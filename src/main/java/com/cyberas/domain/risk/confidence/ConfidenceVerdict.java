package com.cyberas.domain.risk.confidence;

/**
 * Verdict rendu par le service ML de scoring (arbre de décision, critère Gini).
 *
 * <p>Purement consultatif : {@link #flagged()} signale à l'auditeur une
 * réponse dont le niveau déclaré paraît statistiquement peu cohérent avec les
 * preuves jointes — jamais une accusation, jamais une correction automatique
 * du score. Le score déterministe (RiskEngine, FrameworkScoringService) ne
 * lit jamais ce verdict : c'est la séparation actée pour que le calcul de
 * risque reste recalculable à la main.
 */
public record ConfidenceVerdict(
    double confidenceIndex,
    boolean flagged,
    String reason,
    String model
) {
    public static ConfidenceVerdict unavailable(String reason) {
        return new ConfidenceVerdict(0.0, false, reason, "indisponible");
    }
}
