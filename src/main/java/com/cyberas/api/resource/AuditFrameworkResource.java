package com.cyberas.api.resource;

import com.cyberas.domain.service.AuditAccessService;
import com.cyberas.domain.service.FrameworkScoringService;
import com.cyberas.security.JwtContext;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;

import java.util.List;
import java.util.UUID;

/**
 * Score d'un audit, référentiel par référentiel.
 *
 * <p>Distinct de {@link FrameworkResource}, qui sert le catalogue : ici tout
 * dépend d'un audit, et l'accès est donc contrôlé par organisation.
 *
 * <p>Il n'existe volontairement <strong>pas</strong> de route rendant « le »
 * score d'un audit tous référentiels confondus. Additionner ISO 27001 et NIST
 * CSF donnerait un nombre qui ne veut rien dire : ils ne couvrent pas le même
 * périmètre et ne se recouvrent que partiellement. Le score global de Cyberas,
 * lorsqu'il existera, combinera déclaration, preuves et scans — pas des
 * référentiels entre eux.
 */
@Path("/audits/{auditId}/frameworks")
@Produces(MediaType.APPLICATION_JSON)
public class AuditFrameworkResource {

    @Inject
    FrameworkScoringService scoringService;

    @Inject
    AuditAccessService auditAccess;

    @Inject
    JwtContext jwtContext;

    /**
     * Score détaillé d'un référentiel.
     *
     * <p>Le détail par contrôle n'est rendu que sur demande : 93 évaluations
     * alourdissent une réponse dont un tableau de bord n'a pas besoin.
     */
    @GET
    @Path("/{frameworkCode}/score")
    public FrameworkScoringService.FrameworkScore score(
            @PathParam("auditId") UUID auditId,
            @PathParam("frameworkCode") String frameworkCode,
            @QueryParam("includeControls") Boolean includeControls) {

        auditAccess.requireAudit(auditId, jwtContext.getOrganizationId());

        FrameworkScoringService.FrameworkScore score = scoringService.score(auditId, frameworkCode);
        if (score == null) {
            throw new NotFoundException(
                "Référentiel inconnu ou sans version en vigueur : " + frameworkCode);
        }

        if (!Boolean.TRUE.equals(includeControls)) {
            return withoutControls(score);
        }
        return score;
    }

    private static FrameworkScoringService.FrameworkScore withoutControls(
            FrameworkScoringService.FrameworkScore s) {
        return new FrameworkScoringService.FrameworkScore(
            s.frameworkCode(), s.frameworkName(), s.version(),
            s.score(), s.coverage(), s.totalControls(), s.assessedControls(),
            s.compliant(), s.partiallyCompliant(), s.nonCompliant(),
            s.notAssessed(), s.notApplicable(),
            s.controlsWithReviewRequiredMapping(), s.unmappedControls(),
            s.engineVersion(), s.rationale(), List.of());
    }
}
