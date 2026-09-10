package com.cyberas.api.resource;

import com.cyberas.domain.framework.DomainFamily;
import com.cyberas.domain.service.QuestionnaireService;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

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

    /**
     * Familles de domaines, dans l'ordre des sessions du questionnaire.
     *
     * <p>Rendue même lorsqu'une famille n'a aucune question : c'est la seule
     * façon pour l'interface d'afficher une session vide plutôt que de
     * l'omettre. Une session absente ne se remarque pas ; une session vide dit
     * qu'il reste des questions à écrire.
     */
    @GET
    @Path("/questionnaire/families")
    public List<FamilyResponse> families() {
        List<DomainFamily> presented = DomainFamily.presented();
        return presented.stream()
            .map(f -> new FamilyResponse(
                f.name(), f.label(), f.description(), presented.indexOf(f), f.domains()))
            .toList();
    }

    public record FamilyResponse(
        String family,
        String label,
        String description,
        int position,
        List<String> domains
    ) {}

    // La route /frameworks servait ici le catalogue codé en dur (FrameworkCatalog).
    // Elle est reprise par FrameworkResource, qui lit les référentiels en base et
    // sait descendre jusqu'au contrôle — ce que la constante Java ne permettait
    // pas, son unité étant le domaine interne.
    //
    // Aucun client ne l'appelait : le frontend passe par /posture/frameworks, qui
    // reste inchangé. FrameworkCatalog demeure utilisé par huit autres classes et
    // n'est pas retiré ici.
}
