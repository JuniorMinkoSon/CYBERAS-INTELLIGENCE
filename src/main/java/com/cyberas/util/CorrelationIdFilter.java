package com.cyberas.util;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;
import org.slf4j.MDC;

import java.io.IOException;
import java.util.UUID;

/**
 * Phase 2 (Observability): Correlation ID for distributed tracing
 * Injected into all requests/responses for end-to-end tracing
 */
@Provider
public class CorrelationIdFilter implements ContainerRequestFilter, ContainerResponseFilter {

    private static final Logger LOG = Logger.getLogger(CorrelationIdFilter.class);
    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String correlationId = requestContext.getHeaderString(CORRELATION_ID_HEADER);

        // Generate new ID if not provided
        if (correlationId == null || correlationId.isEmpty()) {
            correlationId = UUID.randomUUID().toString();
        }

        // Store in MDC for logging
        MDC.put(CORRELATION_ID_HEADER, correlationId);

        // Store in request context for later use
        requestContext.setProperty(CORRELATION_ID_HEADER, correlationId);
    }

    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) throws IOException {
        String correlationId = (String) requestContext.getProperty(CORRELATION_ID_HEADER);

        // Add to response headers
        if (correlationId != null) {
            responseContext.getHeaders().add(CORRELATION_ID_HEADER, correlationId);
        }

        // Clean up MDC
        MDC.remove(CORRELATION_ID_HEADER);
    }
}
