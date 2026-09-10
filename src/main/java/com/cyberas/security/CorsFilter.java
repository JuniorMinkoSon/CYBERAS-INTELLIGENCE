package com.cyberas.security;

import jakarta.annotation.Priority;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Autorisation d'origine croisée.
 *
 * <h2>Ce qui se passait quand une origine manquait</h2>
 *
 * <p>Le filtre se contentait de ne rien ajouter. Le navigateur bloquait alors
 * la réponse et rendait à l'application un échec réseau — « Load failed » —
 * sans statut ni corps. Côté serveur, la requête apparaissait comme un succès :
 * rien, dans aucun journal, ne désignait la cause. Une origine refusée est
 * désormais consignée avec le nom du réglage à corriger.
 *
 * <h2>Les domaines de prévisualisation</h2>
 *
 * <p>Une correspondance exacte suffit pour un domaine de production, mais pas
 * pour un hébergeur qui attribue une adresse différente à chaque
 * prévisualisation. Une entrée peut donc porter une étoile en tête d'hôte —
 * {@code https://*.vercel.app} — auquel cas seul le suffixe est comparé.
 * L'étoile ne couvre qu'un niveau de sous-domaine et le protocole reste
 * comparé : {@code https://*.exemple.fr} n'autorise pas {@code http://}, ni un
 * domaine qui se contenterait de finir par « exemple.fr ».
 */
@Provider
@Priority(Priorities.HEADER_DECORATOR - 1)
public class CorsFilter implements ContainerResponseFilter {

    private static final Logger LOG = Logger.getLogger(CorsFilter.class);

    @ConfigProperty(name = "cors.origins", defaultValue = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
    String allowedOrigins;

    @ConfigProperty(name = "cors.methods", defaultValue = "GET,POST,PUT,PATCH,DELETE,OPTIONS")
    String allowedMethods;

    @ConfigProperty(name = "cors.headers", defaultValue = "Content-Type,Authorization,X-Requested-With")
    String allowedHeaders;

    @ConfigProperty(name = "cors.credentials", defaultValue = "true")
    boolean allowCredentials;

    @ConfigProperty(name = "cors.max-age", defaultValue = "3600")
    int maxAge;

    private Set<String> origins;

    /**
     * Origines déjà refusées.
     *
     * <p>Sans cette mémoire, une page qui appelle l'API en boucle remplirait le
     * journal de la même ligne. Le premier refus suffit à diagnostiquer.
     */
    private final Set<String> reported = ConcurrentHashMap.newKeySet();

    private Set<String> parseOrigins() {
        if (origins == null) {
            Set<String> parsed = new LinkedHashSet<>();
            Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(o -> !o.isEmpty())
                .forEach(parsed::add);
            origins = parsed;
        }
        return origins;
    }

    /**
     * L'origine est-elle autorisée ?
     *
     * <p>La comparaison ignore la casse : un navigateur peut rendre l'hôte
     * autrement qu'il n'a été saisi dans la configuration, et refuser pour cette
     * seule raison produirait une panne incompréhensible.
     */
    // Visibilité de paquet : une règle qui décide quel site peut lire les
    // réponses de l'API doit être vérifiable directement, pas seulement à
    // travers une requête complète.
    boolean isAllowed(String origin) {
        String candidate = origin.toLowerCase(Locale.ROOT);

        for (String allowed : parseOrigins()) {
            String pattern = allowed.toLowerCase(Locale.ROOT);

            int star = pattern.indexOf("*.");
            if (star < 0) {
                if (pattern.equals(candidate)) return true;
                continue;
            }

            // « https://*.vercel.app » : le protocole doit correspondre, et
            // l'hôte se terminer par le suffixe sans le rejoindre par un point
            // manquant — « monsite-vercel.app » ne doit pas passer.
            String scheme = pattern.substring(0, star);
            String suffix = pattern.substring(star + 1);
            if (candidate.startsWith(scheme) && candidate.endsWith(suffix)
                    && candidate.length() > scheme.length() + suffix.length()) {
                return true;
            }
        }
        return false;
    }

    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) throws IOException {
        String origin = requestContext.getHeaderString("Origin");
        if (origin == null) {
            // Appel sans origine : outil en ligne de commande, service à service.
            // CORS ne le concerne pas.
            return;
        }

        if (!isAllowed(origin)) {
            if (reported.add(origin)) {
                LOG.warnf("Origine refusée par CORS : %s. La réponse partira sans en-tête "
                    + "d'autorisation et le navigateur la bloquera — l'application n'y verra "
                    + "qu'un échec réseau. Ajoutez cette origine à CORS_ORIGINS "
                    + "(actuellement : %s).", origin, allowedOrigins);
            }
            return;
        }

        responseContext.getHeaders().add("Access-Control-Allow-Origin", origin);
        responseContext.getHeaders().add("Access-Control-Allow-Credentials", String.valueOf(allowCredentials));
        responseContext.getHeaders().add("Access-Control-Allow-Methods", allowedMethods);
        responseContext.getHeaders().add("Access-Control-Allow-Headers", allowedHeaders);
        responseContext.getHeaders().add("Access-Control-Max-Age", String.valueOf(maxAge));
        responseContext.getHeaders().add("Access-Control-Expose-Headers", "Content-Type,Authorization");

        // L'origine varie d'un appelant à l'autre : sans ce Vary, un cache
        // intermédiaire pourrait servir à un site la réponse autorisée pour un
        // autre.
        responseContext.getHeaders().add("Vary", "Origin");

        if ("OPTIONS".equals(requestContext.getMethod())) {
            responseContext.setStatus(Response.Status.NO_CONTENT.getStatusCode());
        }
    }
}
