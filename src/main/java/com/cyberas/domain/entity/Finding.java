package com.cyberas.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "findings")
public class Finding extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "scan_id", nullable = false)
    public Scan scan;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "audit_id", nullable = false)
    public Audit audit;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id", nullable = false)
    public Organization organization;

    @Column(nullable = false, length = 100)
    public String title;

    @Column(columnDefinition = "TEXT")
    public String description;

    @Column(nullable = false, length = 50)
    public String severity; // CRITICAL, HIGH, MEDIUM, LOW, INFO

    @Column(name = "cvss_score")
    public Double cvssScore; // 0.0-10.0

    @Column(length = 50)
    public String cve; // CVE-XXXX-XXXXX

    @Column(length = 100)
    public String cpe; // CPE reference

    @Column(name = "source", length = 100)
    public String source; // NMAP, ZAP, OPENVAS, etc.

    @Column(name = "source_id")
    public String sourceId; // ID from scanner

    @Column(name = "confidence")
    public Double confidence = 1.0; // 0.0-1.0

    @Column(name = "status", length = 50)
    public String status = "OPEN"; // OPEN, ACKNOWLEDGED, REMEDIATED, FALSE_POSITIVE

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_id")
    public Asset asset;

    @Column(name = "port")
    public Integer port;

    @Column(name = "protocol", length = 10)
    public String protocol;

    @Column(name = "service_name", length = 100)
    public String serviceName;

    @Column(name = "service_version", length = 255)
    public String serviceVersion;

    @Column(columnDefinition = "jsonb")
    public JsonNode evidence; // Evidence payload

    @Column(columnDefinition = "jsonb")
    public JsonNode metadata; // Scanner-specific metadata

    @Column(name = "detected_at", nullable = false)
    public LocalDateTime detectedAt = LocalDateTime.now();

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    public User createdBy;

    @Column(name = "updated_at")
    public LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
