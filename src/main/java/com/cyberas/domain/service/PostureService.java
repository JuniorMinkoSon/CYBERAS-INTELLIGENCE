package com.cyberas.domain.service;

import com.cyberas.domain.risk.SecurityPosture;
import com.cyberas.domain.framework.DomainFamily;
import com.cyberas.domain.framework.FrameworkCatalog;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Posture de sécurité déduite du questionnaire de maturité.
 *
 * <h2>Pourquoi ce service existe</h2>
 *
 * <p>Un audit peut se dérouler entièrement sans scan technique : beaucoup
 * d'organisations commencent par l'évaluation organisationnelle. Jusqu'ici,
 * sans constat de scanner, aucun rapport ni aucune recommandation n'était
 * produit — la démarche s'arrêtait au remplissage du questionnaire, et le
 * client repartait avec un pourcentage de complétion.
 *
 * <p>Ce service transforme ces réponses en résultat exploitable : une posture
 * sur une échelle de Likert, un histogramme par domaine, des axes
 * d'amélioration ordonnés, et les références de référentiel correspondantes.
 *
 * <h2>Rien n'est confié à un modèle de langage</h2>
 *
 * <p>Le calcul est déterministe et reproductible, comme celui du moteur de
 * risque. Une posture affichée à un client doit pouvoir être refaite à la main
 * et défendue devant lui ; une valeur produite par un modèle génératif ne le
 * permettrait pas.
 */
@ApplicationScoped
public class PostureService {

    @Inject
    QuestionnaireService questionnaireService;

    /**
     * Écart maximal toléré entre la posture calculée et l'état des domaines
     * fondateurs, avant déclassement.
     *
     * <p>Un domaine fondateur en dessous de ce niveau ne peut pas soutenir une
     * posture élevée : c'est la règle de corrélation, détaillée sur
     * {@link SecurityPosture#FOUNDATIONAL_DOMAINS}.
     */
    private static final double FOUNDATION_FLOOR = 1.5;

    /** En dessous, un contrôle est considéré comme non tenu. */
    private static final int WEAK_THRESHOLD = 2;

    public PostureReport evaluate(UUID auditId, UUID organizationId) {
        QuestionnaireService.Summary summary =
            questionnaireService.summarize(auditId, organizationId);

        SecurityPosture base = SecurityPosture.fromMaturity(summary.maturityScore());
        List<DomainPosture> domains = buildDomains(summary);
        Correlation correlation = correlate(base, domains, summary.maturityScore());

        return new PostureReport(
            correlation.posture(),
            correlation.posture().label(),
            correlation.posture().description(),
            summary.maturityScore(),
            summary.completionRate(),
            summary.answeredQuestions(),
            summary.applicableQuestions(),
            domains,
            families(domains),
            histogram(summary),
            improvementAxes(summary),
            correlation.downgraded(),
            correlation.explanation()
        );
    }

    // -----------------------------------------------------------------------
    // Domaines
    // -----------------------------------------------------------------------

    private List<DomainPosture> buildDomains(QuestionnaireService.Summary summary) {
        List<DomainPosture> rows = new ArrayList<>();
        for (var d : summary.domains()) {
            rows.add(new DomainPosture(
                d.domain(),
                d.maturityScore(),
                // Un domaine sans réponse n'a pas de posture : la marquer
                // « totalement réactive » accuserait à tort, la marquer
                // « active » rassurerait à tort. Elle reste absente.
                d.maturityScore() == null ? null : SecurityPosture.fromMaturity(d.maturityScore()),
                d.maturityScore() == null ? null : SecurityPosture.fromMaturity(d.maturityScore()).label(),
                d.answeredQuestions(),
                d.applicableQuestions(),
                d.completionRate(),
                d.weakControls(),
                isFoundational(d.domain()),
                DomainFamily.of(d.domain()).name(),
                DomainFamily.of(d.domain()).label(),
                d.frameworkRefs()
            ));
        }
        rows.sort(Comparator.comparing(DomainPosture::domain));
        return rows;
    }

    private boolean isFoundational(String domain) {
        return Arrays.asList(SecurityPosture.FOUNDATIONAL_DOMAINS).contains(domain);
    }

