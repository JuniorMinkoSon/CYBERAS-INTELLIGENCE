package com.cyberas.domain.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import com.cyberas.domain.entity.Role;
import com.cyberas.domain.entity.Organization;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

@ApplicationScoped
public class RoleRepository implements PanacheRepository<Role> {

    public Optional<Role> findByNameInOrg(String name, UUID organizationId) {
        return find("name = ?1 and organization.id = ?2 and active = true", name, organizationId)
            .firstResultOptional();
    }

    public List<Role> findByOrganizationId(UUID organizationId) {
        return find("organization.id = ?1 and active = true", organizationId).list();
    }

    public Optional<Role> findActiveById(UUID id) {
        return find("id = ?1 and active = true", id).firstResultOptional();
    }
}
