package com.cyberas.domain.evidence;

import com.cyberas.domain.entity.Document;
import com.cyberas.domain.entity.Question;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
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
import java.util.Optional;
import java.util.Set;

/**
 * Analyse d'une pièce justificative par un modèle de langage.
 *
 * <h2>Ce que cet analyseur apporte sur le précédent</h2>
 *
 * <p>{@link HeuristicEvidenceAnalyzer} ne lit pas les fichiers : il juge sur le
 * format, l'intitulé et la fraîcheur, et sa confiance plafonne à 0,55 pour
 * cette raison. Celui-ci <strong>lit réellement le contenu</strong> et le
 * confronte à la question posée. C'est ce qui permet de distinguer une
 * politique signée et datée d'un fichier nommé « politique.pdf » mais vide.
 *
 * <h2>Ce qu'il ne fait toujours pas</h2>
 *
 * <p>Il ne dit pas si un document est authentique. Un modèle ne peut pas
 * établir qu'une politique a réellement été approuvée par une direction, ni
 * qu'une capture n'a pas été fabriquée. Il rend un <em>niveau démontré</em>,
 * qui reste une lecture, jamais une preuve d'authenticité.
 *
 * <p>Sa confiance est plafonnée elle aussi, plus haut : un modèle peut se
 * tromper, et une note qui pèse sur la maturité d'un client ne doit pas peser
 * de tout son poids sur la foi d'une seule lecture automatique.
 *
 * <h2>Repli</h2>
 *
 * <p>Toute défaillance — clé absente, service injoignable, réponse
 * inexploitable — bascule sur l'analyseur heuristique plutôt que d'échouer. Un
 * audit ne doit pas s'arrêter parce qu'un fournisseur externe est en panne, et
 * une pièce non analysée pèserait à tort comme une pièce sans valeur.
 */
/*
 * Cet analyseur est l'implementation retenue par defaut ({@code @Alternative}
 * prioritaire). Il n'est pas conditionne a la presence de la cle : la decision
 * est prise a l'execution, dans {@link #analyze}, qui bascule sur l'heuristique
 * quand la cle manque.
 *
 * Conditionner le bean lui-meme aurait fige le choix au demarrage : ajouter une
 * cle aurait impose un redemarrage, et une cle retiree aurait fait echouer
 * l'injection au lieu de degrader proprement.
 */
@Alternative
@Priority(1)
@ApplicationScoped
public class GeminiEvidenceAnalyzer implements EvidenceAnalyzer {

    private static final Logger LOG = Logger.getLogger(GeminiEvidenceAnalyzer.class);

    /**
     * Plafond de confiance.
     *
     * <p>Plus haut que l'heuristique — le contenu est réellement lu — mais pas
     * total : un modèle peut mal interpréter un document, et la pondération
     * qu'il déclenche réduit le poids de la réponse d'un client.
     */
    private static final double MAX_CONFIDENCE = 0.85;

    /**
     * Taille maximale envoyée au modèle.
     *
     * <p>Au-delà, la pièce est analysée sur son en-tête. Envoyer un document de
     * plusieurs dizaines de mégaoctets coûte cher, prend du temps, et n'améliore
     * pas un jugement qui se forme sur les premières pages.
     */
    private static final int MAX_INLINE_BYTES = 4 * 1024 * 1024;

    /** Types que le modèle sait lire directement. */
    private static final Set<String> INLINE_TYPES = Set.of(
        "application/pdf", "image/png", "image/jpeg", "image/webp");

    /**
     * Clé d'accès au modèle.
     *
     * <p>{@code Optional} et non {@code String} : une propriété définie à la
     * chaîne vide est considérée comme nulle par SmallRye, qui refuse alors
     * d'injecter un {@code String} et fait échouer le démarrage — précisément
     * ce que la dégradation vers l'heuristique cherche à éviter.
     */
    @ConfigProperty(name = "gemini.api-key")
    Optional<String> apiKey;

