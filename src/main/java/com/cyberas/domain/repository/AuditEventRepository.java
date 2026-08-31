package com.cyberas.domain.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import com.cyberas.domain.entity.AuditEvent;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class AuditEventRepository implements PanacheRepository<AuditEvent> {

    public List<AuditEvent> findByAuditId(UUID auditId) {
        return find("audit.id = ?1 order by timestamp desc", auditId).list();
    }

    public List<AuditEvent> findByOrganizationId(UUID organizationId) {
        return find("organization.id = ?1 order by timestamp desc", organizationId).list();
    }

    public List<AuditEvent> findByActorId(UUID actorId) {
        return find("actor.id = ?1 order by timestamp desc", actorId).list();
    }

    public List<AuditEvent> findByEventType(String eventType) {
        return find("eventType = ?1 order by timestamp desc", eventType).list();
    }
}
