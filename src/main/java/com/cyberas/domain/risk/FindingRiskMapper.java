package com.cyberas.domain.risk;

import com.cyberas.domain.entity.Finding;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Traduit un constat en entrées pour le moteur de risque.
 *
 * Toutes les dimensions ne sont pas encore disponibles : l'inventaire des actifs
 * et le questionnaire ne sont pas implémentés, donc la criticité de l'actif et la
 * maturité du domaine ne peuvent pas être déduites du constat seul.
 *
 * Ces manques ne sont pas comblés par des valeurs flatteuses. Le mapper retourne
 * ce qu'il sait, laisse le reste absent, et énumère les dimensions estimées afin
 * que l'interface puisse afficher « évaluation partielle » plutôt qu'un score
 * présenté comme complet. La confiance calculée s'en trouve mécaniquement réduite.
 */
@ApplicationScoped
public class FindingRiskMapper {

    /**
     * Entrées du moteur, accompagnées de la liste des dimensions qui ont dû être
     * estimées faute de donnée disponible.
     */
    public record MappingResult(RiskInput input, List<String> estimatedDimensions) {

        public boolean isComplete() {
            return estimatedDimensions.isEmpty();
        }
    }

    public MappingResult map(Finding finding) {
        if (finding == null) {
            throw new IllegalArgumentException("Le constat est requis");
        }

        List<String> estimated = new ArrayList<>();
        RiskInput.Builder builder = RiskInput.builder();

        // CVSS : présent seulement si le constat est rattaché à un CVE.
        builder.cvss(finding.cvssScore);

        // Exploitabilité : déduite de la sévérité déclarée tant que l'enrichissement
        // CVE (EPSS, exploits connus) n'est pas branché.
        builder.exploitability(inferExploitability(finding));
        estimated.add("exploitability");

        // Exposition Internet : demande de savoir si l'actif est joignable de
        // l'extérieur. Sans inventaire d'actifs, l'information n'existe pas.
        builder.internetExposure(false);
        estimated.add("internetExposure");

        // Criticité, impact métier, sensibilité : propriétés de l'actif, pas du
        // constat. Les valeurs par défaut du builder sont médianes.
        estimated.add("assetCriticality");
        estimated.add("businessImpact");
        estimated.add("dataSensitivity");

        // Maturité : laissée absente plutôt qu'estimée. Le moteur la traite comme
        // médiane et pénalise la confiance, ce qui est le comportement voulu.
        builder.questionnaireMaturity(null);

        builder.controlFailures(0);
        estimated.add("controlFailures");

        builder.evidenceQuality(inferEvidenceQuality(finding));

        builder.compensatingControls(RiskInput.CompensatingControls.NONE);
        estimated.add("compensatingControls");

        return new MappingResult(builder.build(), List.copyOf(estimated));
    }

    /**
     * Approximation à partir de la sévérité déclarée par le scanner.
     * À remplacer par les données CVE réelles (exploits publiés, EPSS) dès que
     * l'enrichissement sera en place.
     */
    private RiskInput.Exploitability inferExploitability(Finding finding) {
        String severity = finding.severity == null
            ? "" : finding.severity.trim().toUpperCase(Locale.ROOT);

        return switch (severity) {
            case "CRITICAL" -> RiskInput.Exploitability.FUNCTIONAL;
            case "HIGH" -> RiskInput.Exploitability.PROOF_OF_CONCEPT;
            case "MEDIUM" -> RiskInput.Exploitability.THEORETICAL;
            case "LOW", "INFO" -> RiskInput.Exploitability.NONE;
            default -> RiskInput.Exploitability.THEORETICAL;
        };
    }

    /**
     * Qualité de preuve déduite de ce que le constat transporte réellement.
     * Un constat issu d'un scanner avec sortie brute est mieux étayé qu'un constat
     * déclaratif sans pièce jointe.
     */
    private RiskInput.EvidenceQuality inferEvidenceQuality(Finding finding) {
        boolean hasEvidence = finding.evidence != null && !finding.evidence.isEmpty();
        boolean hasCve = finding.cve != null && !finding.cve.isBlank();
        boolean fromScanner = finding.source != null && !finding.source.isBlank();

        if (hasEvidence && hasCve) {
            return RiskInput.EvidenceQuality.STRONG;
        }
        if (hasEvidence && fromScanner) {
            return RiskInput.EvidenceQuality.MODERATE;
        }
        if (fromScanner) {
            return RiskInput.EvidenceQuality.WEAK;
        }
        return RiskInput.EvidenceQuality.NONE;
    }
}
