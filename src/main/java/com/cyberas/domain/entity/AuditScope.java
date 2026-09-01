package com.cyberas.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Périmètre autorisé d'un audit.
 *
 * Chaque entrée déclare une cible (ou une plage de cibles) que l'organisation
 * autorise explicitement à scanner. Aucun scan ne peut sortir de ce périmètre.
 *
 * L'autorisation est une donnée de preuve : elle porte qui a autorisé, quand,
 * et sur quelle base. Elle n'est jamais implicite.
 */
@Entity
@Table(name = "audit_scopes", indexes = {
    @Index(name = "idx_audit_scope_audit", columnList = "audit_id"),
    @Index(name = "idx_audit_scope_org", columnList = "organization_id")
})
public class AuditScope extends PanacheEntityBase {

    /** Types de cible reconnus par le validateur de périmètre. */
    public static final String TYPE_CIDR = "CIDR";
    public static final String TYPE_IP = "IP";
    public static final String TYPE_HOSTNAME = "HOSTNAME";
    public static final String TYPE_DOMAIN = "DOMAIN"; // wildcard, ex: *.corp.local

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "audit_id", nullable = false)
    public Audit audit;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id", nullable = false)
    public Organization organization;

    @Column(name = "scope_type", nullable = false, length = 20)
    public String scopeType;

    /** Valeur brute du périmètre : 192.168.1.0/24, 10.0.0.5, srv.corp.local, *.corp.local */
    @Column(nullable = false, length = 255)
    public String value;

    /**
     * Autorisation explicite. Une entrée de périmètre non autorisée est inerte :
     * elle décrit une cible connue mais interdit le scan.
     */
    @Column(nullable = false)
    public Boolean authorized = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "authorized_by")
    public User authorizedBy;

    @Column(name = "authorized_at")
    public LocalDateTime authorizedAt;

    /** Référence de l'autorisation côté client (bon de commande, mail, contrat). */
    @Column(name = "authorization_reference", length = 255)
    public String authorizationReference;

    @Column(columnDefinition = "TEXT")
    public String notes;

    @Column(name = "revoked_at")
    public LocalDateTime revokedAt;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    public User createdBy;

    @Column(name = "updated_at", nullable = false)
    public LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /** Une entrée n'est utilisable que si elle est autorisée et non révoquée. */
    public boolean isActive() {
        return Boolean.TRUE.equals(authorized) && revokedAt == null;
    }
}
