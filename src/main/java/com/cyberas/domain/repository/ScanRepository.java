package com.cyberas.domain.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import com.cyberas.domain.entity.Scan;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class ScanRepository implements PanacheRepositoryBase<Scan, UUID> {

    public List<Scan> findByAuditId(UUID auditId) {
        return find("audit.id = ?1 order by createdAt desc", auditId).list();
    }

    public Optional<Scan> findActiveById(UUID id) {
        return find("id = ?1", id).firstResultOptional();
    }

    public List<Scan> findByStatus(String status) {
        return find("status = ?1", status).list();
    }
}
