package com.cyberas.api.resource;

import com.cyberas.domain.framework.FrameworkCatalog;
import com.cyberas.domain.service.QuestionnaireService;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.List;
import java.util.Map;

/**
 * Catalogue de questions et référentiels.
 *
 * Séparé de QuestionnaireResource parce que ces données ne dépendent d'aucun
 * audit : elles décrivent ce qui peut être évalué, pas ce qui l'a été. Les
 * garder sous /audits/{auditId}/... aurait imposé un identifiant d'audit
 * inutile pour les consulter.
 */
@Path("/")
@Produces(MediaType.APPLICATION_JSON)
public class QuestionnaireCatalogResource {

    @Inject
    QuestionnaireService questionnaireService;

    /** Catalogue complet, indépendant de tout audit. */
    @GET
    @Path("/questionnaire/questions")
    public List<QuestionnaireResource.QuestionResponse> questions() {
        return questionnaireService.listQuestions().stream()
            .map(QuestionnaireResource.QuestionResponse::new)
            .toList();
    }

    /** Référentiels disponibles et correspondance domaine vers contrôles. */
    @GET
    @Path("/frameworks")
    public Map<String, Object> frameworks() {
        return Map.of(
            "frameworks", FrameworkCatalog.FRAMEWORKS,
            "domainMappings", FrameworkCatalog.DOMAIN_MAPPINGS
        );
    }
}
