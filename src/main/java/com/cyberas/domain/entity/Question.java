package com.cyberas.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "questionnaire_questions")
public class Question extends PanacheEntityBase {

    @Id
    public UUID id;

    @Column(nullable = false, unique = true, length = 20)
    public String code;

    @Column(nullable = false, length = 50)
    public String domain;

    @Column(nullable = false)
    public Integer position;

    @Column(nullable = false, columnDefinition = "TEXT")
    public String text;

    @Column(columnDefinition = "TEXT")
    public String guidance;

    @Column(nullable = false)
    public Integer weight = 1;

    @Column(nullable = false)
    public Boolean active = true;

    /**
     * La réponse se démontre par un document.
     *
     * <p>Indication pour la saisie — la page peut inviter à joindre une pièce —
     * jamais un critère de score : une réponse sans pièce n'est pas pénalisée.
     */
    @Column(name = "evidence_required", nullable = false)
    public Boolean evidenceRequired = false;
}
