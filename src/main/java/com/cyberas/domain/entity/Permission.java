package com.cyberas.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "permissions", uniqueConstraints = {
    @UniqueConstraint(name = "uk_permission_org_code", columnNames = {"organization_id", "code"})
})
public class Permission extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id", nullable = false)
    public Organization organization;

    @Column(nullable = false, length = 100)
    public String code;

    @Column(nullable = false, length = 255)
    public String name;

    @Column(columnDefinition = "TEXT")
    public String description;

    @Column(nullable = false, length = 100)
    public String resource;

    @Column(nullable = false, length = 50)
    public String action;

    @Column(name = "is_system")
    public Boolean isSystem = false;

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

    @ManyToMany(mappedBy = "permissions", fetch = FetchType.LAZY)
    public Set<Role> roles = new HashSet<>();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
