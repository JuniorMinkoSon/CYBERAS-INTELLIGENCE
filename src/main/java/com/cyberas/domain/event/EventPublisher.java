package com.cyberas.domain.event;

import com.cyberas.domain.entity.AuditEvent;
import com.cyberas.domain.repository.AuditEventRepository;
import com.cyberas.security.JwtContext;
import io.smallrye.reactive.messaging.MutinyEmitter;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.reactive.messaging.Channel;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.UUID;

@ApplicationScoped
public class EventPublisher {

    @Inject
    @Channel("audit-events")
    MutinyEmitter<String> auditEventEmitter;

    @Inject
    AuditEventRepository auditEventRepository;

    @Inject
    JwtContext jwtContext;

    @Inject
    ObjectMapper objectMapper;

    @Transactional
    public void publishAuditEvent(UUID organizationId, UUID auditId, String eventType,
                                  String resourceType, UUID resourceId, String action, String status,
                                  String correlationId, JsonNode details) {
        AuditEvent event = new AuditEvent();
        event.organization = null; // Will be loaded by query
        event.audit = null; // Will be loaded by query
        event.eventType = eventType;
        event.actor = null; // Will be loaded from jwtContext.userId
        event.resourceType = resourceType;
        event.resourceId = resourceId;
        event.action = action;
        event.status = status;
        event.details = details;
        event.correlationId = correlationId;
        event.source = "API";
        event.timestamp = LocalDateTime.now();
        event.ipAddress = "127.0.0.1"; // TODO: Extract from request
        event.userAgent = "CYBERAS"; // TODO: Extract from request

        event.persist();

        // Publish to Kafka asynchronously
        try {
            String eventJson = objectMapper.writeValueAsString(new AuditEventMessage(
                event.id,
                organizationId,
                auditId,
                eventType,
                resourceType,
                resourceId,
                action,
                status,
                jwtContext.getUserId(),
                LocalDateTime.now(),
                correlationId,
                details
            ));
            auditEventEmitter.send(eventJson);
        } catch (Exception e) {
            // Log but don't fail
            System.err.println("Failed to publish event to Kafka: " + e.getMessage());
        }
    }

    public static class AuditEventMessage {
        public UUID eventId;
        public UUID organizationId;
        public UUID auditId;
        public String eventType;
        public String resourceType;
        public UUID resourceId;
        public String action;
        public String status;
        public UUID actorId;
        public LocalDateTime timestamp;
        public String correlationId;
        public JsonNode details;

        public AuditEventMessage(UUID eventId, UUID organizationId, UUID auditId, String eventType,
                                String resourceType, UUID resourceId, String action, String status,
                                UUID actorId, LocalDateTime timestamp, String correlationId, JsonNode details) {
            this.eventId = eventId;
            this.organizationId = organizationId;
            this.auditId = auditId;
            this.eventType = eventType;
            this.resourceType = resourceType;
            this.resourceId = resourceId;
            this.action = action;
            this.status = status;
            this.actorId = actorId;
            this.timestamp = timestamp;
            this.correlationId = correlationId;
            this.details = details;
        }
    }
}
