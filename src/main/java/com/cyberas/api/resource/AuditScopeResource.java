package com.cyberas.api.resource;

import com.cyberas.domain.entity.AuditScope;
import com.cyberas.domain.service.AuditScopeService;
import com.cyberas.security.JwtContext;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Périmètre autorisé d'un audit.
 *
 * Déclarer une cible ne suffit pas à la rendre scannable : il faut l'autoriser
 * explicitement via POST /{scopeId}/authorize. Cette séparation rend l'autorisation
 * visible et traçable plutôt qu'implicite.
 */
@Path("/audits/{auditId}/scopes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuditScopeResource {

    @Inject
    AuditScopeService auditScopeService;

    @Inject
    JwtContext jwtContext;

    @GET
    public Response list(@PathParam("auditId") UUID auditId) {
        try {
            List<ScopeResponse> scopes = auditScopeService
                .list(auditId, jwtContext.getOrganizationId())
                .stream()
                .map(ScopeResponse::new)
                .toList();
            return Response.ok(scopes).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }

    @POST
    public Response declare(@PathParam("auditId") UUID auditId, DeclareScopeRequest request) {
        try {
            var scope = auditScopeService.declare(
                auditId, request.scopeType, request.value, request.notes,
                jwtContext.getOrganizationId());
            return Response.status(Response.Status.CREATED)
                .entity(new ScopeResponse(scope)).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }

    /** Ouvre effectivement la cible au scan. Acte distinct de la déclaration. */
    @POST
    @Path("/{scopeId}/authorize")
    public Response authorize(@PathParam("scopeId") UUID scopeId, AuthorizeScopeRequest request) {
        try {
            var scope = auditScopeService.authorize(
                scopeId, request.authorizationReference, jwtContext.getOrganizationId());
            return Response.ok(new ScopeResponse(scope)).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }

    @DELETE
    @Path("/{scopeId}")
    public Response revoke(@PathParam("scopeId") UUID scopeId) {
        try {
            auditScopeService.revoke(scopeId, jwtContext.getOrganizationId());
            return Response.noContent().build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }

    public static class DeclareScopeRequest {
        public String scopeType; // CIDR | IP | HOSTNAME | DOMAIN
        public String value;
        public String notes;
    }

    public static class AuthorizeScopeRequest {
        /** Élément vérifiable rattachant la décision : bon de commande, mail, contrat. */
        public String authorizationReference;
    }

    public static class ScopeResponse {
        public UUID id;
        public String scopeType;
        public String value;
        public Boolean authorized;
        public String authorizationReference;
        public LocalDateTime authorizedAt;
        public String authorizedByEmail;
        public LocalDateTime revokedAt;
        public String notes;
        public LocalDateTime createdAt;
        public boolean active;

        public ScopeResponse(AuditScope scope) {
            this.id = scope.id;
            this.scopeType = scope.scopeType;
            this.value = scope.value;
            this.authorized = scope.authorized;
            this.authorizationReference = scope.authorizationReference;
            this.authorizedAt = scope.authorizedAt;
            this.authorizedByEmail = scope.authorizedBy != null ? scope.authorizedBy.email : null;
            this.revokedAt = scope.revokedAt;
            this.notes = scope.notes;
            this.createdAt = scope.createdAt;
            this.active = scope.isActive();
        }
    }

    public static class ErrorResponse {
        public String error;

        public ErrorResponse(String error) {
            this.error = error;
        }
    }
}
