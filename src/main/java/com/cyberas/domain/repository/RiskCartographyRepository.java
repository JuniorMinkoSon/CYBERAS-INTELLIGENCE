package com.cyberas.domain.repository;

import com.cyberas.domain.entity.RiskCartographyEntry;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class RiskCartographyRepository implements PanacheRepositoryBase<RiskCartographyEntry, UUID> {

    /**
     * Entree au grain du service.
     *
     * <p>La recherche portait sur (organisation, audit, categorie, protocole).
     * La categorie se deduisant du seul protocole, ce couple n'avait qu'un
     * degre de liberte : une mission ne pouvait porter que deux lignes. Le
     * service entre dans la cle, et deux services distincts cessent de se
     * confondre.
     */
    public RiskCartographyEntry findEntry(UUID organizationId, UUID auditId, String category,
                                          String target, String service, String protocol) {
        return find("organization.id = ?1 and (audit.id = ?2 or (audit is null and ?2 is null)) "
                + "and category = ?3 and (target = ?4 or (target is null and ?4 is null)) "
                + "and (service = ?5 or (service is null and ?5 is null)) "
                + "and (protocol = ?6 or (protocol is null and ?6 is null))",
            organizationId, auditId, category, target, service, protocol).firstResult();
    }

    public List<RiskCartographyEntry> listForAudit(UUID organizationId, UUID auditId) {
        return find("organization.id = ?1 and audit.id = ?2 order by riskLevel desc, occurrences desc",
            organizationId, auditId).list();
    }

    public List<RiskCartographyEntry> listForOrganization(UUID organizationId) {
        return find("organization.id = ?1 order by riskLevel desc, occurrences desc", organizationId).list();
    }
}
