package com.cyberas.domain.risk.confidence;

/**
 * Vecteur de caractéristiques transmis au service ML pour l'indice de confiance.
 *
 * <p>{@code declaredLevel} est ce que l'audité affirme (0-4, questionnaire) ;
 * {@code avgEvidenceLevel}/{@code avgEvidenceConfidence} viennent de l'analyse
 * des pièces jointes à la même question ({@code Document.evidenceLevel},
 * {@code Document.analysisConfidence}). L'écart entre déclaration et preuve
 * est le signal que le modèle Gini apprend à reconnaître — pas le contenu
 * d'aucun document, qui ne quitte jamais le backend Java.
 */
public record ConfidenceFeatures(
    String domain,
    Integer declaredLevel,
    Double avgEvidenceLevel,
    Double avgEvidenceConfidence,
    int evidenceCount
) {
}
