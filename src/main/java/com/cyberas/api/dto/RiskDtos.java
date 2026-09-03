package com.cyberas.api.dto;

import com.cyberas.domain.entity.AuditRiskAssessment;
import com.cyberas.domain.entity.FindingRiskAssessment;
import com.fasterxml.jackson.databind.JsonNode;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Vues exposées des évaluations de risque.
 *
 * Les entités ne sont pas sérialisées directement : un constat renvoyé tel quel
 * entraîne son scan, puis son audit, puis l'organisation et ses rôles — plus de
 * cent kilo-octets pour trois constats, et toute la structure interne exposée.
 *
 * Les échelles continues du moteur (0 à 1) sont converties en paliers nommés :
 * l'interface raisonne en probabilité faible, moyenne ou élevée, pas en 0,63.
 */
public final class RiskDtos {

    private RiskDtos() {
    }

    /** Risque d'un constat, tel que consommé par la carte des risques. */
    public record RiskResponse(
        UUID id,
        UUID auditId,
        UUID findingId,
        String title,
        String description,
        String probability,
        String impact,
        int score,
        String severity,
        double confidence,
        boolean needsReview,
        String status,
        JsonNode contributingFactors,
        String engineVersion,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
    ) {
        public static RiskResponse from(FindingRiskAssessment r) {
            return new RiskResponse(
                r.id,
                r.audit != null ? r.audit.id : null,
                r.finding != null ? r.finding.id : null,
                r.finding != null ? r.finding.title : "Risque",
                r.rationale,
                band(r.likelihood),
                band(r.impact),
                r.riskScore,
                normalizeSeverity(r.riskLevel),
                round(r.confidence),
                Boolean.TRUE.equals(r.needsReview),
                r.finding != null && r.finding.status != null ? r.finding.status : "OPEN",
                r.contributingFactors,
                r.engineVersion,
                r.calculatedAt,
                r.calculatedAt
            );
        }
    }

    /** Score consolidé d'un audit, pour l'en-tête du tableau de bord. */
    public record AuditRiskResponse(
        UUID id,
        UUID auditId,
        int score,
        String level,
        int findingsCount,
        int criticalCount,
        int highCount,
        Double maturityScore,
        Double completionRate,
        String rationale,
        JsonNode contributingFactors,
        String engineVersion,
        LocalDateTime calculatedAt
    ) {
        public static AuditRiskResponse from(AuditRiskAssessment a) {
            return new AuditRiskResponse(
                a.id,
                a.audit != null ? a.audit.id : null,
                a.riskScore,
                a.riskLevel,
                a.findingsCount == null ? 0 : a.findingsCount,
                a.criticalCount == null ? 0 : a.criticalCount,
                a.highCount == null ? 0 : a.highCount,
                a.maturityScore,
                a.completionRate,
                a.rationale,
                a.contributingFactors,
                a.engineVersion,
                a.calculatedAt
            );
        }
    }

    /**
     * Convertit une valeur continue en palier. Les bornes suivent les seuils du
     * moteur : en deçà de 0,33 le facteur ne pèse pas, au-delà de 0,66 il domine.
     */
    private static String band(Double value) {
        if (value == null) {
            return "MEDIUM";
        }
        if (value >= 0.66) {
            return "HIGH";
        }
        if (value >= 0.33) {
            return "MEDIUM";
        }
        return "LOW";
    }

    /**
     * L'interface ne distingue pas INFORMATION de LOW : un risque sans action due
     * s'affiche au niveau le plus bas plutôt que dans une catégorie à part.
     */
    private static String normalizeSeverity(String riskLevel) {
        return "INFORMATION".equals(riskLevel) ? "LOW" : riskLevel;
    }

    private static double round(Double v) {
        return v == null ? 0 : Math.round(v * 100) / 100.0;
    }
}
