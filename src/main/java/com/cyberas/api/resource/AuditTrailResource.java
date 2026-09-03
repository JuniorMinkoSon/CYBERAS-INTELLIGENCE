package com.cyberas.api.resource;

import com.cyberas.api.dto.AuditTrailDtos.AuditEventResponse;
import com.cyberas.domain.entity.AuditEvent;
import com.cyberas.domain.service.AuditTrailService;
import com.cyberas.security.JwtContext;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.UUID;

@Path("/audit-trail")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuditTrailResource {

    @Inject
    AuditTrailService auditTrailService;

    @Inject
    JwtContext jwtContext;

    @GET
    public Response listForOrganization(@QueryParam("limit") int limit) {
        if (limit <= 0) {
            limit = 100;
        }
        List<AuditEvent> events = auditTrailService.listForOrganization(jwtContext.getOrganizationId(), limit);
        return Response.ok(events.stream().map(AuditEventResponse::from).toList()).build();
    }

    @GET
    @Path("/audits/{auditId}")
    public Response listForAudit(@PathParam("auditId") UUID auditId, @QueryParam("limit") int limit) {
        if (limit <= 0) {
            limit = 100;
        }
        List<AuditEvent> events = auditTrailService.listForAudit(auditId, jwtContext.getOrganizationId(), limit);
        return Response.ok(events.stream().map(AuditEventResponse::from).toList()).build();
    }

    @GET
    @Path("/{id}")
    public Response getEvent(@PathParam("id") UUID eventId) {
        try {
            AuditEvent event = auditTrailService.getEvent(eventId, jwtContext.getOrganizationId());
            return Response.ok(AuditEventResponse.from(event)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }

    public static class ErrorResponse {
        public String error;

        public ErrorResponse(String error) {
            this.error = error;
        }
    }
}
