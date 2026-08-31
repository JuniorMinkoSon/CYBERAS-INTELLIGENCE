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

    @Column(nullable = false)
    public Boolean active = true;

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
