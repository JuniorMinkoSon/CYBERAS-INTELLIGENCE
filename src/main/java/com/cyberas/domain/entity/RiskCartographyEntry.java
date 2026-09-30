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
@Table(name = "risk_cartography_entries")
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

    /**
     * Service observe par le scanner : le grain de l'agregation.
     *
     * <p>L'agregation portait auparavant sur le seul protocole de transport, et
     * la categorie s'en deduisant, une mission ne pouvait produire que deux
     * lignes. Deux services distincts se confondent desormais plus.
     */
    @Column(length = 80)
    public String service;

    /** Code de la taxonomie R01-R12 portee par les referentiels du depot. */
    @Column(name = "risk_code", length = 10)
    public String riskCode;

    /**
     * Pourquoi ce service met ce critere en jeu.
     *
     * <p>Une ligne de cartographie sans motif n'est pas opposable : elle affirme
     * un risque sans dire d'ou il vient.
     */
    @Column(columnDefinition = "TEXT")
    public String rationale;

    /**
     * Constats a l'origine de la ligne, separes par des virgules.
     *
     * <p>Ce qui manquait pour qu'une entree soit adossee a des faits. Seul
     * lastSummary subsistait, ecrase a chaque constat : l'entree portait un
     * compteur dont les faits comptes avaient disparu du chemin.
     */
    @Column(name = "finding_ids", columnDefinition = "TEXT")
    public String findingIds;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    public LocalDateTime updatedAt = LocalDateTime.now();
}
