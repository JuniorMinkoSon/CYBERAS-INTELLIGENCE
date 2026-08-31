package com.cyberas.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.annotations.Type;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_versions", uniqueConstraints = {
    @UniqueConstraint(name = "uk_audit_version_number", columnNames = {"audit_id", "version_number"})
})
public class AuditVersion extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "audit_id", nullable = false)
    public Audit audit;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id", nullable = false)
    public Organization organization;

    @Column(name = "version_number", nullable = false)
    public Integer versionNumber;

    @Column(nullable = false, length = 255)
    public String title;

    @Column(columnDefinition = "TEXT")
    public String description;

    @Column(nullable = false, length = 50)
    public String status = "DRAFT"; // DRAFT, IN_PROGRESS, COMPLETED, PUBLISHED, ARCHIVED

    @Column(length = 64)
    public String hash;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_version_id")
    public AuditVersion parentVersion;

    @Column(name = "change_summary", columnDefinition = "TEXT")
    public String changeSummary;

    @Column(name = "published_at")
    public LocalDateTime publishedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "published_by")
    public User publishedBy;

    @Column(name = "locked_at")
    public LocalDateTime lockedAt;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    public User createdBy;

    @Column(name = "data_snapshot", columnDefinition = "jsonb")
    @Type(org.hibernate.type.JsonType.class)
    public JsonNode dataSnapshot;

    public boolean isLocked() {
        return lockedAt != null;
    }

    public boolean isPublished() {
        return "PUBLISHED".equals(status) && publishedAt != null;
    }
}