    // -----------------------------------------------------------------------
    // Modèle corrélé
    // -----------------------------------------------------------------------

    /**
     * Applique la corrélation entre domaines à la posture moyenne.
     *
     * <p>La moyenne pondérée traite les domaines comme indépendants : dix bons
     * résultats compensent arithmétiquement un domaine fondateur à zéro, et la
     * posture ressort « active » alors que la chaîne est rompue à sa base. Une
     * détection avancée sur un parc sans inventaire ne protège rien.
     *
     * <p>La règle est donc : si un domaine fondateur — inventaire, accès,
     * gouvernance — est renseigné et se situe sous le plancher, la posture
     * globale est déclassée d'un niveau, et le motif est rendu explicite.
     *
     * <p>Un seul niveau de déclassement, jamais davantage : la règle corrige un
     * biais de moyenne, elle ne remplace pas le calcul.
     */
    private Correlation correlate(SecurityPosture base, List<DomainPosture> domains, Double overall) {
        if (overall == null) {
            return new Correlation(base, false,
                "Aucune réponse exploitable : la posture ne peut pas encore être établie.");
        }

        List<String> broken = new ArrayList<>();
        for (DomainPosture d : domains) {
            if (d.foundational() && d.maturityScore() != null && d.maturityScore() < FOUNDATION_FLOOR) {
                broken.add(d.domain());
            }
        }

        if (broken.isEmpty()) {
            return new Correlation(base, false,
                "Les domaines fondateurs (inventaire, accès, gouvernance) soutiennent la posture calculée.");
        }

        // Le déclassement n'a de sens que si la posture était au-dessus du
        // plancher : une posture déjà réactive n'est pas abaissée deux fois pour
        // la même raison.
        if (base.level() <= SecurityPosture.HESITANTE.level()) {
            return new Correlation(base, false,
                "Domaines fondateurs insuffisants (" + String.join(", ", broken)
                    + "), ce que la posture calculée reflète déjà.");
        }

        return new Correlation(base.downgraded(), true,
            "Posture déclassée d'un niveau : " + String.join(", ", broken)
                + " — un domaine fondateur insuffisant ne peut pas soutenir les autres. "
                + "On ne protège pas ce qu'on ne sait pas posséder, et une gouvernance "
                + "sans maîtrise des accès décrit une intention, pas une pratique.");
    }

    // -----------------------------------------------------------------------
    // Familles
    // -----------------------------------------------------------------------

    /**
     * Agrège les domaines par famille.
     *
     * <p>Quatorze barres ne se lisent pas, et une direction générale n'arbitre
     * pas entre « DETECTION » et « APPLICATIONS ». Quatre familles — technique,
     * organisationnel, humain, conformité — sont le niveau auquel une décision
     * se prend.
     *
     * <p>La moyenne ne porte que sur les domaines réellement renseignés. Compter
     * un domaine sans réponse pour zéro ferait passer une famille peu remplie
     * pour une famille en difficulté, ce qui est une conclusion différente.
     *
     * <p>Une famille sans aucun domaine renseigné garde une maturité nulle et
     * reste affichée : son absence de résultat est elle-même une information —
     * le plus souvent, le questionnaire n'a pas été rempli sur ce pan.
     */
    private List<FamilyPosture> families(List<DomainPosture> domains) {
        List<FamilyPosture> out = new ArrayList<>();

        for (DomainFamily family : DomainFamily.presented()) {
            List<DomainPosture> members = domains.stream()
                .filter(d -> DomainFamily.of(d.domain()) == family)
                .toList();

            List<DomainPosture> assessed = members.stream()
                .filter(d -> d.maturityScore() != null)
                .toList();

            Double average = assessed.isEmpty() ? null
                : Math.round(assessed.stream()
                    .mapToDouble(DomainPosture::maturityScore).average().orElse(0) * 100) / 100.0;

            out.add(new FamilyPosture(
                family.name(),
                family.label(),
                family.description(),
                average,
                average == null ? null : SecurityPosture.fromMaturity(average).label(),
                assessed.size(),
                members.size(),
                members.stream().mapToInt(DomainPosture::weakControls).sum(),
                members.stream().map(DomainPosture::domain).toList()
            ));
        }

        // Un domaine ajouté au questionnaire sans avoir été rattaché à une
        // famille ne doit pas disparaître du rapport : il apparaît sous
        // « Non classé », ce qui rend l'omission visible.
        List<DomainPosture> unclassified = domains.stream()
            .filter(d -> DomainFamily.of(d.domain()) == DomainFamily.NON_CLASSE)
            .toList();

        if (!unclassified.isEmpty()) {
            List<DomainPosture> assessed = unclassified.stream()
                .filter(d -> d.maturityScore() != null).toList();
            Double average = assessed.isEmpty() ? null
                : Math.round(assessed.stream()
                    .mapToDouble(DomainPosture::maturityScore).average().orElse(0) * 100) / 100.0;

            out.add(new FamilyPosture(
                DomainFamily.NON_CLASSE.name(),
                DomainFamily.NON_CLASSE.label(),
                DomainFamily.NON_CLASSE.description(),
                average,
                average == null ? null : SecurityPosture.fromMaturity(average).label(),
                assessed.size(),
                unclassified.size(),
                unclassified.stream().mapToInt(DomainPosture::weakControls).sum(),
                unclassified.stream().map(DomainPosture::domain).toList()
            ));
        }

        return out;
    }

