package com.cyberas.domain.telemetry;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;
import org.jboss.logging.Logger;

/**
 * Point unique de diffusion vers Kafka : scans, constats, cartographie des
 * risques, journal d'audit.
 *
 * <h2>Ce que ce pont est — et ce qu'il n'est pas</h2>
 *
 * <p>C'est l'« environnement de réception des logs » côté émission : chaque
 * étape de scan, chaque constat, chaque mise à jour de cartographie et chaque
 * ligne du journal d'audit y est rediffusée en JSON, sur les topics déclarés
 * depuis la Phase 2 dans {@code application.properties} mais jamais alimentés.
 * Un service abonné à ces topics — le futur moteur de classification ML, un
 * SIEM externe — les reçoit sans avoir à interroger cette base de données.
 *
 * <p>Ce n'est en aucun cas la source de vérité : chaque événement est d'abord
 * persisté (scan, finding, audit_events, risk_cartography_entries), et la
 * publication Kafka n'est qu'une rediffusion best-effort de ce qui est déjà
 * acquis. Une panne de Kafka — broker indisponible, topic manquant — est donc
 * avalée et journalisée, jamais remontée à l'appelant : un audit ne doit pas
 * s'arrêter parce que le bus d'événements est en panne, exactement comme un
 * audit ne s'arrête pas quand Gemini est indisponible.
 */
@ApplicationScoped
public class KafkaLogBridge {

    private static final Logger LOG = Logger.getLogger(KafkaLogBridge.class);

    @Inject
    ObjectMapper objectMapper;

    @Inject
    @Channel("scan-telemetry")
    Emitter<String> scanTelemetryEmitter;

    @Inject
    @Channel("finding-events")
    Emitter<String> findingEventsEmitter;

    @Inject
    @Channel("risk-events")
    Emitter<String> riskEventsEmitter;

    @Inject
    @Channel("audit-events")
    Emitter<String> auditEventsEmitter;

    public void publishScanStage(ScanStageEvent event) {
        send(scanTelemetryEmitter, event, "scan-telemetry");
    }

    public void publishFinding(FindingEvent event) {
        send(findingEventsEmitter, event, "finding-events");
    }

    public void publishRiskCartography(RiskCartographyEvent event) {
        send(riskEventsEmitter, event, "risk-events");
    }

    public void publishAuditLog(AuditLogEvent event) {
        send(auditEventsEmitter, event, "audit-events");
    }

    private void send(Emitter<String> emitter, Object payload, String channel) {
        try {
            emitter.send(objectMapper.writeValueAsString(payload));
        } catch (Exception e) {
            // Jamais propagé : voir la note de classe. Un événement non
            // diffusé reste consultable dans sa table d'origine.
            LOG.warnf(e, "Publication Kafka impossible sur %s", channel);
        }
    }
}
