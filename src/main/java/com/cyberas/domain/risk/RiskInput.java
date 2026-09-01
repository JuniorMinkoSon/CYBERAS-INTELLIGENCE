package com.cyberas.domain.risk;

/**
 * Entrées du moteur de risque.
 *
 * Chaque dimension est exprimée sur une échelle nommée plutôt qu'en nombre brut :
 * un auditeur sait dire qu'un actif est « critique », pas qu'il vaut 0,83. La
 * conversion en poids est centralisée dans RiskScoringConfig.
 *
 * Les champs peuvent être absents — un finding issu de nmap n'a ni CVSS ni CVE.
 * L'absence n'est pas traitée comme un zéro : elle abaisse la confiance et fait
 * retomber le calcul sur une valeur médiane explicite.
 */
public record RiskInput(

    /** Score CVSS de base, 0.0 à 10.0. Absent si le constat n'est rattaché à aucun CVE. */
    Double cvss,

    /** Facilité d'exploitation observée ou documentée. */
    Exploitability exploitability,

    /** L'actif est-il joignable depuis Internet ? */
    boolean internetExposure,

    /** Importance de l'actif pour l'organisation. */
    Criticality assetCriticality,

    /** Conséquence métier d'une compromission de cet actif. */
    Impact businessImpact,

    /** Sensibilité des données hébergées ou traitées. */
    DataSensitivity dataSensitivity,

    /**
     * Maturité déclarée au questionnaire pour le domaine concerné, 0 à 4.
     * 0 = absent, 4 = mesuré et maîtrisé. Absent si le domaine n'a pas été évalué.
     */
    Integer questionnaireMaturity,

    /** Nombre de contrôles du référentiel en échec sur le domaine concerné. */
    int controlFailures,

    /** Solidité des preuves étayant le constat. Détermine surtout la confiance. */
    EvidenceQuality evidenceQuality,

    /** Mesures compensatoires en place réduisant l'exposition réelle. */
    CompensatingControls compensatingControls
) {

    public enum Exploitability {
        /** Aucun vecteur d'exploitation connu. */
        NONE,
        /** Théoriquement exploitable, sans preuve de concept publique. */
        THEORETICAL,
        /** Preuve de concept publiée. */
        PROOF_OF_CONCEPT,
        /** Exploit fonctionnel disponible. */
        FUNCTIONAL,
        /** Exploitation active observée dans la nature. */
        ACTIVELY_EXPLOITED
    }

    public enum Criticality {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum Impact {
        NEGLIGIBLE, MINOR, MODERATE, MAJOR, SEVERE
    }

    public enum DataSensitivity {
        /** Aucune donnée métier. */
        PUBLIC,
        INTERNAL,
        CONFIDENTIAL,
        /** Données personnelles, de santé ou de paiement. */
        REGULATED
    }

    public enum EvidenceQuality {
        /** Aucune preuve : constat déclaratif. */
        NONE,
        /** Indice unique, non corroboré. */
        WEAK,
        /** Preuve technique cohérente. */
        MODERATE,
        /** Preuves multiples et concordantes. */
        STRONG
    }

    public enum CompensatingControls {
        NONE,
        /** Mesure partielle : segmentation, filtrage, surveillance seule. */
        PARTIAL,
        /** Mesure substantielle réduisant fortement l'exploitabilité. */
        SUBSTANTIAL,
        /** L'exposition est effectivement neutralisée. */
        STRONG
    }

    /** Construit une entrée minimale : tout ce qui n'est pas connu reste absent. */
    public static Builder builder() {
        return new Builder();
    }

    /**
     * Les constats arrivent avec des niveaux d'information très variables.
     * Le constructeur fluide évite d'imposer dix arguments dont la moitié sont nuls.
     */
    public static class Builder {
        private Double cvss;
        private Exploitability exploitability = Exploitability.THEORETICAL;
        private boolean internetExposure;
        private Criticality assetCriticality = Criticality.MEDIUM;
        private Impact businessImpact = Impact.MODERATE;
        private DataSensitivity dataSensitivity = DataSensitivity.INTERNAL;
        private Integer questionnaireMaturity;
        private int controlFailures;
        private EvidenceQuality evidenceQuality = EvidenceQuality.MODERATE;
        private CompensatingControls compensatingControls = CompensatingControls.NONE;

        public Builder cvss(Double v) { this.cvss = v; return this; }
        public Builder exploitability(Exploitability v) { this.exploitability = v; return this; }
        public Builder internetExposure(boolean v) { this.internetExposure = v; return this; }
        public Builder assetCriticality(Criticality v) { this.assetCriticality = v; return this; }
        public Builder businessImpact(Impact v) { this.businessImpact = v; return this; }
        public Builder dataSensitivity(DataSensitivity v) { this.dataSensitivity = v; return this; }
        public Builder questionnaireMaturity(Integer v) { this.questionnaireMaturity = v; return this; }
        public Builder controlFailures(int v) { this.controlFailures = v; return this; }
        public Builder evidenceQuality(EvidenceQuality v) { this.evidenceQuality = v; return this; }
        public Builder compensatingControls(CompensatingControls v) { this.compensatingControls = v; return this; }

        public RiskInput build() {
            return new RiskInput(
                cvss, exploitability, internetExposure, assetCriticality,
                businessImpact, dataSensitivity, questionnaireMaturity,
                controlFailures, evidenceQuality, compensatingControls
            );
        }
    }
}