    // -----------------------------------------------------------------------
    // Histogramme
    // -----------------------------------------------------------------------

    /**
     * Répartition des réponses par niveau de maturité.
     *
     * <p>C'est ce que la moyenne cache : deux organisations de moyenne 2,0
     * peuvent avoir des profils opposés — l'une homogène sur tous ses contrôles,
     * l'autre excellente sur la moitié et absente sur l'autre. La seconde est
     * bien plus exposée, et seule la distribution le montre.
     */
    private List<HistogramBar> histogram(QuestionnaireService.Summary summary) {
        Map<Integer, Integer> counts = new LinkedHashMap<>();
        for (int level = 0; level <= 4; level++) {
            counts.put(level, 0);
        }
        for (var w : summary.weakControlDetails()) {
            counts.merge(w.maturityLevel(), 1, Integer::sum);
        }

        // Les contrôles faibles sont détaillés ; les autres sont déduits du
        // total répondu, faute d'un détail par question exposé par le résumé.
        int weakTotal = summary.weakControlDetails().size();
        int strongTotal = Math.max(0, summary.answeredQuestions() - weakTotal);

        List<HistogramBar> bars = new ArrayList<>();
        for (int level = 0; level < WEAK_THRESHOLD; level++) {
            bars.add(bar(level, counts.getOrDefault(level, 0), summary.answeredQuestions()));
        }
        // Les niveaux tenus sont regroupés sur le premier palier au-dessus du
        // seuil : le résumé ne distingue pas 2, 3 et 4 question par question, et
        // répartir arbitrairement inventerait une distribution.
        bars.add(new HistogramBar(WEAK_THRESHOLD,
            SecurityPosture.ofLevel(WEAK_THRESHOLD).label() + " et au-delà",
            strongTotal,
            summary.answeredQuestions() == 0 ? 0 : (double) strongTotal / summary.answeredQuestions()));
        return bars;
    }

    private HistogramBar bar(int level, int count, int total) {
        return new HistogramBar(level, SecurityPosture.ofLevel(level).label(), count,
            total == 0 ? 0 : (double) count / total);
    }

    // -----------------------------------------------------------------------
    // Axes d'amélioration
    // -----------------------------------------------------------------------

