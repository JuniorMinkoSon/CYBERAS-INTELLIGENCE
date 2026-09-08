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
        "Protection des systèmes : inventaire, accès, réseau, applications, "
            + "vulnérabilités, données et détection.",
        List.of("ASSETS", "ACCESS", "NETWORK", "APPLICATIONS",
                "VULNERABILITIES", "DATA", "DETECTION")),

    /**
     * Organisationnel — ce qui décide, pilote et tient dans la durée.
     *
     * <p>Gouvernance, analyse de risque, gestion des incidents, continuité.
     * Une mesure technique sans cette famille n'est appliquée qu'une fois.
     */
    ORGANISATIONNEL("Organisationnel",
        "Pilotage de la sécurité : gouvernance, analyse de risque, gestion des "
            + "incidents et continuité d'activité.",
        List.of("GOVERNANCE", "RISK", "INCIDENTS", "CONTINUITY")),

    /**
     * Humain — les personnes, leurs habilitations et leurs réflexes.
     *
     * <p>Entrées et sorties, signalement, populations exposées. C'est la
     * famille la plus souvent absente des questionnaires, et celle par laquelle
     * passe la majorité des attaques abouties.
     */
    HUMAIN("Humain",
        "Personnes et pratiques : cycle de vie des accès, signalement des "
            + "messages suspects, mesures renforcées sur les fonctions exposées.",
        List.of("HUMAN")),

    /**
     * Conformité — ce qui est exigé de l'extérieur.
     *
     * <p>Obligations réglementaires et maîtrise des tiers. Ce que l'entreprise
     * doit pouvoir démontrer, et pas seulement faire.
     */
    CONFORMITE("Conformité",
        "Exigences externes : obligations réglementaires, audits, et maîtrise "
            + "des fournisseurs et sous-traitants.",
        List.of("COMPLIANCE", "SUPPLIERS")),

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

    /** Familles présentées à l'utilisateur, dans l'ordre de restitution. */
    public static List<DomainFamily> presented() {
        return List.of(TECHNIQUE, ORGANISATIONNEL, HUMAIN, CONFORMITE);
    }
}
