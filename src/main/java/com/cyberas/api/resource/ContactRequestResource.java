package com.cyberas.api.resource;

import com.cyberas.domain.entity.ContactRequest;
import com.cyberas.domain.risk.BusinessSector;
import com.cyberas.security.JwtContext;
import com.cyberas.security.Roles;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Demandes entrantes du site public.
 *
 * <h2>Deux publics, une ressource</h2>
 *
 * <p>Le dépôt ({@code POST}) est ouvert : celui qui remplit le formulaire de
 * contact ou de démonstration n'a pas de compte, c'est le principe même de la
 * démarche. La lecture est fermée : la boîte de réception contient les
 * coordonnées de prospects, et la publier serait une fuite de données
 * personnelles.
 *
 * <p>Cette asymétrie est portée à deux endroits qui doivent rester d'accord :
 * le filtre d'authentification n'ouvre que le POST sur le chemin exact, et
 * chaque méthode de lecture vérifie ici l'authentification. La redondance est
 * volontaire — une seule des deux barrières oubliée ne suffit pas à exposer la
 * liste.
 */
@Path("/contact-requests")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ContactRequestResource {

    @Inject
    JwtContext jwtContext;

    /**
     * Dépose une demande. Route publique.
     *
     * <p>La réponse ne renvoie pas la demande enregistrée : elle serait un
     * moyen commode de vérifier ce que le serveur a retenu, et n'apporte rien à
     * l'auteur du formulaire. Un accusé suffit.
     */
    @POST
    @Transactional
    public Response submit(@Valid SubmitRequest request) {
        ContactRequest entry = new ContactRequest();

        entry.kind = ContactRequest.KIND_DEMO.equalsIgnoreCase(request.kind)
            ? ContactRequest.KIND_DEMO
            : ContactRequest.KIND_CONTACT;

        entry.fullName = request.fullName.trim();
        entry.email = request.email.trim().toLowerCase();
        entry.company = blankToNull(request.company);
        entry.phone = blankToNull(request.phone);
        entry.companySize = blankToNull(request.companySize);
        entry.message = blankToNull(request.message);
        entry.sourcePage = blankToNull(request.sourcePage);

        // Normalisé à l'écriture : une valeur inconnue devient AUTRE plutôt que
        // d'être stockée telle quelle et réinterprétée à chaque lecture.
        entry.sector = request.sector == null || request.sector.isBlank()
            ? null
            : BusinessSector.from(request.sector).name();

        entry.status = ContactRequest.STATUS_NEW;
        entry.persist();

        return Response.status(Response.Status.CREATED)
            .entity(new AcknowledgeResponse(true,
                "Votre demande a bien été enregistrée. Notre équipe vous recontacte sous 24h ouvrées."))
            .build();
    }

    /**
     * Boîte de réception. Réservée aux comptes authentifiés de la plateforme.
     *
     * @param status filtre facultatif (NEW, IN_PROGRESS, CLOSED)
     * @param kind   filtre facultatif (DEMO, CONTACT)
     */
    @GET
    public Response list(@QueryParam("status") String status,
                         @QueryParam("kind") String kind) {
        if (!isPlatformAdmin()) {
            return unauthorized();
        }

        StringBuilder query = new StringBuilder("1 = 1");
        java.util.List<Object> params = new java.util.ArrayList<>();

        if (status != null && !status.isBlank()) {
            query.append(" and status = ?").append(params.size() + 1);
            params.add(status.trim().toUpperCase());
        }
        if (kind != null && !kind.isBlank()) {
            query.append(" and kind = ?").append(params.size() + 1);
            params.add(kind.trim().toUpperCase());
        }
        // Les demandes les plus récentes en tête : c'est l'ordre dans lequel on
        // traite une boîte de réception.
        query.append(" order by createdAt desc");

        List<ContactRequest> rows = ContactRequest.list(query.toString(), params.toArray());
        return Response.ok(rows.stream().map(ContactRequestResponse::from).toList()).build();
    }

    /** Compteurs de la boîte de réception, pour la pastille du menu. */
    @GET
    @Path("/summary")
    public Response summary() {
        if (!isPlatformAdmin()) {
            return unauthorized();
        }
        return Response.ok(new SummaryResponse(
            ContactRequest.count(),
            ContactRequest.count("status = ?1", ContactRequest.STATUS_NEW),
            ContactRequest.count("kind = ?1", ContactRequest.KIND_DEMO),
            ContactRequest.count("kind = ?1", ContactRequest.KIND_CONTACT)
        )).build();
    }

    /** Avancement du traitement et note interne. */
    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") UUID id, UpdateRequest request) {
        if (!isPlatformAdmin()) {
            return unauthorized();
        }

        ContactRequest entry = ContactRequest.findById(id);
        if (entry == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse("Demande introuvable")).build();
        }

        if (request.status != null && !request.status.isBlank()) {
            String next = request.status.trim().toUpperCase();
            if (!List.of(ContactRequest.STATUS_NEW, ContactRequest.STATUS_IN_PROGRESS,
                         ContactRequest.STATUS_CLOSED).contains(next)) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Statut inconnu : " + request.status)).build();
            }
            entry.status = next;
        }
        if (request.handledNote != null) {
            entry.handledNote = blankToNull(request.handledNote);
        }
        entry.updatedAt = LocalDateTime.now();
        entry.persist();

        return Response.ok(ContactRequestResponse.from(entry)).build();
    }

    /**
     * La boîte de réception contient les coordonnées de prospects qui n'ont
     * consenti qu'à être recontactés. Sa lecture est réservée à
     * l'administration de la plateforme : un auditeur ou un RSSI client n'a
     * aucune raison d'y accéder.
     */
    private boolean isPlatformAdmin() {
        return jwtContext.isAuthenticated()
            && Roles.ADMIN.equals(Roles.normalize(jwtContext.getRole()));
    }

    private Response unauthorized() {
        if (!jwtContext.isAuthenticated()) {
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity(new ErrorResponse("Authentification requise")).build();
        }
        return Response.status(Response.Status.FORBIDDEN)
            .entity(new ErrorResponse("Réservé à l'administration de la plateforme")).build();
    }

    /** Une chaîne vide n'est pas une saisie : elle est ramenée à l'absence. */
    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    // -----------------------------------------------------------------------
    // Contrats
    // -----------------------------------------------------------------------

    public static class SubmitRequest {
        /** DEMO ou CONTACT ; toute autre valeur est traitée comme CONTACT. */
        @Size(max = 20)
        public String kind;

        @NotBlank
        @Size(min = 2, max = 200)
        public String fullName;

        @NotBlank
        @Email
        @Size(max = 255)
        public String email;

        @Size(max = 200)
        public String company;

        @Size(max = 50)
        public String phone;

        @Size(max = 50)
        public String sector;

        @Size(max = 50)
        public String companySize;

        @Size(max = 5000)
        public String message;

        @Size(max = 255)
        public String sourcePage;
    }

    public static class UpdateRequest {
        public String status;
        public String handledNote;
    }

    public record AcknowledgeResponse(boolean received, String message) {
    }

    public record SummaryResponse(long total, long pending, long demos, long contacts) {
    }

    public record ContactRequestResponse(
        UUID id,
        String kind,
        String fullName,
        String email,
        String company,
        String phone,
        String sector,
        String sectorLabel,
        String companySize,
        String message,
        String status,
        String handledNote,
        String sourcePage,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
    ) {
        public static ContactRequestResponse from(ContactRequest c) {
            return new ContactRequestResponse(
                c.id, c.kind, c.fullName, c.email, c.company, c.phone,
                c.sector,
                // Le libellé lisible accompagne le code : l'interface n'a pas à
                // maintenir sa propre table de correspondance des secteurs.
                c.sector == null ? null : BusinessSector.from(c.sector).label(),
                c.companySize, c.message, c.status, c.handledNote, c.sourcePage,
                c.createdAt, c.updatedAt
            );
        }
    }

    public record ErrorResponse(String error) {
    }
}
