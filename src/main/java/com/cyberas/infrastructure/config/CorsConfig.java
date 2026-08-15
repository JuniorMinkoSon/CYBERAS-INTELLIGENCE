package com.cyberas.infrastructure.config;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.PreMatching;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

import java.io.IOException;

/**
 * Phase 0 Security Fix #4: CORS Configuration
 * Handles CORS preflight requests and sets appropriate headers
 */
@Provider
@PreMatching
public class CorsConfig implements ContainerRequestFilter {

    private static final Logger LOG = Logger.getLogger(CorsConfig.class);

    private static final String ALLOWED_ORIGINS = "https://cyberas.local,https://www.cyberas.local,http://localhost:3000";
    private static final String ALLOWED_METHODS = "GET,POST,PUT,DELETE,OPTIONS";
    private static final String ALLOWED_HEADERS = "Content-Type,Authorization,X-Correlation-ID";

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String origin = requestContext.getHeaderString("Origin");

        // Check if origin is allowed
        if (origin != null && isOriginAllowed(origin)) {
            // Handle preflight requests
            if ("OPTIONS".equalsIgnoreCase(requestContext.getMethod())) {
                requestContext.abortWith(
                    Response.ok()
                        .header("Access-Control-Allow-Origin", origin)
                        .header("Access-Control-Allow-Credentials", "true")
                        .header("Access-Control-Allow-Methods", ALLOWED_METHODS)
                        .header("Access-Control-Allow-Headers", ALLOWED_HEADERS)
                        .header("Access-Control-Max-Age", "3600")
                        .build()
                );
                return;
            }
        }
    }

    private boolean isOriginAllowed(String origin) {
        String[] allowedOrigins = ALLOWED_ORIGINS.split(",");
        for (String allowed : allowedOrigins) {
            if (allowed.trim().equals(origin)) {
                return true;
            }
        }
        return false;
    }
}
