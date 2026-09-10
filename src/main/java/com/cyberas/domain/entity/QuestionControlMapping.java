package com.cyberas.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Rattachement d'une question Cyberas à un contrôle de référentiel.
 *
 * <p>Table dédiée plutôt qu'une clé étrangère sur la question : une question
 * peut étayer plusieurs contrôles, un contrôle être étayé par plusieurs
 * questions, et la même question doit pouvoir servir à ISO aujourd'hui et à
 * NIST demain sans changement de schéma.
 *
 * <p>{@code mappingRationale} porte le motif du rattachement. Un score de
 * conformité se défend devant un auditeur ; une correspondance dont personne ne
 * sait justifier l'origine ne se défend pas.
 *
 * <p>L'absence de ligne signifie « non rattaché ». C'est un état légitime : une
 * question sans correspondance fiable ne doit pas en recevoir une au forceps,
 * sous peine de produire un score de conformité fondé sur une invention.
 */
@Entity
@Table(name = "question_control_mapping")
public class QuestionControlMapping extends PanacheEntityBase {

    /** Rattachement établi, exploitable pour le calcul. */
    public static final String CONFIRMED = "CONFIRMED";
    /** Rattachement défendable mais incomplet : un auditeur doit trancher. */
    public static final String REVIEW_REQUIRED = "REVIEW_REQUIRED";

    @Id
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    public Question question;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "control_id", nullable = false)
    public Control control;

    @Column(name = "mapping_type", nullable = false, length = 20)
    public String mappingType = "PRIMARY";

    @Column(nullable = false, length = 20)
    public String status = CONFIRMED;

    @Column(nullable = false)
    public Double confidence = 1.0;

    @Column(nullable = false, length = 50)
    public String source = "MANUAL";

    @Column(name = "mapping_rationale", columnDefinition = "TEXT")
    public String mappingRationale;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    public LocalDateTime updatedAt = LocalDateTime.now();

    /** Rattachements d'une version de référentiel, questions comprises. */
    public static List<QuestionControlMapping> findByVersion(UUID frameworkVersionId) {
        return list("control.frameworkVersion.id = ?1", frameworkVersionId);
    }

    public static List<QuestionControlMapping> findByQuestion(UUID questionId) {
        return list("question.id = ?1", questionId);
    }
}
