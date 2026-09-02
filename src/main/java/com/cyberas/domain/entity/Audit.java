package com.cyberas.domain.entity;

import com.fasterxml.jackson.databind.JsonNode;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "audits", uniqueConstraints = {
    @UniqueConstraint(name = "uk_audit_code", columnNames = {"organization_id", "audit_code"})
})
public class Audit extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id", nullable = false)
    public Organization organization;

    @Column(name = "audit_code", nullable = false, length = 50)
    public String auditCode;

    @Column(nullable = false, length = 255)
    public String title;

    @Column(columnDefinition = "TEXT")
    public String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_organization_id")
    public Organization clientOrganization;

    @Column(name = "audit_scope_id")
    public UUID auditScopeId;

    @Column(nullable = false, length = 50)
    public String status = "DRAFT"; // DRAFT, IN_PROGRESS, COMPLETED, PUBLISHED, ARCHIVED

    @Column(name = "current_version_id")
    public UUID currentVersionId;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    public User createdBy;

    @Column(name = "updated_at", nullable = false)
    public LocalDateTime updatedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    public User updatedBy;

    @Column(nullable = false)
    public Integer version = 1;

    @Column(name = "scheduled_start_date")
    public LocalDate scheduledStartDate;

    @Column(name = "scheduled_end_date")
    public LocalDate scheduledEndDate;

    @Column(name = "actual_start_date")
    public LocalDate actualStartDate;

    @Column(name = "actual_end_date")
    public LocalDate actualEndDate;

    /** Codes des référentiels retenus pour cet audit (cf. FrameworkCatalog). */
    @Column(columnDefinition = "jsonb")
    public JsonNode frameworks;

    @OneToMany(mappedBy = "audit", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
    public Set<AuditVersion> versions = new HashSet<>();

    @OneToMany(mappedBy = "audit", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
    public Set<AccessGrant> accessGrants = new HashSet<>();

    @OneToMany(mappedBy = "audit", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
    public Set<AuditEvent> events = new HashSet<>();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
