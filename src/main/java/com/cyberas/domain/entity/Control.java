package com.cyberas.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Contrôle d'un référentiel, dans une version donnée.
 *
 * <p>{@code code} est l'identifiant officiel du contrôle — « A.5.15 ». Un
 * identifiant est factuel et se cite librement.
 *
 * <p>{@code title} et {@code description} sont en revanche des formulations
 * Cyberas. Reproduire le libellé normatif exposerait à une violation de droit
 * d'auteur, et n'aiderait pas l'audité : ce qu'il doit lire, c'est ce qu'on
 * vérifie chez lui, pas la prose de la norme.
 *
 * <p>{@code domain} conserve le domaine interne Cyberas quand il existe. Il
 * devient une métadonnée du contrôle et cesse d'être le niveau principal de
 * navigation : l'utilisateur raisonne par référentiel, pas par domaine.
 */
@Entity
@Table(name = "controls")
public class Control extends PanacheEntityBase {

    @Id
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "framework_version_id", nullable = false)
    public FrameworkVersion frameworkVersion;

    @Column(nullable = false, length = 30)
    public String code;

    @Column(nullable = false, length = 300)
    public String title;

    @Column(columnDefinition = "TEXT")
    public String description;

    @Column(length = 100)
    public String category;

    @Column(length = 50)
    public String domain;

    @Column(nullable = false)
    public Integer weight = 1;

    @Column(nullable = false)
    public Integer position;

    @Column(nullable = false)
    public Boolean active = true;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    public LocalDateTime updatedAt = LocalDateTime.now();

    public static List<Control> findByVersion(UUID frameworkVersionId) {
        return list("frameworkVersion.id = ?1 and active = true order by position",
            frameworkVersionId);
    }

    public static Control findByVersionAndCode(UUID frameworkVersionId, String code) {
        return find("frameworkVersion.id = ?1 and code = ?2", frameworkVersionId, code)
            .firstResult();
    }

    /**
     * Nombre de contrôles actifs de la version en vigueur d'un référentiel.
     *
     * <p>Zéro signifie que le référentiel est déclaré au catalogue mais que
     * ses contrôles ne sont pas encore en base. Le distinguer d'un référentiel
     * instruit est la seule façon d'éviter qu'une interface annonce une
     * couverture que le calcul ne peut pas produire.
     */
    public static long countByFrameworkCode(String frameworkCode) {
        return count("frameworkVersion.framework.code = ?1 and frameworkVersion.status = ?2"
            + " and active = true", frameworkCode, FrameworkVersion.ACTIVE);
    }

    /**
     * Nombre de ces contrôles qu'au moins une question atteint réellement.
     *
     * <p>Un contrôle sans rattachement confirmé ne reçoit aucune réponse : le
     * calcul le classe NOT_ASSESSED. Ce compte dit donc quelle part du
     * référentiel une campagne peut instruire, et c'est cette part — pas le
     * nombre total de contrôles — qui décrit honnêtement la couverture.
     */
    public static long countMappedByFrameworkCode(String frameworkCode) {
        return count("id in (select m.control.id from QuestionControlMapping m"
            + " where m.status = ?1 and m.control.frameworkVersion.framework.code = ?2"
            + " and m.control.frameworkVersion.status = ?3)",
            QuestionControlMapping.CONFIRMED, frameworkCode, FrameworkVersion.ACTIVE);
    }
}
