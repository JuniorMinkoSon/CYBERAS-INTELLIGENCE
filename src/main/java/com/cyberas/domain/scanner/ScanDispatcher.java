package com.cyberas.domain.scanner;

import io.smallrye.mutiny.infrastructure.Infrastructure;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.enterprise.event.TransactionPhase;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

/**
 * Déclenche l'exécution d'un scan une fois sa création réellement committée.
 *
 * Deux contraintes se combinent ici :
 *
 * 1. Le scan ne doit pas s'exécuter dans le thread de requête — un profil FULL
 *    dure plusieurs minutes et tiendrait la transaction ouverte d'autant.
 * 2. Le worker ne doit pas partir avant le commit, sinon il interroge la base
 *    dans sa propre transaction et n'y trouve pas encore le scan.
 *
 * AFTER_SUCCESS répond aux deux : l'observateur est notifié une fois la
 * transaction validée, et confie alors le travail au pool. Un scan dont la
 * création échoue n'est jamais lancé, ce qui est le comportement voulu.
 */
@ApplicationScoped
public class ScanDispatcher {

    private static final Logger LOG = Logger.getLogger(ScanDispatcher.class);

    @Inject
    ScanExecutor scanExecutor;

    void onScanRequested(@Observes(during = TransactionPhase.AFTER_SUCCESS) ScanRequested event) {
        LOG.infof("Scan %s validé en base, exécution confiée au pool de travail", event.scanId());
        Infrastructure.getDefaultWorkerPool().execute(() -> scanExecutor.run(event.scanId()));
    }
}
