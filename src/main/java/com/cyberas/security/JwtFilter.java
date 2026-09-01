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
        if (HttpMethod.OPTIONS.equals(requestContext.getMethod()) || isPublicEndpoint(path)) {
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

    private boolean isPublicEndpoint(String path) {
        // Le chemin est relatif à quarkus.rest.path (/api), qui n'apparaît pas ici.
        return path.startsWith("/auth/login") ||
               path.startsWith("/auth/register") ||
               path.startsWith("/auth/refresh") ||
               path.startsWith("/health") ||
               path.startsWith("/q/") ||
               path.startsWith("/swagger") ||
               path.startsWith("/openapi");
    }
}
