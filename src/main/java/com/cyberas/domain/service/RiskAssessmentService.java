package com.cyberas.domain.service;

import com.cyberas.domain.entity.Audit;
import com.cyberas.domain.entity.AuditRiskAssessment;
import com.cyberas.domain.entity.Finding;
import com.cyberas.domain.entity.FindingRiskAssessment;
import com.cyberas.domain.repository.AuditRepository;
import com.cyberas.domain.repository.AuditRiskAssessmentRepository;
import com.cyberas.domain.repository.FindingRepository;
import com.cyberas.domain.repository.FindingRiskAssessmentRepository;
import com.cyberas.domain.risk.FindingRiskMapper;
import com.cyberas.domain.risk.RiskAssessment;
import com.cyberas.domain.risk.RiskEngine;
import com.cyberas.domain.risk.RiskLevel;
import com.cyberas.domain.risk.RiskScoringConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.context.control.ActivateRequestContext;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Relie le moteur de risque aux données de l'audit.
 *
 * Le moteur lui-même reste pur : il prend des entrées et rend un résultat. Ce
 * service se charge de lui fournir ces entrées depuis les constats persistés, de
 * conserver le résultat, et d'en tirer un score d'audit agrégé.
 *
 * L'historisation se fait par insertion : un recalcul ajoute une ligne et bascule
 * la précédente hors de l'état courant. On peut ainsi répondre à « pourquoi ce
 * constat était-il classé critique en septembre » avec la version du moteur qui
 * l'a produit.
 */
@ApplicationScoped
public class RiskAssessmentService {

    private static final Logger LOG = Logger.getLogger(RiskAssessmentService.class);

    @Inject
    RiskEngine riskEngine;

    @Inject
    RiskScoringConfig riskConfig;

    @Inject
    FindingRiskMapper findingRiskMapper;

    @Inject
    FindingRepository findingRepository;

    @Inject
    FindingRiskAssessmentRepository findingRiskRepository;

    @Inject
    AuditRiskAssessmentRepository auditRiskRepository;

    @Inject
    AuditRepository auditRepository;

    @Inject
    ObjectMapper objectMapper;

    /**
     * Évalue tous les constats d'un audit, puis en agrège le score.
     *
     * Appelé après un scan. Le contexte de requête est activé explicitement : la
     * méthode s'exécute depuis le pool de travail, hors du thread HTTP.
     */
    @Transactional
    @ActivateRequestContext
    public AuditRiskAssessment assessAudit(UUID auditId) {
        Audit audit = auditRepository.findActiveById(auditId)
            .orElseThrow(() -> new IllegalArgumentException("Audit introuvable : " + auditId));

        List<Finding> findings = findingRepository.list("audit.id = ?1", auditId);
        LOG.infof("Évaluation du risque : %d constat(s) pour l'audit %s", findings.size(), auditId);

        for (Finding finding : findings) {
            assessFindingInternal(finding);
        }

        return aggregateForAudit(audit, findings);
    }

    /** Évalue un constat isolé, sans toucher au score d'audit. */
    @Transactional
    @ActivateRequestContext
    public FindingRiskAssessment assessFinding(UUID findingId) {
        Finding finding = findingRepository.findByIdOptional(findingId)
            .orElseThrow(() -> new IllegalArgumentException("Constat introuvable : " + findingId));
        return assessFindingInternal(finding);
    }

    private FindingRiskAssessment assessFindingInternal(Finding finding) {
        FindingRiskMapper.MappingResult mapping = findingRiskMapper.map(finding);
        RiskAssessment result = riskEngine.evaluate(mapping.input());

        // L'évaluation précédente n'est pas supprimée : elle sort de l'état
        // courant et reste consultable.
        findingRiskRepository.update(
            "isCurrent = false where finding.id = ?1 and isCurrent = true", finding.id);

        FindingRiskAssessment row = new FindingRiskAssessment();
        row.finding = finding;
        row.audit = finding.audit;
        row.organization = finding.organization;
        row.riskScore = result.riskScore();
        row.riskLevel = result.riskLevel().name();
        row.likelihood = result.likelihood();
        row.impact = result.impact();
        row.confidence = result.confidence();
        row.rationale = result.rationale();
        row.contributingFactors = toJson(result);
        row.inputSnapshot = toJson(mapping);
        row.engineVersion = result.engineVersion();
        row.needsReview = result.needsReview(riskConfig.lowConfidenceThreshold);
        row.isCurrent = true;
        row.calculatedAt = LocalDateTime.now();
        row.persist();

        return row;
    }

