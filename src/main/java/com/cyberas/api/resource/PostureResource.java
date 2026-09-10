package com.cyberas.api.resource;

import com.cyberas.domain.entity.Organization;
import com.cyberas.domain.framework.DomainFamily;
import com.cyberas.domain.framework.FrameworkCatalog;
import com.cyberas.domain.framework.SubscriptionPlan;
import com.cyberas.domain.service.PostureService;
import com.cyberas.security.JwtContext;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Posture de sécurité et rapport d'audit organisationnel.
 *
 * <h2>Un audit n'a pas besoin d'un scan pour produire un résultat</h2>
 *
 * <p>Beaucoup de démarches commencent — et certaines s'arrêtent — à
 * l'évaluation organisationnelle : questionnaire de maturité, pièces
 * justificatives, entretiens. Jusqu'ici, sans constat de scanner, la plateforme
 * ne produisait ni score, ni recommandation, ni rapport. Le client remplissait
 * un questionnaire et n'obtenait qu'un pourcentage de complétion.
 *
 * <p>Ces routes rendent ce chemin complet : posture sur une échelle de Likert,
 * histogramme de la distribution des réponses, axes d'amélioration ordonnés par
 * gain attendu, et lecture par référentiel.
 */
@Path("/posture")
@Produces(MediaType.APPLICATION_JSON)
public class PostureResource {

    @Inject
    JwtContext jwtContext;

    @Inject
    PostureService postureService;

    /** Posture complète d'un audit : niveau, domaines, histogramme, axes. */
    @GET
    @Path("/audits/{auditId}")
    public Response posture(@PathParam("auditId") UUID auditId) {
        if (!jwtContext.isAuthenticated()) {
            return unauthorized();
        }
        return Response.ok(
            postureService.evaluate(auditId, jwtContext.getOrganizationId())
        ).build();
    }

