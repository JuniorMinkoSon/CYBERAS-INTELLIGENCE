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

    @GET
    public Response listScans(@QueryParam("auditId") UUID auditId) {
        var scans = scanService.listScans(auditId, jwtContext.getOrganizationId())
            .stream().map(ScanResponse::new).toList();
        return Response.ok(scans).build();
    }

    /**
     * Lance un scan sur la version courante de l'audit.
     *
     * Forme courte du point d'entrée ci-dessous : l'appelant qui ne gère pas
     * explicitement les versions n'a pas à en résoudre une. La version verrouillée
     * reste accessible par le chemin complet, nécessaire pour rejouer un scan sur
     * un état d'audit figé.
     *
     * La cible reste obligatoire : sans elle il n'y a rien à scanner, et le
     * périmètre autorisé ne pourrait pas être vérifié.
     */
    @POST
    public Response createScanOnCurrentVersion(CreateScanOnAuditRequest request) {
        if (request == null || request.auditId == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse("auditId est requis")).build();
        }
        if (request.target == null || request.target.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse(
                    "target est requis : sans cible, le périmètre autorisé ne peut pas être vérifié"))
                .build();
        }

        try {
            var scan = scanService.createScanOnCurrentVersion(
                request.auditId,
                request.target,
                request.scannerType != null ? request.scannerType : "NMAP",
                request.scanProfile != null ? request.scanProfile : "STANDARD",
                jwtContext.getOrganizationId()
            );
            return Response.status(Response.Status.CREATED)
                .entity(new ScanResponse(scan)).build();
        } catch (ScanService.ScopeViolationException e) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(new ErrorResponse(e.getMessage())).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }

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
            // Passage par le DTO : l'entité entraînerait scan, audit et
            // organisation dans la réponse.
            return Response.ok(findings.stream()
                .map(com.cyberas.api.dto.FindingDtos.FindingResponse::from).toList()).build();
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

    /** Forme courte : la version courante de l'audit est résolue côté service. */
    public static class CreateScanOnAuditRequest {
        public UUID auditId;
        public String target;
        public String scannerType = "NMAP";
        public String scanProfile = "STANDARD";
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
        public java.time.LocalDateTime createdAt;
        public String errorMessage;
        public String hash;
        public java.util.UUID auditId;
        public String auditCode;
        public java.util.UUID auditVersionId;
        public Integer auditVersionNumber;
        public String createdByEmail;

        public ScanResponse(com.cyberas.domain.entity.Scan scan) {
            this.id = scan.id;
            this.createdAt = scan.createdAt;
            this.errorMessage = scan.errorMessage;
            this.hash = scan.hash;
            this.auditId = scan.audit != null ? scan.audit.id : null;
            this.auditCode = scan.audit != null ? scan.audit.auditCode : null;
            this.auditVersionId = scan.auditVersion != null ? scan.auditVersion.id : null;
            this.auditVersionNumber = scan.auditVersion != null ? scan.auditVersion.versionNumber : null;
            this.createdByEmail = scan.createdBy != null ? scan.createdBy.email : null;
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
