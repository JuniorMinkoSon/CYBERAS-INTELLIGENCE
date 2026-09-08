package com.cyberas.domain.evidence;

import com.cyberas.domain.entity.Document;
import com.cyberas.domain.entity.Question;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

/**
 * Analyseur par défaut, sans service externe.
 *
 * <h2>Ce qu'il regarde</h2>
 *
 * <p>Il n'ouvre pas le fichier. Il se prononce sur ce qui est observable sans
 * le lire : le type de document, sa fraîcheur, ce que son intitulé annonce, et
 * la présence d'une description. Ces signaux sont faibles pris isolément, et
 * c'est pourquoi la confiance rendue reste modérée — elle plafonne
 * volontairement, de sorte qu'un analyseur capable de lire le contenu la
 * dépasse toujours.
 *
 * <h2>Pourquoi il existe</h2>
 *
 * <p>Sans lui, la chaîne « pièce jointe → pondération de la réponse » ne
 * fonctionnerait qu'avec une clé d'API et une connexion sortante. Un audit doit
 * pouvoir se dérouler sans dépendre d'un service tiers ; celui-ci fournit une
 * base honnête, et un analyseur adossé à un modèle de langage prend le relais
 * dès qu'il est disponible.
 */
@ApplicationScoped
public class HeuristicEvidenceAnalyzer implements EvidenceAnalyzer {

    public static final String NAME = "heuristique-1.0";

    /**
     * Plafond de confiance.
     *
     * <p>Cet analyseur ne lit pas le contenu : il ne peut pas être sûr. Le
     * plafond garantit qu'une pièce jamais ouverte ne pèse pas autant qu'une
     * pièce réellement examinée, quel que soit le nombre de signaux favorables.
     */
    private static final double MAX_CONFIDENCE = 0.55;

    /** Au-delà, un document décrit un état passé plutôt que la situation. */
    private static final int STALE_MONTHS = 18;

    /** Formats qui portent habituellement un document formalisé. */
    private static final List<String> FORMAL_TYPES = List.of(
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    /** Formats qui attestent d'une existence, rarement d'un pilotage. */
    private static final List<String> CAPTURE_TYPES = List.of(
        "image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp");

    /**
     * Termes qui annoncent un document engageant.
     *
     * <p>Ce sont des indices, pas des preuves : un fichier nommé
     * « politique.pdf » peut être vide. Ils ne font gagner qu'un niveau, jamais
     * plus, et n'ont d'effet que combinés à un format formalisé.
     */
    private static final List<String> COMMITTING_TERMS = List.of(
        "politique", "procedure", "procédure", "charte", "rapport", "registre",
        "attestation", "certificat", "audit", "revue", "plan", "matrice",
        "proces-verbal", "procès-verbal", "signe", "signé", "approuve", "approuvé");

    /** Termes qui annoncent un état des lieux ponctuel. */
    private static final List<String> SNAPSHOT_TERMS = List.of(
        "capture", "screenshot", "extrait", "export", "copie", "photo");

    @Override
    public String name() {
        return NAME;
    }

    @Override
    public Analysis analyze(Document document, Question question) {
        if (document == null) {
            return Analysis.unusable("Aucune pièce à analyser.", NAME);
        }

        String type = document.contentType == null ? "" : document.contentType.toLowerCase(Locale.ROOT);
        String name = document.fileName == null ? "" : document.fileName.toLowerCase(Locale.ROOT);
        long size = document.sizeBytes == null ? 0 : document.sizeBytes;

        // Un fichier vide ou quasi vide n'établit rien, quel que soit son nom.
        if (size < 1024) {
            return Analysis.unusable(
                "Pièce trop légère pour établir quoi que ce soit (" + size + " octets).", NAME);
        }

        int level;
        StringBuilder why = new StringBuilder();

        if (FORMAL_TYPES.stream().anyMatch(type::startsWith)) {
            // Un document bureautique structuré : point de départ « pratique
            // établie », soit le niveau 2.
            level = 2;
            why.append("Document formalisé");
        } else if (CAPTURE_TYPES.contains(type)) {
            // Une image atteste qu'une chose existe à un instant donné. Elle ne
            // dit rien de sa régularité ni de son pilotage.
            level = 1;
            why.append("Capture d'écran : atteste d'une existence ponctuelle, pas d'un dispositif suivi");
        } else if (type.startsWith("text/") || type.contains("csv") || type.contains("json")) {
            level = 1;
            why.append("Export brut : exploitable, mais sans portée d'engagement");
        } else {
            return Analysis.unusable(
                "Format non exploitable par l'analyse automatique (" + type + ").", NAME);
        }

        // Intitulé engageant : +1, et seulement sur un document formalisé. Un
        // fichier nommé « politique » qui se révèle être une capture d'écran
        // reste une capture d'écran.
        boolean committing = COMMITTING_TERMS.stream().anyMatch(name::contains);
        boolean snapshot = SNAPSHOT_TERMS.stream().anyMatch(name::contains);

        if (committing && level >= 2) {
            level += 1;
            why.append(" ; l'intitulé annonce un document engageant");
        }
        if (snapshot && level > 1) {
            level -= 1;
            why.append(" ; l'intitulé annonce un état des lieux ponctuel");
        }

        // Une description saisie par le déposant vaut un contexte, pas un niveau
        // supplémentaire : elle renforce la confiance, pas la note.
        boolean described = document.description != null && document.description.trim().length() >= 20;

        // Fraîcheur. Un document ancien peut rester valable, mais il ne démontre
        // plus l'état courant — c'est un plafond, pas une sanction.
        boolean stale = document.uploadedAt != null
            && document.uploadedAt.isBefore(LocalDateTime.now().minusMonths(STALE_MONTHS));
        if (stale) {
            level = Math.min(level, 2);
            why.append(" ; pièce de plus de ").append(STALE_MONTHS)
               .append(" mois, elle ne rend plus compte de l'état actuel");
        }

        level = Math.max(0, Math.min(4, level));

        double confidence = 0.30;
        if (FORMAL_TYPES.stream().anyMatch(type::startsWith)) confidence += 0.10;
        if (described) confidence += 0.10;
        if (committing || snapshot) confidence += 0.05;
        confidence = Math.min(MAX_CONFIDENCE, confidence);

        why.append(". Analyse fondée sur le format, l'intitulé et la fraîcheur : ")
           .append("le contenu du fichier n'a pas été lu.");

        // La question sert de contexte de restitution, pas de critère : cet
        // analyseur ne sait pas confronter un contenu à un intitulé.
        if (question != null) {
            why.append(" Rattachée à ").append(question.code).append('.');
        }

        return new Analysis(level, confidence, why.toString(), NAME);
    }
}
