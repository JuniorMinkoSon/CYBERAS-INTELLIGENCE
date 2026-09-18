package com.cyberas.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Agrégat de la cartographie des risques dérivée des logs de scan.
 *
 * <p>Une ligne par (organisation, audit, catégorie MEHARI, protocole) : chaque
 * constat de scan y incrémente {@link #occurrences} et ne fait jamais
 * régresser {@link #riskLevel}. Distincte de {@code AuditRiskAssessment} et de
 * {@code RiskEngine} à dessein — celle-ci lit le flux d'événements de scan
 * (SIEM simplifié), l'autre calcule le score déterministe opposable d'un
 * audit. Les deux ne doivent jamais se mélanger : l'une informe, l'autre
 * engage.
 */
@Entity
@Table(name = "risk_cartography_entries",
    uniqueConstraints = @UniqueConstraint(columnNames = {"organization_id", "audit_id", "category", "protocol"}))
public class RiskCartographyEntry extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    public Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audit_id")
    public Audit audit;

    @Column(nullable = false, length = 20)
    public String category; // MehariCategory

    @Column(length = 10)
    public String protocol; // TCP, UDP, ou null

    @Column(name = "risk_level", nullable = false, length = 20)
    public String riskLevel = "LOW";

    @Column(nullable = false)
    public Integer occurrences = 0;

    @Column(name = "last_summary", columnDefinition = "TEXT")
    public String lastSummary;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    public LocalDateTime updatedAt = LocalDateTime.now();
}
