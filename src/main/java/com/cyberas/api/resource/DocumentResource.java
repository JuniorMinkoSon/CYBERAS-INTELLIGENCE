package com.cyberas.api.resource;

import com.cyberas.domain.entity.Document;
import com.cyberas.domain.entity.Evidence;
import com.cyberas.domain.service.DocumentService;
import com.cyberas.security.JwtContext;
import com.cyberas.security.RequiresRole;
import com.cyberas.security.Roles;
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

/**
 * Pieces et preuves rattachees a un audit.
 *
 * <p>Le chemin complet est porte par la classe. Avec {@code @Path("/")}, JAX-RS
 * retenait {@code AuditResource} pour toute URL commencant par {@code /audits},
 * puis n'y trouvait aucune sous-methode correspondante et repondait 404 : le
 * televersement d'une piece etait inatteignable, sans que rien ne le signale.
 *
 * <p>Les routes qui visent un document par son identifiant, sans passer par
 * l'audit, vivent dans {@link DocumentFileResource} : elles n'ont pas le meme
 * prefixe et les melanger a reproduirait le probleme.
 */
@Path("/audits/{auditId}/documents")
@Produces(MediaType.APPLICATION_JSON)
public class DocumentResource {

    @Inject
    DocumentService documentService;

    @Inject
    JwtContext jwtContext;

    @GET
    public List<DocumentResponse> list(@PathParam("auditId") UUID auditId) {
        return documentService.list(auditId, jwtContext.getOrganizationId())
            .stream().map(DocumentResponse::new).toList();
    }

    @RequiresRole({Roles.ADMIN, Roles.RSSI, Roles.AUDITOR})

    @POST
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
    @Path("/evidences")
    public List<EvidenceResponse> listEvidences(@PathParam("auditId") UUID auditId) {
        return documentService.listEvidences(auditId, jwtContext.getOrganizationId())
            .stream().map(EvidenceResponse::new).toList();
    }

    @RequiresRole({Roles.ADMIN, Roles.RSSI, Roles.AUDITOR})

    @POST
    @Path("/evidences")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response linkEvidence(@PathParam("auditId") UUID auditId, EvidenceRequest request) {
        if (request == null || request.documentId == null) {
            throw new IllegalArgumentException("documentId requis");
        }
        Evidence e = documentService.linkEvidence(auditId, request.documentId, request.questionCode,
            request.controlCode, request.findingId, request.recommendationId, request.note,
            jwtContext.getOrganizationId());
        return Response.status(Response.Status.CREATED).entity(new EvidenceResponse(e)).build();
    }

    @RequiresRole({Roles.ADMIN, Roles.RSSI, Roles.AUDITOR})

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
        /** Contrôle directement étayé, ex. « A.5.15 ». Cumulable avec questionCode. */
        public String controlCode;
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
        public String controlCode;
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
            this.controlCode = e.control != null ? e.control.code : null;
            this.findingId = e.finding != null ? e.finding.id : null;
            this.recommendationId = e.recommendation != null ? e.recommendation.id : null;
            this.note = e.note;
            this.createdAt = e.createdAt;
        }
    }
}
