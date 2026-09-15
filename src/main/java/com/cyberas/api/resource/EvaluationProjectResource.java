package com.cyberas.api.resource;

import com.cyberas.domain.service.EvaluationProjectService;
import com.cyberas.security.PlatformAccess;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Projets d'évaluation — administration de la plateforme.
 *
 * <p>Comme {@link PlatformAdminResource}, cette ressource regarde plusieurs
 * organisations à la fois : elle en crée, y ouvre des audits, en lit les
 * réponses. Chaque méthode commence donc par le même contrôle, et un refus
 * est renvoyé avant toute lecture.
 */
@Path("/admin/projects")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EvaluationProjectResource {

    @Inject
    PlatformAccess access;

    @Inject
    EvaluationProjectService projects;

    @GET
    public Response list() {
        Response denied = access.requirePlatformAdmin();
        if (denied != null) return denied;
        return Response.ok(projects.listProjects()).build();
    }

    @POST
    public Response create(@Valid CreateProjectRequest request) {
        Response denied = access.requirePlatformAdmin();
        if (denied != null) return denied;
        return Response.status(Response.Status.CREATED)
            .entity(projects.createProject(request.name, request.description, request.deadline))
            .build();
    }

    /** Le projet et ses sociétés, classées par mérite. */
    @GET
    @Path("/{id}")
    public Response detail(@PathParam("id") UUID id) {
        Response denied = access.requirePlatformAdmin();
        if (denied != null) return denied;
        return Response.ok(projects.detail(id)).build();
    }

    /** Recalcule les scores à partir des constats, puis renvoie le classement. */
    @POST
    @Path("/{id}/evaluate")
    public Response evaluate(@PathParam("id") UUID id) {
        Response denied = access.requirePlatformAdmin();
        if (denied != null) return denied;
        return Response.ok(projects.evaluate(id)).build();
    }

    @POST
    @Path("/{id}/close")
    public Response close(@PathParam("id") UUID id) {
        Response denied = access.requirePlatformAdmin();
        if (denied != null) return denied;
        return Response.ok(projects.closeProject(id, true)).build();
    }

    @POST
    @Path("/{id}/reopen")
    public Response reopen(@PathParam("id") UUID id) {
        Response denied = access.requirePlatformAdmin();
        if (denied != null) return denied;
        return Response.ok(projects.closeProject(id, false)).build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") UUID id) {
        Response denied = access.requirePlatformAdmin();
        if (denied != null) return denied;
        projects.deleteProject(id);
        return Response.noContent().build();
    }

    /**
     * Inscrit une société : organisation, audit du projet et lien d'accès.
     * Le code du lien n'est renvoyé qu'ici.
     */
    @POST
    @Path("/{id}/participants")
    public Response addParticipant(@PathParam("id") UUID id, @Valid AddParticipantRequest request) {
        Response denied = access.requirePlatformAdmin();
        if (denied != null) return denied;
        return Response.status(Response.Status.CREATED)
            .entity(projects.addParticipant(id, request.organizationName, request.sector,
                request.contactName, request.contactEmail))
            .build();
    }

    @POST
    @Path("/{id}/participants/{participantId}/invitation")
    public Response renewInvitation(@PathParam("id") UUID id, @PathParam("participantId") UUID participantId) {
        Response denied = access.requirePlatformAdmin();
        if (denied != null) return denied;
        return Response.status(Response.Status.CREATED)
            .entity(projects.renewInvitation(id, participantId)).build();
    }

    @DELETE
    @Path("/{id}/participants/{participantId}")
    public Response removeParticipant(@PathParam("id") UUID id, @PathParam("participantId") UUID participantId) {
        Response denied = access.requirePlatformAdmin();
        if (denied != null) return denied;
        projects.removeParticipant(id, participantId);
        return Response.noContent().build();
    }

    @GET
    @Path("/{id}/participants/{participantId}/answers")
    public Response answers(@PathParam("id") UUID id, @PathParam("participantId") UUID participantId) {
        Response denied = access.requirePlatformAdmin();
        if (denied != null) return denied;
        return Response.ok(projects.answersOf(id, participantId)).build();
    }

    public static class CreateProjectRequest {
        @NotBlank
        @Size(min = 3, max = 200)
        public String name;

        @Size(max = 5000)
        public String description;

        public LocalDate deadline;
    }

    public static class AddParticipantRequest {
        @NotBlank
        @Size(min = 2, max = 255)
        public String organizationName;

        @Size(max = 50)
        public String sector;

        @Size(max = 200)
        public String contactName;

        @Email
        @Size(max = 255)
        public String contactEmail;
    }
}
