package com.cyberas.domain.risk.cartography;

import com.cyberas.domain.entity.Audit;
import com.cyberas.domain.entity.Organization;
import com.cyberas.domain.entity.RiskCartographyEntry;
import com.cyberas.domain.repository.RiskCartographyRepository;
import com.cyberas.domain.telemetry.KafkaLogBridge;
import com.cyberas.domain.telemetry.RiskCartographyEvent;
import com.cyberas.domain.telemetry.ScanStageEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.context.control.ActivateRequestContext;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Construit la cartographie des risques à partir de la télémétrie de scan.
 *
 * <p>Consommateur de {@code cyberas-scan-events} (voir
 * {@link ScanEventCartographyConsumer}) : chaque constat fait progresser
 * l'occurrence et, le cas échéant, le niveau de risque de la catégorie MEHARI
 * concernée. Une entrée ne redescend jamais de niveau toute seule — seul un
 * nouveau constat plus sévère la fait progresser ; la redescente est une
 * décision d'audit, pas un effet de bord du flux d'événements.
 */
@ApplicationScoped
public class RiskCartographyService {

    private static final Logger LOG = Logger.getLogger(RiskCartographyService.class);

    @Inject
    RiskCartographyRepository repository;

    @Inject
    EntityManager em;

    @Inject
    KafkaLogBridge kafkaLogBridge;

    @Transactional
    @ActivateRequestContext
    public void ingest(ScanStageEvent event) {
        if (event == null || event.stage() != ScanStageEvent.Stage.FINDING) {
            // Seuls les constats font progresser la cartographie ; les autres
            // étapes (soumission, fin) sont déjà tracées par le journal d'audit.
            return;
        }

        String category = MehariCategory.fromScanTelemetry(event.protocol(), event.severity()).name();
        String incomingLevel = MehariCategory.riskLevelOf(event.severity());

        RiskCartographyEntry entry = repository.findEntry(event.organizationId(), event.auditId(),
            category, event.protocol());
        if (entry == null) {
            entry = new RiskCartographyEntry();
            entry.organization = em.getReference(Organization.class, event.organizationId());
            entry.audit = event.auditId() != null ? em.getReference(Audit.class, event.auditId()) : null;
            entry.category = category;
            entry.protocol = event.protocol();
            entry.riskLevel = incomingLevel;
            entry.occurrences = 0;
        }

        entry.occurrences += 1;
        if (MehariCategory.rank(incomingLevel) > MehariCategory.rank(entry.riskLevel)) {
            entry.riskLevel = incomingLevel;
        }
        entry.lastSummary = event.summary();
        entry.updatedAt = LocalDateTime.now();
        entry.persist();

        kafkaLogBridge.publishRiskCartography(new RiskCartographyEvent(event.organizationId(), event.auditId(),
            entry.category, entry.riskLevel, entry.occurrences, entry.updatedAt));

        LOG.debugf("Cartographie mise à jour : org=%s audit=%s catégorie=%s niveau=%s occurrences=%d",
            event.organizationId(), event.auditId(), entry.category, entry.riskLevel, entry.occurrences);
    }

    public List<RiskCartographyEntry> forAudit(UUID organizationId, UUID auditId) {
        return repository.listForAudit(organizationId, auditId);
    }

    public List<RiskCartographyEntry> forOrganization(UUID organizationId) {
        return repository.listForOrganization(organizationId);
    }
}
