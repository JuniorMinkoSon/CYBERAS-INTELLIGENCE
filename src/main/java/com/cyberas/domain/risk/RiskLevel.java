package com.cyberas.domain.risk;

/**
 * Niveaux de risque Cyberas.
 *
 * À ne pas confondre avec la sévérité CVSS : CVSS décrit une vulnérabilité dans
 * l'absolu, ce niveau décrit ce qu'elle représente pour cette organisation, sur
 * cet actif, dans ce contexte.
 */
public enum RiskLevel {

    INFORMATION("Information", "Aucune action corrective requise", null),
    LOW("Faible", "À traiter dans le cycle normal", 90),
    MEDIUM("Moyen", "À planifier", 30),
    HIGH("Élevé", "À traiter en priorité", 7),
    CRITICAL("Critique", "Traitement immédiat", 1);

    private final String label;
    private final String guidance;

    /** Délai de remédiation indicatif, en jours. Null quand aucune action n'est due. */
    private final Integer remediationDays;

    RiskLevel(String label, String guidance, Integer remediationDays) {
        this.label = label;
        this.guidance = guidance;
        this.remediationDays = remediationDays;
    }

    public String label() {
        return label;
    }

    public String guidance() {
        return guidance;
    }

    public Integer remediationDays() {
        return remediationDays;
    }

    public boolean requiresAction() {
        return this != INFORMATION;
    }

    /** Vrai pour les niveaux qui doivent remonter en alerte plutôt qu'en liste. */
    public boolean isElevated() {
        return this == HIGH || this == CRITICAL;
    }
}
