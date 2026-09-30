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

    /**
     * Une ligne de cartographie, telle qu'un livrable d'audit doit la porter.
     *
     * <p>Quatre champs s'ajoutent, et chacun repond a un manque precis.
     *
     * <p>{@code service} est le grain : l'agregation portait sur le protocole
     * de transport, si bien qu'une mission ne pouvait produire que deux lignes
     * et qu'une base de donnees s'y confondait avec un HTTPS chiffre.
     *
     * <p>{@code riskCode} rattache la ligne a la taxonomie R01-R12 que portent
     * les 551 controles des referentiels du depot : la cartographie parle le
     * meme vocabulaire de risque que les controles.
     *
     * <p>{@code rationale} dit pourquoi ce service met ce critere en jeu. Une
     * ligne qui affirme un risque sans le motiver n'est pas opposable.
     *
     * <p>{@code findingIds} permet de remonter aux constats. Auparavant seul
     * {@code lastSummary} subsistait, ecrase a chaque constat : l'entree portait
     * un compteur dont les faits comptes avaient disparu du chemin.
     */
    public record Entry(UUID id, UUID auditId, String category, String service, String protocol,
                         String riskLevel, String riskCode, String rationale,
                         int occurrences, String lastSummary, List<UUID> findingIds,
                         LocalDateTime updatedAt) {
        static Entry from(RiskCartographyEntry e) {
            List<UUID> constats = e.findingIds == null || e.findingIds.isBlank()
                ? List.of()
                : java.util.Arrays.stream(e.findingIds.split(","))
                    .map(String::trim).filter(x -> !x.isEmpty())
                    .map(UUID::fromString).toList();
            return new Entry(e.id, e.audit == null ? null : e.audit.id, e.category, e.service,
                e.protocol, e.riskLevel, e.riskCode, e.rationale, e.occurrences, e.lastSummary,
                constats, e.updatedAt);
        }
    }
}
