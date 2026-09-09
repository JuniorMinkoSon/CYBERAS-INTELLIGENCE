package com.cyberas.api.resource;

import com.cyberas.domain.entity.Organization;
import com.cyberas.domain.entity.User;
import com.cyberas.domain.service.AuditTrailService;
import com.cyberas.security.JwtUtils;
import com.cyberas.security.Roles;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Connexion par compte Google.
 *
 * <h2>Ce que cela apporte à un outil d'audit</h2>
 *
 * <p>Un mot de passe de moins à retenir, mais surtout : lorsqu'une entreprise
 * utilise Google Workspace, désactiver le compte d'un collaborateur lui coupe
 * l'accès à CYBERAS <em>du même geste</em>. Sur une plateforme qui héberge les
 * vulnérabilités d'un parc, cette propriété vaut plus que le confort.
 *
 * <h2>Le flux</h2>
 *
 * <p>Code d'autorisation, échangé côté serveur. Le secret client ne quitte
 * jamais le serveur et n'apparaît jamais dans une URL : c'est lui qui prouve à
 * Google que la demande vient de CYBERAS et non d'un site qui l'imite.
 *
 * <p>Un paramètre {@code state} aléatoire accompagne l'aller-retour. Sans lui,
 * un tiers pourrait provoquer une connexion à son propre compte depuis le
 * navigateur de la victime — l'attaque par confusion de session.
 *
 * <h2>Configuration</h2>
 *
 * <p>Les identifiants sont lus dans l'environnement, jamais écrits ici. Une
 * configuration absente désactive la route proprement plutôt que de faire
 * échouer le démarrage : une installation qui n'utilise pas Google doit
 * fonctionner sans.
 */
@Path("/auth/google")
@Produces(MediaType.APPLICATION_JSON)
public class GoogleAuthResource {

    private static final Logger LOG = Logger.getLogger(GoogleAuthResource.class);

    private static final String AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
    private static final String USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";

    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * États en attente de retour.
     *
     * <p>En mémoire et volontairement : ce sont des jetons de quelques secondes,
     * et les persister ferait entrer dans le schéma une donnée qui n'a aucune
     * valeur passé l'aller-retour. Un redémarrage invalide les connexions en
     * cours, ce qui se traduit par un simple « recommencez ».
     */
    private final Map<String, LocalDateTime> pendingStates = new HashMap<>();

    private static final Duration STATE_VALIDITY = Duration.ofMinutes(10);

    /**
     * Identifiants du client OAuth.
     *
     * <p>{@code Optional} et non {@code String} : une propriété définie à la
     * chaîne vide est considérée comme nulle par SmallRye, qui refuse alors
     * d'injecter un {@code String} et fait échouer le démarrage — l'inverse
     * exact de la désactivation propre annoncée plus haut.
     */
    @ConfigProperty(name = "google.oauth.client-id")
    Optional<String> clientId;

    @ConfigProperty(name = "google.oauth.client-secret")
    Optional<String> clientSecret;

    @ConfigProperty(name = "google.oauth.redirect-uri",
        defaultValue = "http://localhost:8081/api/auth/google/callback")
    String redirectUri;

    @ConfigProperty(name = "app.frontend-url", defaultValue = "http://localhost:5174")
    String frontendUrl;

    @Inject
    JwtUtils jwtUtils;

    @Inject
    ObjectMapper objectMapper;

    @Inject
    AuditTrailService auditTrail;

    private final HttpClient http = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .build();

    /** La connexion Google est-elle utilisable sur cette installation ? */
    @GET
    @Path("/status")
    public Response status() {
        return Response.ok(new StatusResponse(isConfigured())).build();
    }

