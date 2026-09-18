package com.cyberas.domain.repository;

import com.cyberas.domain.entity.RiskCartographyEntry;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class RiskCartographyRepository implements PanacheRepositoryBase<RiskCartographyEntry, UUID> {

    public RiskCartographyEntry findEntry(UUID organizationId, UUID auditId, String category, String protocol) {
        return find("organization.id = ?1 and (audit.id = ?2 or (audit is null and ?2 is null)) "
                + "and category = ?3 and (protocol = ?4 or (protocol is null and ?4 is null))",
            organizationId, auditId, category, protocol).firstResult();
    }

    public List<RiskCartographyEntry> listForAudit(UUID organizationId, UUID auditId) {
        return find("organization.id = ?1 and audit.id = ?2 order by riskLevel desc, occurrences desc",
            organizationId, auditId).list();
    }

    public List<RiskCartographyEntry> listForOrganization(UUID organizationId) {
        return find("organization.id = ?1 order by riskLevel desc, occurrences desc", organizationId).list();
    }
}
