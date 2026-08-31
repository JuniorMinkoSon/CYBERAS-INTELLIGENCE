package com.cyberas.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(name = "uk_user_email_org", columnNames = {"email", "organization_id"}),
    @UniqueConstraint(name = "uk_user_username_org", columnNames = {"username", "organization_id"})
})
public class User extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id", nullable = false)
    public Organization organization;

    @Column(nullable = false, length = 255)
    public String email;

    @Column(nullable = false, length = 100)
    public String username;

    @Column(name = "password_hash", length = 255)
    public String passwordHash;

    @Column(name = "first_name", length = 100)
    public String firstName;

    @Column(name = "last_name", length = 100)
    public String lastName;

    @Column(nullable = false)
    public Boolean active = true;

    @Column(name = "email_verified")
    public Boolean emailVerified = false;

    @Column(name = "last_login_at")
    public LocalDateTime lastLoginAt;

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

    @Column(name = "locked_until")
    public LocalDateTime lockedUntil;

    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
    public Set<UserRole> userRoles = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
    public Set<AccessGrant> accessGrants = new HashSet<>();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public String getFullName() {
        return (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
    }
}
