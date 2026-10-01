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
    /**
     * Cible du scan : l'adresse ou le nom interroge.
     *
     * <p>Sans elle, une ligne de cartographie dit « mysql, eleve,
     * confidentialite » sans dire SUR QUELLE MACHINE. Un auditeur ne peut pas
     * faire corriger un service dont il ignore l'hote, et le livrable perd sa
     * raison d'etre : designer quoi traiter, et ou.
     */
    String target,
    /** Actif rattache, quand le perimetre en declare un pour cette cible. */
    UUID assetId,
    LocalDateTime detectedAt
) {
}