    /**
     * Démarre la connexion : renvoie vers Google.
     *
     * <p>La réponse est une redirection HTTP plutôt qu'une URL en JSON :
     * l'utilisateur clique un lien, il ne doit pas dépendre d'un script pour
     * arriver chez Google.
     */
    @GET
    @Path("/start")
    public Response start() {
        if (!isConfigured()) {
            return redirectToFrontend("error", "La connexion Google n'est pas configurée sur ce serveur.");
        }

        String state = newState();
        purgeExpiredStates();
        pendingStates.put(state, LocalDateTime.now());

        String url = AUTH_ENDPOINT
            + "?client_id=" + enc(clientId.orElse(""))
            + "&redirect_uri=" + enc(redirectUri)
            + "&response_type=code"
            // Rien de plus que l'identité : demander davantage obligerait
            // l'utilisateur à consentir à un accès dont on n'a pas l'usage.
            + "&scope=" + enc("openid email profile")
            + "&state=" + enc(state)
            // Force le choix du compte : sans cela, un poste partagé reconnecte
            // silencieusement la dernière session Google ouverte.
            + "&prompt=select_account";

        return Response.seeOther(URI.create(url)).build();
    }

    /**
     * Retour de Google.
     *
     * <p>Le code est échangé côté serveur contre un jeton d'accès, qui sert à
     * lire l'identité. La réponse finale est une redirection vers l'interface,
     * porteuse du jeton CYBERAS.
     */
    @GET
    @Path("/callback")
    @Transactional
    public Response callback(@QueryParam("code") String code,
                             @QueryParam("state") String state,
                             @QueryParam("error") String error) {

        if (error != null && !error.isBlank()) {
            // Refus de l'utilisateur : ce n'est pas un incident, on le ramène
            // sans message alarmant.
            return redirectToFrontend("error", "Connexion Google annulée.");
        }
        if (!isConfigured()) {
            return redirectToFrontend("error", "La connexion Google n'est pas configurée.");
        }
        if (code == null || code.isBlank()) {
            return redirectToFrontend("error", "Réponse Google incomplète.");
        }

        // Vérification du state : un retour dont l'état n'a pas été émis par ce
        // serveur ne vient pas d'une connexion que l'utilisateur a demandée.
        purgeExpiredStates();
        if (state == null || pendingStates.remove(state) == null) {
            LOG.warn("Retour Google avec un state inconnu ou expiré");
            return redirectToFrontend("error", "Session de connexion expirée. Réessayez.");
        }

        JsonNode identity;
        try {
            String accessToken = exchangeCode(code);
            identity = fetchIdentity(accessToken);
        } catch (Exception e) {
            LOG.errorf(e, "Échec de l'échange OAuth Google");
            return redirectToFrontend("error", "La connexion Google a échoué.");
        }

        String email = text(identity, "email");
        if (email == null || email.isBlank()) {
            return redirectToFrontend("error", "Google n'a pas fourni d'adresse e-mail.");
        }
        // Une adresse non vérifiée par Google ne prouve rien : n'importe qui
        // peut déclarer l'adresse d'un tiers sur un compte non validé, et
        // l'accepter permettrait de prendre la place d'un utilisateur existant.
        if (!identity.path("email_verified").asBoolean(false)) {
            return redirectToFrontend("error",
                "Cette adresse Google n'est pas vérifiée. Vérifiez-la avant de vous connecter.");
        }

        Optional<User> existing = User.find("lower(email) = ?1", email.toLowerCase()).firstResultOptional();

        if (existing.isEmpty()) {
            // Aucun compte : on ne crée pas d'organisation à la volée. Une
            // organisation porte un périmètre d'audit et une formule ; la faire
            // naître d'un clic produirait des coquilles sans propriétaire.
            return redirectToFrontend("error",
                "Aucun compte CYBERAS n'est associé à " + email
                    + ". Inscrivez votre organisation ou demandez une invitation.");
        }

        User user = existing.get();
        if (!Boolean.TRUE.equals(user.active)) {
            return redirectToFrontend("error", "Ce compte est désactivé.");
        }

        // L'identité Google vaut vérification de l'adresse.
        user.emailVerified = true;
        user.lastLoginAt = LocalDateTime.now();
        user.persist();

        Organization org = user.organization;
        String role = resolveRole(user);
        String token = jwtUtils.generateToken(user.id, user.email,
            org == null ? null : org.id, role);

        auditTrail.recordAs(AuditTrailService.LOGIN, org == null ? null : org.id, null,
            user.id, "USER", user.id,
            java.util.Map.of("email", user.email, "role", role, "provider", "GOOGLE"));

        return redirectToFrontend("token", token);
    }

