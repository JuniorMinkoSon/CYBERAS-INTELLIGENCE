package com.cyberas.security;

import com.cyberas.domain.entity.Organization;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;

/**
 * Contrôle d'accès à l'administration de la plateforme.
 *
 * <p>Un administrateur de la plateforme est un compte ADMIN de l'organisation
 * marquée {@code is_platform}. Le rôle seul ne suffit pas : la première
 * personne inscrite de chaque société est ADMIN de sa société, et l'on ne veut
 * pas qu'elle voie les autres clients ni qu'elle crée des projets.
 *
 * <p>Le résultat est mémorisé pour la durée de la requête : une même requête
 * ne relit pas l'organisation à chaque contrôle.
 */
@RequestScoped
public class PlatformAccess {

    @Inject
    JwtContext jwtContext;

    private Boolean cached;

    public boolean isPlatformAdmin() {
        if (cached != null) return cached;
        boolean result = false;
        if (jwtContext.isAuthenticated()
                && Roles.ADMIN.equals(Roles.normalize(jwtContext.getRole()))
                && jwtContext.getOrganizationId() != null) {
            Organization org = Organization.findById(jwtContext.getOrganizationId());
            result = org != null && Boolean.TRUE.equals(org.isPlatform);
        }
        cached = result;
        return result;
    }

    /** Null si l'accès est accordé, sinon la réponse de refus à renvoyer telle quelle. */
    public Response requirePlatformAdmin() {
        if (isPlatformAdmin()) return null;
        if (!jwtContext.isAuthenticated()) {
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity(new Denied("Authentification requise")).build();
        }
        return Response.status(Response.Status.FORBIDDEN)
            .entity(new Denied("Réservé à l'administration de la plateforme")).build();
    }

    public record Denied(String error) {}
}
