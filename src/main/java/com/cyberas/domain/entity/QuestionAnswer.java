package com.cyberas.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "questionnaire_answers")
public class QuestionAnswer extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audit_id", nullable = false)
    public Audit audit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    public Organization organization;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "question_id", nullable = false)
    public Question question;

    /** 0 (absent) à 4 (mesuré et maîtrisé). Null si non applicable. */
    @Column(name = "maturity_level")
    public Integer maturityLevel;

    @Column(name = "not_applicable", nullable = false)
    public Boolean notApplicable = false;

    @Column(columnDefinition = "TEXT")
    public String comment;

    @Column(name = "answered_at", nullable = false)
    public LocalDateTime answeredAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "answered_by")
    public User answeredBy;
}
