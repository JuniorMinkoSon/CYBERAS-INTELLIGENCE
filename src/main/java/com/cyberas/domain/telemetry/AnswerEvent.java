package com.cyberas.domain.telemetry;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Une réponse au questionnaire de maturité, publiée sur le topic Kafka
 * {@code cyberas-answer-events}.
 *
 * <p>Jusqu'ici, une réponse n'existait que dans sa table. Le tableau de bord la
 * relisait à la demande, en recalculant la synthèse à chaque affichage, et rien
 * d'autre n'en était informé : ni la cartographie, ni un observateur externe.
 * Les scans, eux, publiaient déjà leur télémétrie et alimentaient la
 * cartographie par ce chemin. Les deux moitiés de l'évaluation — ce que
 * l'organisation déclare, ce que ses machines exposent — suivaient donc deux
 * régimes différents.
 *
 * <p>Cet événement met la déclaration au même niveau que le constat. Il porte
 * le domaine et sa famille parce que c'est à cette maille que la restitution se
 * lit, et le degré de maturité parce que c'est lui qui fait l'écart.
 *
 * <p>{@link #maturityLevel()} vaut {@code null} lorsque la question est
 * déclarée sans objet. Ce n'est pas un zéro : une mesure hors périmètre ne
 * creuse pas d'écart, et les confondre ferait baisser le score d'une
 * organisation pour des questions qui ne la concernent pas.
 */
public record AnswerEvent(
    UUID answerId,
    UUID organizationId,
    UUID auditId,
    UUID questionId,
    String questionCode,
    String domain,
    String domainFamily,
    Integer maturityLevel,
    boolean notApplicable,
    LocalDateTime occurredAt
) {

    public static AnswerEvent of(UUID answerId, UUID organizationId, UUID auditId, UUID questionId,
                                 String questionCode, String domain, String domainFamily,
                                 Integer maturityLevel, boolean notApplicable) {
        return new AnswerEvent(answerId, organizationId, auditId, questionId, questionCode, domain,
            domainFamily, maturityLevel, notApplicable, LocalDateTime.now());
    }

    /**
     * Vrai lorsque la réponse traduit un écart.
     *
     * <p>Le seuil est celui que {@code QuestionnaireService.WEAK_THRESHOLD}
     * applique déjà à la synthèse : au-dessous de 2 sur 4, la mesure n'est pas
     * tenue. Il est repris et non redéfini, pour que la projection et l'écran
     * de synthèse ne puissent pas diverger sur ce qu'est un écart.
     */
    public boolean estUnEcart(int seuil) {
        return !notApplicable && maturityLevel != null && maturityLevel < seuil;
    }
}
