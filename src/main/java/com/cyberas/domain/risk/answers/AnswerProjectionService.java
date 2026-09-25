package com.cyberas.domain.risk.answers;

import com.cyberas.domain.entity.AnswerProjectionEntry;
import com.cyberas.domain.entity.Audit;
import com.cyberas.domain.entity.Organization;
import com.cyberas.domain.repository.AnswerProjectionRepository;
import com.cyberas.domain.service.QuestionnaireService;
import com.cyberas.domain.telemetry.AnswerEvent;
import io.quarkus.narayana.jta.QuarkusTransaction;
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
 * Matérialise les réponses du questionnaire en état courant par famille.
 *
 * <p>Pendant du {@code RiskCartographyService} pour l'autre moitié de
 * l'évaluation : celui-là ingère ce que les machines exposent, celui-ci ingère
 * ce que l'organisation déclare. Les deux lisent un flux d'événements et
 * écrivent une vue matérialisée, les deux se reconstruisent en rejouant leur
 * topic, et aucun des deux ne porte de score opposable — cela reste le travail
 * du moteur de risque, sur les réponses elles-mêmes.
 *
 * <p>L'ingestion est idempotente par rapport au contenu mais pas par rapport à
 * la répétition : rejouer deux fois le même événement compte la réponse deux
 * fois. C'est le comportement de la cartographie de scan, et il est acceptable
 * pour la même raison — la projection est reconstructible, et la source de
 * vérité reste la table des réponses. Un compteur faussé se corrige en vidant
 * la table et en rejouant le topic.
 */
@ApplicationScoped
public class AnswerProjectionService {

    private static final Logger LOG = Logger.getLogger(AnswerProjectionService.class);

    @Inject
    AnswerProjectionRepository repository;

    @Inject
    EntityManager em;

    /**
     * Range un événement dans sa famille.
     *
     * <p>Une réponse sans audit n'est pas ingérée : la projection est unique
     * par (organisation, audit, famille), et une ligne sans audit n'aurait
     * aucune maille de lecture.
     */
    @Transactional
    @ActivateRequestContext
    public void ingest(AnswerEvent event) {
        if (event == null || event.organizationId() == null || event.auditId() == null) {
            return;
        }

        String famille = event.domainFamily() == null || event.domainFamily().isBlank()
            ? "INDETERMINEE"
            : event.domainFamily();

        AnswerProjectionEntry entry = repository.findEntry(event.organizationId(), event.auditId(), famille);
        if (entry == null) {
            entry = new AnswerProjectionEntry();
            entry.organization = em.getReference(Organization.class, event.organizationId());
            entry.audit = em.getReference(Audit.class, event.auditId());
            entry.domainFamily = famille;
        }

        if (event.notApplicable()) {
            entry.notApplicableCount += 1;
        } else if (event.maturityLevel() != null) {
            entry.answeredCount += 1;
            entry.maturitySum += event.maturityLevel();
            if (event.estUnEcart(QuestionnaireService.WEAK_THRESHOLD)) {
                entry.gapCount += 1;
            }
        }

        entry.updatedAt = LocalDateTime.now();
        entry.persist();

        LOG.debugf("Projection des réponses : org=%s audit=%s famille=%s répondues=%d écarts=%d",
            event.organizationId(), event.auditId(), famille, entry.answeredCount, entry.gapCount);
    }

    public List<AnswerProjectionEntry> forAudit(UUID organizationId, UUID auditId) {
        return repository.listForAudit(organizationId, auditId);
    }

    public List<AnswerProjectionEntry> forOrganization(UUID organizationId) {
        return repository.listForOrganization(organizationId);
    }

    /**
     * Vide la projection d'un audit.
     *
     * <p>Sert à la reconstruire : on efface, on rejoue le topic. Sans ce
     * point d'entrée, un compteur faussé par un double envoi ne se corrigerait
     * qu'à la main, en base.
     */
    public void reset(UUID organizationId, UUID auditId) {
        QuarkusTransaction.requiringNew().run(() ->
            repository.delete("organization.id = ?1 and audit.id = ?2", organizationId, auditId));
    }
}
