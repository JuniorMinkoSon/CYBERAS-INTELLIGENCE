package com.cyberas.api.resource;

import com.cyberas.api.dto.RiskDtos;
import com.cyberas.domain.entity.AuditRiskAssessment;
import com.cyberas.domain.entity.FindingRiskAssessment;
import com.cyberas.domain.repository.AuditRiskAssessmentRepository;
import com.cyberas.domain.repository.FindingRiskAssessmentRepository;
import com.cyberas.domain.service.RiskAssessmentService;
import com.cyberas.security.JwtContext;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.UUID;

/**
 * Risques évalués.
 *
 * Seules les évaluations courantes sont exposées : l'historique reste en base
 * pour la traçabilité, mais l'interface travaille sur l'état présent.
 *
 * Toutes les requêtes sont filtrées par l'organisation portée par le jeton. Le
 * paramètre auditId restreint davantage, il n'élargit jamais.
 */
@Path("/risks")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RiskResource {

    @Inject
    FindingRiskAssessmentRepository findingRiskRepository;

    @Inject
    AuditRiskAssessmentRepository auditRiskRepository;

    @Inject
    RiskAssessmentService riskAssessmentService;

    @Inject
    JwtContext jwtContext;

    @GET
    public Response list(@QueryParam("auditId") UUID auditId) {
        UUID org = jwtContext.getOrganizationId();

        List<FindingRiskAssessment> rows = auditId == null
            ? findingRiskRepository.list(
                "organization.id = ?1 and isCurrent = true order by riskScore desc", org)
            : findingRiskRepository.list(
                "organization.id = ?1 and audit.id = ?2 and isCurrent = true order by riskScore desc",
                org, auditId);

        return Response.ok(rows.stream().map(RiskDtos.RiskResponse::from).toList()).build();
    }

    @GET
    @Path("/{riskId}")
    public Response getById(@PathParam("riskId") UUID riskId) {
        return findingRiskRepository
            .find("id = ?1 and organization.id = ?2", riskId, jwtContext.getOrganizationId())
            .firstResultOptional()
            .map(r -> Response.ok(RiskDtos.RiskResponse.from(r)).build())
            .orElseGet(() -> Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse("Risque introuvable")).build());
    }

    /**
     * Exposition consolidée de l'organisation.
     *
     * Retient le score le plus élevé parmi les audits courants plutôt qu'une
     * moyenne : une entreprise dont un audit est critique et trois sont sains
     * n'est pas « moyennement exposée », elle a un problème critique.
     *
     * Le calcul reste au backend. Le tableau de bord affiche ce qu'on lui donne,
     * il ne recompose pas un score à partir de comptages.
     */
    @GET
    @Path("/score")
    public Response organizationScore() {
        UUID org = jwtContext.getOrganizationId();

        List<AuditRiskAssessment> assessments = auditRiskRepository.list(
            "organization.id = ?1 and isCurrent = true order by riskScore desc", org);

        if (assessments.isEmpty()) {
            return Response.ok(OrganizationScoreResponse.empty()).build();
        }

        AuditRiskAssessment worst = assessments.get(0);
        int findings = 0;
        int critical = 0;
        int high = 0;
        for (AuditRiskAssessment a : assessments) {
            findings += a.findingsCount == null ? 0 : a.findingsCount;
            critical += a.criticalCount == null ? 0 : a.criticalCount;
            high += a.highCount == null ? 0 : a.highCount;
        }

        return Response.ok(new OrganizationScoreResponse(
            worst.riskScore, worst.riskLevel, assessments.size(),
            findings, critical, high, worst.rationale, worst.engineVersion
        )).build();
    }

    /** Score consolidé d'un audit : la valeur affichée en tête de tableau de bord. */
    @GET
    @Path("/audits/{auditId}/score")
    public Response auditScore(@PathParam("auditId") UUID auditId) {
        return auditRiskRepository
            .find("audit.id = ?1 and organization.id = ?2 and isCurrent = true",
                auditId, jwtContext.getOrganizationId())
            .firstResultOptional()
            .map(a -> Response.ok(RiskDtos.AuditRiskResponse.from(a)).build())
            .orElseGet(() -> Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(
                    "Aucun score calculé pour cet audit. Lancez un scan ou déclenchez un recalcul."))
                .build());
    }

    /**
     * Recalcule le risque d'un audit.
     *
     * Utile après une modification du contexte — criticité d'un actif, réponses au
     * questionnaire — qui change l'évaluation sans qu'un nouveau scan soit requis.
     */
    @POST
    @Path("/audits/{auditId}/recalculate")
    public Response recalculate(@PathParam("auditId") UUID auditId) {
        try {
            AuditRiskAssessment result = riskAssessmentService.assessAudit(auditId);
            return Response.ok(RiskDtos.AuditRiskResponse.from(result)).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }

    /**
     * Exposition de l'organisation.
     *
     * Sans aucun audit évalué, le score n'est pas zéro : l'absence de mesure ne
     * vaut pas absence de risque. Le champ assessed distingue les deux, pour que
     * l'interface propose de lancer un audit au lieu d'afficher un score rassurant.
     */
    public record OrganizationScoreResponse(
        Integer score,
        String level,
        int auditsAssessed,
        int findingsCount,
        int criticalCount,
        int highCount,
        String rationale,
        String engineVersion
    ) {
        public boolean assessed() {
            return auditsAssessed > 0;
        }

        static OrganizationScoreResponse empty() {
            return new OrganizationScoreResponse(
                null, null, 0, 0, 0, 0,
                "Aucun audit évalué. Lancez un scan ou complétez un questionnaire "
                    + "pour obtenir une mesure de votre exposition.",
                null);
        }
    }

    public record ErrorResponse(String error) {
    }
}
