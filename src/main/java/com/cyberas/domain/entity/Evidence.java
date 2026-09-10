package com.cyberas.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Lien entre un document et ce qu'il étaye : question, contrôle, constat ou
 * recommandation.
 *
 * <p>Question et contrôle coexistent volontairement. L'audité répond à des
 * questions et y joint ses pièces ; l'auditeur raisonne par référentiel et
 * rattache directement au contrôle. La couverture réelle d'un contrôle réunit
 * les deux chemins — les pièces qui le visent, et celles jointes aux questions
 * qui lui sont rattachées.
 */
@Entity
@Table(name = "evidences")
public class Evidence extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    public Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audit_id", nullable = false)
    public Audit audit;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "document_id", nullable = false)
    public Document document;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "question_id")
    public Question question;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "control_id")
    public Control control;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finding_id")
    public Finding finding;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recommendation_id")
    public Recommendation recommendation;

    @Column(columnDefinition = "TEXT")
    public String note;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    public User createdBy;
}
