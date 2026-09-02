package com.cyberas.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import com.fasterxml.jackson.databind.JsonNode;
import org.hibernate.type.SqlTypes;
import org.hibernate.annotations.JdbcTypeCode;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "access_grants")
public class AccessGrant extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "audit_id", nullable = false)
    public Audit audit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audit_version_id")
    public AuditVersion auditVersion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id", nullable = false)
    public Organization organization;

    @Column(nullable = false, length = 50)
    public String role; // ADMIN, AUDITOR, CLIENT, VIEWER

    @Column(name = "permissions", columnDefinition = "jsonb", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    public JsonNode permissions;

    @Column(name = "scan_profile", length = 50)
    public String scanProfile = "STANDARD"; // NONE, BASIC, STANDARD, FULL

    @Column(name = "scope", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    public JsonNode scope;

    @Column(name = "expires_at")
    public LocalDateTime expiresAt;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    public User createdBy;

    @Column(name = "revoked_at")
    public LocalDateTime revokedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "revoked_by")
    public User revokedBy;

    @Column(nullable = false, length = 50)
    public String status = "ACTIVE"; // PENDING, ACTIVE, EXPIRED, REVOKED

    @Column(nullable = false)
    public Integer version = 1;

    public boolean isActive() {
        if ("REVOKED".equals(status)) return false;
        if ("EXPIRED".equals(status)) return false;
        if (revokedAt != null) return false;
        if (expiresAt != null && LocalDateTime.now().isAfter(expiresAt)) {
            status = "EXPIRED";
            return false;
        }
        return "ACTIVE".equals(status);
    }

    public boolean hasPermission(String permissionCode) {
        if (!isActive()) return false;
        if (permissions == null) return false;
        return permissions.has(permissionCode) && permissions.get(permissionCode).asBoolean();
    }
}