    /**
     * Recommandations organisationnelles, éventuellement filtrées par
     * référentiel.
     *
     * <p>Elles sont dérivées des contrôles non tenus, pas rédigées par un
     * modèle : chacune cite le domaine concerné, le nombre de contrôles en
     * défaut et les références du référentiel demandé. Un filtre sur un
     * référentiel absent du catalogue ne renvoie pas une liste vide
     * silencieuse — il est signalé.
     *
     * @param framework code de référentiel (ISO27001, ISO27002, NIST_CSF, CIS…)
     */
    @GET
    @Path("/audits/{auditId}/recommendations")
    public Response recommendations(@PathParam("auditId") UUID auditId,
                                    @QueryParam("framework") String framework) {
        if (!jwtContext.isAuthenticated()) {
            return unauthorized();
        }

        String wanted = framework == null || framework.isBlank()
            ? null : framework.trim().toUpperCase();

        if (wanted != null) {
            Organization org = Organization.findById(jwtContext.getOrganizationId());
            SubscriptionPlan plan = SubscriptionPlan.from(org == null ? null : org.subscriptionPlan);
            if (!plan.covers(wanted)) {
                // Refus explicite plutot qu'une liste vide : sans message, le
                // client conclurait qu'il n'a aucun ecart sur ce referentiel.
                return Response.status(Response.Status.PAYMENT_REQUIRED)
                    .entity(new ErrorResponse("Le referentiel " + wanted
                        + " n'est pas couvert par la formule " + plan.label()
                        + ". Il est disponible avec la formule "
                        + SubscriptionPlan.ANNUEL.label() + "."))
                    .build();
            }
        }

        if (wanted != null && FrameworkCatalog.FRAMEWORKS.stream()
                .noneMatch(f -> f.code().equalsIgnoreCase(wanted))) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse("Référentiel inconnu : " + framework
                    + ". Disponibles : " + FrameworkCatalog.FRAMEWORKS.stream()
                        .map(FrameworkCatalog.Framework::code).toList()))
                .build();
        }

        var report = postureService.evaluate(auditId, jwtContext.getOrganizationId());
        List<OrganizationalRecommendation> out = new ArrayList<>();

        for (var axis : report.improvementAxes()) {
            List<FrameworkCatalog.Reference> refs = axis.frameworkRefs();
            if (wanted != null) {
                refs = refs.stream().filter(r -> r.framework().equalsIgnoreCase(wanted)).toList();
                // Un axe sans correspondance dans le référentiel demandé est
                // écarté : l'afficher sans référence laisserait croire à une
                // exigence du référentiel qui n'existe pas.
                if (refs.isEmpty()) {
                    continue;
                }
            }

            DomainFamily family = DomainFamily.of(axis.domain());
            out.add(new OrganizationalRecommendation(
                axis.domain(),
                family.name(),
                family.label(),
                titleFor(axis),
                problemFor(axis),
                actionFor(axis),
                priorityFor(axis),
                axis.weakControls(),
                axis.averageLevel(),
                axis.expectedGain(),
                axis.foundational(),
                axis.weakQuestions(),
                refs
            ));
        }

        return Response.ok(out).build();
    }

    /**
     * Catalogue des referentiels, avec ce que la formule souscrite couvre.
     *
     * <p>Les referentiels non couverts sont renvoyes et marques {@code
     * available = false}, jamais retires de la liste : un client doit voir ce
     * que sa formule ne comprend pas, sinon il ne peut pas decider d'en
     * changer. Les masquer donnerait l'impression d'un catalogue plus pauvre
     * qu'il ne l'est.
     */
    @GET
    @Path("/frameworks")
    public Response frameworks() {
        if (!jwtContext.isAuthenticated()) {
            return unauthorized();
        }

        Organization org = Organization.findById(jwtContext.getOrganizationId());
        SubscriptionPlan plan = SubscriptionPlan.from(org == null ? null : org.subscriptionPlan);

        List<FrameworkOption> options = FrameworkCatalog.FRAMEWORKS.stream()
            .map(f -> new FrameworkOption(
                f.code(), f.name(), f.publisher(), f.version(), f.url(),
                plan.covers(f.code()),
                plan.covers(f.code()) ? null
                    : "Disponible avec la formule " + SubscriptionPlan.ANNUEL.label() + "."))
            .toList();

        return Response.ok(new FrameworkCatalogResponse(
            plan.name(), plan.label(), options)).build();
    }

    public record FrameworkCatalogResponse(
        String plan, String planLabel, List<FrameworkOption> frameworks) {}

    public record FrameworkOption(
        String code, String name, String publisher, String version, String url,
        boolean available, String lockedReason) {}

    // -----------------------------------------------------------------------
    // Formulation
    // -----------------------------------------------------------------------

    private String titleFor(PostureService.ImprovementAxis axis) {
        return "Renforcer le domaine " + axis.domain()
            + (axis.foundational() ? " (fondateur)" : "");
    }

    private String problemFor(PostureService.ImprovementAxis axis) {
        return axis.weakControls() + " contrôle(s) non tenu(s) dans ce domaine, "
            + "à un niveau moyen de " + String.format(java.util.Locale.ROOT, "%.1f", axis.averageLevel())
            + " sur 4.";
    }

    private String actionFor(PostureService.ImprovementAxis axis) {
        if (axis.foundational()) {
            return "Traiter ce domaine en priorité : il conditionne l'efficacité des autres. "
                + "Tant qu'il reste en défaut, les progrès réalisés ailleurs ne se traduisent "
                + "pas en réduction du risque réel.";
        }
        return "Reprendre les contrôles listés et porter chacun au niveau attendu, "
            + "en s'appuyant sur les références du référentiel retenu.";
    }

    /**
     * Priorité déduite du gain attendu.
     *
     * <p>Les seuils sont explicites plutôt que calculés relativement à la
     * distribution : une priorité qui change parce qu'un autre domaine s'est
     * amélioré serait incompréhensible pour l'équipe qui la reçoit.
     */
    private String priorityFor(PostureService.ImprovementAxis axis) {
        double gain = axis.expectedGain();
        if (gain >= 12) return "CRITICAL";
        if (gain >= 6) return "HIGH";
        if (gain >= 2.5) return "MEDIUM";
        return "LOW";
    }

    private Response unauthorized() {
        return Response.status(Response.Status.UNAUTHORIZED)
            .entity(new ErrorResponse("Authentification requise")).build();
    }

    public record OrganizationalRecommendation(
        String domain,
        /** Famille de rattachement, pour regrouper les recommandations à la restitution. */
        String family,
        String familyLabel,
        String title,
        String problem,
        String action,
        String priority,
        int weakControls,
        double averageLevel,
        double expectedGain,
        boolean foundational,
        /** Questions qui ont fait chuter le domaine, de la plus faible à la moins faible. */
        List<PostureService.WeakQuestion> weakQuestions,
        List<FrameworkCatalog.Reference> frameworkRefs
    ) {}

    public record ErrorResponse(String error) {}
}
