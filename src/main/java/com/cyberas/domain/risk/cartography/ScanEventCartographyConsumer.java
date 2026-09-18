package com.cyberas.domain.risk.cartography;

import com.cyberas.domain.telemetry.ScanStageEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.smallrye.common.annotation.Blocking;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.jboss.logging.Logger;

/**
 * Consomme {@code cyberas-scan-events} pour alimenter la cartographie des
 * risques.
 *
 * <p>{@code @Blocking} : l'ingestion écrit en base (Panache/Hibernate), qui
 * est bloquant. Sans cette annotation, SmallRye Reactive Messaging exécute le
 * consommateur sur la boucle d'événements Vert.x, qu'un appel bloquant
 * gèlerait pour tout le reste de l'application.
 *
 * <p>Un message illisible (JSON corrompu, schéma d'un autre producteur) est
 * journalisé et ignoré plutôt que de faire échouer la consommation : un topic
 * partagé avec un futur producteur externe ne doit pas pouvoir bloquer cette
 * application sur un message qu'elle ne comprend pas.
 */
@ApplicationScoped
public class ScanEventCartographyConsumer {

    private static final Logger LOG = Logger.getLogger(ScanEventCartographyConsumer.class);

    @Inject
    ObjectMapper objectMapper;

    @Inject
    RiskCartographyService cartographyService;

    @Incoming("scan-events")
    @Blocking
    public void onScanEvent(String payload) {
        try {
            ScanStageEvent event = objectMapper.readValue(payload, ScanStageEvent.class);
            cartographyService.ingest(event);
        } catch (Exception e) {
            LOG.warnf(e, "Événement de scan illisible sur cyberas-scan-events, ignoré");
        }
    }
}
