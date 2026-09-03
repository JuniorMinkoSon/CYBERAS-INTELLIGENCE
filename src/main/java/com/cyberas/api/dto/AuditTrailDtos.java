package com.cyberas.api.dto;

import com.cyberas.domain.entity.AuditEvent;
import com.fasterxml.jackson.databind.JsonNode;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Vue exposée d'un événement de traçabilité.
 *
 * L'entité porte cinq relations — organisation, audit, version, acteur — dont la
 * sérialisation directe entraînait toute la hiérarchie : cent kilo-octets pour
 * cinq événements. Le journal étant la vue la plus consultée d'un audit, c'est
 * précisément là que le coût comptait le plus.
 *
 * L'acteur est réduit à son adresse : elle suffit à répondre à « qui a fait quoi »,
 * qui est la question à laquelle sert ce journal.
 */
public record AuditTrailDtos() {

    public record AuditEventResponse(
        UUID id,
        UUID organizationId,
        UUID auditId,
        UUID auditVersionId,
        Integer auditVersionNumber,
        String eventType,
        UUID actorId,
        String actorEmail,
        String actorName,
        String resourceType,
        UUID resourceId,
        String action,
        String status,
        JsonNode details,
        String correlationId,
        String source,
        String ipAddress,
        LocalDateTime timestamp
    ) {
        public static AuditEventResponse from(AuditEvent e) {
            return new AuditEventResponse(
                e.id,
                e.organization != null ? e.organization.id : null,
                e.audit != null ? e.audit.id : null,
                e.auditVersion != null ? e.auditVersion.id : null,
                e.auditVersion != null ? e.auditVersion.versionNumber : null,
                e.eventType,
                e.actor != null ? e.actor.id : null,
                e.actor != null ? e.actor.email : null,
                displayName(e),
                e.resourceType,
                e.resourceId,
                e.action,
                e.status,
                // Les détails portent ce qui distingue un événement d'un autre :
                // cible du scan, ancienne et nouvelle valeur, motif de refus.
                e.details,
                e.correlationId,
                e.source,
                e.ipAddress,
                e.timestamp
            );
        }

        /**
         * Un journal se lit avec des noms, pas des identifiants. Les actions du
         * système n'ont pas d'acteur : elles sont désignées comme telles plutôt
         * que laissées vides, ce qui se lirait comme une information manquante.
         */
        private static String displayName(AuditEvent e) {
            if (e.actor == null) {
                return "SYSTEM".equals(e.source) || "SCANNER".equals(e.source)
                    ? "Système" : null;
            }
            String first = e.actor.firstName == null ? "" : e.actor.firstName.trim();
            String last = e.actor.lastName == null ? "" : e.actor.lastName.trim();
            String full = (first + " " + last).trim();
            return full.isEmpty() ? e.actor.email : full;
        }
    }
}
