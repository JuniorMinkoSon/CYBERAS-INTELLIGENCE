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
        String role = Roles.normalize(jwtContext.getRole());
        if (!jwtContext.isAuthenticated() || Arrays.stream(annotation.value()).noneMatch(role::equals)) {
            ctx.abortWith(Response.status(Response.Status.FORBIDDEN)
                .type(MediaType.APPLICATION_JSON)
                .entity(Map.of("error", "Rôle insuffisant pour cette opération"))
                .build());
        }
    }
}
