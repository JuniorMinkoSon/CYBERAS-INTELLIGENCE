package com.cyberas.domain.entity;

import com.fasterxml.jackson.databind.JsonNode;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/** Score de risque consolidé d'un audit, dérivé des évaluations par constat et de la maturité. */
@Entity
@Table(name = "audit_risk_assessments")
public class AuditRiskAssessment extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audit_id", nullable = false)
    public Audit audit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    public Organization organization;

    @Column(name = "risk_score", nullable = false)
    public Integer riskScore;

    @Column(name = "risk_level", nullable = false, length = 20)
    public String riskLevel;

    @Column(name = "maturity_score")
    public Double maturityScore;

    @Column(name = "completion_rate")
    public Double completionRate;

    @Column(name = "findings_count", nullable = false)
    public Integer findingsCount = 0;

    @Column(name = "critical_count", nullable = false)
    public Integer criticalCount = 0;

    @Column(name = "high_count", nullable = false)
    public Integer highCount = 0;

    @Column(columnDefinition = "TEXT")
    public String rationale;

    @Column(name = "contributing_factors", columnDefinition = "jsonb")
    public JsonNode contributingFactors;

    @Column(name = "engine_version", nullable = false, length = 20)
    public String engineVersion;

    @Column(name = "is_current", nullable = false)
    public Boolean isCurrent = true;

    @Column(name = "calculated_at", nullable = false)
    public LocalDateTime calculatedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "calculated_by")
    public User calculatedBy;
}
