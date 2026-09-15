package com.cyberas.api.resource;

import com.cyberas.domain.entity.Invitation;
import com.cyberas.domain.entity.Organization;
import com.cyberas.domain.entity.User;
import com.cyberas.security.JwtContext;
import com.cyberas.security.Roles;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

/**
 * Invitations d'équipe.
 *
 * <h2>Pourquoi un lien plutôt qu'un compte créé d'office</h2>
 *
 * <p>Créer directement le compte d'un collègue oblige à choisir son mot de
 * passe puis à le lui transmettre — par un canal qui n'est jamais sûr. Le lien
 * d'invitation inverse la charge : la personne invitée choisit elle-même son
 * mot de passe, et le lien devient inutilisable dès qu'il a servi.
 *
 * <h2>Ce qui est conservé</h2>
 *
 * <p>Qui a invité, quand, avec quel rôle, si le lien a servi et par qui, s'il a
 * été révoqué. Une invitation acceptée ou révoquée n'est jamais supprimée : la
 * traçabilité des accès est précisément ce qu'un audit demande à voir, et un
 * historique dont on retire les entrées gênantes n'est pas un historique.
 *
 * <p><strong>Le code n'est renvoyé qu'à la création.</strong> Les relectures
 * n'exposent que son empreinte visible — quelques caractères — de sorte qu'une
 * fuite de la liste ne donne accès à rien.
 */
