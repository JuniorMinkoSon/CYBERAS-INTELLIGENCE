package com.cyberas.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "assets")
public class Asset extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id", nullable = false)
    public Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audit_id")
    public Audit audit;

    @Column(length = 255)
    public String hostname;

    @Column(name = "ip_address", length = 64)
    public String ipAddress;

    @Column(name = "asset_type", nullable = false, length = 50)
    public String assetType = "SERVER"; // SERVER, WORKSTATION, NETWORK, APPLICATION, DATABASE, CLOUD, IOT, OTHER

    @Column(name = "operating_system", length = 100)
    public String operatingSystem;

    @Column(nullable = false, length = 50)
    public String environment = "PRODUCTION"; // PRODUCTION, PREPRODUCTION, TEST, DEVELOPMENT

    @Column(nullable = false, length = 20)
    public String criticality = "MEDIUM"; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(name = "internet_exposed", nullable = false)
    public Boolean internetExposed = false;

    @Column(length = 255)
    public String owner;

    @Column(columnDefinition = "TEXT")
    public String description;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    public User createdBy;

    @Column(name = "updated_at", nullable = false)
    public LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
