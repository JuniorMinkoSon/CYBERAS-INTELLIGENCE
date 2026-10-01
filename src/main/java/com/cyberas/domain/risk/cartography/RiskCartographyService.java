package com.cyberas.domain.risk.cartography;

import com.cyberas.domain.entity.Audit;
import com.cyberas.domain.entity.Organization;
import com.cyberas.domain.entity.RiskCartographyEntry;
import com.cyberas.domain.repository.RiskCartographyRepository;
import com.cyberas.domain.telemetry.KafkaLogBridge;
import com.cyberas.domain.telemetry.RiskCartographyEvent;
import com.cyberas.domain.telemetry.FindingEvent;
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

    /**
     * Cartographie un constat, à partir du service qu'il a observé.
     *
     * <p>La cartographie consommait jusqu'ici les étapes de scan, qui ne
     * portent ni port ni nom de service. La classification se rabattait donc
     * sur le protocole de transport et rangeait tout le TCP dans une seule
     * case : une mission produisait au plus deux lignes, où une base de données
     * et un HTTPS correctement chiffré comptaient pour la même chose.
     *
     * <p>Ces champs existaient pourtant. {@code FindingEvent} les publie sur
     * {@code cyberas-finding-events} depuis l'origine — un topic qu'aucun
     * consommateur ne lisait. La donnée était produite puis jetée.
     *
     * <p>Un constat produit <strong>une entrée par critère de sécurité mis en
     * jeu</strong>. Une base joignable en produit deux, puisqu'elle se lit et
     * s'écrit : c'est précisément ce que le modèle à une catégorie par constat
     * ne savait pas exprimer.
     */
    @Transactional
    @ActivateRequestContext
    public void ingest(FindingEvent event) {
        if (event == null || event.organizationId() == null) {
            return;
        }

        String niveau = MehariCategory.riskLevelOf(event.severity());

        for (ServiceExposureProfile.Atteinte atteinte :
                ServiceExposureProfile.atteintes(event.serviceName(), event.port(), event.protocol())) {

            String categorie = atteinte.categorie().name();
            RiskCartographyEntry entry = repository.findEntry(event.organizationId(), event.auditId(),
                categorie, event.target(), event.serviceName(), event.protocol());

            if (entry == null) {
                entry = new RiskCartographyEntry();
                entry.organization = em.getReference(Organization.class, event.organizationId());
                entry.audit = event.auditId() != null ? em.getReference(Audit.class, event.auditId()) : null;
                entry.category = categorie;
                entry.target = event.target();
                entry.service = event.serviceName();
                entry.protocol = event.protocol();
                entry.riskLevel = niveau;
                entry.occurrences = 0;
            }

            entry.occurrences += 1;
            if (MehariCategory.rank(niveau) > MehariCategory.rank(entry.riskLevel)) {
                entry.riskLevel = niveau;
            }
            entry.riskCode = atteinte.codeRisque();
            entry.rationale = atteinte.motif();
            entry.lastSummary = event.title();
            entry.findingIds = ajouterConstat(entry.findingIds, event.findingId());
            if (event.assetId() != null) {
                entry.asset = em.getReference(com.cyberas.domain.entity.Asset.class, event.assetId());
            }
            // Chaque observation repousse la date : une ligne qu'aucun scan
            // recent ne confirme se distingue ainsi d'un risque courant.
            entry.lastSeenAt = event.detectedAt() != null ? event.detectedAt() : LocalDateTime.now();
            entry.updatedAt = LocalDateTime.now();
            entry.persist();

            kafkaLogBridge.publishRiskCartography(new RiskCartographyEvent(event.organizationId(),
                event.auditId(), entry.category, entry.riskLevel, entry.occurrences, entry.updatedAt));

            LOG.debugf("Cartographie : org=%s audit=%s service=%s critère=%s risque=%s niveau=%s",
                event.organizationId(), event.auditId(), entry.service, entry.category,
                entry.riskCode, entry.riskLevel);
        }
    }

    /**
     * Ajoute un constat à ceux que l'entrée cite, sans doublon.
     *
     * <p>Plafonné à cinquante. Une entrée doit pouvoir citer ses constats, pas
     * les recopier tous : au-delà, le compteur d'occurrences dit le volume, et
     * cinquante identifiants suffisent à vérifier l'échantillon.
     */
    private String ajouterConstat(String existant, UUID findingId) {
        if (findingId == null) {
            return existant;
        }
        String id = findingId.toString();
        if (existant == null || existant.isBlank()) {
            return id;
        }
        if (existant.contains(id)) {
            return existant;
        }
        if (existant.chars().filter(c -> c == ',').count() >= 49) {
            return existant;
        }
        return existant + "," + id;
    }

    public List<RiskCartographyEntry> forAudit(UUID organizationId, UUID auditId) {
        return repository.listForAudit(organizationId, auditId);
    }

    public List<RiskCartographyEntry> forOrganization(UUID organizationId) {
        return repository.listForOrganization(organizationId);
    }
}
