package com.cyberas.api.resource;

import com.cyberas.domain.entity.Recommendation;
import com.cyberas.domain.repository.RecommendationRepository;
import com.cyberas.domain.service.RecommendationService;
import com.cyberas.security.JwtContext;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Recommandations de remédiation.
 *
 * Toutes les lectures sont bornées à l'organisation du jeton. La mise à jour se
 * limite au suivi — statut, responsable, échéance : le contenu de la
 * recommandation et sa référence normative ne sont pas modifiables par l'API,
 * sans quoi la traçabilité entre le constat et l'action perdrait sa valeur.
 */
@Path("/recommendations")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RecommendationResource {

    private static final Set<String> STATUSES =
        Set.of("OPEN", "IN_PROGRESS", "DONE", "ACCEPTED_RISK", "REJECTED");

    @Inject
    RecommendationRepository recommendationRepository;

    @Inject
    RecommendationService recommendationService;

    @Inject
    JwtContext jwtContext;

    @GET
    public Response list(@QueryParam("auditId") UUID auditId,
                         @QueryParam("status") String status) {
        UUID org = jwtContext.getOrganizationId();
        StringBuilder query = new StringBuilder("organization.id = ?1");
        List<Object> params = new java.util.ArrayList<>();
        params.add(org);

        if (auditId != null) {
            query.append(" and audit.id = ?").append(params.size() + 1);
            params.add(auditId);
        }
        if (status != null && !status.isBlank()) {
            query.append(" and status = ?").append(params.size() + 1);
            params.add(status.trim().toUpperCase());
        }
        query.append(" order by createdAt desc");

        List<Recommendation> rows = recommendationRepository.list(query.toString(), params.toArray());
        return Response.ok(rows.stream().map(RecommendationResponse::from).toList()).build();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") UUID id) {
        return recommendationRepository
            .find("id = ?1 and organization.id = ?2", id, jwtContext.getOrganizationId())
            .firstResultOptional()
            .map(r -> Response.ok(RecommendationResponse.from(r)).build())
            .orElseGet(() -> Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse("Recommandation introuvable")).build());
    }

    /** Suivi de la remédiation : statut, échéance, responsable. */
    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") UUID id, UpdateRequest request) {
        var found = recommendationRepository
            .find("id = ?1 and organization.id = ?2", id, jwtContext.getOrganizationId())
            .firstResultOptional();

        if (found.isEmpty()) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse("Recommandation introuvable")).build();
        }

        Recommendation rec = found.get();

        if (request.status != null) {
            String status = request.status.trim().toUpperCase();
            if (!STATUSES.contains(status)) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Statut invalide : " + request.status
                        + " (attendu : " + String.join(", ", STATUSES) + ")")).build();
            }
            rec.status = status;
        }
        if (request.dueDate != null) {
            rec.dueDate = request.dueDate;
        }
        rec.updatedAt = LocalDateTime.now();
        rec.persist();

        return Response.ok(RecommendationResponse.from(rec)).build();
    }

    /**
     * Déclenche la génération pour un audit.
     *
     * Idempotent : les recommandations déjà émises ne sont ni dupliquées ni
     * réécrites, le travail de remédiation en cours est préservé.
     */
    @POST
    @Path("/audits/{auditId}/generate")
    public Response generate(@PathParam("auditId") UUID auditId) {
        var created = recommendationService.generateForAudit(auditId);
        return Response.ok(created.stream().map(RecommendationResponse::from).toList()).build();
    }

    public static class UpdateRequest {
        public String status;
        public LocalDate dueDate;
    }

    /** Vue exposée : évite d'entraîner l'audit et l'organisation dans la réponse. */
    public record RecommendationResponse(
        UUID id,
        UUID auditId,
        UUID findingId,
        String title,
        String problem,
        String risk,
        String description,
        String priority,
        String status,
        JsonNode frameworkRefs,
        String responsible,
        LocalDate dueDate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
    ) {
        public static RecommendationResponse from(Recommendation r) {
            return new RecommendationResponse(
                r.id,
                r.audit != null ? r.audit.id : null,
                r.finding != null ? r.finding.id : null,
                r.problem,
                r.problem,
                r.risk,
                r.recommendation,
                r.priority,
                r.status,
                r.frameworkRefs,
                r.owner != null ? r.owner.email : null,
                r.dueDate,
                r.createdAt,
                r.updatedAt
            );
        }
    }

    public record ErrorResponse(String error) {
    }
}
