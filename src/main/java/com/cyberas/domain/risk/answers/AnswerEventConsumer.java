package com.cyberas.domain.risk.answers;

import com.cyberas.domain.telemetry.AnswerEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.smallrye.common.annotation.Blocking;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.jboss.logging.Logger;

/**
 * Consomme {@code cyberas-answer-events} pour alimenter la projection des
 * réponses.
 *
 * <p>Calqué sur {@code ScanEventCartographyConsumer}, et pour les mêmes
 * raisons.
 *
 * <p>{@code @Blocking} : l'ingestion écrit en base, qui est bloquant. Sans
 * cette annotation, SmallRye exécute le consommateur sur la boucle
 * d'événements Vert.x, qu'un appel bloquant gèlerait pour tout le reste de
 * l'application.
 *
 * <p>Un message illisible est journalisé et ignoré plutôt que de faire échouer
 * la consommation : le topic peut un jour recevoir un producteur externe, et
 * un message que cette application ne comprend pas ne doit pas l'arrêter.
 */
@ApplicationScoped
public class AnswerEventConsumer {

    private static final Logger LOG = Logger.getLogger(AnswerEventConsumer.class);

    @Inject
    ObjectMapper objectMapper;

    @Inject
    AnswerProjectionService projectionService;

    @Incoming("answer-events")
    @Blocking
    public void onAnswerEvent(String payload) {
        try {
            AnswerEvent event = objectMapper.readValue(payload, AnswerEvent.class);
            projectionService.ingest(event);
        } catch (Exception e) {
            LOG.warnf(e, "Événement de réponse illisible sur cyberas-answer-events, ignoré");
        }
    }
}
