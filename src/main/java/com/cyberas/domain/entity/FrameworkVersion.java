package com.cyberas.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Version d'un référentiel.
 *
 * <p>La version est persistée et non déduite d'une constante : un score calculé
 * sur ISO/IEC 27001:2022 ne se compare pas à un score calculé sur la révision
 * de 2013, dont les contrôles ne correspondent pas un à un. Sans cette trace,
 * un rapport ancien deviendrait inexplicable après une mise à jour du
 * catalogue.
 *
 * <p>La colonne {@code metadata} existe en base mais n'est pas mappée ici :
 * aucun traitement n'en a besoin, et Hibernate valide le schéma au démarrage —
 * mapper un type JSON sans usage ajouterait un risque pour rien.
 */
@Entity
@Table(name = "framework_versions")
public class FrameworkVersion extends PanacheEntityBase {

    /** Version en vigueur : la seule sur laquelle un nouvel audit doit démarrer. */
    public static final String ACTIVE = "ACTIVE";

    @Id
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "framework_id", nullable = false)
    public Framework framework;

    @Column(nullable = false, length = 50)
    public String version;

    @Column(nullable = false, length = 30)
    public String status = "DRAFT";

    @Column(name = "effective_from")
    public LocalDate effectiveFrom;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    public LocalDateTime updatedAt = LocalDateTime.now();

    public static List<FrameworkVersion> findByFramework(UUID frameworkId) {
        return list("framework.id = ?1 order by version desc", frameworkId);
    }

    /** Version en vigueur d'un référentiel, ou {@code null} s'il n'en a aucune. */
    public static FrameworkVersion findActive(String frameworkCode) {
        return find("framework.code = ?1 and status = ?2", frameworkCode, ACTIVE).firstResult();
    }
}
