package com.cyberas.api.resource;

import com.cyberas.domain.entity.RiskCartographyEntry;
import com.cyberas.domain.risk.cartography.RiskCartographyService;
import com.cyberas.security.JwtContext;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Cartographie des risques dérivée des logs de scan (SIEM simplifié, MEHARI).
 *
 * <p>Distincte de {@code /risks} : celle-ci restitue ce que le flux
 * d'événements de scan a observé, agrégé par catégorie MEHARI et protocole ;
 * elle n'est jamais le score opposable d'un audit, seulement une lecture du
 * bruit accumulé au fil des scans. Toutes les requêtes sont filtrées par
 * l'organisation portée par le jeton.
 */
@Path("/risk-cartography")
@Produces(MediaType.APPLICATION_JSON)
public class RiskCartographyResource {

    @Inject
    RiskCartographyService cartographyService;

    @Inject
    JwtContext jwtContext;

    @GET
    @Path("/audits/{auditId}")
    public Response forAudit(@PathParam("auditId") UUID auditId) {
        List<RiskCartographyEntry> entries = cartographyService.forAudit(jwtContext.getOrganizationId(), auditId);
        return Response.ok(entries.stream().map(Entry::from).toList()).build();
    }

    @GET
    public Response forOrganization() {
        List<RiskCartographyEntry> entries = cartographyService.forOrganization(jwtContext.getOrganizationId());
        return Response.ok(entries.stream().map(Entry::from).toList()).build();
    }

    public record Entry(UUID id, UUID auditId, String category, String protocol, String riskLevel,
                         int occurrences, String lastSummary, LocalDateTime updatedAt) {
        static Entry from(RiskCartographyEntry e) {
            return new Entry(e.id, e.audit == null ? null : e.audit.id, e.category, e.protocol,
                e.riskLevel, e.occurrences, e.lastSummary, e.updatedAt);
        }
    }
}
