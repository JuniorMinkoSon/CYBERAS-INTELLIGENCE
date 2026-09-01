package com.cyberas.api.resource;

import com.cyberas.domain.service.ScanService;
import com.cyberas.security.JwtContext;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.UUID;

@Path("/scans")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ScanResource {

    @Inject
    ScanService scanService;

    @Inject
    JwtContext jwtContext;

    @POST
    @Path("/audits/{auditId}/versions/{versionId}")
    public Response createScan(@PathParam("auditId") UUID auditId,
                              @PathParam("versionId") UUID versionId,
                              CreateScanRequest request) {
        try {
            var scan = scanService.createScan(
                auditId,
                versionId,
                request.target,
                request.scannerType,
                request.scanProfile != null ? request.scanProfile : "STANDARD",
                jwtContext.getOrganizationId()
            );
            return Response.status(Response.Status.CREATED)
                .entity(new ScanResponse(scan)).build();
        } catch (ScanService.ScopeViolationException e) {
            // Cible hors périmètre autorisé : c'est un refus d'autorisation, pas une
            // requête malformée. Le motif est renvoyé tel quel pour l'audit trail.
            return Response.status(Response.Status.FORBIDDEN)
                .entity(new ErrorResponse(e.getMessage())).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }

    @GET
    @Path("/{id}")
    public Response getScan(@PathParam("id") UUID scanId) {
        try {
            var scan = scanService.getScan(scanId, jwtContext.getOrganizationId());
            return Response.ok(new ScanResponse(scan)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }

    @GET
    @Path("/{id}/findings")
    public Response getScanFindings(@PathParam("id") UUID scanId) {
        try {
            var findings = scanService.getScanFindings(scanId, jwtContext.getOrganizationId());
            return Response.ok(findings).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }

    @DELETE
    @Path("/{id}")
    public Response cancelScan(@PathParam("id") UUID scanId) {
        try {
            scanService.cancelScan(scanId, jwtContext.getOrganizationId());
            return Response.noContent().build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }

    public static class CreateScanRequest {
        public String target;
        public String scannerType = "NMAP";
        public String scanProfile = "STANDARD";
    }

    public static class ScanResponse {
        public java.util.UUID id;
        public String scannerType;
        public String target;
        public String status;
        public Integer progress;
        public String scanProfile;
        public Long durationSeconds;
        public java.time.LocalDateTime startedAt;
        public java.time.LocalDateTime finishedAt;

        public ScanResponse(com.cyberas.domain.entity.Scan scan) {
            this.id = scan.id;
            this.scannerType = scan.scannerType;
            this.target = scan.target;
            this.status = scan.status;
            this.progress = scan.progress;
            this.scanProfile = scan.scanProfile;
            this.durationSeconds = scan.durationSeconds;
            this.startedAt = scan.startedAt;
            this.finishedAt = scan.finishedAt;
        }
    }

    public static class ErrorResponse {
        public String error;

        public ErrorResponse(String error) {
            this.error = error;
        }
    }
}
