package com.cyberas.domain.framework;

import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Familles de domaines du questionnaire de maturité.
 *
 * <h2>Pourquoi regrouper</h2>
 *
 * <p>Le questionnaire compte quatorze domaines. C'est la bonne granularité pour
 * répondre — chaque domaine correspond à un sujet qu'une personne précise
 * maîtrise — mais c'est trop fin pour rendre compte : quatorze barres côte à
 * côte ne se lisent pas, et une direction générale n'a pas à arbitrer entre
 * « DETECTION » et « APPLICATIONS ».
 *
 * <p>Ces quatre familles sont le niveau auquel un comité de direction décide.
 * Elles ne remplacent pas les domaines : elles les rassemblent pour la
 * restitution, et chaque famille reste ouvrable jusqu'aux questions.
 *
 * <h2>La famille humaine</h2>
 *
 * <p>Elle a longtemps manqué au questionnaire, qui ne comptait que des domaines
 * techniques, organisationnels et réglementaires. C'est pourtant par les
 * personnes que passe la majorité des compromissions réelles. Elle est
 * désormais renseignée par ses propres questions.
 */
public enum DomainFamily {

    /**
     * Technique — ce qui protège les systèmes eux-mêmes.
     *
     * <p>Inventaire, accès, réseau, applications, vulnérabilités, données,
     * détection. C'est la famille que le scanner alimente directement.
     */
    TECHNIQUE("Technique",
        "Protection des systèmes : infrastructure, réseau, identités, "
            + "applications, sauvegarde et continuité.",
        // Les codes de la première génération (VULNERABILITIES, DATA, DETECTION)
        // restent rattachés : des réponses les référencent encore, et un audit
        // ancien doit pouvoir se relire avec ses familles d'origine.
        List.of("INFRASTRUCTURE", "NETWORK", "ACCESS", "APPLICATIONS", "CONTINUITY",
                "VULNERABILITIES", "DATA", "DETECTION")),

    /**
     * Organisationnel — ce qui décide, pilote et tient dans la durée.
     *
     * <p>Gouvernance, analyse de risque, gestion des incidents, continuité.
     * Une mesure technique sans cette famille n'est appliquée qu'une fois.
     */
    ORGANISATIONNEL("Organisationnel",
        "Pilotage de la sécurité : stratégie, gouvernance, suivi, incidents, "
            + "amélioration continue, actifs et fournisseurs.",
        // La gouvernance au sens large vit ici, en thèmes, plutôt qu'en famille
        // à part : une « gouvernance » séparée de l'« organisationnel » aurait
        // deux fois le même sujet à deux endroits. RISK et CONTINUITY sont des
        // codes de première génération, conservés pour les audits qui les
        // portent ; CONTINUITY a depuis rejoint la famille technique.
        List.of("STRATEGY", "GOVERNANCE", "STEERING", "INCIDENTS", "IMPROVEMENT",
                "ASSETS", "SUPPLIERS", "RISK")),

    /**
     * Humain — les personnes, leurs habilitations et leurs réflexes.
     *
     * <p>Entrées et sorties, signalement, populations exposées. C'est la
     * famille la plus souvent absente des questionnaires, et celle par laquelle
     * passe la majorité des attaques abouties.
     */
    HUMAIN("Humain",
        "Personnes et pratiques : sensibilisation, comportements au quotidien, "
            + "et tests grandeur nature.",
        List.of("AWARENESS", "BEHAVIOUR", "TESTING", "HUMAN")),

    /**
     * Conformité — ce qui est exigé de l'extérieur.
     *
     * <p>Obligations réglementaires et maîtrise des tiers. Ce que l'entreprise
     * doit pouvoir démontrer, et pas seulement faire.
     */
    CONFORMITE("Conformité",
        "Exigences externes : politiques approuvées et appliquées, données "
            + "personnelles, conformité technique.",
        List.of("POLICIES", "PRIVACY", "COMPLIANCE")),

