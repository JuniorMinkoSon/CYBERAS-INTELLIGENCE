package com.cyberas.domain.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import com.cyberas.domain.entity.Organization;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class OrganizationRepository implements PanacheRepository<Organization> {

    public Optional<Organization> findByName(String name) {
        return find("name = ?1 and active = true", name).firstResultOptional();
    }

    public Optional<Organization> findActiveById(UUID id) {
        return find("id = ?1 and active = true", id).firstResultOptional();
    }
}
