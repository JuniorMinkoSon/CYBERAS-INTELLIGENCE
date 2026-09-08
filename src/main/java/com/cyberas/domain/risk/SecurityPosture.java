package com.cyberas.domain.risk;

/**
 * Posture de sécurité de l'organisation, sur une échelle de Likert à cinq
 * niveaux.
 *
 * <h2>Ce que l'échelle décrit</h2>
 *
 * <p>Elle ne mesure pas le nombre de vulnérabilités — c'est le rôle du score de
 * risque — mais <strong>la façon dont l'organisation se comporte face au
 * risque</strong> : subit-elle les incidents, ou les anticipe-t-elle ? Deux
 * entreprises peuvent avoir le même nombre de failles ouvertes et des postures
 * opposées, l'une découvrant ses problèmes lors d'une panne, l'autre les ayant
 * identifiés et planifiés.
 *
 * <p>Elle est déduite des réponses au questionnaire de maturité, pondérées par
 * le poids de chaque question. Aucun modèle de langage n'intervient : la valeur
 * doit être reproductible et opposable, comme le score de risque.
 *
 * <h2>Correspondance avec l'échelle de maturité</h2>
 *
 * <p>Les réponses vont de 0 à 4. Les seuils sont posés sur la moyenne pondérée,
 * légèrement décalés vers le haut : atteindre un niveau demande de l'avoir
 * réellement dépassé sur la majorité des contrôles, pas de l'effleurer.
 */
public enum SecurityPosture {

    /**
     * Totalement réactive — l'organisation découvre ses problèmes quand ils
     * surviennent. Aucun dispositif d'anticipation en place.
     */
    TOTALEMENT_REACTIVE(0, "Totalement réactive",
        "Les incidents sont découverts lorsqu'ils surviennent. Aucun dispositif d'anticipation n'est en place."),

    /**
     * Hésitante — des intentions et quelques mesures isolées, sans continuité
     * ni responsable identifié.
     */
    HESITANTE(1, "Hésitante",
        "Des mesures existent mais restent isolées, sans continuité ni responsable clairement désigné."),

    /**
     * Réactive — les incidents sont traités correctement, mais la démarche
     * reste déclenchée par l'événement.
     */
    REACTIVE(2, "Réactive",
        "Les incidents sont traités correctement, mais la démarche reste déclenchée par l'événement."),

    /**
     * Active — contrôles en place, suivis, et revus périodiquement.
     */
    ACTIVE(3, "Active",
        "Les contrôles sont en place, suivis et revus périodiquement. Les risques sont identifiés avant l'incident."),

    /**
     * Fortement activée — démarche pilotée, mesurée et améliorée en continu.
     */
    FORTEMENT_ACTIVEE(4, "Fortement activée",
        "La démarche est pilotée par des indicateurs, mesurée et améliorée en continu.");

    /**
     * Domaines sans lesquels une posture élevée n'a pas de fondement.
     *
     * <p>C'est le cœur du modèle corrélé : les domaines ne sont pas
     * indépendants. Une capacité de détection avancée sur un parc dont
     * l'inventaire est inexistant ne protège rien — on ne surveille pas ce
     * qu'on ne sait pas posséder. De même, une gouvernance mature sans gestion
     * des accès décrit une intention, pas une pratique.
     *
     * <p>La moyenne pondérée seule masque cet effet : de bons résultats sur dix
     * domaines compensent arithmétiquement un domaine fondateur à zéro, et la
     * posture ressort « active » alors que la chaîne est rompue à sa base.
     */
    public static final String[] FOUNDATIONAL_DOMAINS = {"ASSETS", "ACCESS", "GOVERNANCE"};

    private final int level;
    private final String label;
    private final String description;

    SecurityPosture(int level, String label, String description) {
        this.level = level;
        this.label = label;
        this.description = description;
    }

    public int level() {
        return level;
    }

    public String label() {
        return label;
    }

    public String description() {
        return description;
    }

    /**
     * Posture correspondant à une moyenne pondérée de maturité.
     *
     * <p>Les bornes sont volontairement exigeantes : une moyenne de 2,9 sur une
     * échelle de 0 à 4 reste « réactive » et ne devient pas « active ». Arrondir
     * au plus proche ferait basculer une organisation dans le niveau supérieur
     * dès qu'elle en atteint la moitié, ce qui flatte le résultat.
     *
     * @param weightedMaturity moyenne pondérée sur 0-4, ou null si aucune
     *                         réponse exploitable
     */
    public static SecurityPosture fromMaturity(Double weightedMaturity) {
        if (weightedMaturity == null) {
            // Sans réponse, la posture n'est pas « bonne par défaut ».
            return TOTALEMENT_REACTIVE;
        }
        double m = weightedMaturity;
        if (m >= 3.5) return FORTEMENT_ACTIVEE;
        if (m >= 2.6) return ACTIVE;
        if (m >= 1.7) return REACTIVE;
        if (m >= 0.8) return HESITANTE;
        return TOTALEMENT_REACTIVE;
    }

    /** Niveau immédiatement inférieur ; le plancher ne descend pas plus bas. */
    public SecurityPosture downgraded() {
        return level == 0 ? this : values()[level - 1];
    }

    public static SecurityPosture ofLevel(int level) {
        int bounded = Math.max(0, Math.min(values().length - 1, level));
        return values()[bounded];
    }
}
