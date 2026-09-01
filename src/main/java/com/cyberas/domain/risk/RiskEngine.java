package com.cyberas.domain.risk;

import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Moteur de risque Cyberas.
 *
 * Calcul déterministe : les mêmes entrées produisent toujours le même score.
 * Aucun modèle de langage n'intervient ici — le LLM commente et recommande à
 * partir de ce résultat, il ne le produit pas. Un score qu'on ne peut pas
 * recalculer à la main n'est pas défendable en audit.
 *
 * Modèle : risque = probabilité × impact, atténué par les mesures compensatoires.
 * Les deux termes sont des moyennes pondérées de dimensions normalisées sur 0-1,
 * dont les poids vivent dans RiskScoringConfig.
 */
@ApplicationScoped
public class RiskEngine {

    /** À incrémenter dès que la formule change, pour tracer les scores historiques. */
    public static final String ENGINE_VERSION = "1.0.0";

    @Inject
    RiskScoringConfig config;

    /** Permet l'instanciation directe en test, sans conteneur CDI. */
    public RiskEngine() {
    }

    public RiskEngine(RiskScoringConfig config) {
        this.config = config;
        this.config.validate();
    }

    @PostConstruct
    void checkConfiguration() {
        config.validate();
    }

    public RiskAssessment evaluate(RiskInput input) {
        if (input == null) {
            throw new IllegalArgumentException("Les entrées d'évaluation sont requises");
        }

        List<RiskAssessment.Factor> factors = new ArrayList<>();

        double likelihood = computeLikelihood(input, factors);
        double impact = computeImpact(input, factors);

        double rawRisk = likelihood * impact;
        double mitigation = config.mitigationScale.getOrDefault(input.compensatingControls(), 0.0);
        double mitigatedRisk = rawRisk * (1.0 - mitigation);

        int score = (int) Math.round(mitigatedRisk * 100);
        RiskLevel level = classify(score);
        double confidence = computeConfidence(input);

        if (mitigation > 0) {
            factors.add(new RiskAssessment.Factor(
                "compensatingControls",
                mitigation,
                -1.0,
                -(rawRisk - mitigatedRisk) * 100,
                describeMitigation(input.compensatingControls())
            ));
        }

        // Les contributions négatives doivent rester visibles : on trie sur la
        // valeur absolue pour que les atténuations remontent avec les aggravations.
        factors.sort(Comparator.comparingDouble(
            (RiskAssessment.Factor f) -> Math.abs(f.contribution())).reversed());

        return new RiskAssessment(
            score, level, likelihood, impact, confidence,
            buildRationale(input, score, level, confidence, factors),
            List.copyOf(factors),
            ENGINE_VERSION
        );
    }

    // ------------------------------------------------------------------
    // Probabilité
    // ------------------------------------------------------------------

    private double computeLikelihood(RiskInput input, List<RiskAssessment.Factor> factors) {
        double total = 0;

        double cvssValue = (input.cvss() != null ? input.cvss() : config.cvssFallback) / 10.0;
        cvssValue = clamp(cvssValue);
        total += addFactor(factors, "cvss", cvssValue, config.weightCvss,
            input.cvss() != null
                ? "CVSS " + format(input.cvss()) + " sur 10"
                : "CVSS absent : valeur médiane retenue");

        double exploit = config.exploitabilityScale.getOrDefault(input.exploitability(), 0.30);
        total += addFactor(factors, "exploitability", exploit, config.weightExploitability,
            describeExploitability(input.exploitability()));

        double exposure = input.internetExposure() ? 1.0 : 0.25;
        total += addFactor(factors, "internetExposure", exposure, config.weightExposure,
            input.internetExposure()
                ? "Actif joignable depuis Internet"
                : "Actif interne, non exposé directement");

        // L'écart de maturité, pas la maturité : une maturité élevée réduit la
        // probabilité, une maturité absente l'augmente.
        double maturityGap;
        if (input.questionnaireMaturity() != null) {
            int maturity = Math.clamp(input.questionnaireMaturity(), 0, config.maturityScaleMax);
            maturityGap = 1.0 - ((double) maturity / config.maturityScaleMax);
            total += addFactor(factors, "questionnaireMaturity", maturityGap, config.weightMaturityGap,
                "Maturité déclarée " + maturity + "/" + config.maturityScaleMax
                    + " sur le domaine concerné");
        } else {
            maturityGap = 0.5;
            total += addFactor(factors, "questionnaireMaturity", maturityGap, config.weightMaturityGap,
                "Domaine non évalué au questionnaire");
        }

        double failureRatio = Math.min(
            1.0, (double) Math.max(0, input.controlFailures()) / config.controlFailuresSaturation);
        total += addFactor(factors, "controlFailures", failureRatio, config.weightControlFailures,
            input.controlFailures() == 0
                ? "Aucun contrôle en échec sur le domaine"
                : input.controlFailures() + " contrôle(s) en échec sur le domaine");

        return clamp(total);
    }

