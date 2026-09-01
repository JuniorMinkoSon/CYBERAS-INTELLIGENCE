package com.cyberas.domain.entity;

import com.fasterxml.jackson.databind.JsonNode;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "recommendations")
public class Recommendation extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    public Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audit_id", nullable = false)
    public Audit audit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finding_id")
    public Finding finding;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "question_id")
    public Question question;

    /** Clé stable (ex. FINDING:<id>, QUESTION:<code>) évitant les doublons à la régénération. */
    @Column(name = "source_key", nullable = false, length = 120)
    public String sourceKey;

    @Column(nullable = false, columnDefinition = "TEXT")
    public String problem;

    @Column(nullable = false, columnDefinition = "TEXT")
    public String risk;

    @Column(nullable = false, columnDefinition = "TEXT")
    public String recommendation;

    @Column(nullable = false, length = 20)
    public String priority; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(nullable = false, length = 20)
    public String status = "OPEN"; // OPEN, IN_PROGRESS, DONE

    @Column(name = "framework_refs", columnDefinition = "jsonb")
    public JsonNode frameworkRefs;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    public LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
