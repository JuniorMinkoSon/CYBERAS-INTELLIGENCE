package com.cyberas.domain.repository;

import com.cyberas.domain.entity.AuditScope;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class AuditScopeRepository implements PanacheRepositoryBase<AuditScope, UUID> {

    /** Entrées de périmètre actives (autorisées, non révoquées) d'un audit. */
    public List<AuditScope> findActiveByAuditId(UUID auditId) {
        return list("audit.id = ?1 and authorized = true and revokedAt is null", auditId);
    }

    /** Toutes les entrées d'un audit, y compris révoquées — pour l'affichage et la traçabilité. */
    public List<AuditScope> findByAuditId(UUID auditId) {
        return list("audit.id = ?1", auditId);
    }

    public Optional<AuditScope> findByIdAndOrganization(UUID id, UUID organizationId) {
        return find("id = ?1 and organization.id = ?2", id, organizationId).firstResultOptional();
    }
}
