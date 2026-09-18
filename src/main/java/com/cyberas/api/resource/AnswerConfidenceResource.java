package com.cyberas.api.resource;

import com.cyberas.domain.risk.confidence.AnswerConfidenceService;
import com.cyberas.domain.risk.confidence.ConfidenceVerdict;
import com.cyberas.security.JwtContext;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.UUID;

/**
 * Indice de confiance ML sur une réponse au questionnaire.
 *
 * <p>Consultatif : à la différence de {@code /risks}, ceci n'est jamais un
 * score d'audit. Une réponse signalée ({@code flagged}) mérite un regard
 * humain, elle n'est pas requalifiée automatiquement.
 */
@Path("/questionnaire/answers")
@Produces(MediaType.APPLICATION_JSON)
public class AnswerConfidenceResource {

    @Inject
    AnswerConfidenceService confidenceService;

    @Inject
    JwtContext jwtContext;

    @GET
    @Path("/{answerId}/confidence-check")
    public Response check(@PathParam("answerId") UUID answerId) {
        return confidenceService.checkAnswer(answerId, jwtContext.getOrganizationId())
            .map(v -> Response.ok(v).build())
            .orElseGet(() -> Response.ok(ConfidenceVerdict.unavailable(
                "Service de vérification indisponible ou réponse introuvable.")).build());
    }
}
