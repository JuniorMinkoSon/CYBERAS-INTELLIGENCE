package com.cyberas.api.resource;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Path("/health")
@Produces(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class HealthResource {

    @Inject
    EntityManager em;

    @GET
    @Path("/live")
    public Response liveness() {
        return Response.ok(new StatusResponse("UP", "CYBERAS Audit Service is running")).build();
    }

    @GET
    @Path("/ready")
    public Response readiness() {
        Map<String, String> checks = new HashMap<>();

        // Database check
        try {
            em.createNativeQuery("SELECT 1").getSingleResult();
            checks.put("database", "UP");
        } catch (Exception e) {
            checks.put("database", "DOWN - " + e.getMessage());
            return Response.status(503)
                .entity(new StatusResponse("DOWN", checks))
                .build();
        }

        // Redis check (optional) - skipped for now
        checks.put("redis", "NOT_CHECKED");

        return Response.ok(new StatusResponse("UP", checks)).build();
    }

    @GET
    @Path("/info")
    public Response info() {
        Map<String, Object> info = new HashMap<>();
        info.put("service", "CYBERAS Audit Service");
        info.put("version", "1.0.0");
        info.put("timestamp", LocalDateTime.now());
        info.put("java.version", System.getProperty("java.version"));
        info.put("java.vendor", System.getProperty("java.vendor"));
        return Response.ok(info).build();
    }

    public static class StatusResponse {
        public String status;
        public Object details;

        public StatusResponse(String status, Object details) {
            this.status = status;
            this.details = details;
        }
    }
}
