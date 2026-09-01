package com.cyberas.domain.risk;

import java.util.List;

/**
 * Résultat d'une évaluation de risque.
 *
 * Le score seul ne vaut rien s'il ne peut pas être défendu devant un auditeur :
 * chaque évaluation transporte donc sa justification et le détail de ce qui l'a
 * fait monter ou descendre.
 */
public record RiskAssessment(

    /** Risque contextualisé, 0 à 100. Distinct du CVSS. */
    int riskScore,

    RiskLevel riskLevel,

    /** Probabilité calculée, 0 à 1. Exposée pour la matrice de risque. */
    double likelihood,

    /** Impact calculé, 0 à 1. Exposé pour la matrice de risque. */
    double impact,

    /**
     * Degré de certitude de l'évaluation, 0 à 1.
     * Une confiance basse n'atténue pas le risque : elle signale qu'il faut
     * instruire davantage avant de décider.
     */
    double confidence,

    /** Explication en une phrase, lisible telle quelle dans un rapport. */
    String rationale,

    /** Détail des contributions, du plus au moins déterminant. */
    List<Factor> contributingFactors,

    /** Version du modèle de calcul, pour retrouver comment un score a été obtenu. */
    String engineVersion
) {

    /**
     * Contribution d'une dimension au score.
     *
     * @param name        dimension concernée
     * @param value       valeur normalisée retenue, 0 à 1
     * @param weight      poids appliqué
     * @param contribution points effectivement apportés au score final
     * @param explanation formulation lisible de ce que cette dimension traduit
     */
    public record Factor(
        String name,
        double value,
        double weight,
        double contribution,
        String explanation
    ) {}

    /** Vrai quand le niveau est élevé mais que les données ne le soutiennent pas fermement. */
    public boolean needsReview(double lowConfidenceThreshold) {
        return riskLevel.isElevated() && confidence < lowConfidenceThreshold;
    }

    /** Les trois dimensions les plus déterminantes, pour un affichage resserré. */
    public List<Factor> topFactors() {
        return contributingFactors.stream().limit(3).toList();
    }
}