    // -----------------------------------------------------------------------

    private String exchangeCode(String code) throws Exception {
        String body = "code=" + enc(code)
            + "&client_id=" + enc(clientId.orElse(""))
            + "&client_secret=" + enc(clientSecret.orElse(""))
            + "&redirect_uri=" + enc(redirectUri)
            + "&grant_type=authorization_code";

        HttpRequest request = HttpRequest.newBuilder(URI.create(TOKEN_ENDPOINT))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .timeout(Duration.ofSeconds(15))
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build();

        HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            // Le corps peut contenir le motif du refus ; il n'est pas remonté à
            // l'utilisateur, qui n'en ferait rien, mais il est journalisé.
            throw new IllegalStateException("Google a refusé l'échange : " + response.statusCode());
        }

        JsonNode json = objectMapper.readTree(response.body());
        String accessToken = text(json, "access_token");
        if (accessToken == null) {
            throw new IllegalStateException("Réponse Google sans jeton d'accès");
        }
        return accessToken;
    }

    private JsonNode fetchIdentity(String accessToken) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(URI.create(USERINFO_ENDPOINT))
            .header("Authorization", "Bearer " + accessToken)
            .timeout(Duration.ofSeconds(15))
            .GET()
            .build();

        HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new IllegalStateException("Lecture de l'identité refusée : " + response.statusCode());
        }
        return objectMapper.readTree(response.body());
    }

    /**
     * Role porte par le jeton.
     *
     * <p>Une connexion Google ne change jamais les droits : elle authentifie,
     * elle n'autorise pas. Le role retenu est le plus eleve encore valide parmi
     * ceux que l'organisation a attribues — meme regle qu'a la connexion par
     * mot de passe, pour qu'un utilisateur ne change pas de droits selon la
     * porte qu'il emprunte.
     *
     * <p>A defaut, la lecture seule : c'est la position sure quand on ne sait
     * pas.
     */
    private String resolveRole(User user) {
        return user.userRoles.stream()
            .filter(ur -> ur.expiresAt == null || LocalDateTime.now().isBefore(ur.expiresAt))
            .map(ur -> Roles.normalize(ur.role.name))
            .min((a, b) -> Integer.compare(rank(a), rank(b)))
            .orElse(Roles.VIEWER);
    }

    private int rank(String role) {
        return switch (role) {
            case Roles.ADMIN -> 0;
            case Roles.RSSI -> 1;
            case Roles.AUDITOR -> 2;
            default -> 3;
        };
    }

    private boolean isConfigured() {
        return clientId.filter(v -> !v.isBlank()).isPresent()
            && clientSecret.filter(v -> !v.isBlank()).isPresent();
    }

    private Response redirectToFrontend(String param, String value) {
        String base = frontendUrl.endsWith("/")
            ? frontendUrl.substring(0, frontendUrl.length() - 1) : frontendUrl;
        return Response.seeOther(
            URI.create(base + "/login?" + param + "=" + enc(value))).build();
    }

    private String newState() {
        byte[] bytes = new byte[24];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /** Un état non consommé finirait par encombrer la mémoire du serveur. */
    private void purgeExpiredStates() {
        LocalDateTime limit = LocalDateTime.now().minus(STATE_VALIDITY);
        pendingStates.entrySet().removeIf(e -> e.getValue().isBefore(limit));
    }

    private static String enc(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }

    private static String text(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value == null || value.isNull() ? null : value.asText();
    }

    public record StatusResponse(boolean enabled) {}
}
