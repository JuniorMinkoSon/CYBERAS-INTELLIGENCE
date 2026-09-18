package com.cyberas.domain.telemetry;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Rediffusion d'une ligne du journal d'audit chaîné sur Kafka.
 *
 * <p>Porte les mêmes champs que {@code AuditEvent}, y compris les empreintes
 * de la chaîne d'intégrité : un consommateur externe (SIEM, service de
 * cartographie des risques) peut ainsi vérifier lui-même la continuité de ce
 * qu'il reçoit, sans avoir à interroger la base pour la retrouver.
 */
public record AuditLogEvent(
    UUID eventId,
    UUID organizationId,
    UUID auditId,
    String eventType,
    String resourceType,
    UUID resourceId,
    UUID actorId,
    String source,
    LocalDateTime timestamp,
    String prevHash,
    String entryHash
) {
}
