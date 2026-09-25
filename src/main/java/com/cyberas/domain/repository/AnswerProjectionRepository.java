package com.cyberas.domain.repository;

import com.cyberas.domain.entity.AnswerProjectionEntry;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class AnswerProjectionRepository implements PanacheRepositoryBase<AnswerProjectionEntry, UUID> {

    public AnswerProjectionEntry findEntry(UUID organizationId, UUID auditId, String domainFamily) {
        return find("organization.id = ?1 and audit.id = ?2 and domainFamily = ?3",
            organizationId, auditId, domainFamily).firstResult();
    }

    /**
     * Les familles d'un audit, les plus en écart d'abord.
     *
     * <p>L'ordre porte une intention : celui qui ouvre l'écran cherche ce qui
     * manque, pas l'inventaire. Une famille sans écart n'appelle aucune
     * décision et peut attendre la fin de la liste.
     */
    public List<AnswerProjectionEntry> listForAudit(UUID organizationId, UUID auditId) {
        return find("organization.id = ?1 and audit.id = ?2 order by gapCount desc, domainFamily asc",
            organizationId, auditId).list();
    }

    public List<AnswerProjectionEntry> listForOrganization(UUID organizationId) {
        return find("organization.id = ?1 order by updatedAt desc", organizationId).list();
    }
}
