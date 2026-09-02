package com.cyberas.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import com.fasterxml.jackson.databind.JsonNode;
import org.hibernate.type.SqlTypes;
import org.hibernate.annotations.JdbcTypeCode;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "scans")
public class Scan extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "audit_id", nullable = false)
    public Audit audit;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "audit_version_id", nullable = false)
    public AuditVersion auditVersion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id", nullable = false)
    public Organization organization;

    @Column(nullable = false, length = 50)
    public String scannerType; // NMAP, ZAP, OPENVAS, NESSUS, etc.

    @Column(nullable = false, length = 50)
    public String scannerVersion;

    @Column(name = "target", nullable = false)
    public String target; // IP address, hostname, or network

    @Column(name = "scan_profile", length = 50)
    public String scanProfile = "STANDARD"; // NONE, BASIC, STANDARD, FULL

    @Column(nullable = false, length = 50)
    public String status = "QUEUED"; // QUEUED, RUNNING, COMPLETED, FAILED, CANCELLED, TIMEOUT

    @Column(name = "progress")
    public Integer progress = 0; // 0-100

    @Column(name = "started_at")
    public LocalDateTime startedAt;

    @Column(name = "finished_at")
    public LocalDateTime finishedAt;

    @Column(name = "duration_seconds")
    public Long durationSeconds;

    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    public JsonNode configuration; // Scanner-specific config

    @Column(name = "raw_output", columnDefinition = "TEXT")
    public String rawOutput; // Raw scanner output

    @Column(name = "parsed_output", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    public JsonNode parsedOutput; // Normalized findings

    @Column(length = 64)
    public String hash; // SHA-256 of raw output

    @Column(columnDefinition = "TEXT")
    public String errorMessage;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    public User createdBy;

    @Column(name = "updated_at", nullable = false)
    public LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "scan", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
    public Set<Finding> findings = new HashSet<>();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isCompleted() {
        return "COMPLETED".equals(status) && finishedAt != null;
    }

    public boolean isFailed() {
        return "FAILED".equals(status) || "CANCELLED".equals(status) || "TIMEOUT".equals(status);
    }
}
