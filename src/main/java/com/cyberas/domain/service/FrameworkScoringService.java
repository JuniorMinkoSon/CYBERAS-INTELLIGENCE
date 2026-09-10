package com.cyberas.domain.service;

import com.cyberas.domain.entity.Control;
import com.cyberas.domain.entity.Framework;
import com.cyberas.domain.entity.FrameworkVersion;
import com.cyberas.domain.entity.QuestionAnswer;
import com.cyberas.domain.entity.QuestionControlMapping;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Score de conformité par référentiel.
 *
 * <h2>Pourquoi ce service existe</h2>
 *
 * <p>Jusqu'ici l'application affichait un score unique en laissant croire qu'il
 * couvrait les référentiels. Il n'en couvrait aucun : il agrégeait les domaines
 * internes Cyberas, dont la correspondance vers les contrôles n'existait qu'au
 * niveau du domaine. Annoncer « conforme ISO 27001 à 74 % » sur cette base
 * aurait été indéfendable devant un auditeur.
 *
 * <p>Depuis que les contrôles et leurs rattachements sont persistés, le calcul
 * devient possible et vérifiable : chaque contrôle est évalué à partir des
 * seules questions qui lui sont réellement rattachées.
 *
 * <h2>Ce que le service refuse de faire</h2>
 *
 * <p><strong>Un contrôle sans réponse n'est pas non conforme.</strong> Il est
 * non évalué, et sort du calcul au lieu d'y entrer avec un zéro. Compter
 * l'absence de réponse comme un échec ferait chuter le score d'une organisation
 * qui n'a simplement pas fini de répondre, et l'inciterait à répondre au hasard
 * plutôt qu'à ne pas répondre.
 *
 * <p>C'est la raison d'être de {@code coverage} : un score de 80 % sur 12
 * contrôles évalués ne vaut pas un score de 80 % sur 93. Les deux chiffres
 * voyagent ensemble, et le second n'a aucun sens sans le premier.
 *
 * <p><strong>Un rattachement douteux ne compte pas.</strong> Les
 * correspondances marquées à revoir sont écartées du calcul et rapportées à
 * part : fonder une note sur un rattachement que personne n'a validé
 * reviendrait à inventer de la conformité.
 *
 * <p>Le calcul est déterministe et rejouable à la main. Aucun modèle de langage
 * n'intervient.
 */
@ApplicationScoped
public class FrameworkScoringService {

    /** Version du calcul, à incrémenter dès que la formule change. */
    public static final String ENGINE_VERSION = "1.0.0";

    /**
     * Seuils sur la moyenne pondérée des réponses, échelle 0-4.
     *
     * <p>« En grande partie » (3) et « Totalement » (4) valent conformité ;
     * « En partie » (2) vaut conformité partielle. Les seuils sont posés en
     * dessous des paliers pour tolérer une moyenne tirée vers le bas par une
     * question secondaire, sans laisser passer une majorité de « juste un peu ».
     */
    private static final double COMPLIANT_THRESHOLD = 2.5;
    private static final double PARTIAL_THRESHOLD = 1.5;

    /** État d'un contrôle au regard des réponses disponibles. */
    public enum ControlStatus {
        COMPLIANT,
        PARTIALLY_COMPLIANT,
        NON_COMPLIANT,
        /** Aucune question rattachée n'a reçu de réponse. Exclu du score. */
        NOT_ASSESSED,
        /** Toutes les réponses rattachées sont « non applicable ». Exclu du score. */
        NOT_APPLICABLE
    }

    /**
     * Évaluation d'un contrôle.
     *
     * @param declaredLevel moyenne pondérée 0-4, absente si non évalué
     * @param questionCodes questions qui ont réellement servi au calcul
     */
    public record ControlAssessment(
        String code,
        String title,
        String category,
        int weight,
        ControlStatus status,
        Double declaredLevel,
        List<String> questionCodes,
        int answeredQuestions,
        int mappedQuestions,
        boolean hasReviewRequiredMapping
    ) {}

    /**
     * Score d'un référentiel pour un audit.
     *
     * @param score       0 à 100, <strong>null</strong> si aucun contrôle n'a pu
     *                    être évalué — et non zéro, qui signifierait « non conforme »
     * @param coverage    part des contrôles évalués, 0 à 1
     */
    public record FrameworkScore(
        String frameworkCode,
        String frameworkName,
        String version,
        Double score,
        double coverage,
        int totalControls,
        int assessedControls,
        int compliant,
        int partiallyCompliant,
        int nonCompliant,
        int notAssessed,
        int notApplicable,
        int controlsWithReviewRequiredMapping,
        int unmappedControls,
        String engineVersion,
        String rationale,
        List<ControlAssessment> controls
    ) {}

