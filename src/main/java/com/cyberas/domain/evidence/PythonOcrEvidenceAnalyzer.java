package com.cyberas.domain.evidence;

import com.cyberas.domain.entity.Document;
import com.cyberas.domain.entity.Question;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.annotation.Priority;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Alternative;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Base64;
import java.util.Locale;

/**
 * Analyse d'une pièce justificative par OCR et vérification de cohérence
 * (service Python, {@code ocr-service/}).
 *
 * <h2>Ce que cet analyseur apporte, et où il se situe</h2>
 *
 * <p>Il remplace {@link GeminiEvidenceAnalyzer} comme implémentation
 * retenue par défaut. Comme lui, il lit réellement le contenu — y compris les
 * pièces scannées, sans couche texte, que {@link DocumentTextExtractor}
 * (PDFBox) ne sait pas ouvrir. À la différence d'un modèle de langage, il ne
 * « comprend » pas la question : il extrait le texte (OCR pour les images et
 * PDF scannés, couche texte native sinon) et mesure sa proximité lexicale
 * avec l'intitulé et les éléments attendus. C'est plus étroit qu'une lecture
 * sémantique, d'où un plafond de confiance entre celui de l'heuristique et
 * celui qu'avait Gemini.
 *
 * <h2>Ce qu'il ne fait toujours pas</h2>
 *
 * <p>Il ne dit pas si un document est authentique, exactement comme les deux
 * analyseurs précédents. Le champ produit reste un niveau démontré, jamais
 * une preuve.
 *
 * <h2>Repli</h2>
 *
 * <p>Service indisponible, dépôt injoignable, réponse inexploitable : bascule
 * sur l'heuristique plutôt que d'échouer. {@link GeminiEvidenceAnalyzer} reste
 * dans le code, désactivé (ni {@code @Alternative} ni {@code @Priority}) :
 * réactiver l'analyse par modèle de langage est un choix de configuration, pas
 * une réécriture.
 */
@Alternative
@Priority(1)
@ApplicationScoped
public class PythonOcrEvidenceAnalyzer implements EvidenceAnalyzer {

    private static final Logger LOG = Logger.getLogger(PythonOcrEvidenceAnalyzer.class);

    public static final String NAME = "ocr-consistency-1.0";

    /**
     * Plafond de confiance.
     *
     * <p>Entre celui de l'heuristique (0,55, qui ne lit rien) et celui que
     * Gemini portait (0,85, qui comprend le texte) : l'OCR lit le contenu,
     * mais la mesure de cohérence reste lexicale, pas sémantique.
     */
    private static final double MAX_CONFIDENCE = 0.75;

    private static final int MAX_INLINE_BYTES = 8 * 1024 * 1024;

    @ConfigProperty(name = "ocr.service.url")
    String serviceUrl;

    @Inject
    ObjectMapper objectMapper;

    @Inject
    HeuristicEvidenceAnalyzer fallback;

    private final HttpClient http = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(5))
        .build();

    @Override
    public String name() {
        return NAME;
    }

    @Override
    public Analysis analyze(Document document, Question question) {
        if (document == null) {
            return Analysis.unusable("Aucune pièce à analyser.", name());
        }

        String type = document.contentType == null ? "" : document.contentType.toLowerCase(Locale.ROOT);
        if (!SupportedFileTypes.isReadableInline(type)) {
            // Conteneur bureautique ou format sans OCR possible : l'heuristique
            // sur les métadonnées vaut mieux qu'un appel voué à l'échec.
            return fallback.analyze(document, question);
        }

        byte[] bytes = readBytes(document);
        if (bytes == null) {
            return fallback.analyze(document, question);
        }

        try {
            String response = call(buildRequest(document, question, type, bytes));
            Analysis parsed = readVerdict(response, document);
            if (parsed != null) {
                return parsed;
            }
            LOG.warnf("Réponse du service OCR inexploitable pour %s, repli heuristique", document.fileName);
        } catch (Exception e) {
            // Une panne du service OCR ne doit pas interrompre un audit.
            LOG.warnf(e, "Service OCR indisponible pour %s, repli heuristique", document.fileName);
        }
        return fallback.analyze(document, question);
    }

    // -----------------------------------------------------------------------

    private ObjectNode buildRequest(Document document, Question question, String contentType, byte[] bytes) {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("fileName", document.fileName);
        root.put("contentType", contentType);
        root.put("contentBase64", Base64.getEncoder().encodeToString(bytes));

        if (question != null) {
            ObjectNode q = root.putObject("question");
            q.put("code", question.code);
            q.put("text", question.text);
            q.put("guidance", question.guidance == null ? "" : question.guidance);
        }
        return root;
    }

    private byte[] readBytes(Document document) {
        if (document.storagePath == null) {
            return null;
        }
        try {
            Path path = Path.of(document.storagePath);
            if (!Files.exists(path) || Files.size(path) > MAX_INLINE_BYTES) {
                return null;
            }
            return Files.readAllBytes(path);
        } catch (Exception e) {
            LOG.debugf("Pièce illisible sur disque : %s", document.storagePath);
            return null;
        }
    }

    private String call(ObjectNode body) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(URI.create(serviceUrl + "/analyze"))
            .header("Content-Type", "application/json")
            .timeout(Duration.ofSeconds(45))
            .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
            .build();

        HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new IllegalStateException(
                "Le service OCR a refusé la demande (" + response.statusCode() + ")");
        }
        return response.body();
    }

    /** Retourne null si la réponse n'est pas exploitable, pour que l'appelant bascule sur l'heuristique. */
    private Analysis readVerdict(String raw, Document document) {
        try {
            JsonNode verdict = objectMapper.readTree(raw);
            Integer level = verdict.hasNonNull("level")
                ? Math.max(0, Math.min(4, verdict.path("level").asInt()))
                : null;

            double confidence = Math.max(0.0, Math.min(MAX_CONFIDENCE, verdict.path("confidence").asDouble(0.5)));

            String rationale = verdict.path("rationale").asText("").trim();
            if (rationale.isEmpty()) {
                rationale = "Texte extrait par OCR et confronté à la question par similarité lexicale.";
            }
            rationale += " (lecture OCR par " + name() + " ; la lecture n'établit pas l'authenticité du document)";

            return new Analysis(level, confidence, rationale, name());
        } catch (Exception e) {
            LOG.debugf(e, "Verdict OCR illisible pour %s", document.fileName);
            return null;
        }
    }
}