    /**
     * Agrège les risques d'un audit en un score unique.
     *
     * La moyenne serait trompeuse : cinquante constats mineurs feraient disparaître
     * un risque critique. Le score d'audit part donc du plus élevé de ses constats,
     * puis monte selon l'accumulation — un audit qui cumule les risques élevés est
     * plus exposé qu'un audit qui n'en compte qu'un.
     */
    private AuditRiskAssessment aggregateForAudit(Audit audit, List<Finding> findings) {
        List<FindingRiskAssessment> current = findingRiskRepository.list(
            "audit.id = ?1 and isCurrent = true", audit.id);

        int maxScore = 0;
        int critical = 0;
        int high = 0;
        double confidenceSum = 0;

        for (FindingRiskAssessment fra : current) {
            maxScore = Math.max(maxScore, fra.riskScore);
            confidenceSum += fra.confidence;
            RiskLevel level = RiskLevel.valueOf(fra.riskLevel);
            if (level == RiskLevel.CRITICAL) {
                critical++;
            } else if (level == RiskLevel.HIGH) {
                high++;
            }
        }

        // Majoration d'accumulation, plafonnée : le cumul aggrave la situation
        // sans jamais faire passer à lui seul un audit sans risque élevé en zone
        // critique.
        int accumulation = Math.min(15, critical * 5 + high * 2);
        int score = Math.min(100, maxScore + accumulation);

        RiskLevel level = classify(score);
        double avgConfidence = current.isEmpty() ? 0 : confidenceSum / current.size();

        auditRiskRepository.update(
            "isCurrent = false where audit.id = ?1 and isCurrent = true", audit.id);

        AuditRiskAssessment row = new AuditRiskAssessment();
        row.audit = audit;
        row.organization = audit.organization;
        row.riskScore = score;
        row.riskLevel = level.name();
        row.findingsCount = findings.size();
        row.criticalCount = critical;
        row.highCount = high;
        row.rationale = buildAuditRationale(score, level, findings.size(), critical, high, maxScore, avgConfidence);
        row.contributingFactors = buildAuditFactors(maxScore, accumulation, critical, high, avgConfidence);
        row.engineVersion = RiskEngine.ENGINE_VERSION;
        row.isCurrent = true;
        row.calculatedAt = LocalDateTime.now();
        row.persist();

        LOG.infof("Audit %s : score %d/100 (%s), %d constat(s) dont %d critique(s) et %d élevé(s)",
            audit.id, score, level.name(), findings.size(), critical, high);

        return row;
    }

    private RiskLevel classify(int score) {
        if (score >= riskConfig.thresholdCritical) return RiskLevel.CRITICAL;
        if (score >= riskConfig.thresholdHigh) return RiskLevel.HIGH;
        if (score >= riskConfig.thresholdMedium) return RiskLevel.MEDIUM;
        if (score >= riskConfig.thresholdLow) return RiskLevel.LOW;
        return RiskLevel.INFORMATION;
    }

    private String buildAuditRationale(int score, RiskLevel level, int total,
                                       int critical, int high, int maxScore, double confidence) {
        StringBuilder sb = new StringBuilder();
        sb.append("Exposition ").append(level.label().toLowerCase())
          .append(" (").append(score).append("/100). ");

        if (total == 0) {
            return "Aucun constat évalué : le score ne reflète pas encore l'exposition réelle.";
        }

        sb.append(total).append(" constat(s) évalué(s)");
        if (critical > 0 || high > 0) {
            sb.append(", dont ").append(critical).append(" critique(s) et ")
              .append(high).append(" élevé(s)");
        }
        sb.append(". Le score part du constat le plus grave (")
          .append(maxScore).append("/100), majoré par l'accumulation. ");

        if (confidence < riskConfig.lowConfidenceThreshold) {
            sb.append("Confiance moyenne faible (")
              .append(Math.round(confidence * 100))
              .append(" %) : les évaluations demandent à être consolidées.");
        } else {
            sb.append("Confiance moyenne ").append(Math.round(confidence * 100)).append(" %.");
        }
        return sb.toString();
    }

    private ObjectNode buildAuditFactors(int maxScore, int accumulation,
                                         int critical, int high, double confidence) {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("highestFindingScore", maxScore);
        node.put("accumulationBonus", accumulation);
        node.put("criticalFindings", critical);
        node.put("highFindings", high);
        node.put("averageConfidence", Math.round(confidence * 100) / 100.0);
        return node;
    }

    private com.fasterxml.jackson.databind.JsonNode toJson(RiskAssessment result) {
        ArrayNode arr = objectMapper.createArrayNode();
        for (RiskAssessment.Factor f : result.contributingFactors()) {
            ObjectNode n = objectMapper.createObjectNode();
            n.put("name", f.name());
            n.put("value", Math.round(f.value() * 1000) / 1000.0);
            n.put("weight", f.weight());
            n.put("contribution", Math.round(f.contribution() * 100) / 100.0);
            n.put("explanation", f.explanation());
            arr.add(n);
        }
        return arr;
    }

    /**
     * Instantané des entrées. Sans lui, le score ne serait pas reproductible et
     * donc pas auditable : on saurait quel score a été donné, pas pourquoi.
     */
    private com.fasterxml.jackson.databind.JsonNode toJson(FindingRiskMapper.MappingResult mapping) {
        ObjectNode node = objectMapper.valueToTree(mapping.input());
        ArrayNode estimated = objectMapper.createArrayNode();
        mapping.estimatedDimensions().forEach(estimated::add);
        node.set("estimatedDimensions", estimated);
        node.put("complete", mapping.isComplete());
        return node;
    }
}
