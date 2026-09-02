package com.cyberas.domain.entity;

import com.fasterxml.jackson.databind.JsonNode;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/** Code d'accès permettant de rejoindre une organisation avec un niveau de permission donné. */
@Entity
@Table(name = "invitations")
public class Invitation extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id", nullable = false)
    public Organization organization;

    @Column(nullable = false, unique = true, length = 40)
    public String code;

    @Column(length = 255)
    public String email;

    @Column(nullable = false, length = 50)
    public String role;

    @Column(columnDefinition = "jsonb")
    public JsonNode permissions;

    @Column(name = "expires_at", nullable = false)
    public LocalDateTime expiresAt;

    @Column(name = "used_at")
    public LocalDateTime usedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "used_by")
    public User usedBy;

    @Column(name = "revoked_at")
    public LocalDateTime revokedAt;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    public User createdBy;

    public String status() {
        if (revokedAt != null) return "REVOKED";
        if (usedAt != null) return "USED";
        if (LocalDateTime.now().isAfter(expiresAt)) return "EXPIRED";
        return "PENDING";
    }

    public boolean isUsable() {
        return "PENDING".equals(status());
    }
}