    /**
     * Calcule le score d'un référentiel pour un audit.
     *
     * @param frameworkCode code du référentiel, ex. « ISO27001 »
     * @return le score, ou {@code null} si le référentiel n'existe pas ou n'a
     *         aucune version en vigueur — un référentiel absent ne produit
     *         aucun score, il n'en produit pas un mauvais
     */
    public FrameworkScore score(UUID auditId, String frameworkCode) {
        Framework framework = Framework.findByCode(frameworkCode);
        if (framework == null) {
            return null;
        }
        FrameworkVersion version = FrameworkVersion.findActive(frameworkCode);
        if (version == null) {
            return null;
        }

        List<Control> controls = Control.findByVersion(version.id);

        // Rattachements et réponses sont chargés en bloc : les demander contrôle
        // par contrôle produirait deux requêtes par contrôle, soit près de deux
        // cents pour un seul score.
        Map<UUID, List<QuestionControlMapping>> mappingsByControl = new HashMap<>();
        for (QuestionControlMapping m : QuestionControlMapping.findByVersion(version.id)) {
            mappingsByControl.computeIfAbsent(m.control.id, k -> new ArrayList<>()).add(m);
        }

        Map<UUID, QuestionAnswer> answersByQuestion = new HashMap<>();
        List<QuestionAnswer> answers = QuestionAnswer.list("audit.id = ?1", auditId);
        for (QuestionAnswer a : answers) {
            answersByQuestion.put(a.question.id, a);
        }

        List<ControlAssessment> assessments = new ArrayList<>();
        double weightedSum = 0;
        double weightTotal = 0;
        int compliant = 0, partial = 0, nonCompliant = 0, notAssessed = 0, notApplicable = 0;
        int withReviewRequired = 0, unmapped = 0;

        for (Control control : controls) {
            List<QuestionControlMapping> mappings = mappingsByControl.getOrDefault(control.id, List.of());
            if (mappings.isEmpty()) {
                unmapped++;
            }

            boolean reviewRequired = mappings.stream()
                .anyMatch(m -> QuestionControlMapping.REVIEW_REQUIRED.equals(m.status));
            if (reviewRequired) {
                withReviewRequired++;
            }

            // Seuls les rattachements établis alimentent le calcul.
            List<QuestionControlMapping> usable = mappings.stream()
                .filter(m -> QuestionControlMapping.CONFIRMED.equals(m.status))
                .toList();

            double sum = 0;
            double weights = 0;
            int answered = 0;
            int applicableAnswers = 0;
            List<String> usedCodes = new ArrayList<>();

            for (QuestionControlMapping mapping : usable) {
                QuestionAnswer answer = answersByQuestion.get(mapping.question.id);
                if (answer == null) {
                    continue;
                }
                answered++;
                if (Boolean.TRUE.equals(answer.notApplicable) || answer.maturityLevel == null) {
                    continue;
                }
                applicableAnswers++;

                // Le poids de la question module sa part dans le contrôle : une
                // question majeure ne pèse pas comme une question secondaire.
                double weight = mapping.question.weight == null ? 1 : mapping.question.weight;
                sum += answer.maturityLevel * weight;
                weights += weight;
                usedCodes.add(mapping.question.code);
            }

            ControlStatus status;
            Double level = null;

            if (answered == 0) {
                status = ControlStatus.NOT_ASSESSED;
                notAssessed++;
            } else if (applicableAnswers == 0) {
                status = ControlStatus.NOT_APPLICABLE;
                notApplicable++;
            } else {
                level = sum / weights;
                if (level >= COMPLIANT_THRESHOLD) {
                    status = ControlStatus.COMPLIANT;
                    compliant++;
                } else if (level >= PARTIAL_THRESHOLD) {
                    status = ControlStatus.PARTIALLY_COMPLIANT;
                    partial++;
                } else {
                    status = ControlStatus.NON_COMPLIANT;
                    nonCompliant++;
                }

                double controlWeight = control.weight == null ? 1 : control.weight;
                weightedSum += (level / 4.0) * controlWeight;
                weightTotal += controlWeight;
            }

            assessments.add(new ControlAssessment(
                control.code, control.title, control.category,
                control.weight == null ? 1 : control.weight,
                status, level, usedCodes, answered, usable.size(), reviewRequired));
        }

        int assessed = compliant + partial + nonCompliant;
        Double score = weightTotal == 0 ? null : Math.round(weightedSum / weightTotal * 1000) / 10.0;
        double coverage = controls.isEmpty() ? 0 : (double) assessed / controls.size();

        return new FrameworkScore(
            framework.code, framework.name, version.version,
            score, coverage,
            controls.size(), assessed,
            compliant, partial, nonCompliant, notAssessed, notApplicable,
            withReviewRequired, unmapped,
            ENGINE_VERSION,
            rationale(score, assessed, controls.size(), unmapped),
            assessments);
    }

    private static String rationale(Double score, int assessed, int total, int unmapped) {
        if (score == null) {
            return "Aucun contrôle n'a pu être évalué : aucune question rattachée n'a reçu de réponse. "
                + "L'absence de score n'est pas une non-conformité.";
        }
        return "Moyenne pondérée par le poids des contrôles, calculée sur les " + assessed
            + " contrôles évalués sur " + total + ". Les contrôles sans réponse sont exclus du calcul "
            + "et non comptés comme non conformes. " + unmapped
            + " contrôles n'ont aucune question rattachée et ne peuvent pas être évalués par le "
            + "questionnaire seul.";
    }
}
