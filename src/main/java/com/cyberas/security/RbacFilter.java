package com.cyberas.security;

import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ResourceInfo;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;

import java.util.Arrays;
import java.util.Map;

/** Applique @RequiresRole après l'authentification JWT. */
@Provider
@RequiresRole({})
@Priority(Priorities.AUTHORIZATION)
public class RbacFilter implements ContainerRequestFilter {

    @Context
    ResourceInfo resourceInfo;

    @Inject
    JwtContext jwtContext;

    @Override
    public void filter(ContainerRequestContext ctx) {
        RequiresRole annotation = resourceInfo.getResourceMethod().getAnnotation(RequiresRole.class);
        if (annotation == null) {
            annotation = resourceInfo.getResourceClass().getAnnotation(RequiresRole.class);
        }
        if (annotation == null || annotation.value().length == 0) {
            return;
        }
        if (!jwtContext.isAuthenticated()) {
            ctx.abortWith(Response.status(Response.Status.UNAUTHORIZED)
                .type(MediaType.APPLICATION_JSON)
                .entity(Map.of("error", "Authentification requise"))
                .build());
            return;
        }

        String role = Roles.normalize(jwtContext.getRole());
        if (Arrays.stream(annotation.value()).noneMatch(role::equals)) {
            /* La réponse nomme le rôle porté et les rôles attendus.
             *
             * Un « rôle insuffisant » sans autre précision oblige l'interface à
             * inventer une explication, et l'utilisateur à deviner qui, dans son
             * organisation, pourra faire l'opération à sa place. Le code machine
             * `ROLE_REQUIRED` permet en outre de distinguer ce refus d'une
             * erreur technique sans avoir à reconnaître une phrase française. */
            ctx.abortWith(Response.status(Response.Status.FORBIDDEN)
                .type(MediaType.APPLICATION_JSON)
                .entity(Map.of(
                    "code", "ROLE_REQUIRED",
                    "error", "Cette opération demande le rôle "
                        + String.join(" ou ", annotation.value())
                        + ". Votre compte est " + role + ".",
                    "role", role,
                    "requiredRoles", Arrays.asList(annotation.value())))
                .build());
        }
    }
}
