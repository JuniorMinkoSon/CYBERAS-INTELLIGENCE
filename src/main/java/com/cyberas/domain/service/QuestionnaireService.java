package com.cyberas.domain.service;

import com.cyberas.domain.entity.Audit;
import com.cyberas.domain.entity.Question;
import com.cyberas.domain.entity.QuestionAnswer;
import com.cyberas.domain.framework.FrameworkCatalog;
import com.cyberas.domain.repository.QuestionAnswerRepository;
import com.cyberas.domain.repository.QuestionRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Questionnaire de maturité : réponses persistées par audit et synthèse
 * (maturité 0-4, taux de complétion, contrôles faibles) qui alimente le
 * moteur de risque.
 */
@ApplicationScoped
public class QuestionnaireService {

    /** Niveau de maturité en dessous duquel un contrôle est considéré comme faible. */
    public static final int WEAK_THRESHOLD = 2;

    @Inject
    QuestionRepository questionRepository;

    @Inject
    QuestionAnswerRepository answerRepository;

    @Inject
    AuditAccessService auditAccess;

    @Inject
    AuditTrailService auditTrail;

    public List<Question> listQuestions() {
        return questionRepository.list("active = true order by domain, position");
    }

    public List<QuestionAnswer> listAnswers(UUID auditId, UUID organizationId) {
        auditAccess.requireAudit(auditId, organizationId);
        return answerRepository.list("audit.id = ?1", auditId);
    }

    @Transactional
    public QuestionAnswer answer(UUID auditId, String questionCode, Integer maturityLevel,
                                 boolean notApplicable, String comment, UUID organizationId) {
        Audit audit = auditAccess.requireAudit(auditId, organizationId);
        Question question = questionRepository.find("code = ?1 and active = true", questionCode)
            .firstResultOptional()
            .orElseThrow(() -> new IllegalArgumentException("Question inconnue : " + questionCode));

        if (!notApplicable && (maturityLevel == null || maturityLevel < 0 || maturityLevel > 4)) {
            throw new IllegalArgumentException("Le niveau de maturité doit être compris entre 0 et 4");
        }

        QuestionAnswer answer = answerRepository
            .find("audit.id = ?1 and question.id = ?2", auditId, question.id)
            .firstResultOptional()
            .orElseGet(() -> {
                QuestionAnswer created = new QuestionAnswer();
                created.audit = audit;
                created.organization = audit.organization;
                created.question = question;
                return created;
            });

        answer.notApplicable = notApplicable;
        answer.maturityLevel = notApplicable ? null : maturityLevel;
        answer.comment = comment;
        answer.answeredAt = LocalDateTime.now();
        answer.answeredBy = auditAccess.currentUser();
        answer.persist();

        auditTrail.record(AuditTrailService.QUESTION_ANSWERED, organizationId, auditId,
            "QUESTION", question.id,
            Map.of("code", question.code, "domain", question.domain,
                   "maturityLevel", maturityLevel == null ? "N/A" : maturityLevel));

        return answer;
    }

    public Summary summarize(UUID auditId, UUID organizationId) {
        auditAccess.requireAudit(auditId, organizationId);
        return summarize(listQuestions(), answerRepository.list("audit.id = ?1", auditId));
    }

    /** Synthèse pure, réutilisée par le moteur de risque et le rapport. */
    public Summary summarize(List<Question> questions, List<QuestionAnswer> answers) {
        Map<UUID, QuestionAnswer> byQuestion = answers.stream()
            .collect(Collectors.toMap(a -> a.question.id, Function.identity(), (a, b) -> b));

        Map<String, List<Question>> byDomain = questions.stream()
            .collect(Collectors.groupingBy(q -> q.domain, LinkedHashMap::new, Collectors.toList()));

        List<DomainSummary> domains = new ArrayList<>();
        int totalApplicable = 0;
        int totalAnswered = 0;
        double weightedSum = 0;
        double weightTotal = 0;
        List<WeakControl> weak = new ArrayList<>();

        for (var entry : byDomain.entrySet()) {
            int applicable = 0;
            int answered = 0;
            double domainWeighted = 0;
            double domainWeight = 0;
            int domainWeak = 0;

            for (Question q : entry.getValue()) {
                QuestionAnswer a = byQuestion.get(q.id);
                if (a != null && Boolean.TRUE.equals(a.notApplicable)) {
                    continue;
                }
                applicable++;
                if (a != null && a.maturityLevel != null) {
                    answered++;
                    domainWeighted += a.maturityLevel * q.weight;
                    domainWeight += q.weight;
                    if (a.maturityLevel < WEAK_THRESHOLD) {
                        domainWeak++;
                        weak.add(new WeakControl(q.code, q.domain, q.text, a.maturityLevel, q.weight,
                            FrameworkCatalog.forDomain(q.domain)));
                    }
                }
            }

            Double maturity = domainWeight == 0 ? null : domainWeighted / domainWeight;
            domains.add(new DomainSummary(entry.getKey(), applicable, answered,
                applicable == 0 ? 1.0 : (double) answered / applicable, maturity, domainWeak,
                FrameworkCatalog.forDomain(entry.getKey())));

            totalApplicable += applicable;
            totalAnswered += answered;
            weightedSum += domainWeighted;
            weightTotal += domainWeight;
        }

        weak.sort((a, b) -> Integer.compare(a.maturityLevel * 10 - a.weight, b.maturityLevel * 10 - b.weight));

        return new Summary(
            questions.size(),
            totalApplicable,
            totalAnswered,
            totalApplicable == 0 ? 0.0 : (double) totalAnswered / totalApplicable,
            weightTotal == 0 ? null : weightedSum / weightTotal,
            weak.size(),
            domains,
            weak
        );
    }

    public record Summary(
        int totalQuestions,
        int applicableQuestions,
        int answeredQuestions,
        double completionRate,
        /** Maturité pondérée 0-4, absente tant qu'aucune réponse n'est saisie. */
        Double maturityScore,
        int weakControls,
        List<DomainSummary> domains,
        List<WeakControl> weakControlDetails
    ) {
        /** Maturité arrondie sur l'échelle entière attendue par le moteur de risque. */
        public Integer maturityLevel() {
            return maturityScore == null ? null : (int) Math.round(maturityScore);
        }
    }

    public record DomainSummary(
        String domain,
        int applicableQuestions,
        int answeredQuestions,
        double completionRate,
        Double maturityScore,
        int weakControls,
        List<FrameworkCatalog.Reference> frameworkRefs
    ) {}

    public record WeakControl(
        String code,
        String domain,
        String text,
        int maturityLevel,
        int weight,
        List<FrameworkCatalog.Reference> frameworkRefs
    ) {}
}