@Path("/invitations")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class InvitationResource {

    /** Durée de validité par défaut. Un lien éternel finit par circuler. */
    private static final int DEFAULT_VALIDITY_DAYS = 7;

    private static final SecureRandom RANDOM = new SecureRandom();

    @Inject
    JwtContext jwtContext;

    /**
     * Crée un lien d'invitation.
     *
     * <p>Réservé aux rôles qui administrent l'organisation : inviter quelqu'un,
     * c'est lui ouvrir les données de l'entreprise.
     */
    @POST
    @Transactional
    public Response create(CreateRequest request) {
        if (!canManageTeam()) {
            return forbidden();
        }

        String role = Roles.normalize(request == null ? null : request.role);
        int days = request == null || request.validityDays == null
            ? DEFAULT_VALIDITY_DAYS
            : Math.max(1, Math.min(90, request.validityDays));

        Organization org = Organization.findById(jwtContext.getOrganizationId());
        if (org == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse("Organisation introuvable")).build();
        }

        Invitation invitation = new Invitation();
        invitation.organization = org;
        invitation.code = newCode();
        invitation.email = request == null || request.email == null || request.email.isBlank()
            ? null : request.email.trim().toLowerCase();
        invitation.role = role;
        invitation.expiresAt = LocalDateTime.now().plusDays(days);
        invitation.createdBy = User.findById(jwtContext.getUserId());
        invitation.persist();

        // Le code complet n'apparaît qu'ici, une seule fois.
        return Response.status(Response.Status.CREATED)
            .entity(new CreatedInvitation(
                invitation.id, invitation.code, invitation.role,
                invitation.email, invitation.expiresAt,
                "/inscription?invitation=" + invitation.code))
            .build();
    }

    /** Invitations de l'organisation, code masqué. */
    @GET
    public Response list() {
        if (!canManageTeam()) {
            return forbidden();
        }

        List<Invitation> rows = Invitation.list(
            "organization.id = ?1 order by createdAt desc", jwtContext.getOrganizationId());

        return Response.ok(rows.stream().map(InvitationResponse::from).toList()).build();
    }

    /**
     * Révoque une invitation.
     *
     * <p>La ligne est marquée, pas supprimée : savoir qu'un accès a été ouvert
     * puis fermé fait partie de ce qu'un audit vient vérifier.
     */
    @DELETE
    @Path("/{id}")
    @Transactional
    public Response revoke(@PathParam("id") UUID id) {
        if (!canManageTeam()) {
            return forbidden();
        }

        Invitation invitation = Invitation.find(
            "id = ?1 and organization.id = ?2", id, jwtContext.getOrganizationId())
            .firstResult();

        if (invitation == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse("Invitation introuvable")).build();
        }
        if (invitation.usedAt != null) {
            return Response.status(Response.Status.CONFLICT)
                .entity(new ErrorResponse(
                    "Cette invitation a déjà été utilisée. Révoquez l'accès du compte concerné."))
                .build();
        }

        invitation.revokedAt = LocalDateTime.now();
        invitation.persist();
        return Response.ok(InvitationResponse.from(invitation)).build();
    }

    /**
     * Un lien d'invitation est-il exploitable ?
     *
     * <p>Route ouverte : celui qui suit le lien n'a pas encore de compte. Elle
     * révèle la validité, le rôle proposé et le nom de l'organisation — celui
     * qui s'apprête à créer un compte doit voir où il entre, sinon une société
     * inscrite dans un projet ne saurait pas qu'elle rejoint bien la sienne.
     * Rien d'autre : ni l'auteur, ni le détail de l'organisation. Le code fait
     * 192 bits ; il n'est pas devinable, et ne s'apprend qu'en le recevant.
     */
    @GET
    @Path("/check/{code}")
    public Response check(@PathParam("code") String code) {
        Invitation invitation = Invitation.find("code = ?1", code).firstResult();

        if (invitation == null || invitation.revokedAt != null) {
            return Response.ok(new CheckResponse(false, null, "Lien invalide ou révoqué.", null, null, null, null)).build();
        }
        if (invitation.usedAt != null) {
            return Response.ok(new CheckResponse(false, null, "Ce lien a déjà été utilisé.", null, null, null, null)).build();
        }
        if (invitation.expiresAt != null && invitation.expiresAt.isBefore(LocalDateTime.now())) {
            return Response.ok(new CheckResponse(false, null, "Ce lien a expiré.", null, null, null, null)).build();
        }
        // Compte déjà créé pour cette adresse : le lien l'active au lieu d'en
        // créer un. L'écran verrouille l'adresse et pré-remplit le nom.
        User account = invitation.email == null || invitation.organization == null ? null
            : User.find("organization.id = ?1 and email = ?2",
                invitation.organization.id, invitation.email).firstResult();
        return Response.ok(new CheckResponse(true, invitation.role, null,
            invitation.organization == null ? null : invitation.organization.name,
            account == null ? null : account.email,
            account == null ? null : account.firstName,
            account == null ? null : account.lastName)).build();
    }

    // -----------------------------------------------------------------------

    /**
     * Code d'invitation.
     *
     * <p>Tiré d'un générateur cryptographique et encodé sans caractère
     * nécessitant un échappement dans une URL. Un identifiant séquentiel, ou
     * même un UUID ordinaire, serait devinable par énumération.
     *
     * <p><strong>24 octets et non 32</strong> : la colonne qui reçoit ce code
     * est déclarée {@code varchar(40)}, et 32 octets produisent 43 caractères
     * en base64 — l'insertion échouait. 24 octets donnent 32 caractères, qui
     * tiennent avec de la marge.
     *
     * <p>Cela reste 192 bits d'entropie. L'écart avec 256 n'a aucune portée
     * pratique : les deux sont hors de portée d'une énumération, et élargir la
     * colonne par migration pour gagner des bits inutilisables aurait été un
     * changement de schéma sans bénéfice.
     */
    private String newCode() {
        byte[] bytes = new byte[24];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private boolean canManageTeam() {
        if (!jwtContext.isAuthenticated()) {
            return false;
        }
        String role = Roles.normalize(jwtContext.getRole());
        return Roles.ADMIN.equals(role) || Roles.RSSI.equals(role);
    }

    private Response forbidden() {
        if (!jwtContext.isAuthenticated()) {
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity(new ErrorResponse("Authentification requise")).build();
        }
        return Response.status(Response.Status.FORBIDDEN)
            .entity(new ErrorResponse(
                "Seuls les rôles ADMIN et RSSI peuvent gérer les accès de l'équipe.")).build();
    }

    public static class CreateRequest {
        /** ADMIN, RSSI, AUDITOR ou VIEWER. Toute autre valeur devient VIEWER. */
        @Size(max = 30)
        public String role;

        /** Destinataire attendu, facultatif : sert au suivi, pas au contrôle. */
        @Email
        @Size(max = 255)
        public String email;

        /** Validité en jours, bornée entre 1 et 90. */
        public Integer validityDays;
    }

    /** Réponse de création : seule occasion où le code complet est renvoyé. */
    public record CreatedInvitation(
        UUID id, String code, String role, String email,
        LocalDateTime expiresAt, String path) {}

    public record InvitationResponse(
        UUID id,
        /** Quelques caractères, pour reconnaître un lien sans pouvoir s'en servir. */
        String codeHint,
        String role,
        String email,
        String status,
        LocalDateTime expiresAt,
        LocalDateTime usedAt,
        String usedByEmail,
        LocalDateTime revokedAt,
        LocalDateTime createdAt,
        String createdByEmail
    ) {
        static InvitationResponse from(Invitation i) {
            String status = i.revokedAt != null ? "REVOKED"
                : i.usedAt != null ? "USED"
                : (i.expiresAt != null && i.expiresAt.isBefore(LocalDateTime.now())) ? "EXPIRED"
                : "PENDING";

            return new InvitationResponse(
                i.id,
                i.code == null || i.code.length() < 8 ? "…" : i.code.substring(0, 8) + "…",
                i.role, i.email, status, i.expiresAt, i.usedAt,
                i.usedBy == null ? null : i.usedBy.email,
                i.revokedAt, i.createdAt,
                i.createdBy == null ? null : i.createdBy.email);
        }
    }

    public record CheckResponse(boolean valid, String role, String reason, String organizationName,
                                /** Adresse du compte pré-créé que ce lien active ; null s'il faut en créer un. */
                                String accountEmail, String firstName, String lastName) {}

    public record ErrorResponse(String error) {}
}
