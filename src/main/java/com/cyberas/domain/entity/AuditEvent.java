package com.cyberas.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.annotations.Type;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_events")
public class AuditEvent extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id", nullable = false)
    public Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audit_id")
    public Audit audit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audit_version_id")
    public AuditVersion auditVersion;

    @Column(name = "event_type", nullable = false, length = 100)
    public String eventType; // SCAN_STARTED, FINDING_CREATED, RISK_ASSESSED, etc.

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    public User actor;

    @Column(name = "resource_type", length = 50)
    public String resourceType; // AUDIT, USER, FINDING, SCAN, etc.

    @Column(name = "resource_id")
    public UUID resourceId;

    @Column(name = "action", length = 50)
    public String action; // CREATE, UPDATE, DELETE, PUBLISH, etc.

    @Column(name = "status", length = 50)
    public String status; // SUCCESS, FAILED, PENDING

    @Column(name = "details", columnDefinition = "jsonb")
    @Type(org.hibernate.type.JsonType.class)
    public JsonNode details;

    @Column(name = "correlation_id", length = 100)
    public String correlationId;

    @Column(name = "source", length = 100)
    public String source; // UI, API, SCANNER, SYSTEM

    @Column(name = "timestamp", nullable = false)
    public LocalDateTime timestamp = LocalDateTime.now();

    @Column(name = "ip_address")
    public String ipAddress;

    @Column(name = "user_agent", length = 500)
    public String userAgent;

    @Index(name = "idx_audit_events_org", columnList = "organization_id")
    @Index(name = "idx_audit_events_timestamp", columnList = "timestamp")
    @Index(name = "idx_audit_events_actor", columnList = "actor_id")
    private static final String indexes = "";
}
