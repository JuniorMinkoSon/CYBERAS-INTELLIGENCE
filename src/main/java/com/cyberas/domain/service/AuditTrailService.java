package com.cyberas.domain.service;

import com.cyberas.domain.entity.Audit;
import com.cyberas.domain.entity.AuditEvent;
import com.cyberas.domain.entity.AuditVersion;
import com.cyberas.domain.entity.Organization;
import com.cyberas.domain.entity.User;
import com.cyberas.domain.repository.AuditEventRepository;
import com.cyberas.security.JwtContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Journal d'audit persistant.
 *
 * Chaque événement porte l'acteur, l'organisation, l'horodatage, l'action et
 * l'entité concernée. La diffusion vers un bus (Kafka) est volontairement hors MVP :
 * la table audit_events est la source de vérité.
 */
@ApplicationScoped
public class AuditTrailService {

    private static final Logger LOG = Logger.getLogger(AuditTrailService.class);

    public static final String LOGIN = "LOGIN";
    public static final String AUDIT_CREATED = "AUDIT_CREATED";
    public static final String AUDIT_UPDATED = "AUDIT_UPDATED";
    public static final String VERSION_CREATED = "VERSION_CREATED";
    public static final String VERSION_PUBLISHED = "VERSION_PUBLISHED";
    public static final String SCOPE_DECLARED = "SCOPE_DECLARED";
    public static final String SCOPE_AUTHORIZED = "SCOPE_AUTHORIZED";
    public static final String FINDING_UPDATED = "FINDING_UPDATED";
    public static final String RECOMMENDATION_UPDATED = "RECOMMENDATION_UPDATED";
    public static final String MEMBER_INVITED = "MEMBER_INVITED";
    public static final String MEMBER_JOINED = "MEMBER_JOINED";
    public static final String ORGANIZATION_UPDATED = "ORGANIZATION_UPDATED";
    public static final String QUESTION_ANSWERED = "QUESTION_ANSWERED";
    public static final String DOCUMENT_UPLOADED = "DOCUMENT_UPLOADED";
    public static final String ASSET_CREATED = "ASSET_CREATED";
    public static final String SCAN_STARTED = "SCAN_STARTED";
    public static final String SCAN_COMPLETED = "SCAN_COMPLETED";
    public static final String SCAN_FAILED = "SCAN_FAILED";
    public static final String SCAN_CANCELLED = "SCAN_CANCELLED";
    public static final String FINDING_CREATED = "FINDING_CREATED";
    public static final String RISK_CALCULATED = "RISK_CALCULATED";
    public static final String RECOMMENDATION_CREATED = "RECOMMENDATION_CREATED";
    public static final String REPORT_GENERATED = "REPORT_GENERATED";

    @Inject
    AuditEventRepository auditEventRepository;

    @Inject
    EntityManager em;

    @Inject
    JwtContext jwtContext;

    @Inject
    ObjectMapper objectMapper;

    /** Enregistre un événement dans la transaction courante, avec l'acteur du JWT. */
    public void record(String eventType, UUID organizationId, UUID auditId,
                       String resourceType, UUID resourceId, Map<String, Object> details) {
        UUID actorId = jwtContext.isAuthenticated() ? jwtContext.getUserId() : null;
        record(eventType, organizationId, auditId, null, actorId, resourceType, resourceId, details, "API");
    }

    /** Variante rattachée à une version d'audit précise. */
    public void recordForVersion(String eventType, UUID organizationId, UUID auditId, UUID auditVersionId,
                                 String resourceType, UUID resourceId, Map<String, Object> details) {
        UUID actorId = jwtContext.isAuthenticated() ? jwtContext.getUserId() : null;
        record(eventType, organizationId, auditId, auditVersionId, actorId, resourceType, resourceId, details, "API");
    }

    /** Enregistre dans la transaction courante avec un acteur explicite (ex. login, JWT absent). */
    public void recordAs(String eventType, UUID organizationId, UUID auditId, UUID actorId,
                         String resourceType, UUID resourceId, Map<String, Object> details) {
        record(eventType, organizationId, auditId, null, actorId, resourceType, resourceId, details, "API");
    }

    /** Variante hors requête HTTP (scanner asynchrone) : ouvre sa propre transaction. */
    @Transactional
    public void recordSystem(String eventType, UUID organizationId, UUID auditId, UUID actorId,
                             String resourceType, UUID resourceId, Map<String, Object> details) {
        record(eventType, organizationId, auditId, null, actorId, resourceType, resourceId, details, "SYSTEM");
    }

    /** Variante hors requête HTTP rattachée à une version d'audit. */
    @Transactional
    public void recordSystemForVersion(String eventType, UUID organizationId, UUID auditId, UUID auditVersionId,
                                       UUID actorId, String resourceType, UUID resourceId, Map<String, Object> details) {
        record(eventType, organizationId, auditId, auditVersionId, actorId, resourceType, resourceId, details, "SYSTEM");
    }

    private void record(String eventType, UUID organizationId, UUID auditId, UUID auditVersionId, UUID actorId,
                        String resourceType, UUID resourceId, Map<String, Object> details, String source) {
        try {
            AuditEvent event = new AuditEvent();
            event.organization = em.getReference(Organization.class, organizationId);
            event.audit = auditId != null ? em.getReference(Audit.class, auditId) : null;
            event.auditVersion = auditVersionId != null ? em.getReference(AuditVersion.class, auditVersionId) : null;
            event.actor = actorId != null ? em.getReference(User.class, actorId) : null;
            event.eventType = eventType;
            event.resourceType = resourceType;
            event.resourceId = resourceId;
            event.action = eventType;
            event.status = "SUCCESS";
            event.source = source;
            event.timestamp = LocalDateTime.now();
            event.details = toJson(details);
            event.persist();
        } catch (Exception e) {
            LOG.warnf(e, "Événement d'audit %s non enregistré", eventType);
        }
    }

    public List<AuditEvent> listForOrganization(UUID organizationId, int limit) {
        return auditEventRepository
            .find("organization.id = ?1 order by timestamp desc", organizationId)
            .page(0, limit).list();
    }

    public long countForOrganization(UUID organizationId) {
        return auditEventRepository.count("organization.id = ?1", organizationId);
    }

    public List<AuditEvent> listForAudit(UUID auditId, UUID organizationId, int limit) {
        return auditEventRepository
            .find("audit.id = ?1 and organization.id = ?2 order by timestamp desc", auditId, organizationId)
            .page(0, limit).list();
    }

    private JsonNode toJson(Map<String, Object> details) {
        if (details == null) {
            return null;
        }
        ObjectNode node = objectMapper.createObjectNode();
        details.forEach((k, v) -> node.put(k, v == null ? null : String.valueOf(v)));
        return node;
    }
}
