package com.cyberas.security.ratelimit;

import com.cyberas.security.RequestContext;
import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ResourceInfo;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;

import java.io.IOException;
import java.lang.reflect.Method;

@Provider
@Priority(Priorities.AUTHENTICATION - 2)
public class RateLimitFilter implements ContainerRequestFilter {

    @Inject
    RateLimitService rateLimitService;

    @Context
    ResourceInfo resourceInfo;

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        try {
            if ("OPTIONS".equalsIgnoreCase(requestContext.getMethod())) {
                return;
            }

            if (resourceInfo == null || resourceInfo.getResourceMethod() == null) {
                return;
            }

            Method resourceMethod = resourceInfo.getResourceMethod();
            RateLimitPolicy policy = resourceMethod.getAnnotation(RateLimitPolicy.class);
            if (policy == null) {
                return;
            }

            String ipAddress = RequestContext.getIpAddress();
            boolean allowed = switch (policy.type()) {
                case LOGIN -> rateLimitService.isLoginAllowed(ipAddress);
                case REGISTER -> rateLimitService.isRegisterAllowed(ipAddress);
                case API -> rateLimitService.isApiAllowed();
            };

            if (!allowed) {
                requestContext.abortWith(
                    Response.status(429)
                        .entity(new RateLimitError("RATE_LIMIT_EXCEEDED", "Too many requests. Please try again later."))
                        .header("Retry-After", "60")
                        .build()
                );
            }
        } catch (Exception e) {
            // Log silently, do not block request on filter error
        }
    }

    public static class RateLimitError {
        public String error;
        public String message;

        public RateLimitError(String error, String message) {
            this.error = error;
            this.message = message;
        }
    }
}
