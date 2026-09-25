package com.cyberas.api.resource;

import com.cyberas.domain.entity.AnswerProjectionEntry;
import com.cyberas.domain.risk.answers.AnswerProjectionService;
import com.cyberas.security.JwtContext;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * État courant des réponses, par famille de domaines.
 *
 * <p>Pendant de {@code /risk-cartography} pour l'autre moitié de l'évaluation :
 * l'une restitue ce que les scans ont observé, celle-ci ce que l'organisation a
 * déclaré. Toutes deux lisent une vue matérialisée alimentée par Kafka, et
 * aucune des deux n'est le score opposable d'un audit — cela reste le travail
 * de {@code /risks}, qui calcule sur les réponses elles-mêmes.
 *
 * <p>L'intérêt de passer par la projection plutôt que par la synthèse du
 * questionnaire : la synthèse relit toutes les réponses d'un audit à chaque
 * appel. C'est tenable pour un audit ouvert, pas pour un tableau de bord
 * d'organisation qui en agrège plusieurs.
 *
 * <p>Toutes les requêtes sont filtrées par l'organisation portée par le jeton.
 */
@Path("/answer-projection")
@Produces(MediaType.APPLICATION_JSON)
public class AnswerProjectionResource {

    @Inject
    AnswerProjectionService projectionService;

    @Inject
    JwtContext jwtContext;

    @GET
    @Path("/audits/{auditId}")
    public Response forAudit(@PathParam("auditId") UUID auditId) {
        List<AnswerProjectionEntry> entries =
            projectionService.forAudit(jwtContext.getOrganizationId(), auditId);
        return Response.ok(entries.stream().map(Entry::from).toList()).build();
    }

    @GET
    public Response forOrganization() {
        List<AnswerProjectionEntry> entries =
            projectionService.forOrganization(jwtContext.getOrganizationId());
        return Response.ok(entries.stream().map(Entry::from).toList()).build();
    }

    /**
     * Une famille, telle qu'un écran la lit.
     *
     * <p>{@code maturiteMoyenne} vaut {@code null} tant que rien n'a été
     * répondu dans la famille. L'écran doit afficher « non évaluée » et non un
     * zéro : un audit à peine commencé n'est pas une organisation en échec.
     */
    public record Entry(UUID id, UUID auditId, String domainFamily, int answeredCount,
                        int notApplicableCount, int gapCount, Double maturiteMoyenne,
                        LocalDateTime updatedAt) {
        static Entry from(AnswerProjectionEntry e) {
            return new Entry(e.id, e.audit == null ? null : e.audit.id, e.domainFamily,
                e.answeredCount, e.notApplicableCount, e.gapCount, e.maturiteMoyenne(), e.updatedAt);
        }
    }
}
