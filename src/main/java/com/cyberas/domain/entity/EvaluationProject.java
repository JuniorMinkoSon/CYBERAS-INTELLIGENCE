package com.cyberas.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Projet d'évaluation : plusieurs sociétés évaluées puis classées ensemble.
 *
 * <p>Porté par l'organisation qui administre la plateforme, jamais par une
 * cliente. Les participantes ne le voient pas : chacune travaille dans sa
 * propre organisation, sur l'audit que le projet lui a ouvert.
 */
@Entity
@Table(name = "evaluation_projects")
public class EvaluationProject extends PanacheEntityBase {

    public static final String OPEN = "OPEN";
    public static final String CLOSED = "CLOSED";

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @Column(nullable = false, length = 200)
    public String name;

    @Column(columnDefinition = "TEXT")
    public String description;

    @Column(nullable = false, length = 20)
    public String status = OPEN;

    /** Date limite communiquée aux sociétés ; indicative, elle ne bloque rien. */
    public LocalDate deadline;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    public User createdBy;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    public LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "closed_at")
    public LocalDateTime closedAt;

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
