package com.cyberas.domain.service;

import com.cyberas.domain.entity.Audit;
import com.cyberas.domain.entity.AuditEvent;
import com.cyberas.domain.entity.AuditVersion;
import com.cyberas.domain.entity.Organization;
import com.cyberas.domain.entity.User;
import com.cyberas.domain.repository.AuditEventRepository;
import com.cyberas.domain.telemetry.AuditLogEvent;
import com.cyberas.domain.telemetry.KafkaLogBridge;
import com.cyberas.security.JwtContext;
import com.cyberas.security.RequestContext;
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
 * l'entité concernée. La table {@code audit_events} reste la source de
 * vérité et la seule dont la chaîne d'intégrité fait foi.
 *
 * <p>Chaque événement est aussi rediffusé, best-effort, sur Kafka via
 * {@link KafkaLogBridge} — c'est l'« environnement de réception des logs »
 * qu'un SIEM externe ou le service de cartographie des risques peut consommer
 * sans interroger cette base. La diffusion ne conditionne jamais l'écriture :
 * une panne de Kafka ne doit jamais faire perdre un événement d'audit.
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

    @Inject
    KafkaLogBridge kafkaLogBridge;

    /** Enregistre un événement dans la transaction courante, avec l'acteur du JWT. */
    public void record(String eventType, UUID organizationId, UUID auditId,
                       String resourceType, UUID resourceId, Map<String, Object> details) {
        UUID actorId = jwtContext.isAuthenticated() ? jwtContext.getUserId() : null;
        String ipAddress = extractIpAddress();
        String userAgent = extractUserAgent();
        record(eventType, organizationId, auditId, null, actorId, resourceType, resourceId, details, "API", ipAddress, userAgent);
    }

    /** Variante rattachée à une version d'audit précise. */
    public void recordForVersion(String eventType, UUID organizationId, UUID auditId, UUID auditVersionId,
                                 String resourceType, UUID resourceId, Map<String, Object> details) {
        UUID actorId = jwtContext.isAuthenticated() ? jwtContext.getUserId() : null;
        String ipAddress = extractIpAddress();
        String userAgent = extractUserAgent();
        record(eventType, organizationId, auditId, auditVersionId, actorId, resourceType, resourceId, details, "API", ipAddress, userAgent);
    }

    /** Enregistre dans la transaction courante avec un acteur explicite (ex. login, JWT absent). */
    public void recordAs(String eventType, UUID organizationId, UUID auditId, UUID actorId,
                         String resourceType, UUID resourceId, Map<String, Object> details) {
        String ipAddress = extractIpAddress();
        String userAgent = extractUserAgent();
        record(eventType, organizationId, auditId, null, actorId, resourceType, resourceId, details, "API", ipAddress, userAgent);
    }

    /** Variante hors requête HTTP (scanner asynchrone) : ouvre sa propre transaction. */
    @Transactional
    public void recordSystem(String eventType, UUID organizationId, UUID auditId, UUID actorId,
                             String resourceType, UUID resourceId, Map<String, Object> details) {
        record(eventType, organizationId, auditId, null, actorId, resourceType, resourceId, details, "SYSTEM", null, null);
    }

    /** Variante hors requête HTTP rattachée à une version d'audit. */
    @Transactional
    public void recordSystemForVersion(String eventType, UUID organizationId, UUID auditId, UUID auditVersionId,
                                       UUID actorId, String resourceType, UUID resourceId, Map<String, Object> details) {
        record(eventType, organizationId, auditId, auditVersionId, actorId, resourceType, resourceId, details, "SYSTEM", null, null);
    }

    private void record(String eventType, UUID organizationId, UUID auditId, UUID auditVersionId, UUID actorId,
                        String resourceType, UUID resourceId, Map<String, Object> details, String source,
                        String ipAddress, String userAgent) {
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
            // Tronqué à la microseconde : c'est la précision de la colonne. Une
            // empreinte calculée sur des nanosecondes ne se recalculerait plus
            // à l'identique après relecture.
            event.timestamp = LocalDateTime.now().truncatedTo(java.time.temporal.ChronoUnit.MICROS);
            event.details = toJson(details);
            event.ipAddress = ipAddress;
            event.userAgent = userAgent;
            chain(event, organizationId);
            event.persist();

            kafkaLogBridge.publishAuditLog(new AuditLogEvent(event.id, organizationId, auditId, eventType,
                resourceType, resourceId, actorId, source, event.timestamp, event.prevHash, event.entryHash));
        } catch (Exception e) {
            LOG.warnf(e, "Événement d'audit %s non enregistré", eventType);
        }
    }

    // -----------------------------------------------------------------------
    // Chaîne d'intégrité
    // -----------------------------------------------------------------------

    /**
     * Relie l'événement au précédent de la même organisation.
     *
     * <p>Deux transactions qui enregistrent en même temps liraient le même
     * « précédent » et produiraient une fourche que la vérification prendrait
     * pour une altération. Un verrou consultatif PostgreSQL, tenu jusqu'à la
     * fin de la transaction et propre à l'organisation, les fait passer l'une
     * après l'autre. Il ne gêne pas les autres organisations.
     */
    private void chain(AuditEvent event, UUID organizationId) {
        em.createNativeQuery("select pg_advisory_xact_lock(hashtext(:org))")
            .setParameter("org", organizationId.toString())
            .getSingleResult();

        List<String> last = em.createQuery(
                "select e.entryHash from AuditEvent e where e.organization.id = :org "
                    + "order by e.timestamp desc, e.id desc", String.class)
            .setParameter("org", organizationId)
            .setMaxResults(1)
            .getResultList();
        event.prevHash = last.isEmpty() ? null : last.get(0);
        event.entryHash = hashOf(event);
    }

    /**
     * Empreinte d'un événement : SHA-256 des champs qui le définissent, dans
     * un ordre fixe, précédés de l'empreinte du précédent. Les champs absents
     * comptent pour une chaîne vide, de sorte que le calcul est reproductible
     * à la vérification.
     */
    public static String hashOf(AuditEvent e) {
        String material = String.join("|",
            n(e.prevHash),
            e.organization == null ? "" : String.valueOf(e.organization.id),
            n(e.eventType), n(e.resourceType),
            e.resourceId == null ? "" : e.resourceId.toString(),
            e.actor == null ? "" : String.valueOf(e.actor.id),
            e.timestamp == null ? "" : e.timestamp.toString(),
            e.details == null ? "" : canonical(e.details),
            n(e.source), n(e.ipAddress));
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            return java.util.HexFormat.of().formatHex(md.digest(material.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 indisponible", ex);
        }
    }

    private static String n(String s) {
        return s == null ? "" : s;
    }

    /**
     * JSON canonique : clés triées à tous les niveaux.
     *
     * <p>La colonne est en {@code jsonb}, et PostgreSQL range les clés à sa
     * façon ; relu, le document ne s'écrit plus dans l'ordre d'origine. Trier
     * avant de hacher rend l'empreinte indépendante de cet ordre.
     */
    static String canonical(JsonNode node) {
        if (node == null || node.isNull()) return "null";
        if (node.isObject()) {
            java.util.TreeMap<String, JsonNode> sorted = new java.util.TreeMap<>();
            node.fields().forEachRemaining(f -> sorted.put(f.getKey(), f.getValue()));
            StringBuilder sb = new StringBuilder("{");
            boolean first = true;
            for (Map.Entry<String, JsonNode> f : sorted.entrySet()) {
                if (!first) sb.append(',');
                first = false;
                sb.append(com.fasterxml.jackson.databind.node.TextNode.valueOf(f.getKey()).toString())
                  .append(':').append(canonical(f.getValue()));
            }
            return sb.append('}').toString();
        }
        if (node.isArray()) {
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < node.size(); i++) {
                if (i > 0) sb.append(',');
                sb.append(canonical(node.get(i)));
            }
            return sb.append(']').toString();
        }
        return node.toString();
    }

    /**
     * Parcourt la chaîne d'une organisation et signale chaque rupture.
     *
     * <p>Une rupture est soit une empreinte qui ne correspond plus au contenu
     * (ligne modifiée), soit un {@code prevHash} qui ne désigne pas l'événement
     * précédent (ligne supprimée ou insérée). Les événements sans empreinte —
     * antérieurs à la mise en place de la chaîne — sont comptés à part, jamais
     * comme des ruptures.
     */
    public ChainReport verify(UUID organizationId) {
        List<AuditEvent> events = auditEventRepository
            .find("organization.id = ?1 order by timestamp asc, id asc", organizationId).list();
        int chained = 0;
        int unchained = 0;
        List<UUID> broken = new java.util.ArrayList<>();
        String expectedPrev = null;
        for (AuditEvent e : events) {
            if (e.entryHash == null) {
                unchained++;
                continue;
            }
            chained++;
            boolean linkOk = java.util.Objects.equals(e.prevHash, expectedPrev);
            boolean contentOk = e.entryHash.equals(hashOf(e));
            if (!linkOk || !contentOk) {
                broken.add(e.id);
            }
            expectedPrev = e.entryHash;
        }
        return new ChainReport(events.size(), chained, unchained, broken.isEmpty(), broken);
    }

    public record ChainReport(int total, int chained, int unchained, boolean intact, List<UUID> brokenEventIds) {}

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

    public AuditEvent getEvent(UUID eventId, UUID organizationId) {
        AuditEvent event = auditEventRepository.findById(eventId);
        if (event == null || !event.organization.id.equals(organizationId)) {
            throw new IllegalArgumentException("Event not found");
        }
        return event;
    }

    private JsonNode toJson(Map<String, Object> details) {
        if (details == null) {
            return null;
        }
        ObjectNode node = objectMapper.createObjectNode();
        details.forEach((k, v) -> node.put(k, v == null ? null : String.valueOf(v)));
        return node;
    }

    private String extractIpAddress() {
        return RequestContext.getIpAddress();
    }

    private String extractUserAgent() {
        return RequestContext.getUserAgent();
    }
}
