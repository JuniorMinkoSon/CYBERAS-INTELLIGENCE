package com.cyberas.domain.scanner;

/**
 * Échec d'interprétation de la sortie d'un scan.
 *
 * <p>Cette exception existe pour une raison précise : <strong>un défaut
 * d'analyse ne doit jamais se présenter comme une absence de constat.</strong>
 * Le parseur précédent, en cas d'erreur, renvoyait une liste vide — un rapport
 * concluait alors « aucun problème détecté » alors que le scan n'avait pas pu
 * être lu. C'est la pire défaillance possible pour un outil d'audit : elle est
 * silencieuse et elle rassure.
 *
 * <p>Le scan concerné doit donc être marqué en échec, avec le motif conservé.
 */
public class NmapParseException extends Exception {

    /** Code stable, repris dans le champ d'erreur du scan et l'audit trail. */
    public static final String CODE = "SCAN_PARSE_ERROR";

    public NmapParseException(String message) {
        super(message);
    }

    public NmapParseException(String message, Throwable cause) {
        super(message, cause);
    }
}