    /**
     * Physique — les locaux, les équipements et leur accès matériel.
     *
     * <p>Aucune question du catalogue ne porte encore ce domaine : la famille
     * est déclarée mais vide, et se restitue « non évaluée ». Elle est ajoutée
     * malgré cela pour deux raisons.
     *
     * <p>D'abord parce que l'Annexe A d'ISO/IEC 27001 lui consacre quatorze
     * contrôles — A.7.1 à A.7.14 — qui portent tous ce domaine dans le
     * catalogue : sans la famille, ces contrôles n'auraient aucune famille de
     * rattachement. Ensuite parce qu'une famille absente ne se remarque pas,
     * alors qu'une famille vide se voit : elle dit qu'il reste des questions à
     * écrire, là où le silence laisserait croire à une couverture complète.
     */
    PHYSIQUE("Physique",
        "Locaux et équipements : contrôle des accès physiques, zones sécurisées, "
            + "protection et mise au rebut du matériel.",
        List.of("PHYSICAL")),

    /**
     * Famille de repli.
     *
     * <p>Recueille tout domaine ajouté au questionnaire sans avoir été rattaché
     * ici. Sa présence dans une restitution est le signe qu'un domaine a été
     * oublié au classement — mieux vaut le voir apparaître sous ce nom que le
     * voir disparaître silencieusement du rapport.
     */
    NON_CLASSE("Non classé",
        "Domaines non rattachés à une famille. Leur présence signale un "
            + "classement à compléter.",
        List.of());

    private final String label;
    private final String description;
    private final List<String> domains;

    DomainFamily(String label, String description, List<String> domains) {
        this.label = label;
        this.description = description;
        this.domains = domains;
    }

    public String label() {
        return label;
    }

    public String description() {
        return description;
    }

    /** Domaines rattachés à cette famille. */
    public List<String> domains() {
        return domains;
    }

    /**
     * Index inversé, construit une fois.
     *
     * <p>Le classement est déclaré sur la famille — c'est là qu'il se lit — mais
     * l'usage courant est l'inverse : partir d'un domaine et retrouver sa
     * famille. Reparcourir les familles à chaque appel serait sans conséquence
     * sur quatorze entrées, mais la carte rend l'intention explicite.
     */
    private static final Map<String, DomainFamily> BY_DOMAIN = buildIndex();

    private static Map<String, DomainFamily> buildIndex() {
        return java.util.Arrays.stream(values())
            .flatMap(f -> f.domains.stream().map(d -> Map.entry(d, f)))
            .collect(java.util.stream.Collectors.toUnmodifiableMap(
                Map.Entry::getKey, Map.Entry::getValue));
    }

    /**
     * Famille d'un domaine.
     *
     * <p>Un domaine inconnu tombe dans {@link #NON_CLASSE} plutôt que de faire
     * échouer la restitution : un questionnaire enrichi sans mise à jour de ce
     * classement doit continuer à produire un rapport, quitte à signaler
     * l'omission.
     */
    public static DomainFamily of(String domain) {
        if (domain == null || domain.isBlank()) {
            return NON_CLASSE;
        }
        return BY_DOMAIN.getOrDefault(domain.trim().toUpperCase(Locale.ROOT), NON_CLASSE);
    }

    /**
     * Familles présentées à l'utilisateur, dans l'ordre de restitution.
     *
     * <p>L'ordre suit celui d'un audit réel : ce qui se décide d'abord
     * (organisationnel), ce qui est exigé de l'extérieur (conformité), puis
     * les deux pans où les mesures s'appliquent — technique, humain.
     *
     * <p>PHYSIQUE n'y figure pas : aucune question ne la renseigne, et une
     * session vide affichée en permanence finit par ressembler à une promesse
     * non tenue. La famille reste déclarée — les contrôles A.7 d'ISO 27001
     * portent son domaine — et rejoint cette liste le jour où des questions
     * physiques existent.
     */
    public static List<DomainFamily> presented() {
        return List.of(ORGANISATIONNEL, CONFORMITE, TECHNIQUE, HUMAIN);
    }
}
