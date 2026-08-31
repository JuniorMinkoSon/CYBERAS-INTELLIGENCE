package com.cyberas.domain.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import com.cyberas.domain.entity.AuditVersion;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class AuditVersionRepository implements PanacheRepository<AuditVersion> {

    public List<AuditVersion> findByAuditId(UUID auditId) {
        return find("audit.id = ?1 order by versionNumber desc", auditId).list();
    }

    public Optional<AuditVersion> findByAuditIdAndVersion(UUID auditId, Integer versionNumber) {
        return find("audit.id = ?1 and versionNumber = ?2", auditId, versionNumber).firstResultOptional();
    }

    public Optional<AuditVersion> findLatestByAuditId(UUID auditId) {
        return find("audit.id = ?1 order by versionNumber desc", auditId).firstResultOptional();
    }

    public List<AuditVersion> findByStatus(String status) {
        return find("status = ?1 order by createdAt desc", status).list();
    }
}
