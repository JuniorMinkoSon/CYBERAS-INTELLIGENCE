package com.cyberas.security;

import jakarta.annotation.Priority;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.ext.Provider;
import java.io.IOException;

@Provider
@Priority(Priorities.AUTHENTICATION - 1)
public class RequestContextFilter implements ContainerRequestFilter, ContainerResponseFilter {

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        // Extract IP address (X-Forwarded-For for proxied requests)
        String ip = requestContext.getHeaderString("X-Forwarded-For");
        if (ip != null && !ip.isBlank()) {
            ip = ip.split(",")[0].trim();
        } else {
            ip = requestContext.getProperty("org.glassfish.grizzly.http.server.Request") != null ?
                requestContext.getProperty("org.glassfish.grizzly.http.server.Request").toString() : null;
        }

        // Extract User-Agent
        String ua = requestContext.getHeaderString("User-Agent");
        if (ua != null && ua.length() > 500) {
            ua = ua.substring(0, 500);
        }

        // Store in thread-local
        if (ip != null) {
            RequestContext.setIpAddress(ip);
        }
        if (ua != null) {
            RequestContext.setUserAgent(ua);
        }
    }

    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) throws IOException {
        // Clean up thread-local after response
        RequestContext.clear();
    }
}
