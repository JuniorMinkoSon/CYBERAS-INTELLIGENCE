package com.cyberas.api.resource;

import com.cyberas.domain.entity.Document;
import com.cyberas.domain.entity.Evidence;
import com.cyberas.domain.entity.Question;
import com.cyberas.domain.entity.QuestionAnswer;
import com.cyberas.domain.evidence.EvidenceAnalyzer;
import com.cyberas.domain.evidence.EvidenceWeighting;
import com.cyberas.domain.framework.DomainFamily;
import com.cyberas.security.JwtContext;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Dossier de preuves d'un audit.
 *
 * <h2>Ce que rassemble cet écran</h2>
 *
 * <p>Toutes les pièces versées pendant l'audit, avec pour chacune ce qu'elle
 * démontre et l'écart avec ce qui a été déclaré. Les pièces existaient déjà —
 * elles étaient déposées puis oubliées, visibles nulle part une fois
 * l'attachement fait.
 *
 * <h2>La pondération</h2>
 *
 * <p>Le poids d'une réponse est corrigé par le rapport entre le niveau qu'elle
 * déclare et celui que sa pièce démontre. Le niveau déclaré n'est jamais
 * remplacé : les deux sont affichés côte à côte, et c'est l'écart qui est
 * signalé. Substituer un jugement automatique à une déclaration humaine sans le
 * dire serait la pire façon d'utiliser cette analyse.
 */
