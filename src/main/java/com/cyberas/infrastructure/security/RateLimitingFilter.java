package com.cyberas.infrastructure.security;

import jakarta.annotation.Priority;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Phase 0 Security Fix #3: Rate Limiting
 * Prevents brute force attacks on login and signup endpoints
 *
 * Note: In production, use distributed Redis-based rate limiting
 * This is a simple in-memory implementation for development
 *
 * Production: Use @RateLimit annotation with external service
 */
@Provider
@Priority(Priorities.AUTHENTICATION - 1)
public class RateLimitingFilter implements ContainerRequestFilter {

    private static final Logger LOG = Logger.getLogger(RateLimitingFilter.class);

    // IP -> (endpoint -> request count)
    private static final Map<String, Map<String, AtomicInteger>> rateLimitMap = new ConcurrentHashMap<>();
    private static final long WINDOW_MILLIS = 5 * 60 * 1000; // 5 minutes
    private static final int LOGIN_LIMIT = 5;
    private static final int SIGNUP_LIMIT = 10;
    private static final int GLOBAL_LIMIT = 100;

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String clientIp = getClientIp(requestContext);
        String path = requestContext.getUriInfo().getPath();

        // Check rate limits
        if (!isAllowed(clientIp, path)) {
            LOG.warn("Rate limit exceeded for IP: " + clientIp + " on path: " + path);
            requestContext.abortWith(
                Response.status(429) // Too Many Requests
                    .entity(new RateLimitResponse("Rate limit exceeded. Try again later."))
                    .build()
            );
        }

        // Increment counter
        incrementCounter(clientIp, path);
    }

    private boolean isAllowed(String clientIp, String path) {
        int limit = GLOBAL_LIMIT;

        if (path.contains("/login")) {
            limit = LOGIN_LIMIT;
        } else if (path.contains("/signup")) {
            limit = SIGNUP_LIMIT;
        }

        Map<String, AtomicInteger> ipCounters = rateLimitMap.computeIfAbsent(clientIp, k -> new ConcurrentHashMap<>());
        AtomicInteger counter = ipCounters.get(path);

        return counter == null || counter.get() < limit;
    }

    private void incrementCounter(String clientIp, String path) {
        Map<String, AtomicInteger> ipCounters = rateLimitMap.computeIfAbsent(clientIp, k -> new ConcurrentHashMap<>());
        ipCounters.computeIfAbsent(path, k -> new AtomicInteger(0)).incrementAndGet();
    }

    private String getClientIp(ContainerRequestContext requestContext) {
        // Check X-Forwarded-For header (proxy/load balancer)
        String forwarded = requestContext.getHeaderString("X-Forwarded-For");
        if (forwarded != null && !forwarded.isEmpty()) {
            return forwarded.split(",")[0].trim();
        }

        // Check X-Real-IP header
        String realIp = requestContext.getHeaderString("X-Real-IP");
        if (realIp != null && !realIp.isEmpty()) {
            return realIp;
        }

        // Fallback to remote address
        return requestContext.getRequest().getRemoteAddr();
    }

    public static class RateLimitResponse {
        public String message;

        public RateLimitResponse(String message) {
            this.message = message;
        }
    }
}
