package com.cyberas.api.resource;

import com.cyberas.domain.service.FindingService;
import com.cyberas.security.JwtContext;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.UUID;

@Path("/findings")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FindingResource {

    @Inject
    FindingService findingService;

    @Inject
    JwtContext jwtContext;

    @GET
    public Response listFindings() {
        var findings = findingService.listFindingsByOrganization(jwtContext.getOrganizationId());
        return Response.ok(findings).build();
    }

    @GET
    @Path("/{id}")
    public Response getFinding(@PathParam("id") UUID findingId) {
        try {
            var finding = findingService.getFinding(findingId, jwtContext.getOrganizationId());
            return Response.ok(finding).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }

    public static class ErrorResponse {
        public String error;

        public ErrorResponse(String error) {
            this.error = error;
        }
    }
}
