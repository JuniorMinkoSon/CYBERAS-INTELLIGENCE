package com.cyberas.domain.entity;

import com.fasterxml.jackson.databind.JsonNode;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.type.SqlTypes;
import org.hibernate.annotations.JdbcTypeCode;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Évaluation de risque persistée pour un constat.
 *
 * Nommée FindingRiskAssessment pour ne pas se confondre avec le record
 * com.cyberas.domain.risk.RiskAssessment, qui est le résultat de calcul en mémoire.
 *
 * Une évaluation n'est jamais écrasée : chaque recalcul crée une nouvelle ligne et
 * la précédente reste consultable. C'est ce qui permet de répondre à « pourquoi ce
 * constat était-il classé critique en septembre ? » — et le score dépend de la
 * version du moteur, qui est donc conservée avec lui.
 */
@Entity
@Table(name = "finding_risk_assessments", indexes = {
    @Index(name = "idx_fra_finding", columnList = "finding_id"),
    @Index(name = "idx_fra_audit", columnList = "audit_id"),
    @Index(name = "idx_fra_org", columnList = "organization_id"),
    @Index(name = "idx_fra_level", columnList = "risk_level")
})
public class FindingRiskAssessment extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "finding_id", nullable = false)
    public Finding finding;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "audit_id", nullable = false)
    public Audit audit;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id", nullable = false)
    public Organization organization;

    /** Risque contextualisé 0-100. Distinct du CVSS porté par le Finding. */
    @Column(name = "risk_score", nullable = false)
    public Integer riskScore;

    @Column(name = "risk_level", nullable = false, length = 20)
    public String riskLevel;

    @Column(nullable = false)
    public Double likelihood;

    @Column(nullable = false)
    public Double impact;

    @Column(nullable = false)
    public Double confidence;

    @Column(columnDefinition = "TEXT")
    public String rationale;

    /** Détail des contributions, tel que produit par le moteur. */
    @Column(name = "contributing_factors", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    public JsonNode contributingFactors;

    /** Entrées ayant servi au calcul : sans elles le score n'est pas reproductible. */
    @Column(name = "input_snapshot", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    public JsonNode inputSnapshot;

    @Column(name = "engine_version", nullable = false, length = 20)
    public String engineVersion;

    /** Vrai quand le niveau est élevé mais la confiance faible. */
    @Column(name = "needs_review", nullable = false)
    public Boolean needsReview = false;

    /**
     * Marque la ligne courante. Un recalcul bascule les précédentes à false plutôt
     * que de les supprimer.
     */
    @Column(name = "is_current", nullable = false)
    public Boolean isCurrent = true;

    @Column(name = "calculated_at", nullable = false)
    public LocalDateTime calculatedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "calculated_by")
    public User calculatedBy;
}
