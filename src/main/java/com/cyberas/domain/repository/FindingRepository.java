package com.cyberas.domain.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import com.cyberas.domain.entity.Finding;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class FindingRepository implements PanacheRepository<Finding> {

    public List<Finding> findByScanId(UUID scanId) {
        return find("scan.id = ?1 order by severity desc, detectedAt desc", scanId).list();
    }

    public List<Finding> findByAuditId(UUID auditId) {
        return find("audit.id = ?1 order by severity desc", auditId).list();
    }

    public List<Finding> findBySeverity(String severity) {
        return find("severity = ?1", severity).list();
    }

    public List<Finding> findByStatus(String status) {
        return find("status = ?1", status).list();
    }
}
