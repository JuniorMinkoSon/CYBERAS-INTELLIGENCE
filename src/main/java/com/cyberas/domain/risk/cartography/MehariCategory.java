package com.cyberas.domain.risk.cartography;

import java.util.Locale;

/**
 * Catégorie de risque MEHARI simplifiée.
 *
 * <p>MEHARI (Méthode Harmonisée d'Analyse de Risques) type le risque par
 * service de sécurité menacé plutôt que par vulnérabilité brute. Cette
 * cartographie n'en reprend que l'ossature à trois piliers plus la
 * traçabilité — une classification complète demanderait le contexte métier
 * de chaque actif (criticité, sensibilité des données), qu'un scan seul ne
 * porte pas.
 *
 * <p>{@link #fromScanTelemetry} est une règle déterministe, volontairement
 * simple : elle classe sur le protocole et la sévérité observés, pas sur une
 * lecture du service exposé. C'est la version 1 de cette cartographie ; le
 * modèle KNN entraîné sur les référentiels et l'historique des constats (voir
 * le service ML séparé) affine ensuite ce classement sans jamais le
 * remplacer côté audit — cette règle reste le repli déterministe si le
 * service ML est indisponible.
 */
public enum MehariCategory {

    /** Le service ou l'actif visé peut cesser de répondre. */
    DISPONIBILITE,

    /** Les données ou la configuration peuvent être altérées. */
    INTEGRITE,

    /** Les données peuvent être exposées sans altération ni interruption. */
    CONFIDENTIALITE,

    /** Rien ne permettrait de détecter ou de reconstituer l'incident après coup. */
    TRACABILITE;

    /**
     * Classe un constat de scan par protocole et sévérité.
     *
     * <p>UDP porte la majorité des vecteurs d'amplification et de déni de
     * service (DNS, NTP, SNMP) : une exposition UDP penche vers la
     * disponibilité. TCP porte la majorité des services avec état
     * (bases de données, applicatifs, accès distants) : une exposition TCP
     * penche vers la confidentialité. Un constat sans sévérité établie —
     * jamais qualifié, jamais remonté — est un vide de traçabilité en soi.
     */
    public static MehariCategory fromScanTelemetry(String protocol, String severity) {
        if (severity == null || severity.isBlank()) {
            return TRACABILITE;
        }
        String proto = protocol == null ? "" : protocol.toUpperCase(Locale.ROOT);
        if ("UDP".equals(proto)) {
            return DISPONIBILITE;
        }
        if ("TCP".equals(proto)) {
            return CONFIDENTIALITE;
        }
        return TRACABILITE;
    }

    /** Regroupe les sévérités de constat (CRITICAL..INFO) sur l'échelle à quatre niveaux de la cartographie. */
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

    /** Ordre de gravité, pour ne jamais faire régresser le niveau déjà enregistré d'une entrée. */
    public static int rank(String riskLevel) {
        return switch (riskLevel == null ? "LOW" : riskLevel.toUpperCase(Locale.ROOT)) {
            case "CRITICAL" -> 3;
            case "HIGH" -> 2;
            case "MEDIUM" -> 1;
            default -> 0;
        };
    }
}
