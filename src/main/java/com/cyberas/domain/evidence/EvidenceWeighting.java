package com.cyberas.domain.evidence;

/**
 * Pondération d'une réponse par la pièce qui l'étaye.
 *
 * <h2>Le principe</h2>
 *
 * <p>Une réponse au questionnaire est une <em>déclaration</em>. La pièce jointe
 * est ce qui la <em>démontre</em>. Le rapport entre les deux dit à quel point la
 * déclaration est étayée :
 *
 * <pre>
 *   corroboration = niveau démontré par la pièce / niveau déclaré
 * </pre>
 *
 * <p>Déclarer 4 en joignant une pièce qui n'établit que 2 donne une
 * corroboration de 0,5 : la réponse n'est pas rejetée, elle pèse moitié moins.
 * Déclarer 2 en joignant une pièce qui établit 3 donne 1,0 — on ne récompense
 * pas d'avoir sous-estimé sa propre maturité, la déclaration reste la borne.
 *
 * <h2>Ce que la pondération ne fait pas</h2>
 *
 * <p>Elle <strong>ne remplace jamais la réponse déclarée</strong>. Le niveau
 * saisi par l'audité reste affiché tel quel, à côté du niveau démontré ; c'est
 * l'écart entre les deux qui informe, et le masquer reviendrait à substituer un
 * jugement automatique à une déclaration humaine sans le dire.
 *
 * <p>Elle est <strong>modulée par la confiance de l'analyse</strong>. Un
 * analyseur qui n'a pas lu le fichier ne doit pas pouvoir diviser par deux le
 * poids d'une réponse sur la seule foi d'un nom de fichier. À confiance faible,
 * la corroboration reste proche de 1 ; elle ne mord réellement que lorsque
 * l'analyse est sûre d'elle.
 *
 * <h2>Absence de pièce</h2>
 *
 * <p>Une réponse sans pièce n'est pas pénalisée par ce mécanisme. Beaucoup de
 * contrôles se constatent sans document, et sanctionner l'absence de pièce
 * pousserait à en joindre pour la forme. Le manque de preuve est traité
 * ailleurs, par la qualité de preuve du moteur de risque.
 */
public final class EvidenceWeighting {

    /**
     * Corroboration minimale.
     *
     * <p>Une pièce qui contredit franchement la déclaration réduit le poids sans
     * l'annuler : à zéro, la réponse disparaîtrait du calcul, ce qui reviendrait
     * à traiter une déclaration mal étayée comme une absence de réponse. Ce sont
     * deux situations différentes.
     */
    public static final double MIN_CORROBORATION = 0.25;

    private EvidenceWeighting() {
    }

    /**
     * Résultat de la pondération.
     *
     * @param declaredLevel     niveau déclaré par l'audité (0-4)
     * @param evidencedLevel    niveau démontré par la pièce, ou null si aucune
     *                          pièce exploitable
     * @param rawRatio          rapport brut, avant modulation par la confiance
     * @param corroboration     facteur réellement appliqué au poids (0,25 à 1)
     * @param effectiveWeight   poids de la question après pondération
     * @param explanation       motif lisible
     */
    public record Result(
        int declaredLevel,
        Integer evidencedLevel,
        Double rawRatio,
        double corroboration,
        double effectiveWeight,
        String explanation
    ) {
        /** L'écart mérite-t-il d'être signalé à l'auditeur ? */
        public boolean isUnderEvidenced() {
            return evidencedLevel != null && evidencedLevel < declaredLevel;
        }
    }

    /**
     * Calcule la pondération d'une réponse.
     *
     * @param declaredLevel niveau déclaré, 0-4
     * @param questionWeight poids de la question dans son domaine
     * @param evidencedLevel niveau démontré par la pièce, ou null
     * @param analysisConfidence confiance de l'analyse, 0 à 1
     */
    public static Result weigh(int declaredLevel, int questionWeight,
                               Integer evidencedLevel, Double analysisConfidence) {

        // Aucune pièce exploitable : le poids déclaré s'applique tel quel.
        if (evidencedLevel == null) {
            return new Result(declaredLevel, null, null, 1.0, questionWeight,
                "Aucune pièce exploitable : la réponse déclarée est retenue telle quelle.");
        }

        // Un niveau déclaré nul n'a rien à corroborer : il n'y a pas de
        // déclaration à étayer, et diviser par zéro n'aurait aucun sens.
        if (declaredLevel <= 0) {
            return new Result(declaredLevel, evidencedLevel, null, 1.0, questionWeight,
                "Niveau déclaré nul : il n'y a rien à étayer.");
        }

        double raw = (double) evidencedLevel / declaredLevel;

        // Une pièce qui démontre plus que ce qui est déclaré ne majore pas le
        // poids : la déclaration reste la borne haute.
        double capped = Math.min(1.0, raw);

        // Modulation par la confiance : à confiance nulle, l'analyse n'a aucun
        // effet ; à confiance pleine, elle s'applique entièrement.
        double confidence = analysisConfidence == null ? 0.0
            : Math.max(0.0, Math.min(1.0, analysisConfidence));
        double corroboration = 1.0 - (1.0 - capped) * confidence;
        corroboration = Math.max(MIN_CORROBORATION, corroboration);

        double effective = Math.round(questionWeight * corroboration * 100) / 100.0;

        String explanation;
        if (evidencedLevel >= declaredLevel) {
            explanation = "La pièce étaye le niveau déclaré (" + declaredLevel + ").";
        } else {
            explanation = "Niveau déclaré " + declaredLevel + ", niveau démontré par la pièce "
                + evidencedLevel + " : la réponse pèse "
                + Math.round(corroboration * 100) + " % de son poids. "
                + "Le niveau déclaré n'est pas modifié — c'est l'écart qui est signalé.";
        }

        return new Result(declaredLevel, evidencedLevel,
            Math.round(raw * 100) / 100.0, Math.round(corroboration * 100) / 100.0,
            effective, explanation);
    }
}
