package com.cyberas.security;

import jakarta.annotation.Priority;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Provider
@Priority(Priorities.HEADER_DECORATOR - 1)
public class CorsFilter implements ContainerResponseFilter {

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

    private Set<String> parseOrigins() {
        if (origins == null) {
            origins = new HashSet<>(Arrays.asList(allowedOrigins.split(",")));
        }
        return origins;
    }

    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) throws IOException {
        String origin = requestContext.getHeaderString("Origin");

        if (origin != null && parseOrigins().stream().anyMatch(o -> o.trim().equals(origin))) {
            responseContext.getHeaders().add("Access-Control-Allow-Origin", origin);
            responseContext.getHeaders().add("Access-Control-Allow-Credentials", String.valueOf(allowCredentials));
            responseContext.getHeaders().add("Access-Control-Allow-Methods", allowedMethods);
            responseContext.getHeaders().add("Access-Control-Allow-Headers", allowedHeaders);
            responseContext.getHeaders().add("Access-Control-Max-Age", String.valueOf(maxAge));
            responseContext.getHeaders().add("Access-Control-Expose-Headers", "Content-Type,Authorization");

            if ("OPTIONS".equals(requestContext.getMethod())) {
                responseContext.setStatus(Response.Status.NO_CONTENT.getStatusCode());
            }
        }
    }
}
