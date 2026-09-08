package com.cyberas.domain.framework;

import java.util.List;
import java.util.Locale;

/**
 * Formule d'abonnement de l'organisation.
 *
 * <h2>Ce que la formule détermine</h2>
 *
 * <p>Les référentiels disponibles à l'audit. Tout le monde dispose du socle
 * — ISO 27001 et 27002, qui structurent l'essentiel des démarches de
 * certification. Les référentiels complémentaires, plus spécialisés, relèvent
 * de la formule annuelle.
 *
 * <h2>Ce que la formule ne détermine pas</h2>
 *
 * <p>Ni la qualité de l'évaluation, ni le score, ni les recommandations. Un
 * audit mené sur le socle produit un résultat complet et opposable : la formule
 * ouvre des grilles de lecture supplémentaires, elle ne dégrade pas celle qui
 * est offerte. Restreindre la justesse d'une analyse selon ce qui est payé
 * serait vendre un audit qu'on sait incomplet.
 *
 * <p>Les référentiels non couverts sont <strong>affichés et signalés comme
 * tels</strong>, jamais masqués : un client doit voir ce que sa formule ne
 * comprend pas, sinon il ne peut pas décider de changer.
 */
public enum SubscriptionPlan {

    /**
     * Découverte — le temps de l'évaluation initiale, avant tout engagement.
     *
     * <p>Formule par défaut d'une organisation qui vient de s'inscrire : elle
     * doit pouvoir mener un audit complet sur le socle avant de choisir.
     */
    DECOUVERTE("Découverte", List.of("ISO27001", "ISO27002")),

    /** Semestriel — socle de certification. */
    SEMESTRIEL("Semestriel", List.of("ISO27001", "ISO27002")),

    /** Annuel — tous les référentiels du catalogue. */
    ANNUEL("Annuel", List.of("ISO27001", "ISO27002", "NIST_CSF", "CIS", "OWASP", "MITRE_ATTACK"));

    private final String label;
    private final List<String> frameworks;

    SubscriptionPlan(String label, List<String> frameworks) {
        this.label = label;
        this.frameworks = frameworks;
    }

    public String label() {
        return label;
    }

    /** Codes de référentiels couverts par la formule. */
    public List<String> frameworks() {
        return frameworks;
    }

    public boolean covers(String frameworkCode) {
        return frameworkCode != null
            && frameworks.contains(frameworkCode.trim().toUpperCase(Locale.ROOT));
    }

    /**
     * Lecture tolérante.
     *
     * <p>Une valeur absente ou inconnue retombe sur {@link #DECOUVERTE} et non
     * sur la formule la plus large : en cas de doute sur ce qui a été souscrit,
     * la position sûre est celle qui n'offre pas ce qui n'a pas été payé, tout
     * en laissant l'audit se dérouler.
     */
    public static SubscriptionPlan from(String value) {
        if (value == null || value.isBlank()) {
            return DECOUVERTE;
        }
        try {
            return valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return DECOUVERTE;
        }
    }
}