    /**
     * Axes d'amélioration, ordonnés par gain attendu.
     *
     * <p>La priorité croise deux choses : l'écart au niveau attendu et le poids
     * du domaine. Un contrôle faible sur un domaine secondaire pèse moins qu'un
     * contrôle moyen sur un domaine fondateur — et c'est précisément l'ordre
     * dans lequel une équipe doit travailler quand son budget est contraint.
     */
    private List<ImprovementAxis> improvementAxes(QuestionnaireService.Summary summary) {
        Map<String, List<QuestionnaireService.WeakControl>> byDomain = new LinkedHashMap<>();
        for (var w : summary.weakControlDetails()) {
            byDomain.computeIfAbsent(w.domain(), k -> new ArrayList<>()).add(w);
        }

        List<ImprovementAxis> axes = new ArrayList<>();
        for (var entry : byDomain.entrySet()) {
            String domain = entry.getKey();
            List<QuestionnaireService.WeakControl> controls = entry.getValue();

            int weightSum = controls.stream().mapToInt(QuestionnaireService.WeakControl::weight).sum();
            double avgLevel = controls.stream()
                .mapToInt(QuestionnaireService.WeakControl::maturityLevel).average().orElse(0);

            // Gain potentiel : distance au niveau « tenu » multipliée par le
            // poids. C'est une mesure d'effort utile, pas une prédiction.
            double gain = (WEAK_THRESHOLD - avgLevel) * weightSum;
            if (isFoundational(domain)) {
                // Un domaine fondateur débloque les autres : son gain réel
                // dépasse son gain arithmétique.
                gain *= 1.5;
            }

            axes.add(new ImprovementAxis(
                domain,
                controls.size(),
                avgLevel,
                Math.round(gain * 10) / 10.0,
                isFoundational(domain),
                // Toutes les questions faibles, pas un échantillon : l'audité
                // doit voir ce qu'il a à corriger, pas trois exemples parmi
                // d'autres qu'on lui cacherait.
                controls.stream()
                    .sorted(java.util.Comparator.comparingInt(QuestionnaireService.WeakControl::maturityLevel))
                    .map(c -> new WeakQuestion(c.code(), c.text(), c.maturityLevel()))
                    .toList(),
                FrameworkCatalog.forDomain(domain)
            ));
        }

        axes.sort(Comparator.comparingDouble(ImprovementAxis::expectedGain).reversed());
        return axes;
    }

    // -----------------------------------------------------------------------
    // Contrats
    // -----------------------------------------------------------------------

    private record Correlation(SecurityPosture posture, boolean downgraded, String explanation) {}

    public record PostureReport(
        SecurityPosture posture,
        String postureLabel,
        String postureDescription,
        Double maturityScore,
        double completionRate,
        int answeredQuestions,
        int applicableQuestions,
        List<DomainPosture> domains,
        /** Lecture par famille : le niveau auquel une direction arbitre. */
        List<FamilyPosture> families,
        List<HistogramBar> histogram,
        List<ImprovementAxis> improvementAxes,
        /** La corrélation entre domaines a-t-elle abaissé la posture ? */
        boolean downgradedByCorrelation,
        String correlationExplanation
    ) {}

    public record DomainPosture(
        String domain,
        Double maturityScore,
        SecurityPosture posture,
        String postureLabel,
        int answeredQuestions,
        int applicableQuestions,
        double completionRate,
        int weakControls,
        boolean foundational,
        /** Famille de rattachement : TECHNIQUE, ORGANISATIONNEL, HUMAIN, CONFORMITE. */
        String family,
        String familyLabel,
        List<FrameworkCatalog.Reference> frameworkRefs
    ) {}

    public record FamilyPosture(
        String family,
        String label,
        String description,
        /** Moyenne des domaines renseignés de la famille ; null si aucun. */
        Double maturityScore,
        String postureLabel,
        int domainsAssessed,
        int domainsTotal,
        int weakControls,
        List<String> domains
    ) {}

    public record HistogramBar(int level, String label, int count, double share) {}

    /**
     * Question à améliorer, telle qu'elle doit être rendue à l'audité.
     *
     * <p>Le texte seul ne suffisait pas : sans le code, impossible de retrouver
     * la question dans le questionnaire ; sans le niveau, impossible de savoir
     * laquelle est la plus loin du compte. Une recommandation qui nomme un
     * domaine sans dire quelles réponses l'ont fait chuter n'est pas
     * actionnable.
     */
    public record WeakQuestion(String code, String text, int level) {}

    public record ImprovementAxis(
        String domain,
        int weakControls,
        double averageLevel,
        /** Gain attendu : distance au niveau tenu × poids, majoré si fondateur. */
        double expectedGain,
        boolean foundational,
        List<WeakQuestion> weakQuestions,
        List<FrameworkCatalog.Reference> frameworkRefs
    ) {}
}
