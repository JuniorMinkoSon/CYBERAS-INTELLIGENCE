package com.cyberas.domain.evidence;

import com.cyberas.domain.entity.Document;
import com.cyberas.domain.entity.Question;

/**
 * Analyse d'une pièce justificative.
 *
 * <h2>Ce que l'analyse produit — et ce qu'elle ne prétend pas faire</h2>
 *
 * <p>Elle répond à une question précise : <strong>jusqu'à quel niveau de
 * maturité cette pièce permet-elle d'étayer la réponse ?</strong> Une politique
 * signée, datée et revue étaye un niveau élevé ; une capture d'écran étaye une
 * existence, pas un pilotage.
 *
 * <p>Elle ne dit <strong>pas</strong> si le document est authentique. Aucun
 * analyseur automatique ne peut établir qu'une politique de sécurité a
 * réellement été approuvée par une direction, ni qu'une capture n'a pas été
 * fabriquée. Le champ produit s'appelle donc « niveau démontré » et jamais
 * « véracité » : présenter une conjecture sous le nom d'une preuve est
 * exactement le défaut qu'on a corrigé sur le scanner en supprimant les
 * sévérités uniformes.
 *
 * <h2>Pourquoi une interface</h2>
 *
 * <p>L'implémentation par défaut est déterministe et fonctionne sans service
 * externe. Un analyseur adossé à un modèle de langage — capable de lire le
 * contenu et de le confronter à l'intitulé de la question — s'y substitue en
 * implémentant ce contrat, sans que le calcul de pondération ni la restitution
 * n'aient à changer.
 */
public interface EvidenceAnalyzer {

    /**
     * Résultat d'analyse.
     *
     * @param evidenceLevel niveau de maturité démontré, sur 0-4, ou null si la
     *                      pièce n'est pas exploitable
     * @param confidence    confiance dans l'analyse elle-même, de 0 à 1
     * @param rationale     motif lisible, destiné à l'auditeur comme à l'audité
     * @param analyzer      identité et version de l'analyseur, pour la traçabilité
     */
    record Analysis(Integer evidenceLevel, double confidence, String rationale, String analyzer) {

        /** Pièce reçue mais inexploitable : notée comme telle, pas ignorée. */
        public static Analysis unusable(String reason, String analyzer) {
            return new Analysis(null, 0.0, reason, analyzer);
        }
    }

    /**
     * Analyse une pièce au regard de la question qu'elle étaye.
     *
     * @param document pièce déposée
     * @param question question à laquelle elle se rattache, ou null si la pièce
     *                 est versée au dossier sans être liée à une question
     */
    Analysis analyze(Document document, Question question);

    /** Identité de l'analyseur, reprise dans la traçabilité. */
    String name();
}