    // ------------------------------------------------------------------
    // Impact
    // ------------------------------------------------------------------

    private double computeImpact(RiskInput input, List<RiskAssessment.Factor> factors) {
        double total = 0;

        double criticality = config.criticalityScale.getOrDefault(input.assetCriticality(), 0.45);
        total += addFactor(factors, "assetCriticality", criticality, config.weightAssetCriticality,
            "Criticité de l'actif : " + input.assetCriticality());

        double business = config.impactScale.getOrDefault(input.businessImpact(), 0.50);
        total += addFactor(factors, "businessImpact", business, config.weightBusinessImpact,
            "Impact métier estimé : " + input.businessImpact());

        double data = config.dataSensitivityScale.getOrDefault(input.dataSensitivity(), 0.40);
        total += addFactor(factors, "dataSensitivity", data, config.weightDataSensitivity,
            "Sensibilité des données : " + input.dataSensitivity());

        return clamp(total);
    }

    // ------------------------------------------------------------------
    // Confiance
    // ------------------------------------------------------------------

    /**
     * La confiance dépend de la qualité des preuves et de la complétude des entrées.
     * Elle est indépendante du score : un risque critique mal documenté reste
     * critique, mais son évaluation demande à être consolidée.
     */
    private double computeConfidence(RiskInput input) {
        double base = config.evidenceConfidenceScale.getOrDefault(input.evidenceQuality(), 0.55);

        int missing = 0;
        if (input.cvss() == null) {
            missing++;
        }
        if (input.questionnaireMaturity() == null) {
            missing++;
        }

        double penalty = missing * config.missingDataConfidencePenalty;
        return clamp(Math.max(0.05, base - penalty));
    }

    // ------------------------------------------------------------------
    // Classement et restitution
    // ------------------------------------------------------------------

    private RiskLevel classify(int score) {
        if (score >= config.thresholdCritical) {
            return RiskLevel.CRITICAL;
        }
        if (score >= config.thresholdHigh) {
            return RiskLevel.HIGH;
        }
        if (score >= config.thresholdMedium) {
            return RiskLevel.MEDIUM;
        }
        if (score >= config.thresholdLow) {
            return RiskLevel.LOW;
        }
        return RiskLevel.INFORMATION;
    }

    private String buildRationale(RiskInput input, int score, RiskLevel level,
                                  double confidence, List<RiskAssessment.Factor> factors) {
        StringBuilder sb = new StringBuilder();
        sb.append("Risque ").append(level.label().toLowerCase())
          .append(" (").append(score).append("/100). ");

        factors.stream()
            .filter(f -> f.contribution() > 0)
            .max(Comparator.comparingDouble(RiskAssessment.Factor::contribution))
            .ifPresent(f -> sb.append("Facteur dominant : ")
                .append(f.explanation().toLowerCase()).append(". "));

        if (input.compensatingControls() != RiskInput.CompensatingControls.NONE) {
            sb.append("Score atténué par les mesures compensatoires en place. ");
        }

        if (confidence < config.lowConfidenceThreshold) {
            sb.append("Confiance faible (")
              .append(Math.round(confidence * 100)).append(" %) : ")
              .append("l'évaluation doit être consolidée avant décision.");
        } else {
            sb.append("Confiance ").append(Math.round(confidence * 100)).append(" %.");
        }

        return sb.toString().trim();
    }

    // ------------------------------------------------------------------
    // Utilitaires
    // ------------------------------------------------------------------

    /** Ajoute un facteur et retourne sa contribution à la moyenne pondérée. */
    private double addFactor(List<RiskAssessment.Factor> factors, String name,
                             double value, double weight, String explanation) {
        double weighted = value * weight;
        factors.add(new RiskAssessment.Factor(name, value, weight, weighted * 100, explanation));
        return weighted;
    }

    private double clamp(double v) {
        return Math.max(0.0, Math.min(1.0, v));
    }

    private String format(double v) {
        return String.valueOf(Math.round(v * 10) / 10.0);
    }

    private String describeExploitability(RiskInput.Exploitability e) {
        return switch (e) {
            case NONE -> "Aucun vecteur d'exploitation connu";
            case THEORETICAL -> "Exploitation théorique, sans preuve de concept publiée";
            case PROOF_OF_CONCEPT -> "Preuve de concept publiée";
            case FUNCTIONAL -> "Exploit fonctionnel disponible";
            case ACTIVELY_EXPLOITED -> "Exploitation active observée";
        };
    }

    private String describeMitigation(RiskInput.CompensatingControls c) {
        return switch (c) {
            case NONE -> "Aucune mesure compensatoire";
            case PARTIAL -> "Mesures compensatoires partielles";
            case SUBSTANTIAL -> "Mesures compensatoires substantielles";
            case STRONG -> "Mesures compensatoires neutralisant l'essentiel de l'exposition";
        };
    }
}
