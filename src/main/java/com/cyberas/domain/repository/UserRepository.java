package com.cyberas.domain.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import com.cyberas.domain.entity.User;
import com.cyberas.domain.entity.Organization;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

@ApplicationScoped
public class UserRepository implements PanacheRepository<User> {

    public Optional<User> findByEmailInOrg(String email, UUID organizationId) {
        return find("email = ?1 and organization.id = ?2 and active = true", email, organizationId)
            .firstResultOptional();
    }

    public Optional<User> findByUsernameInOrg(String username, UUID organizationId) {
        return find("username = ?1 and organization.id = ?2 and active = true", username, organizationId)
            .firstResultOptional();
    }

    public List<User> findByOrganization(Organization organization) {
        return find("organization = ?1 and active = true", organization).list();
    }

    public List<User> findByOrganizationId(UUID organizationId) {
        return find("organization.id = ?1 and active = true", organizationId).list();
    }

    public Optional<User> findActiveById(UUID id) {
        return find("id = ?1 and active = true", id).firstResultOptional();
    }
}
