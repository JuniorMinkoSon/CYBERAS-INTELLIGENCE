package com.cyberas.domain.risk.confidence;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Optional;

/**
 * Client du service ML de scoring (Python, classification par arbre de
 * décision à critère Gini — voir {@code ml-service/}).
 *
 * <h2>Ce que ce client fait — et ne fait pas</h2>
 *
 * <p>Il calcule un indice de confiance sur la cohérence d'une réponse au
 * questionnaire, à côté du score déterministe. Il n'influence jamais
 * {@code RiskEngine} ni {@code FrameworkScoringService} : c'est la couche
 * séparée décidée pour intégrer du machine learning sans remettre en cause
 * le principe « un score qu'on ne peut pas recalculer à la main n'est pas
 * défendable en audit ».
 *
 * <h2>Repli</h2>
 *
 * <p>Service absent ou en panne → {@link Optional#empty()}, jamais
 * d'exception : l'indice de confiance est une information en plus, pas une
 * condition pour consulter ou clôturer un audit.
 */
@ApplicationScoped
public class AnswerConfidenceClient {

    private static final Logger LOG = Logger.getLogger(AnswerConfidenceClient.class);

    @ConfigProperty(name = "ml.service.url")
    String baseUrl;

    @Inject
    ObjectMapper objectMapper;

    /**
     * HTTP/1.1 imposé.
     *
     * <p>{@code HttpClient.newBuilder()} négocie HTTP/2 par défaut : sur une
     * cible en clair, cela prend la forme d'une tentative de bascule h2c, le
     * corps de la requête étant envoyé dans la foulée de l'en-tête de
     * négociation. Uvicorn, qui sert les deux services Python, ne parle que
     * HTTP/1.1 : il répondait bien, mais sans jamais lire le corps.
     *
     * <p>Le symptôme était trompeur. Le service renvoyait 422 « Field required,
     * loc: body, input: null » — c'est-à-dire « il manque le corps » — alors
     * que le corps était correctement sérialisé côté Java, et que la même
     * requête rejouée à la main passait sans problème. La vérification de
     * cohérence des réponses n'a donc jamais fonctionné en dehors des tests,
     * et l'interface affichait « service indisponible » sur un service qui
     * tournait parfaitement.
     */
    private final HttpClient http = HttpClient.newBuilder()
        .version(HttpClient.Version.HTTP_1_1)
        .connectTimeout(Duration.ofSeconds(5))
        .build();

    public Optional<ConfidenceVerdict> checkAnswer(ConfidenceFeatures features) {
        try {
            ObjectNode body = objectMapper.createObjectNode();
            body.put("domain", features.domain());
            body.put("declaredLevel", features.declaredLevel());
            body.put("avgEvidenceLevel", features.avgEvidenceLevel());
            body.put("avgEvidenceConfidence", features.avgEvidenceConfidence());
            body.put("evidenceCount", features.evidenceCount());

            HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + "/confidence/questionnaire-answer"))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(10))
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                .build();

            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                // Le corps de la réponse est journalisé, pas seulement le code.
                // Un « réponse 422 » seul ne dit pas quel champ le service a
                // refusé : il a fallu rejouer la requête à la main pour
                // l'apprendre, alors que le service le disait déjà dans sa
                // réponse. La requête envoyée est jointe en debug, car c'est la
                // confrontation des deux qui désigne le fautif.
                LOG.warnf("Service ML : réponse %d sur /confidence/questionnaire-answer — %s",
                    response.statusCode(), response.body());
                LOG.debugf("Corps envoyé : %s", objectMapper.writeValueAsString(body));
                return Optional.empty();
            }

            JsonNode json = objectMapper.readTree(response.body());
            return Optional.of(new ConfidenceVerdict(
                json.path("confidenceIndex").asDouble(0.0),
                json.path("flagged").asBoolean(false),
                json.path("reason").asText(""),
                json.path("model").asText("gini-tree")
            ));
        } catch (Exception e) {
            LOG.debugf(e, "Service ML indisponible pour la vérification de cohérence");
            return Optional.empty();
        }
    }
}
