package com.cyberas.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Référentiel d'audit.
 *
 * <p>Ne porte aucun texte normatif : un identifiant, un nom d'usage et de quoi
 * situer l'éditeur. ISO/IEC 27001 et PCI DSS sont des normes protégées — on
 * cite leurs identifiants de contrôle, jamais leur contenu.
 *
 * <p>Le référentiel ne porte pas non plus ses contrôles directement : ils
 * dépendent de la {@link FrameworkVersion}, parce qu'une révision de norme
 * renumérote et regroupe. Un audit mené sur une version doit rester lisible
 * après la publication de la suivante.
 */
@Entity
@Table(name = "frameworks")
public class Framework extends PanacheEntityBase {

    @Id
    public UUID id;

    @Column(nullable = false, unique = true, length = 50)
    public String code;

    @Column(nullable = false, length = 200)
    public String name;

    @Column(columnDefinition = "TEXT")
    public String description;

    @Column(length = 200)
    public String provider;

    @Column(name = "reference_url", length = 500)
    public String referenceUrl;

    @Column(nullable = false)
    public Boolean active = true;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    public LocalDateTime updatedAt = LocalDateTime.now();

    public static Framework findByCode(String code) {
        return find("code", code).firstResult();
    }
}
