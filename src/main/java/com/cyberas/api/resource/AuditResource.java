package com.cyberas.api.resource;

import com.cyberas.api.dto.AuditDtos;
import com.cyberas.domain.service.AuditService;
import com.cyberas.security.JwtContext;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.UUID;

@Path("/audits")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuditResource {

    @Inject
    AuditService auditService;

    @Inject
    JwtContext jwtContext;

    @GET
    public Response listAudits() {
        return Response.ok(auditService.listAudits(jwtContext.getOrganizationId())).build();
    }

    @POST
    public Response createAudit(AuditDtos.CreateAuditRequest request) {
        try {
            var response = auditService.createAudit(request, jwtContext.getOrganizationId());
            return Response.status(Response.Status.CREATED).entity(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }

    @GET
    @Path("/{id}")
    public Response getAudit(@PathParam("id") UUID auditId) {
        try {
            var response = auditService.getAudit(auditId, jwtContext.getOrganizationId());
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }

    @PUT
    @Path("/{id}")
    public Response updateAudit(@PathParam("id") UUID auditId, AuditDtos.UpdateAuditRequest request) {
        try {
            var response = auditService.updateAudit(auditId, request, jwtContext.getOrganizationId());
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }

    @GET
    @Path("/{id}/versions")
    public Response listVersions(@PathParam("id") UUID auditId) {
        try {
            return Response.ok(auditService.listVersions(auditId, jwtContext.getOrganizationId())).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }

    @POST
    @Path("/{id}/versions")
    public Response createVersion(@PathParam("id") UUID auditId,
                                 AuditDtos.CreateAuditVersionRequest request) {
        try {
            var response = auditService.createVersion(auditId, request, jwtContext.getOrganizationId());
            return Response.status(Response.Status.CREATED).entity(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }

    @POST
    @Path("/{id}/versions/{versionId}/publish")
    public Response publishVersion(@PathParam("id") UUID auditId,
                                  @PathParam("versionId") UUID versionId,
                                  AuditDtos.PublishAuditVersionRequest request) {
        try {
            var response = auditService.publishVersion(auditId, versionId, request, jwtContext.getOrganizationId());
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
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