    @ConfigProperty(name = "gemini.model", defaultValue = "gemini-flash-latest")
    String model;

    @Inject
    ObjectMapper objectMapper;

    @Inject
    HeuristicEvidenceAnalyzer fallback;

    private final HttpClient http = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(15))
        .build();

    @Override
    public String name() {
        // Le nom du modele porte deja le prefixe du fournisseur : le rajouter
        // produisait « gemini-gemini-flash-latest » dans la tracabilite.
        return model.startsWith("gemini") ? model : "gemini-" + model;
    }

    @Override
    public Analysis analyze(Document document, Question question) {
        if (document == null) {
            return Analysis.unusable("Aucune pièce à analyser.", name());
        }
        if (apiKey.isEmpty() || apiKey.get().isBlank()) {
            return fallback.analyze(document, question);
        }

        try {
            String response = call(buildRequest(document, question));
            Analysis parsed = readVerdict(response, document, question);
            if (parsed != null) {
                return parsed;
            }
            LOG.warnf("Réponse du modèle inexploitable pour %s, repli heuristique", document.fileName);
        } catch (Exception e) {
            // Une panne du fournisseur ne doit pas interrompre un audit.
            LOG.warnf(e, "Analyse par modèle indisponible pour %s, repli heuristique",
                document.fileName);
        }
        return fallback.analyze(document, question);
    }

    // -----------------------------------------------------------------------

    private ObjectNode buildRequest(Document document, Question question) throws Exception {
        ObjectNode root = objectMapper.createObjectNode();
        ArrayNode contents = root.putArray("contents");
        ObjectNode turn = contents.addObject();
        turn.put("role", "user");
        ArrayNode parts = turn.putArray("parts");

        parts.addObject().put("text", prompt(document, question));

        String type = document.contentType == null
            ? "" : document.contentType.toLowerCase(Locale.ROOT);
        byte[] bytes = readBytes(document);

        if (bytes != null && INLINE_TYPES.contains(type)) {
            ObjectNode inline = parts.addObject().putObject("inline_data");
            inline.put("mime_type", type);
            inline.put("data", Base64.getEncoder().encodeToString(bytes));
        } else if (bytes != null && (type.startsWith("text/") || type.contains("json")
                || type.contains("csv") || type.contains("xml"))) {
            // Texte brut : envoyé tel quel, tronqué au besoin. Le modèle le lit
            // mieux que sous forme encodée.
            String text = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
            parts.addObject().put("text",
                "--- Contenu du fichier ---\n" + text.substring(0, Math.min(text.length(), 60_000)));
        } else {
            // Format non lisible : on le dit au modèle plutôt que de le laisser
            // conclure sur le seul intitulé sans savoir qu'il lui manque tout.
            parts.addObject().put("text",
                "--- Contenu non transmis : format « " + type
                    + " » non exploitable par l'analyse. Jugez sur les seules métadonnées "
                    + "et abaissez la confiance en conséquence. ---");
        }

        // Température nulle : deux analyses de la même pièce doivent rendre la
        // même note. Une notation qui varie d'un appel à l'autre ne serait pas
        // opposable à un client.
        ObjectNode config = root.putObject("generationConfig");
        config.put("temperature", 0);
        config.put("responseMimeType", "application/json");

        return root;
    }

    private String prompt(Document document, Question question) {
        StringBuilder sb = new StringBuilder();
        sb.append("Tu évalues une pièce justificative dans le cadre d'un audit de sécurité.\n\n")
          .append("QUESTION ÉTAYÉE PAR CETTE PIÈCE :\n");

        if (question != null) {
            sb.append(question.code).append(" — ").append(question.text).append('\n');
            if (question.guidance != null && !question.guidance.isBlank()) {
                sb.append("Éléments attendus : ").append(question.guidance).append('\n');
            }
        } else {
            sb.append("Aucune question précise : la pièce est versée au dossier général.\n");
        }

        sb.append("\nPIÈCE : ").append(document.fileName)
          .append(" (").append(document.contentType).append(", ")
          .append(document.sizeBytes == null ? 0 : document.sizeBytes).append(" octets)\n");
        if (document.description != null && !document.description.isBlank()) {
            sb.append("Description fournie par le déposant : ").append(document.description).append('\n');
        }

        sb.append("""

            ÉCHELLE — jusqu'à quel niveau de maturité cette pièce permet-elle
            d'étayer la réponse ?
              0 — n'étaye rien : hors sujet, vide, ou sans rapport avec la question
              1 — atteste d'une existence ponctuelle (capture, note informelle)
              2 — pratique établie : document formalisé décrivant ce qui est fait
              3 — pratique pilotée : document daté, engageant, avec responsable ou périmètre
              4 — pratique mesurée : indicateurs, revue périodique, traces de suivi

            RÈGLES :
            - Tu juges ce que la pièce DÉMONTRE, pas si elle est authentique.
              Tu ne peux pas vérifier une signature ni détecter un faux : ne le
              prétends jamais.
            - Une pièce hors sujet par rapport à la question vaut 0, même si
              c'est un beau document.
            - Un document ancien ne peut pas dépasser 2 : il ne rend plus compte
              de l'état actuel.
            - La confiance reflète TA certitude de lecture, pas la qualité du
              document.

            Réponds uniquement en JSON :
            {"level": <0-4>, "confidence": <0.0-1.0>, "rationale": "<2 phrases max, en français>"}
            """);
        return sb.toString();
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
        String url = "https://generativelanguage.googleapis.com/v1beta/models/"
            + model + ":generateContent";

        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
            .header("Content-Type", "application/json")
            // La clé passe par un en-tête et non par l'URL : une URL se
            // retrouve dans les journaux d'accès, les traces et l'historique.
            .header("x-goog-api-key", apiKey.orElse(""))
            .timeout(Duration.ofSeconds(60))
            .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
            .build();

        HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new IllegalStateException(
                "Le modèle a refusé la demande (" + response.statusCode() + ") : "
                    + response.body().substring(0, Math.min(300, response.body().length())));
        }
        return response.body();
    }

    /**
     * Lit le verdict.
     *
     * <p>Retourne null si la réponse n'est pas exploitable, pour que l'appelant
     * bascule sur l'heuristique. Une note fabriquée à partir d'une réponse mal
     * formée serait pire qu'une note plus prudente mais assumée.
     */
    private Analysis readVerdict(String raw, Document document, Question question) {
        try {
            JsonNode root = objectMapper.readTree(raw);
            JsonNode textNode = root.path("candidates").path(0)
                .path("content").path("parts").path(0).path("text");
            if (textNode.isMissingNode() || textNode.isNull()) {
                return null;
            }

            JsonNode verdict = objectMapper.readTree(textNode.asText());
            if (!verdict.has("level")) {
                return null;
            }

            int level = Math.max(0, Math.min(4, verdict.path("level").asInt(-1)));
            if (verdict.path("level").asInt(-1) < 0) {
                return null;
            }

            double confidence = Math.max(0.0,
                Math.min(MAX_CONFIDENCE, verdict.path("confidence").asDouble(0.5)));

            String rationale = verdict.path("rationale").asText("").trim();
            if (rationale.isEmpty()) {
                rationale = "Analyse du contenu par modèle de langage.";
            }

            // La provenance est portée dans le motif : un auditeur doit savoir
            // qu'une machine a lu la pièce, et laquelle.
            rationale += " (contenu lu par " + name()
                + " ; la lecture n'établit pas l'authenticité du document)";

            return new Analysis(level, confidence, rationale, name());
        } catch (Exception e) {
            LOG.debugf(e, "Verdict illisible pour %s", document.fileName);
            return null;
        }
    }
}
