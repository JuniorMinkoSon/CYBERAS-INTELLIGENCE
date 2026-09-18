package com.cyberas.domain.risk.confidence;

import com.cyberas.domain.entity.Evidence;
import com.cyberas.domain.entity.QuestionAnswer;
import com.cyberas.domain.repository.EvidenceRepository;
import com.cyberas.domain.repository.QuestionAnswerRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Assemble les caractéristiques d'une réponse et interroge le service ML.
 *
 * <p>Ne lit que ce que le backend a déjà : le niveau déclaré
 * ({@code QuestionAnswer.maturityLevel}) et le niveau démontré par les pièces
 * jointes à la même question ({@code Document.evidenceLevel}, via
 * {@code Evidence}). Aucun contenu de document n'est transmis au service ML —
 * seuls des nombres agrégés le sont.
 */
@ApplicationScoped
public class AnswerConfidenceService {

    @Inject
    QuestionAnswerRepository answerRepository;

    @Inject
    EvidenceRepository evidenceRepository;

    @Inject
    AnswerConfidenceClient client;

    public Optional<ConfidenceVerdict> checkAnswer(UUID answerId, UUID organizationId) {
        QuestionAnswer answer = answerRepository
            .find("id = ?1 and organization.id = ?2", answerId, organizationId)
            .firstResult();
        if (answer == null) {
            return Optional.empty();
        }

        List<Evidence> evidences = evidenceRepository.find(
            "question.id = ?1 and audit.id = ?2", answer.question.id, answer.audit.id).list();

        double levelSum = 0;
        double confidenceSum = 0;
        int usable = 0;
        for (Evidence ev : evidences) {
            if (ev.document != null && ev.document.evidenceLevel != null) {
                levelSum += ev.document.evidenceLevel;
                confidenceSum += ev.document.analysisConfidence == null ? 0.0 : ev.document.analysisConfidence;
                usable++;
            }
        }

        ConfidenceFeatures features = new ConfidenceFeatures(
            answer.question.domain,
            answer.maturityLevel,
            usable == 0 ? null : levelSum / usable,
            usable == 0 ? null : confidenceSum / usable,
            evidences.size()
        );

        return client.checkAnswer(features);
    }
}
