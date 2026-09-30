package com.cyberas.api.dto;

import com.cyberas.domain.entity.Finding;
import com.fasterxml.jackson.databind.JsonNode;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Vue exposée d'un constat.
 *
 * L'entité n'est pas sérialisée telle quelle : elle entraîne son scan, puis
 * l'audit, l'organisation et ses rôles. Le DTO n'expose que les identifiants des
 * relations, à charge de l'appelant de les suivre s'il en a besoin.
 *
 * Le risque évalué n'apparaît pas ici : il vit sur /api/risks, avec sa propre
 * historisation. Un constat est une observation, son risque est une
 * interprétation, et les deux évoluent séparément.
 */
public record FindingDtos() {

    public record FindingResponse(
        UUID id,
        UUID scanId,
        UUID auditId,
        UUID assetId,
        String title,
        String description,
        String severity,
        String status,
        String source,
        String sourceId,
        Double cvssScore,
        String cve,
        /**
         * Ce que le scanner a effectivement observé.
         *
         * <p>Ces quatre champs étaient renseignés par le scanner, stockés en
         * base, et absents de cette vue : l'API rendait des constats intitulés
         * « Port 22/tcp ouvert — ssh » sans jamais dire quel port, quel
         * protocole ni quel service. Tout écran voulant lister les services
         * exposés devait rouvrir le titre pour le relire, ou s'en passer.
         *
         * <p>C'est pourtant la seule matière factuelle du constat. Le titre est
         * une formulation ; le port et la version sont l'observation, et c'est
         * sur elles qu'un correctif se décide.
         */
        Integer port,
        String protocol,
        String serviceName,
        String serviceVersion,
        Double confidence,
        JsonNode evidence,
        LocalDateTime detectedAt,
        LocalDateTime createdAt
    ) {
        public static FindingResponse from(Finding f) {
            return new FindingResponse(
                f.id,
                f.scan != null ? f.scan.id : null,
                f.audit != null ? f.audit.id : null,
                f.asset != null ? f.asset.id : null,
                f.title,
                f.description,
                f.severity,
                f.status,
                f.source,
                f.sourceId,
                f.cvssScore,
                f.cve,
                f.port,
                f.protocol,
                f.serviceName,
                f.serviceVersion,
                f.confidence,
                // Les preuves restent attachées : sans elles, un constat ne peut
                // être ni vérifié ni contesté.
                f.evidence,
                f.detectedAt,
                f.createdAt
            );
        }
    }
}
