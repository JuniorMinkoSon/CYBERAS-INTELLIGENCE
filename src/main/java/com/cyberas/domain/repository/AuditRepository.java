package com.cyberas.domain.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import com.cyberas.domain.entity.Audit;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

@ApplicationScoped
public class AuditRepository implements PanacheRepository<Audit> {

    public Optional<Audit> findByCodeInOrg(String auditCode, UUID organizationId) {
        return find("auditCode = ?1 and organization.id = ?2", auditCode, organizationId)
            .firstResultOptional();
    }

    public List<Audit> findByOrganizationId(UUID organizationId) {
        return find("organization.id = ?1", organizationId).list();
    }

    public Optional<Audit> findActiveById(UUID id) {
        return find("id = ?1", id).firstResultOptional();
    }

    public List<Audit> findByStatus(String status) {
        return find("status = ?1", status).list();
    }
}
