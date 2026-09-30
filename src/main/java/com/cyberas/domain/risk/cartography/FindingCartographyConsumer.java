package com.cyberas.domain.risk.cartography;

import com.cyberas.domain.telemetry.FindingEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.smallrye.common.annotation.Blocking;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.jboss.logging.Logger;

/**
 * Consomme {@code cyberas-finding-events} pour alimenter la cartographie.
 *
 * <p>Ce topic était publié sans être lu. La cartographie consommait les étapes
 * de scan, qui ne portent ni port ni nom de service : elle se rabattait sur le
 * protocole de transport et rangeait tout le TCP dans une seule case. Le
 * constat, lui, porte le service observé — et c'est de lui que se déduit le
 * critère de sécurité mis en jeu.
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
public class FindingCartographyConsumer {

    private static final Logger LOG = Logger.getLogger(FindingCartographyConsumer.class);

    @Inject
    ObjectMapper objectMapper;

    @Inject
    RiskCartographyService cartographyService;

    @Incoming("finding-events-in")
    @Blocking
    public void onFindingEvent(String payload) {
        try {
            FindingEvent event = objectMapper.readValue(payload, FindingEvent.class);
            cartographyService.ingest(event);
        } catch (Exception e) {
            LOG.warnf(e, "Constat illisible sur cyberas-finding-events, ignoré");
        }
    }
}
