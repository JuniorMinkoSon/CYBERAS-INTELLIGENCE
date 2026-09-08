package com.cyberas.api.resource;

import com.cyberas.domain.entity.Document;
import com.cyberas.domain.service.DocumentService;
import com.cyberas.security.JwtContext;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.io.IOException;
import java.nio.file.Files;
import java.util.UUID;

/**
 * Acces a une piece par son identifiant.
 *
 * <p>Separee de {@link DocumentResource}, qui est rattachee a un audit. Les deux
 * familles de routes n'ont pas le meme prefixe, et les loger dans une classe au
 * chemin racine {@code "/"} rendait l'ensemble inatteignable : JAX-RS retenait
 * {@code AuditResource} pour tout ce qui commencait par {@code /audits}.
 *
 * <p>Le cloisonnement par organisation est verifie a chaque appel par le
 * service : un identifiant de document ne suffit pas a y acceder.
 */
@Path("/documents")
@Produces(MediaType.APPLICATION_JSON)
public class DocumentFileResource {

    @Inject
    DocumentService documentService;

    @Inject
    JwtContext jwtContext;

    @GET
    @Path("/{id}/download")
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
    @Path("/{id}/status")
    @Consumes(MediaType.APPLICATION_JSON)
    public DocumentResource.DocumentResponse updateStatus(
            @PathParam("id") UUID id, DocumentResource.StatusRequest request) {
        return new DocumentResource.DocumentResponse(documentService.updateStatus(id,
            request == null ? null : request.status, jwtContext.getOrganizationId()));
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") UUID id) throws IOException {
        documentService.delete(id, jwtContext.getOrganizationId());
        return Response.noContent().build();
    }
}
