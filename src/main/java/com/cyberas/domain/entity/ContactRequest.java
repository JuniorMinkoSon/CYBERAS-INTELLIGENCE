package com.cyberas.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Demande entrante déposée depuis le site public.
 *
 * <p>Les formulaires « Contact » et « Démo » affichaient « Demande envoyée »
 * sans rien envoyer : le message n'existait nulle part, et personne ne pouvait
 * y répondre. Cette table est leur destination.
 *
 * <p>Elle n'est rattachée à aucune organisation : au moment où quelqu'un
 * remplit le formulaire, il n'a pas de compte. C'est précisément ce qui la
 * distingue du reste du modèle, et pourquoi son accès en lecture est réservé à
 * l'administration de la plateforme.
 */
@Entity
@Table(name = "contact_requests")
public class ContactRequest extends PanacheEntityBase {

    /** Demande de démonstration avec un expert. */
    public static final String KIND_DEMO = "DEMO";

    /** Question générale envoyée depuis la page contact. */
    public static final String KIND_CONTACT = "CONTACT";

    public static final String STATUS_NEW = "NEW";
    public static final String STATUS_IN_PROGRESS = "IN_PROGRESS";
    public static final String STATUS_CLOSED = "CLOSED";

    @Id
    @GeneratedValue
    public UUID id;

    /** DEMO ou CONTACT : les deux formulaires, une seule boîte de réception. */
    @Column(nullable = false, length = 20)
    public String kind = KIND_CONTACT;

    @Column(nullable = false, length = 200)
    public String fullName;

    @Column(nullable = false, length = 255)
    public String email;

    @Column(length = 200)
    public String company;

    @Column(length = 50)
    public String phone;

    /**
     * Secteur déclaré, au sens de {@code BusinessSector}.
     *
     * <p>Renseigné dès la demande quand le formulaire le propose : il évite de
     * reposer la question à l'inscription, et permet de qualifier le besoin
     * avant même le premier échange.
     */
    @Column(length = 50)
    public String sector;

    /** Effectif ou taille déclarée, forme libre : « 50-200 », « PME »… */
    @Column(name = "company_size", length = 50)
    public String companySize;

    @Column(columnDefinition = "TEXT")
    public String message;

    /** NEW, IN_PROGRESS, CLOSED. */
    @Column(nullable = false, length = 20)
    public String status = STATUS_NEW;

    /** Note interne de suivi, saisie côté administration. */
    @Column(name = "handled_note", columnDefinition = "TEXT")
    public String handledNote;

    /**
     * Origine de la demande.
     *
     * <p>Conservée telle qu'annoncée par le navigateur, sans être présentée
     * comme une preuve : elle sert à distinguer un dépôt légitime d'une
     * soumission automatisée, pas à identifier quelqu'un.
     */
    @Column(name = "source_page", length = 255)
    public String sourcePage;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    public LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
