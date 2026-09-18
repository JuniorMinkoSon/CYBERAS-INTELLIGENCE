package com.cyberas.domain.telemetry;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Mise à jour d'une entrée de la cartographie des risques, publiée sur
 * {@code cyberas-risk-events}.
 *
 * <p>{@code category} reprend une des quatre catégories MEHARI simplifiées
 * portées par {@code RiskCartography.MehariCategory} — en chaîne plutôt qu'en
 * énumération, pour que ce module de télémétrie n'ait pas à dépendre du
 * domaine risque.
 */
public record RiskCartographyEvent(
    UUID organizationId,
    UUID auditId,
    String category,
    String riskLevel,
    int occurrences,
    LocalDateTime updatedAt
) {
}
