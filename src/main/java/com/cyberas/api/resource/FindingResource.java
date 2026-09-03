package com.cyberas.api.resource;

import com.cyberas.api.dto.FindingDtos.FindingResponse;
import com.cyberas.domain.entity.Finding;
import com.cyberas.domain.repository.FindingRepository;
import com.cyberas.domain.service.FindingService;
import com.cyberas.security.JwtContext;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.UUID;

/**
 * Constats issus des scans et des questionnaires.
 *
 * Toutes les lectures sont bornées à l'organisation portée par le jeton. Les
 * paramètres de filtrage restreignent, ils n'élargissent jamais : un auditId
 * d'une autre organisation ne renvoie rien plutôt que d'échouer, le filtre
 * organisation étant appliqué en premier.
 */
@Path("/findings")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FindingResource {

    @Inject
    FindingService findingService;

    @Inject
    FindingRepository findingRepository;

    @Inject
    JwtContext jwtContext;

    @GET
    public Response listFindings(@QueryParam("auditId") UUID auditId,
                                 @QueryParam("severity") String severity) {
        UUID org = jwtContext.getOrganizationId();

        StringBuilder query = new StringBuilder("organization.id = ?1");
        List<Object> params = new java.util.ArrayList<>();
        params.add(org);

        if (auditId != null) {
            query.append(" and audit.id = ?").append(params.size() + 1);
            params.add(auditId);
        }
        if (severity != null && !severity.isBlank()) {
            query.append(" and severity = ?").append(params.size() + 1);
            params.add(severity.trim().toUpperCase());
        }
        query.append(" order by detectedAt desc");

        List<Finding> findings = findingRepository.list(query.toString(), params.toArray());
        return Response.ok(findings.stream().map(FindingResponse::from).toList()).build();
    }

    /**
     * Constats d'un scan donné.
     *
     * Doublon assumé de /scans/{id}/findings : les deux chemins sont légitimes
     * selon qu'on parte du scan ou des constats, et le second existait déjà.
     */
    @GET
    @Path("/scan/{scanId}")
    public Response listByScan(@PathParam("scanId") UUID scanId) {
        List<Finding> findings = findingRepository.list(
            "scan.id = ?1 and organization.id = ?2 order by detectedAt desc",
            scanId, jwtContext.getOrganizationId());
        return Response.ok(findings.stream().map(FindingResponse::from).toList()).build();
    }

    @GET
    @Path("/{id}")
    public Response getFinding(@PathParam("id") UUID findingId) {
        try {
            var finding = findingService.getFinding(findingId, jwtContext.getOrganizationId());
            return Response.ok(FindingResponse.from(finding)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }

    public record ErrorResponse(String error) {
    }
}
