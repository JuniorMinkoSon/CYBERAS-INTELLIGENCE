package com.cyberas.api.resource;

import com.cyberas.domain.entity.Control;
import com.cyberas.domain.entity.Framework;
import com.cyberas.domain.entity.FrameworkVersion;
import com.cyberas.domain.entity.QuestionControlMapping;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Référentiels, versions et contrôles.
 *
 * <p>Catalogue pur : ces données ne dépendent d'aucun audit et ne portent aucune
 * information d'organisation. Elles décrivent ce qui <em>peut</em> être évalué,
 * pas ce qui l'a été — d'où l'absence de contrôle d'accès par organisation, à la
 * différence des ressources qui manipulent des missions.
 *
 * <p>Le référentiel est désigné par son code (« ISO27001 ») plutôt que par son
 * identifiant technique : un code est stable, lisible dans une URL et connu du
 * frontend, là où l'UUID varie d'un environnement à l'autre. L'identifiant reste
 * accepté, pour les appels qui l'ont déjà sous la main.
 */
@Path("/frameworks")
@Produces(MediaType.APPLICATION_JSON)
public class FrameworkResource {

    /** Référentiels connus. */
    @GET
    public List<FrameworkResponse> list(@QueryParam("activeOnly") Boolean activeOnly) {
        List<Framework> frameworks = Boolean.TRUE.equals(activeOnly)
            ? Framework.list("active = true order by code")
            : Framework.listAll();
        return frameworks.stream().map(FrameworkResponse::new).toList();
    }

    @GET
    @Path("/{id}")
    public FrameworkResponse get(@PathParam("id") String id) {
        return new FrameworkResponse(resolve(id));
    }

    @GET
    @Path("/{id}/versions")
    public List<VersionResponse> versions(@PathParam("id") String id) {
        Framework framework = resolve(id);
        return FrameworkVersion.findByFramework(framework.id).stream()
            .map(VersionResponse::new).toList();
    }

    /**
     * Contrôles d'un référentiel.
     *
     * <p>Sans paramètre {@code version}, la version en vigueur est retenue :
     * c'est celle sur laquelle un nouvel audit doit démarrer. Le paramètre reste
     * disponible pour relire un audit mené sur une révision antérieure.
     */
    @GET
    @Path("/{id}/controls")
    public List<ControlResponse> controls(@PathParam("id") String id,
                                          @QueryParam("version") String version) {
        FrameworkVersion frameworkVersion = resolveVersion(id, version);

        // Les rattachements sont chargés en une fois puis regroupés : les
        // demander contrôle par contrôle produirait 93 requêtes pour une page.
        Map<UUID, List<QuestionControlMapping>> mappings =
            QuestionControlMapping.findByVersion(frameworkVersion.id).stream()
                .collect(Collectors.groupingBy(m -> m.control.id));

        return Control.findByVersion(frameworkVersion.id).stream()
            .map(c -> new ControlResponse(c, mappings.getOrDefault(c.id, List.of())))
            .toList();
    }

    @GET
    @Path("/{id}/controls/{controlId}")
    public ControlResponse control(@PathParam("id") String id,
                                   @PathParam("controlId") String controlId,
                                   @QueryParam("version") String version) {
        FrameworkVersion frameworkVersion = resolveVersion(id, version);

        Control control = Control.findByVersionAndCode(frameworkVersion.id, controlId);
        if (control == null) {
            control = parseUuid(controlId)
                .map(uuid -> (Control) Control.findById(uuid))
                .orElse(null);
        }
        if (control == null || !control.frameworkVersion.id.equals(frameworkVersion.id)) {
            throw new NotFoundException("Contrôle introuvable : " + controlId);
        }

        return new ControlResponse(control,
            QuestionControlMapping.list("control.id = ?1", control.id));
    }

    // -----------------------------------------------------------------------

    private static Framework resolve(String id) {
        Framework framework = Framework.findByCode(id);
        if (framework == null) {
            framework = parseUuid(id).map(uuid -> (Framework) Framework.findById(uuid)).orElse(null);
        }
        if (framework == null) {
            throw new NotFoundException("Référentiel introuvable : " + id);
        }
        return framework;
    }

    private static FrameworkVersion resolveVersion(String id, String version) {
        Framework framework = resolve(id);

        FrameworkVersion resolved = version == null || version.isBlank()
            ? FrameworkVersion.find("framework.id = ?1 and status = ?2",
                framework.id, FrameworkVersion.ACTIVE).firstResult()
            : FrameworkVersion.find("framework.id = ?1 and version = ?2",
                framework.id, version).firstResult();

        if (resolved == null) {
            throw new NotFoundException(version == null || version.isBlank()
                ? "Aucune version en vigueur pour " + framework.code
                : "Version introuvable : " + framework.code + " " + version);
        }
        return resolved;
    }

    private static java.util.Optional<UUID> parseUuid(String value) {
        try {
            return java.util.Optional.of(UUID.fromString(value));
        } catch (IllegalArgumentException e) {
            return java.util.Optional.empty();
        }
    }

    // -----------------------------------------------------------------------

    public record FrameworkResponse(
        UUID id, String code, String name, String description,
        String provider, String referenceUrl, boolean active
    ) {
        FrameworkResponse(Framework f) {
            this(f.id, f.code, f.name, f.description, f.provider, f.referenceUrl,
                Boolean.TRUE.equals(f.active));
        }
    }

    public record VersionResponse(
        UUID id, String version, String status, LocalDate effectiveFrom, long controlCount
    ) {
        VersionResponse(FrameworkVersion v) {
            this(v.id, v.version, v.status, v.effectiveFrom,
                Control.count("frameworkVersion.id = ?1 and active = true", v.id));
        }
    }

    /**
     * Contrôle et ses rattachements.
     *
     * <p>{@code questionCodes} dit quelles questions Cyberas alimentent ce
     * contrôle, et {@code needsReview} signale qu'au moins un rattachement reste
     * à trancher. Sans cette information, un score par référentiel donnerait le
     * même poids à une correspondance établie et à une correspondance
     * approximative.
     */
    public record ControlResponse(
        UUID id, String code, String title, String description,
        String category, String domain, int weight, int position,
        List<String> questionCodes, boolean mapped, boolean needsReview
    ) {
        ControlResponse(Control c, List<QuestionControlMapping> mappings) {
            this(c.id, c.code, c.title, c.description, c.category, c.domain,
                c.weight, c.position,
                mappings.stream().map(m -> m.question.code).sorted().toList(),
                !mappings.isEmpty(),
                mappings.stream().anyMatch(
                    m -> QuestionControlMapping.REVIEW_REQUIRED.equals(m.status)));
        }
    }
}
