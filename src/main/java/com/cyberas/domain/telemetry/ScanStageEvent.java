package com.cyberas.domain.telemetry;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Une étape de la vie d'un scan, publiée sur le topic Kafka {@code cyberas-scan-events}.
 *
 * <p>Un scan ne produit pas un seul événement à la fin, mais un par étape :
 * {@link #stage()} distingue la soumission, la sonde TCP, la sonde UDP, un
 * constat isolé et la fin (réussie ou non). C'est ce qui permet à un
 * observateur externe — cartographie des risques, futur moteur SIEM, service
 * ML — de suivre un scan en train de se dérouler plutôt que de découvrir son
 * seul résultat final.
 *
 * <p>{@link #protocol()} vaut {@code TCP}, {@code UDP} ou {@code null} quand
 * l'étape ne porte pas sur un protocole précis (soumission, fin). Il reflète
 * ce que nmap a réellement sondé, jamais une supposition : pour un constat,
 * il vient du champ {@code protocol} du résultat nmap.
 */
public record ScanStageEvent(
    UUID scanId,
    UUID organizationId,
    UUID auditId,
    String target,
    Stage stage,
    String protocol,
    String severity,
    String summary,
    LocalDateTime occurredAt
) {

    public enum Stage {
        SUBMITTED,
        RUNNING,
        FINDING,
        COMPLETED,
        FAILED
    }

    public static ScanStageEvent of(UUID scanId, UUID organizationId, UUID auditId, String target,
                                     Stage stage, String protocol, String severity, String summary) {
        return new ScanStageEvent(scanId, organizationId, auditId, target, stage, protocol, severity,
            summary, LocalDateTime.now());
    }
}
