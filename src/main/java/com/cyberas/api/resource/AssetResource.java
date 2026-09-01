package com.cyberas.api.resource;

import com.cyberas.api.error.ApiExceptionMapper.NotFoundException;
import com.cyberas.domain.entity.Asset;
import com.cyberas.domain.entity.Audit;
import com.cyberas.domain.repository.AssetRepository;
import com.cyberas.domain.repository.OrganizationRepository;
import com.cyberas.domain.service.AuditAccessService;
import com.cyberas.domain.service.AuditTrailService;
import com.cyberas.security.JwtContext;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Path("/assets")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AssetResource {

    private static final Set<String> CRITICALITIES = Set.of("LOW", "MEDIUM", "HIGH", "CRITICAL");
    private static final Set<String> TYPES = Set.of(
        "SERVER", "WORKSTATION", "NETWORK", "APPLICATION", "DATABASE", "CLOUD", "IOT", "OTHER");
    private static final Set<String> ENVIRONMENTS = Set.of("PRODUCTION", "PREPRODUCTION", "TEST", "DEVELOPMENT");

    @Inject
    AssetRepository assetRepository;

    @Inject
    OrganizationRepository organizationRepository;

    @Inject
    AuditAccessService auditAccess;

    @Inject
    AuditTrailService auditTrail;

    @Inject
    JwtContext jwtContext;

    @GET
    public List<AssetResponse> list(@QueryParam("auditId") UUID auditId) {
        UUID orgId = jwtContext.getOrganizationId();
        List<Asset> assets = auditId == null
            ? assetRepository.list("organization.id = ?1 order by createdAt desc", orgId)
            : assetRepository.list("organization.id = ?1 and audit.id = ?2 order by createdAt desc", orgId, auditId);
        return assets.stream().map(AssetResponse::new).toList();
    }

    @GET
    @Path("/{id}")
    public AssetResponse get(@PathParam("id") UUID id) {
        return new AssetResponse(require(id));
    }

    @POST
    @Transactional
    public Response create(AssetRequest request) {
        UUID orgId = jwtContext.getOrganizationId();
        Asset asset = new Asset();
        asset.organization = organizationRepository.findActiveById(orgId)
            .orElseThrow(() -> new IllegalStateException("Organisation introuvable"));
        apply(asset, request, orgId);
        asset.createdBy = auditAccess.currentUser();
        asset.persist();

        auditTrail.record(AuditTrailService.ASSET_CREATED, orgId,
            asset.audit != null ? asset.audit.id : null, "ASSET", asset.id,
            Map.of("hostname", nullSafe(asset.hostname), "ipAddress", nullSafe(asset.ipAddress)));

        return Response.status(Response.Status.CREATED).entity(new AssetResponse(asset)).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public AssetResponse update(@PathParam("id") UUID id, AssetRequest request) {
        Asset asset = require(id);
        apply(asset, request, jwtContext.getOrganizationId());
        asset.updatedAt = LocalDateTime.now();
        asset.persist();
        return new AssetResponse(asset);
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") UUID id) {
        Asset asset = require(id);
        asset.delete();
        return Response.noContent().build();
    }

    private Asset require(UUID id) {
        Asset asset = assetRepository.findById(id);
        if (asset == null || !asset.organization.id.equals(jwtContext.getOrganizationId())) {
            throw new NotFoundException("Actif introuvable");
        }
        return asset;
    }

    private void apply(Asset asset, AssetRequest r, UUID orgId) {
        if (r == null) {
            throw new IllegalArgumentException("Corps de requête requis");
        }
        String hostname = blankToNull(r.hostname);
        String ip = blankToNull(r.ipAddress);
        if (hostname == null && ip == null) {
            throw new IllegalArgumentException("Un hostname ou une adresse IP est requis");
        }
        asset.hostname = hostname;
        asset.ipAddress = ip;
        asset.assetType = enumValue(r.assetType, TYPES, "SERVER", "type d'actif");
        asset.operatingSystem = blankToNull(r.operatingSystem);
        asset.environment = enumValue(r.environment, ENVIRONMENTS, "PRODUCTION", "environnement");
        asset.criticality = enumValue(r.criticality, CRITICALITIES, "MEDIUM", "criticité");
        asset.internetExposed = Boolean.TRUE.equals(r.internetExposed);
        asset.owner = blankToNull(r.owner);
        asset.description = blankToNull(r.description);
        if (r.auditId != null) {
            Audit audit = auditAccess.requireAudit(r.auditId, orgId);
            asset.audit = audit;
        } else {
            asset.audit = null;
        }
    }

    private static String enumValue(String value, Set<String> allowed, String fallback, String label) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        String upper = value.trim().toUpperCase(Locale.ROOT);
        if (!allowed.contains(upper)) {
            throw new IllegalArgumentException("Valeur invalide pour " + label + " : " + value);
        }
        return upper;
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private static String nullSafe(String s) {
        return s == null ? "" : s;
    }

    public static class AssetRequest {
        public UUID auditId;
        public String hostname;
        public String ipAddress;
        public String assetType;
        public String operatingSystem;
        public String environment;
        public String criticality;
        public Boolean internetExposed;
        public String owner;
        public String description;
    }

    public static class AssetResponse {
        public UUID id;
        public UUID auditId;
        public String hostname;
        public String ipAddress;
        public String assetType;
        public String operatingSystem;
        public String environment;
        public String criticality;
        public Boolean internetExposed;
        public String owner;
        public String description;
        public LocalDateTime createdAt;
        public LocalDateTime updatedAt;

        public AssetResponse(Asset a) {
            this.id = a.id;
            this.auditId = a.audit != null ? a.audit.id : null;
            this.hostname = a.hostname;
            this.ipAddress = a.ipAddress;
            this.assetType = a.assetType;
            this.operatingSystem = a.operatingSystem;
            this.environment = a.environment;
            this.criticality = a.criticality;
            this.internetExposed = a.internetExposed;
            this.owner = a.owner;
            this.description = a.description;
            this.createdAt = a.createdAt;
            this.updatedAt = a.updatedAt;
        }
    }
}
