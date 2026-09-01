package com.cyberas.api.resource;

import com.cyberas.domain.entity.Document;
import com.cyberas.domain.entity.Evidence;
import com.cyberas.domain.service.DocumentService;
import com.cyberas.security.JwtContext;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Path("/")
@Produces(MediaType.APPLICATION_JSON)
public class DocumentResource {

    @Inject
    DocumentService documentService;

    @Inject
    JwtContext jwtContext;

    @GET
    @Path("/audits/{auditId}/documents")
    public List<DocumentResponse> list(@PathParam("auditId") UUID auditId) {
        return documentService.list(auditId, jwtContext.getOrganizationId())
            .stream().map(DocumentResponse::new).toList();
    }

    @POST
    @Path("/audits/{auditId}/documents")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response upload(@PathParam("auditId") UUID auditId,
                           @RestForm("file") FileUpload file,
                           @RestForm("description") String description) throws IOException {
        if (file == null || file.uploadedFile() == null) {
            throw new IllegalArgumentException("Champ 'file' requis");
        }
        try (InputStream in = Files.newInputStream(file.uploadedFile())) {
            Document doc = documentService.store(auditId, file.fileName(), file.contentType(), in,
                description, jwtContext.getOrganizationId());
            return Response.status(Response.Status.CREATED).entity(new DocumentResponse(doc)).build();
        }
    }

    @GET
    @Path("/documents/{id}/download")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response download(@PathParam("id") UUID id) throws IOException {
        Document doc = documentService.require(id, jwtContext.getOrganizationId());
        java.nio.file.Path path = documentService.resolvePath(doc);
        if (!Files.exists(path)) {
            throw new IllegalStateException("Fichier absent du stockage");
        }
        return Response.ok(Files.newInputStream(path))
            .type(doc.contentType)
            .header("Content-Disposition", "attachment; filename=\"" + doc.fileName.replace("\"", "") + "\"")
            .header("X-Content-Sha256", doc.sha256)
            .build();
    }

    @PATCH
    @Path("/documents/{id}/status")
    @Consumes(MediaType.APPLICATION_JSON)
    public DocumentResponse updateStatus(@PathParam("id") UUID id, StatusRequest request) {
        return new DocumentResponse(documentService.updateStatus(id,
            request == null ? null : request.status, jwtContext.getOrganizationId()));
    }

    @DELETE
    @Path("/documents/{id}")
    public Response delete(@PathParam("id") UUID id) throws IOException {
        documentService.delete(id, jwtContext.getOrganizationId());
        return Response.noContent().build();
    }

    @GET
    @Path("/audits/{auditId}/evidences")
    public List<EvidenceResponse> listEvidences(@PathParam("auditId") UUID auditId) {
        return documentService.listEvidences(auditId, jwtContext.getOrganizationId())
            .stream().map(EvidenceResponse::new).toList();
    }

    @POST
    @Path("/audits/{auditId}/evidences")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response linkEvidence(@PathParam("auditId") UUID auditId, EvidenceRequest request) {
        if (request == null || request.documentId == null) {
            throw new IllegalArgumentException("documentId requis");
        }
        Evidence e = documentService.linkEvidence(auditId, request.documentId, request.questionCode,
            request.findingId, request.recommendationId, request.note, jwtContext.getOrganizationId());
        return Response.status(Response.Status.CREATED).entity(new EvidenceResponse(e)).build();
    }

    @DELETE
    @Path("/evidences/{id}")
    public Response deleteEvidence(@PathParam("id") UUID id) {
        documentService.deleteEvidence(id, jwtContext.getOrganizationId());
        return Response.noContent().build();
    }

    public static class StatusRequest {
        public String status;
    }

    public static class EvidenceRequest {
        public UUID documentId;
        public String questionCode;
        public UUID findingId;
        public UUID recommendationId;
        public String note;
    }

    public static class DocumentResponse {
        public UUID id;
        public UUID auditId;
        public String fileName;
        public String contentType;
        public Long sizeBytes;
        public String sha256;
        public String status;
        public String description;
        public LocalDateTime uploadedAt;
        public String uploadedByEmail;

        public DocumentResponse(Document d) {
            this.id = d.id;
            this.auditId = d.audit.id;
            this.fileName = d.fileName;
            this.contentType = d.contentType;
            this.sizeBytes = d.sizeBytes;
            this.sha256 = d.sha256;
            this.status = d.status;
            this.description = d.description;
            this.uploadedAt = d.uploadedAt;
            this.uploadedByEmail = d.uploadedBy != null ? d.uploadedBy.email : null;
        }
    }

    public static class EvidenceResponse {
        public UUID id;
        public UUID auditId;
        public UUID documentId;
        public String documentName;
        public String questionCode;
        public UUID findingId;
        public UUID recommendationId;
        public String note;
        public LocalDateTime createdAt;

        public EvidenceResponse(Evidence e) {
            this.id = e.id;
            this.auditId = e.audit.id;
            this.documentId = e.document.id;
            this.documentName = e.document.fileName;
            this.questionCode = e.question != null ? e.question.code : null;
            this.findingId = e.finding != null ? e.finding.id : null;
            this.recommendationId = e.recommendation != null ? e.recommendation.id : null;
            this.note = e.note;
            this.createdAt = e.createdAt;
        }
    }
}
