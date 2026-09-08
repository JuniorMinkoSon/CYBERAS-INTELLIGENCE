package com.cyberas.security;

import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.ws.rs.HttpMethod;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import java.io.IOException;

@Provider
@Priority(Priorities.AUTHENTICATION)
public class JwtFilter implements ContainerRequestFilter {

    @Inject
    JwtUtils jwtUtils;

    @Inject
    JwtContext jwtContext;

    private static final String BEARER = "Bearer ";

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        // Skip auth for public endpoints
        String path = requestContext.getUriInfo().getPath();
        if (HttpMethod.OPTIONS.equals(requestContext.getMethod())
                || isPublicEndpoint(path, requestContext.getMethod())) {
            return;
        }

        String authHeader = requestContext.getHeaderString("Authorization");

        if (authHeader == null || !authHeader.startsWith(BEARER)) {
            abortWithUnauthorized(requestContext);
            return;
        }

        String token = authHeader.substring(BEARER.length());

        try {
            var claims = jwtUtils.validateAndGetClaims(token);

            if (claims.isEmpty()) {
                abortWithUnauthorized(requestContext);
                return;
            }

            var userId = jwtUtils.getUserIdFromToken(token);
            var orgId = jwtUtils.getOrganizationIdFromToken(token);
            var role = jwtUtils.getRoleFromToken(token);

            if (userId.isEmpty() || orgId.isEmpty()) {
                abortWithUnauthorized(requestContext);
                return;
            }

            // Populate JwtContext
            jwtContext.setUserId(userId.get());
            jwtContext.setOrganizationId(orgId.get());
            jwtContext.setEmail(claims.get().getSubject());
            jwtContext.setRole(Roles.normalize(role.orElse(Roles.VIEWER)));
            jwtContext.setToken(token);
            jwtContext.setAuthenticated(true);

        } catch (Exception e) {
            abortWithUnauthorized(requestContext);
        }
    }

    private void abortWithUnauthorized(ContainerRequestContext requestContext) {
        requestContext.abortWith(
            Response.status(Response.Status.UNAUTHORIZED)
                .entity("{\"error\": \"Unauthorized - Invalid or missing token\"}")
                .build()
        );
    }

    private boolean isPublicEndpoint(String path, String method) {
        // Le chemin est relatif à quarkus.rest.path (/api), qui n'apparaît pas ici.
        return path.startsWith("/auth/login") ||
               path.startsWith("/auth/register") ||
               path.startsWith("/auth/refresh") ||
               // Connexion par compte Google : ces routes précèdent
               // l'authentification, personne n'a encore de jeton en les
               // appelant. Elles n'exposent rien — le statut dit seulement si
               // le serveur est configuré, le départ redirige vers Google, et
               // le retour n'aboutit que sur un `state` émis par ce serveur et
               // une adresse vérifiée correspondant à un compte existant.
               path.startsWith("/auth/google/") ||
               // Dépôt d'une demande depuis le site public : celui qui remplit
               // le formulaire n'a pas encore de compte. Seul le POST est
               // ouvert — la lecture de la boîte de réception est contrôlée
               // dans la ressource, qui refuse tout appelant non authentifié.
               isPublicContactSubmission(path, method) ||
               // Verification d'un lien d'invitation : la personne invitee n'a
               // pas encore de compte. La route ne revele que la validite et le
               // role propose, jamais l'organisation.
               path.startsWith("/invitations/check/") ||
               path.startsWith("/health") ||
               path.startsWith("/q/") ||
               path.startsWith("/swagger") ||
               path.startsWith("/openapi");
    }

    /**
     * Dépôt d'une demande de contact ou de démonstration.
     *
     * <p>Le chemin seul ne suffit pas à décider : {@code POST /contact-requests}
     * doit être ouvert, puisque l'auteur du formulaire n'a pas encore de compte,
     * mais {@code GET /contact-requests} donne accès à toutes les demandes
     * reçues — coordonnées comprises. Ouvrir le chemin sans distinguer le verbe
     * publierait la boîte de réception.
     *
     * <p>Le chemin exact est exigé : un préfixe laisserait passer
     * {@code POST /contact-requests/{id}/note}, qui est une action interne.
     */
    private boolean isPublicContactSubmission(String path, String method) {
        if (!"POST".equalsIgnoreCase(method)) {
            return false;
        }
        String normalized = path.endsWith("/") ? path.substring(0, path.length() - 1) : path;
        return "/contact-requests".equals(normalized);
    }
}
