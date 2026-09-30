package com.cyberas.domain.risk.cartography;

import java.util.Locale;

/**
 * Critère de sécurité mis en jeu par un constat.
 *
 * <h2>Ce que ces quatre valeurs sont</h2>
 *
 * <p>Disponibilité, intégrité, confidentialité, traçabilité : le vocabulaire
 * commun de la sécurité de l'information, celui-là même qu'ISO 27001 emploie.
 * Nommer ainsi ce qu'un service exposé met en jeu est exact.
 *
 * <h2>Ce qu'elles ne sont pas</h2>
 *
 * <p><strong>Ce n'est pas une analyse MEHARI</strong>, et l'énumération porte
 * un nom qui l'a longtemps laissé croire.
 *
 * <p>MEHARI classe des scénarios de risque — actif primaire, événement redouté,
 * critère atteint — et demande trois choses qu'un scan réseau ne porte pas :
 * une classification des actifs valeur par valeur, une base de connaissance des
 * services de sécurité évaluée par questionnaire, et une grille
 * gravité = f(potentialité, impact). Un scanner observe des ports ouverts ; il
 * ne sait pas ce que l'actif vaut pour le métier.
 *
 * <p>Présenter le résultat comme le produit d'une méthode MEHARI serait donc
 * faux. La cartographie dit ce qu'elle est : les critères de sécurité que les
 * services observés mettent en jeu, avec le motif de chaque rattachement.
 *
 * <h2>Le classement lui-même</h2>
 *
 * <p>Il vit dans {@link ServiceExposureProfile}, à partir du service observé.
 * Une méthode {@code fromScanTelemetry} classait auparavant sur le protocole de
 * transport — UDP donnait disponibilité, TCP confidentialité — ce qui rendait
 * deux des quatre valeurs inatteignables et réduisait la cartographie d'une
 * mission à deux lignes au plus. Elle a été retirée plutôt que dépréciée : une
 * méthode de classement qui se trompe est plus dangereuse qu'absente.
 *
 * <p>Le javadoc annonçait aussi qu'un modèle KNN « affine ensuite ce
 * classement ». L'endpoint existe côté service ML, mais aucun code Java ne
 * l'appelle. La mention est retirée tant que le branchement n'est pas fait.
 */
public enum MehariCategory {

    /** Le service ou l'actif visé peut cesser de répondre. */
    DISPONIBILITE,

    /** Les données ou la configuration peuvent être altérées. */
    INTEGRITE,

    /** Les données peuvent être lues par qui n'y a pas droit. */
    CONFIDENTIALITE,

    /** Les traces peuvent être altérées, effacées, ou n'avoir jamais existé. */
    TRACABILITE;

    /**
     * Niveau de risque repris de la sévérité du constat.
     *
     * <p>Note sur {@code CRITICAL} : le scanner ne le produit pas aujourd'hui —
     * {@code ServiceExposure} ne rend que LOW, MEDIUM et HIGH. La branche est
     * conservée parce qu'un constat saisi à la main ou issu d'une autre source
     * peut le porter, et qu'un niveau inconnu ne doit pas être silencieusement
     * rabaissé.
     */
    public static String riskLevelOf(String severity) {
        if (severity == null) {
            return "LOW";
        }
        return switch (severity.toUpperCase(Locale.ROOT)) {
            case "CRITICAL" -> "CRITICAL";
            case "HIGH" -> "HIGH";
            case "MEDIUM" -> "MEDIUM";
            default -> "LOW";
        };
    }

    /** Ordre des niveaux, pour ne retenir que le plus élevé sur une entrée. */
    public static int rank(String riskLevel) {
        return switch (riskLevel == null ? "LOW" : riskLevel.toUpperCase(Locale.ROOT)) {
            case "CRITICAL" -> 3;
            case "HIGH" -> 2;
            case "MEDIUM" -> 1;
            default -> 0;
        };
    }
}
