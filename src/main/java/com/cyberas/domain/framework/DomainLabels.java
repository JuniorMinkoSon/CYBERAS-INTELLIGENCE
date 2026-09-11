package com.cyberas.domain.framework;

import java.util.Locale;
import java.util.Map;

/**
 * Libellés des thèmes du questionnaire.
 *
 * <p>Le code d'un thème — {@code STRATEGY}, {@code STEERING} — est un
 * identifiant, pas un texte d'interface. L'afficher tel quel demandait au
 * lecteur de traduire de tête, et les pages qui s'y risquaient tenaient chacune
 * leur propre table, jamais complète. Une seule ici, rendue par l'API.
 *
 * <p>Les codes de première génération y figurent : des réponses les
 * référencent encore, et un audit ancien doit se relire avec ses libellés.
 */
public final class DomainLabels {

    private static final Map<String, String> LABELS = Map.ofEntries(
        // Organisationnel
        Map.entry("STRATEGY", "Stratégie"),
        Map.entry("GOVERNANCE", "Gouvernance"),
        Map.entry("STEERING", "Pilotage"),
        Map.entry("INCIDENTS", "Gestion des incidents"),
        Map.entry("IMPROVEMENT", "Amélioration continue"),
        Map.entry("ASSETS", "Gestion des actifs"),
        Map.entry("SUPPLIERS", "Gestion des fournisseurs"),
        Map.entry("RISK", "Gestion des risques"),
        // Conformité
        Map.entry("POLICIES", "Politiques et procédures"),
        Map.entry("PRIVACY", "Données personnelles"),
        Map.entry("COMPLIANCE", "Conformité technique"),
        // Technique
        Map.entry("INFRASTRUCTURE", "Infrastructure"),
        Map.entry("NETWORK", "Réseau"),
        Map.entry("ACCESS", "Identités et accès"),
        Map.entry("APPLICATIONS", "Sécurité applicative"),
        Map.entry("CONTINUITY", "Sauvegarde et continuité"),
        Map.entry("VULNERABILITIES", "Vulnérabilités"),
        Map.entry("DATA", "Données"),
        Map.entry("DETECTION", "Détection"),
        // Humain
        Map.entry("AWARENESS", "Sensibilisation"),
        Map.entry("BEHAVIOUR", "Comportements"),
        Map.entry("TESTING", "Tests"),
        Map.entry("HUMAN", "Facteur humain"),
        // Physique
        Map.entry("PHYSICAL", "Sécurité physique")
    );

    private DomainLabels() {
    }

    /**
     * Libellé d'un thème, ou son code si aucun n'est connu.
     *
     * <p>Rendre le code plutôt que rien : un thème ajouté sans libellé doit
     * rester identifiable à l'écran, pas disparaître.
     */
    public static String of(String domain) {
        if (domain == null) return "";
        return LABELS.getOrDefault(domain.trim().toUpperCase(Locale.ROOT), domain);
    }
}
