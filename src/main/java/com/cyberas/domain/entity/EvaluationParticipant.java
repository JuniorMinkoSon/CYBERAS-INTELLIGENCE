package com.cyberas.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Société inscrite dans un projet d'évaluation.
 *
 * <p>Relie une organisation à l'audit qui lui sert de support dans ce projet et
 * au dernier lien d'accès qui lui a été remis. Réponses, scans et score se
 * lisent sur l'audit ; le lien dit si la société est entrée ou non.
 */
@Entity
@Table(name = "evaluation_participants")
public class EvaluationParticipant extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    public EvaluationProject project;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    public Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audit_id")
    public Audit audit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invitation_id")
    public Invitation invitation;

    @Column(name = "contact_name", length = 200)
    public String contactName;

    @Column(name = "contact_email", length = 255)
    public String contactEmail;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();
}
