package com.cyberas.api.error;

import com.cyberas.domain.service.ScanService;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

import java.util.Map;

/** Traduction uniforme des erreurs métier en réponses JSON {"error": ...}. */
@Provider
public class ApiExceptionMapper implements ExceptionMapper<RuntimeException> {

    private static final Logger LOG = Logger.getLogger(ApiExceptionMapper.class);

    @Override
    public Response toResponse(RuntimeException e) {
        if (e instanceof jakarta.ws.rs.WebApplicationException wae) {
            return wae.getResponse();
        }
        if (e instanceof ScanService.ScopeViolationException) {
            return json(Response.Status.FORBIDDEN, e.getMessage());
        }
        if (e instanceof NotFoundException) {
            return json(Response.Status.NOT_FOUND, e.getMessage());
        }
        if (e instanceof ForbiddenException) {
            return json(Response.Status.FORBIDDEN, e.getMessage());
        }
        if (e instanceof IllegalArgumentException || e instanceof IllegalStateException) {
            return json(Response.Status.BAD_REQUEST, e.getMessage());
        }
        LOG.error("Erreur non gérée", e);
        return json(Response.Status.INTERNAL_SERVER_ERROR, "Erreur interne");
    }

    private Response json(Response.Status status, String message) {
        return Response.status(status)
            .type(MediaType.APPLICATION_JSON)
            .entity(Map.of("error", message == null ? status.getReasonPhrase() : message))
            .build();
    }

    public static class NotFoundException extends RuntimeException {
        public NotFoundException(String message) { super(message); }
    }

    public static class ForbiddenException extends RuntimeException {
        public ForbiddenException(String message) { super(message); }
    }
}
