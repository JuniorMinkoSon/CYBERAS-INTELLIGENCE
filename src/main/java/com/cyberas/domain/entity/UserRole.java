package com.cyberas.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_roles", uniqueConstraints = {
    @UniqueConstraint(name = "uk_user_role", columnNames = {"user_id", "role_id"})
})
public class UserRole extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    public Role role;

    @Column(name = "assigned_at", nullable = false)
    public LocalDateTime assignedAt = LocalDateTime.now();

    @Column(name = "assigned_by")
    public UUID assignedBy;

    @Column(name = "expires_at")
    public LocalDateTime expiresAt;

    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }
}
