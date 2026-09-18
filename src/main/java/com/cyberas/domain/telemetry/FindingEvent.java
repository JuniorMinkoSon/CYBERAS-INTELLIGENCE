package com.cyberas.domain.telemetry;

import java.time.LocalDateTime;
import java.util.UUID;

/** Rediffusion d'un constat nouvellement persisté sur le topic Kafka {@code cyberas-finding-events}. */
public record FindingEvent(
    UUID findingId,
    UUID scanId,
    UUID auditId,
    UUID organizationId,
    String title,
    String severity,
    Integer port,
    String protocol,
    String serviceName,
    LocalDateTime detectedAt
) {
}
