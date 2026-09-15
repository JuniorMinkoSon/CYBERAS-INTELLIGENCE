package com.cyberas.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "organizations")
public class Organization extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @Column(nullable = false, unique = true, length = 255)
    public String name;

    @Column(columnDefinition = "TEXT")
    public String description;

    /**
     * Secteur d'activité, au sens de {@code BusinessSector}.
     *
     * <p>Alimente l'impact métier et la sensibilité des données retenus par
     * défaut dans l'évaluation du risque, selon l'approche MEHARI : un même
     * incident ne pèse pas pareil chez un hébergeur de dossiers médicaux et
     * chez un commerçant de proximité.
     *
     * <p>Nullable : les organisations créées avant l'ajout du champ n'en ont
     * pas, et le code retombe alors sur une valeur médiane.
     */
    @Column(length = 50)
    public String sector;

    /**
     * Formule souscrite, au sens de {@code SubscriptionPlan}.
     *
     * <p>Determine les referentiels ouverts a l'audit. Elle ne conditionne ni le
     * score, ni les recommandations : un audit mene sur le socle produit un
     * resultat complet.
     */
    @Column(name = "subscription_plan", length = 30)
    public String subscriptionPlan = "DECOUVERTE";

    @Column(nullable = false)
    public Boolean active = true;

    /**
     * Organisation qui administre la plateforme.
     *
     * <p>Ses administrateurs voient l'ensemble des clients et pilotent les
     * projets d'évaluation. Toute autre organisation, même dotée d'un rôle
     * ADMIN, reste bornée à ses propres données.
     */
    @Column(name = "is_platform", nullable = false)
    public Boolean isPlatform = false;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "created_by")
    public UUID createdBy;

    @Column(name = "updated_at", nullable = false)
    public LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "updated_by")
    public UUID updatedBy;

    @Column(nullable = false)
    public Integer version = 1;

    @Column(name = "deleted_at")
    public LocalDateTime deletedAt;

    @OneToMany(mappedBy = "organization", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
    public Set<Role> roles = new HashSet<>();

    @OneToMany(mappedBy = "organization", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
    public Set<Permission> permissions = new HashSet<>();

    @OneToMany(mappedBy = "organization", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
    public Set<User> users = new HashSet<>();

    @OneToMany(mappedBy = "organization", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
    public Set<Audit> audits = new HashSet<>();

    @OneToMany(mappedBy = "organization", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
    public Set<AuditEvent> events = new HashSet<>();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
