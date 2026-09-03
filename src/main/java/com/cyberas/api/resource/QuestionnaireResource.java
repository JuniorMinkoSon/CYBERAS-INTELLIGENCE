package com.cyberas.api.resource;

import com.cyberas.domain.entity.Question;
import com.cyberas.domain.entity.QuestionAnswer;
import com.cyberas.domain.framework.FrameworkCatalog;
import com.cyberas.domain.service.QuestionnaireService;
import com.cyberas.security.JwtContext;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Questionnaire d'audit.
 *
 * Le chemin racine est /audits/{auditId}/questionnaire et non "/" : avec un
 * @Path("/"), JAX-RS retenait AuditResource pour toute URL commençant par
 * /audits — sa racine littérale étant plus longue — puis renvoyait 404 faute
 * d'y trouver une méthode correspondante.
 *
 * Le catalogue de questions et les référentiels, indépendants de tout audit,
 * vivent dans QuestionnaireCatalogResource.
 */
@Path("/audits/{auditId}/questionnaire")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class QuestionnaireResource {

    @Inject
    QuestionnaireService questionnaireService;

    @Inject
    JwtContext jwtContext;

    @GET
    public QuestionnaireResponse questionnaire(@PathParam("auditId") UUID auditId) {
        UUID orgId = jwtContext.getOrganizationId();
        List<QuestionResponse> questions = questionnaireService.listQuestions().stream()
            .map(QuestionResponse::new).toList();
        List<AnswerResponse> answers = questionnaireService.listAnswers(auditId, orgId).stream()
            .map(AnswerResponse::new).toList();
        return new QuestionnaireResponse(questions, answers, questionnaireService.summarize(auditId, orgId));
    }

    @GET
    @Path("/summary")
    public QuestionnaireService.Summary summary(@PathParam("auditId") UUID auditId) {
        return questionnaireService.summarize(auditId, jwtContext.getOrganizationId());
    }

    @PUT
    @Path("/answers/{code}")
    public Response answer(@PathParam("auditId") UUID auditId,
                           @PathParam("code") String code,
                           AnswerRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Corps de requête requis");
        }
        QuestionAnswer answer = questionnaireService.answer(
            auditId, code, request.maturityLevel, request.notApplicable, request.comment,
            jwtContext.getOrganizationId());
        return Response.ok(new AnswerResponse(answer)).build();
    }

    public static class AnswerRequest {
        public Integer maturityLevel;
        public boolean notApplicable;
        public String comment;
    }

    public record QuestionnaireResponse(List<QuestionResponse> questions,
                                        List<AnswerResponse> answers,
                                        QuestionnaireService.Summary summary) {}

    public static class QuestionResponse {
        public UUID id;
        public String code;
        public String domain;
        public Integer position;
        public String text;
        public String guidance;
        public Integer weight;
        public List<FrameworkCatalog.Reference> frameworkRefs;

        public QuestionResponse(Question q) {
            this.id = q.id;
            this.code = q.code;
            this.domain = q.domain;
            this.position = q.position;
            this.text = q.text;
            this.guidance = q.guidance;
            this.weight = q.weight;
            this.frameworkRefs = FrameworkCatalog.forDomain(q.domain);
        }
    }

    public static class AnswerResponse {
        public UUID id;
        public String questionCode;
        public Integer maturityLevel;
        public Boolean notApplicable;
        public String comment;
        public LocalDateTime answeredAt;
        public String answeredByEmail;

        public AnswerResponse(QuestionAnswer a) {
            this.id = a.id;
            this.questionCode = a.question.code;
            this.maturityLevel = a.maturityLevel;
            this.notApplicable = a.notApplicable;
            this.comment = a.comment;
            this.answeredAt = a.answeredAt;
            this.answeredByEmail = a.answeredBy != null ? a.answeredBy.email : null;
        }
    }
}
