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
}
