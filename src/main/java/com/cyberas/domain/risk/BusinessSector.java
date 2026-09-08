package com.cyberas.domain.risk;

import java.util.Locale;

/**
 * Secteur d'activité de l'organisation auditée.
 *
 * <h2>Pourquoi le secteur entre dans le calcul du risque</h2>
 *
 * <p>MEHARI évalue l'impact d'un sinistre à partir de ce que l'activité a de
 * précieux : la continuité pour un industriel, la confidentialité pour un
 * cabinet de santé, la conformité pour une banque. Un même serveur compromis
 * n'a pas les mêmes conséquences chez un hébergeur de dossiers médicaux et
 * chez un commerçant de proximité.
 *
 * <p>Jusqu'ici le moteur de risque prenait des valeurs médianes pour l'impact
 * métier et la sensibilité des données, faute de savoir à qui il avait affaire.
 * Le secteur, demandé une seule fois à l'inscription, fournit une base
 * défendable pour ces deux dimensions.
 *
 * <h2>Ce que ces valeurs sont — et ne sont pas</h2>
 *
 * <p>Ce sont des <strong>points de départ</strong>, pas des verdicts. Elles
 * s'appliquent à un actif dont personne n'a encore décrit l'importance. Dès
 * qu'un actif porte sa propre criticité et sa propre exposition — saisies dans
 * l'inventaire — ce sont elles qui priment : une machine de laboratoire chez un
 * établissement de santé reste une machine de laboratoire.
 *
 * <p>Le secteur ne crée donc jamais de risque à lui seul. Il évite seulement
 * qu'un actif non encore décrit soit traité comme s'il appartenait à une
 * activité sans enjeu.
 */
public enum BusinessSector {

    /**
     * Banque, assurance, services financiers.
     * Fraude et conformité réglementaire forte ; données de paiement.
     */
    FINANCE("Banque, finance, assurance",
        RiskInput.Impact.SEVERE, RiskInput.DataSensitivity.REGULATED),

    /**
     * Santé : hôpitaux, cliniques, laboratoires.
     * Données de santé, et une indisponibilité qui touche la prise en charge.
     */
    SANTE("Santé et médico-social",
        RiskInput.Impact.SEVERE, RiskInput.DataSensitivity.REGULATED),

    /**
     * Administration, collectivités, opérateurs publics.
     * Données personnelles de citoyens, continuité du service public.
     */
    PUBLIC_SECTOR("Secteur public et administration",
        RiskInput.Impact.MAJOR, RiskInput.DataSensitivity.REGULATED),

    /**
     * Énergie, eau, transport : services dont l'arrêt a des effets physiques.
     */
    ENERGIE_UTILITIES("Énergie, eau, transport",
        RiskInput.Impact.SEVERE, RiskInput.DataSensitivity.CONFIDENTIAL),

    /**
     * Télécommunications et hébergement : l'incident se propage aux clients.
     */
    TELECOM("Télécommunications et hébergement",
        RiskInput.Impact.MAJOR, RiskInput.DataSensitivity.CONFIDENTIAL),

    /** Industrie et production : la continuité prime sur la confidentialité. */
    INDUSTRIE("Industrie et production",
        RiskInput.Impact.MAJOR, RiskInput.DataSensitivity.INTERNAL),

    /** Commerce et distribution : paiements, données clients. */
    COMMERCE("Commerce et distribution",
        RiskInput.Impact.MODERATE, RiskInput.DataSensitivity.REGULATED),

    /** Éditeurs, ESN, services numériques. */
    TECHNOLOGIE("Technologie et services numériques",
        RiskInput.Impact.MAJOR, RiskInput.DataSensitivity.CONFIDENTIAL),

    /** Enseignement et recherche. */
    EDUCATION("Enseignement et recherche",
        RiskInput.Impact.MODERATE, RiskInput.DataSensitivity.INTERNAL),

    /** Conseil, juridique, comptabilité : secret professionnel. */
    SERVICES_PRO("Services professionnels et conseil",
        RiskInput.Impact.MODERATE, RiskInput.DataSensitivity.CONFIDENTIAL),

    /** Associations et organisations à but non lucratif. */
    ASSOCIATIF("Associatif et ONG",
        RiskInput.Impact.MINOR, RiskInput.DataSensitivity.INTERNAL),

    /**
     * Secteur non renseigné.
     *
     * <p>Volontairement médian, et non minimal : une organisation qui n'a pas
     * déclaré son activité ne doit pas se retrouver avantagée dans le calcul
     * par rapport à celle qui l'a fait.
     */
    AUTRE("Autre ou non précisé",
        RiskInput.Impact.MODERATE, RiskInput.DataSensitivity.INTERNAL);

    private final String label;
    private final RiskInput.Impact defaultImpact;
    private final RiskInput.DataSensitivity defaultDataSensitivity;

    BusinessSector(String label, RiskInput.Impact impact, RiskInput.DataSensitivity sensitivity) {
        this.label = label;
        this.defaultImpact = impact;
        this.defaultDataSensitivity = sensitivity;
    }

    public String label() {
        return label;
    }

    /** Impact métier retenu par défaut pour un actif dont l'importance n'est pas décrite. */
    public RiskInput.Impact defaultImpact() {
        return defaultImpact;
    }

    /** Sensibilité des données retenue par défaut pour ce secteur. */
    public RiskInput.DataSensitivity defaultDataSensitivity() {
        return defaultDataSensitivity;
    }

    /**
     * Lecture tolérante d'une valeur stockée ou saisie.
     *
     * <p>Une valeur inconnue retombe sur {@link #AUTRE} plutôt que de faire
     * échouer une évaluation : le secteur affine le calcul, il ne le
     * conditionne pas.
     */
    public static BusinessSector from(String value) {
        if (value == null || value.isBlank()) {
            return AUTRE;
        }
        try {
            return valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return AUTRE;
        }
    }
}
