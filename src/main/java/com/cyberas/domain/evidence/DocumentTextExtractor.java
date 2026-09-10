package com.cyberas.domain.evidence;

import com.cyberas.domain.entity.Document;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.Optional;

/**
 * Lecture du texte d'une pièce justificative.
 *
 * <h2>Pourquoi cette classe existe</h2>
 *
 * <p>L'analyse d'une preuve ne portait que sur le nom du fichier, son format et
 * sa date. Une politique de sécurité de trente pages et un document vide au
 * même intitulé recevaient la même note, et l'analyse le disait honnêtement :
 * « le contenu du fichier n'a pas été lu ». Honnête, mais sans valeur pour
 * l'audité.
 *
 * <p>L'extraction se fait <strong>localement</strong>. Une organisation qui
 * audite ses propres documents n'a pas à les envoyer chez un tiers pour qu'ils
 * soient lus, et l'analyse ne doit pas dépendre de la présence d'une clé d'API.
 *
 * <h2>Ce qu'elle ne sait pas lire</h2>
 *
 * <p>Les conteneurs bureautiques — DOCX, XLSX, PPTX — et les images. Le premier
 * cas demanderait Apache POI, le second un moteur de reconnaissance optique.
 * Dans les deux, l'extraction rend un résultat vide et l'analyse retombe sur
 * les métadonnées, en le disant. <strong>Un texte absent n'est jamais traité
 * comme un texte vide</strong> : ne pas savoir lire n'est pas un constat de
 * non-conformité.
 */
@ApplicationScoped
public class DocumentTextExtractor {

    private static final Logger LOG = Logger.getLogger(DocumentTextExtractor.class);

    /**
     * Plafond de caractères retenus.
     *
     * <p>Au-delà, l'analyse n'y gagne rien : les éléments qui distinguent une
     * politique formalisée d'une note de service — objet, périmètre, date de
     * revue, signataire — figurent dans les premières pages. Lire un document
     * de plusieurs centaines de pages coûterait de la mémoire pour un gain nul.
     */
    private static final int MAX_CHARS = 200_000;

    /** Pages lues au plus, pour la même raison. */
    private static final int MAX_PAGES = 40;

    /**
     * Texte de la pièce, vide si le format ne se lit pas ou si la lecture
     * échoue.
     *
     * <p>Un échec ne remonte jamais en exception : l'analyse doit se poursuivre
     * sur les métadonnées plutôt que d'interrompre le dépôt d'une preuve.
     */
    public Optional<String> extract(Document document) {
        if (document == null || document.storagePath == null) {
            return Optional.empty();
        }

        Path path = Path.of(document.storagePath);
        if (!Files.isReadable(path)) {
            return Optional.empty();
        }

        String type = document.contentType == null
            ? "" : document.contentType.toLowerCase(Locale.ROOT);

        try {
            if (type.equals("application/pdf")) {
                return extractPdf(path);
            }
            if (type.startsWith("text/")) {
                String text = Files.readString(path, StandardCharsets.UTF_8);
                return normalize(text);
            }
        } catch (Exception e) {
            // Un PDF chiffré, tronqué ou malformé est un cas courant, pas une
            // anomalie du service : on l'enregistre et l'on rend le champ vide.
            LOG.debugf(e, "Lecture impossible pour %s (%s)", document.fileName, type);
            return Optional.empty();
        }

        return Optional.empty();
    }

    private Optional<String> extractPdf(Path path) throws IOException {
        try (PDDocument pdf = Loader.loadPDF(path.toFile())) {
            // Un PDF protégé contre l'extraction ne doit pas être forcé : le
            // refus d'extraction est une volonté de son auteur.
            if (pdf.isEncrypted()) {
                return Optional.empty();
            }

            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setStartPage(1);
            stripper.setEndPage(Math.min(MAX_PAGES, pdf.getNumberOfPages()));
            return normalize(stripper.getText(pdf));
        }
    }

    /**
     * Un texte réduit à des espaces vaut une absence de texte.
     *
     * <p>C'est le cas d'un PDF composé d'images numérisées : PDFBox rend
     * quelques sauts de ligne, et les traiter comme du contenu ferait conclure
     * à un document vide alors qu'il n'a simplement pas été lu.
     */
    private Optional<String> normalize(String raw) {
        if (raw == null || raw.isBlank()) {
            return Optional.empty();
        }
        String cleaned = raw.replaceAll("\\s+", " ").trim();
        if (cleaned.length() < 40) {
            return Optional.empty();
        }
        return Optional.of(cleaned.length() > MAX_CHARS ? cleaned.substring(0, MAX_CHARS) : cleaned);
    }
}