@Path("/evidence")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EvidenceResource {

    @Inject
    JwtContext jwtContext;

    @Inject
    EvidenceAnalyzer analyzer;

    /**
     * Pièces d'un audit, analysées et pondérées.
     *
     * <p>Les pièces non encore analysées sont renvoyées avec un niveau nul et
     * signalées comme telles : les omettre laisserait croire que le dossier est
     * plus mince qu'il ne l'est.
     */
    @GET
    @Path("/audits/{auditId}")
    public Response list(@PathParam("auditId") UUID auditId) {
        if (!jwtContext.isAuthenticated()) {
            return unauthorized();
        }
        UUID org = jwtContext.getOrganizationId();

        List<Document> documents = Document.list(
            "audit.id = ?1 and organization.id = ?2 order by uploadedAt desc", auditId, org);

        // Liens pièce → question, chargés en une fois : les relire document par
        // document multiplierait les requêtes par le nombre de pièces.
        Map<UUID, Evidence> linkByDocument = new HashMap<>();
        for (Evidence e : Evidence.<Evidence>list("audit.id = ?1 and organization.id = ?2", auditId, org)) {
            if (e.document != null) {
                linkByDocument.put(e.document.id, e);
            }
        }

        Map<UUID, QuestionAnswer> answerByQuestion = new HashMap<>();
        for (QuestionAnswer a : QuestionAnswer.<QuestionAnswer>list(
                "audit.id = ?1 and organization.id = ?2", auditId, org)) {
            if (a.question != null) {
                answerByQuestion.put(a.question.id, a);
            }
        }

        List<EvidenceItem> items = new ArrayList<>();
        for (Document d : documents) {
            Evidence link = linkByDocument.get(d.id);
            Question question = link == null ? null : link.question;
            QuestionAnswer answer = question == null ? null : answerByQuestion.get(question.id);

            EvidenceWeighting.Result weighting = null;
            if (answer != null && answer.maturityLevel != null && question != null) {
                weighting = EvidenceWeighting.weigh(
                    answer.maturityLevel,
                    question.weight == null ? 1 : question.weight,
                    d.evidenceLevel,
                    d.analysisConfidence);
            }

            items.add(EvidenceItem.of(d, question, answer, link, weighting));
        }

        return Response.ok(items).build();
    }

    /**
     * Analyse (ou réanalyse) les pièces d'un audit.
     *
     * <p>Réanalyser est explicitement permis : un analyseur plus capable
     * remplace un analyseur plus faible, et l'identité de celui qui a produit la
     * note est conservée pour que deux rapports restent comparables.
     */
    @POST
    @Path("/audits/{auditId}/analyze")
    @Transactional
    public Response analyze(@PathParam("auditId") UUID auditId,
                            @QueryParam("force") @DefaultValue("false") boolean force) {
        if (!jwtContext.isAuthenticated()) {
            return unauthorized();
        }
        UUID org = jwtContext.getOrganizationId();

        List<Document> documents = force
            ? Document.list("audit.id = ?1 and organization.id = ?2", auditId, org)
            : Document.list("audit.id = ?1 and organization.id = ?2 and evidenceLevel is null",
                auditId, org);

        Map<UUID, Question> questionByDocument = new HashMap<>();
        for (Evidence e : Evidence.<Evidence>list("audit.id = ?1 and organization.id = ?2", auditId, org)) {
            if (e.document != null && e.question != null) {
                questionByDocument.put(e.document.id, e.question);
            }
        }

        int analyzed = 0;
        int unusable = 0;
        for (Document d : documents) {
            EvidenceAnalyzer.Analysis result = analyzer.analyze(d, questionByDocument.get(d.id));
            d.evidenceLevel = result.evidenceLevel();
            d.analysisConfidence = result.confidence();
            d.analysisRationale = result.rationale();
            d.analyzer = result.analyzer();
            d.analyzedAt = LocalDateTime.now();
            d.persist();

            if (result.evidenceLevel() == null) unusable++; else analyzed++;
        }

        return Response.ok(new AnalysisSummary(
            documents.size(), analyzed, unusable, analyzer.name())).build();
    }

    private Response unauthorized() {
        return Response.status(Response.Status.UNAUTHORIZED)
            .entity(new ErrorResponse("Authentification requise")).build();
    }

    // -----------------------------------------------------------------------
    // Contrats
    // -----------------------------------------------------------------------

    public record EvidenceItem(
        UUID documentId,
        String fileName,
        String contentType,
        Long sizeBytes,
        String description,
        String status,
        LocalDateTime uploadedAt,

        /** Question étayée, si la pièce est rattachée. */
        String questionCode,
        String questionText,
        String domain,
        String familyLabel,

        /** Niveau saisi par l'audité. Jamais remplacé par l'analyse. */
        Integer declaredLevel,
        /** Niveau que la pièce démontre, selon l'analyse. */
        Integer evidencedLevel,
        Double analysisConfidence,
        String analysisRationale,
        String analyzer,
        LocalDateTime analyzedAt,

        /** Rapport brut niveau démontré / niveau déclaré. */
        Double ratio,
        /** Facteur réellement appliqué au poids, modulé par la confiance. */
        Double corroboration,
        Integer questionWeight,
        Double effectiveWeight,
        boolean underEvidenced,
        String weightingExplanation,

        String note
    ) {
        static EvidenceItem of(Document d, Question q, QuestionAnswer a, Evidence link,
                               EvidenceWeighting.Result w) {
            return new EvidenceItem(
                d.id, d.fileName, d.contentType, d.sizeBytes, d.description, d.status, d.uploadedAt,
                q == null ? null : q.code,
                q == null ? null : q.text,
                q == null ? null : q.domain,
                q == null ? null : DomainFamily.of(q.domain).label(),
                a == null ? null : a.maturityLevel,
                d.evidenceLevel,
                d.analysisConfidence,
                d.analysisRationale,
                d.analyzer,
                d.analyzedAt,
                w == null ? null : w.rawRatio(),
                w == null ? null : w.corroboration(),
                q == null ? null : q.weight,
                w == null ? null : w.effectiveWeight(),
                w != null && w.isUnderEvidenced(),
                w == null ? null : w.explanation(),
                link == null ? null : link.note
            );
        }
    }

    public record AnalysisSummary(int documents, int analyzed, int unusable, String analyzer) {}

    public record ErrorResponse(String error) {}
}
