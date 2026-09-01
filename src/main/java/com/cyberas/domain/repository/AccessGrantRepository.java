package com.cyberas.domain.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import com.cyberas.domain.entity.AccessGrant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class AccessGrantRepository implements PanacheRepositoryBase<AccessGrant, UUID> {

    public List<AccessGrant> findByAuditId(UUID auditId) {
        return find("audit.id = ?1 and status = 'ACTIVE'", auditId).list();
    }

    public List<AccessGrant> findByUserId(UUID userId) {
        return find("user.id = ?1 and status = 'ACTIVE'", userId).list();
    }

    public Optional<AccessGrant> findActiveByUserAndAudit(UUID userId, UUID auditId) {
        return find("user.id = ?1 and audit.id = ?2 and status = 'ACTIVE'", userId, auditId)
            .firstResultOptional();
    }

    public List<AccessGrant> findByStatus(String status) {
        return find("status = ?1", status).list();
    }

    public List<AccessGrant> findExpiredAndNotRevoked() {
        return find("status = 'ACTIVE' and expiresAt is not null and expiresAt < now()").list();
    }
}
