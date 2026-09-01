package com.cyberas.domain.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import com.cyberas.domain.entity.Permission;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class PermissionRepository implements PanacheRepositoryBase<Permission, UUID> {

    public Optional<Permission> findByCodeInOrg(String code, UUID organizationId) {
        return find("code = ?1 and organization.id = ?2 and active = true", code, organizationId)
            .firstResultOptional();
    }

    public List<Permission> findByOrganizationId(UUID organizationId) {
        return find("organization.id = ?1 and active = true", organizationId).list();
    }

    public List<Permission> findByResource(String resource) {
        return find("resource = ?1 and active = true", resource).list();
    }
}
