package com.cyberas.domain.risk;

import jakarta.enterprise.context.ApplicationScoped;

import java.util.Map;

/**
 * Coefficients et seuils du moteur de risque.
 *
 * Tout ce qui pondère une décision est ici : aucune constante numérique ne doit
 * apparaître dans RiskEngine. Une organisation qui juge que l'exposition Internet
 * pèse plus que la maturité déclarée modifie un poids ici, pas la formule.
 *
 * Les poids de chaque groupe somment à 1,0 — la validation est faite au démarrage
 * plutôt que laissée à la relecture.
 */
@ApplicationScoped
public class RiskScoringConfig {

    // ---------------------------------------------------------------------
    // Probabilité : quelle est la chance que le risque se matérialise ?
    // ---------------------------------------------------------------------

    /** Le CVSS reste le signal technique dominant, sans être le seul. */
    public double weightCvss = 0.35;

    /** L'existence d'un exploit change plus la donne qu'un score théorique élevé. */
    public double weightExploitability = 0.25;

    public double weightExposure = 0.20;

    /** Une organisation immature détecte et corrige moins vite. */
    public double weightMaturityGap = 0.10;

    public double weightControlFailures = 0.10;

    // ---------------------------------------------------------------------
    // Impact : que se passe-t-il si le risque se matérialise ?
    // ---------------------------------------------------------------------

    public double weightAssetCriticality = 0.40;
    public double weightBusinessImpact = 0.35;
    public double weightDataSensitivity = 0.25;

    // ---------------------------------------------------------------------
    // Conversion des échelles nommées en valeurs 0-1
    // ---------------------------------------------------------------------

    public Map<RiskInput.Exploitability, Double> exploitabilityScale = Map.of(
        RiskInput.Exploitability.NONE, 0.05,
        RiskInput.Exploitability.THEORETICAL, 0.30,
        RiskInput.Exploitability.PROOF_OF_CONCEPT, 0.55,
        RiskInput.Exploitability.FUNCTIONAL, 0.80,
        RiskInput.Exploitability.ACTIVELY_EXPLOITED, 1.00
    );

    public Map<RiskInput.Criticality, Double> criticalityScale = Map.of(
        RiskInput.Criticality.LOW, 0.20,
        RiskInput.Criticality.MEDIUM, 0.45,
        RiskInput.Criticality.HIGH, 0.75,
        RiskInput.Criticality.CRITICAL, 1.00
    );

    public Map<RiskInput.Impact, Double> impactScale = Map.of(
        RiskInput.Impact.NEGLIGIBLE, 0.10,
        RiskInput.Impact.MINOR, 0.30,
        RiskInput.Impact.MODERATE, 0.50,
        RiskInput.Impact.MAJOR, 0.80,
        RiskInput.Impact.SEVERE, 1.00
    );

    public Map<RiskInput.DataSensitivity, Double> dataSensitivityScale = Map.of(
        RiskInput.DataSensitivity.PUBLIC, 0.10,
        RiskInput.DataSensitivity.INTERNAL, 0.40,
        RiskInput.DataSensitivity.CONFIDENTIAL, 0.75,
        RiskInput.DataSensitivity.REGULATED, 1.00
    );

    /** Réduction appliquée au risque brut par les mesures compensatoires. */
    public Map<RiskInput.CompensatingControls, Double> mitigationScale = Map.of(
        RiskInput.CompensatingControls.NONE, 0.00,
        RiskInput.CompensatingControls.PARTIAL, 0.15,
        RiskInput.CompensatingControls.SUBSTANTIAL, 0.35,
        RiskInput.CompensatingControls.STRONG, 0.55
    );

    /**
     * Contribution de la qualité de preuve à la confiance.
     * Une preuve faible n'abaisse pas le risque — elle abaisse la certitude qu'on
     * a de l'avoir bien évalué. Confondre les deux ferait disparaître les risques
     * mal documentés, qui sont précisément ceux qu'il faut instruire.
     */
    public Map<RiskInput.EvidenceQuality, Double> evidenceConfidenceScale = Map.of(
        RiskInput.EvidenceQuality.NONE, 0.30,
        RiskInput.EvidenceQuality.WEAK, 0.55,
        RiskInput.EvidenceQuality.MODERATE, 0.80,
        RiskInput.EvidenceQuality.STRONG, 0.95
    );

    // ---------------------------------------------------------------------
    // Paramètres de normalisation
    // ---------------------------------------------------------------------

    /** Échelon de maturité maximal du questionnaire (0 à 4). */
    public int maturityScaleMax = 4;

    /**
     * Nombre d'échecs de contrôle au-delà duquel la contribution sature.
     * Sans plafond, un domaine à 40 contrôles écraserait toutes les autres dimensions.
     */
    public int controlFailuresSaturation = 10;

    /** Valeur retenue quand le CVSS est absent : médiane, ni optimiste ni alarmiste. */
    public double cvssFallback = 5.0;

    /** Pénalité de confiance par dimension manquante. */
    public double missingDataConfidencePenalty = 0.15;

    // ---------------------------------------------------------------------
    // Seuils de classement — bornes basses, inclusives
    // ---------------------------------------------------------------------

    public int thresholdLow = 10;
    public int thresholdMedium = 30;
    public int thresholdHigh = 55;
    public int thresholdCritical = 80;

    /**
     * En deçà de cette confiance, un niveau élevé est signalé comme incertain
     * plutôt que présenté comme établi.
     */
    public double lowConfidenceThreshold = 0.50;

    /**
     * Vérifie la cohérence interne. Un jeu de poids qui ne somme pas à 1 produirait
     * des scores hors échelle sans que rien ne le signale.
     */
    public void validate() {
        double likelihood = weightCvss + weightExploitability + weightExposure
            + weightMaturityGap + weightControlFailures;
        double impact = weightAssetCriticality + weightBusinessImpact + weightDataSensitivity;

        if (Math.abs(likelihood - 1.0) > 0.001) {
            throw new IllegalStateException(
                "Les poids de probabilité doivent sommer à 1,0 (actuel : " + likelihood + ")");
        }
        if (Math.abs(impact - 1.0) > 0.001) {
            throw new IllegalStateException(
                "Les poids d'impact doivent sommer à 1,0 (actuel : " + impact + ")");
        }
        if (!(thresholdLow < thresholdMedium
              && thresholdMedium < thresholdHigh
              && thresholdHigh < thresholdCritical)) {
            throw new IllegalStateException("Les seuils doivent être strictement croissants");
        }
    }
}
