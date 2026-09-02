package com.cyberas.domain.service;

import com.cyberas.api.dto.AuditDtos;
import com.cyberas.domain.entity.Audit;
import com.cyberas.domain.entity.AuditVersion;
import com.cyberas.domain.entity.Organization;
import com.cyberas.domain.framework.FrameworkCatalog;
import com.cyberas.domain.repository.AuditRepository;
import com.cyberas.domain.repository.AuditVersionRepository;
import com.cyberas.domain.repository.OrganizationRepository;
import com.cyberas.domain.repository.UserRepository;
import com.cyberas.security.JwtContext;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.security.MessageDigest;

@ApplicationScoped
public class AuditService {

    @Inject
    AuditRepository auditRepository;

    @Inject
    AuditVersionRepository auditVersionRepository;

    @Inject
    OrganizationRepository organizationRepository;

    @Inject
    UserRepository userRepository;

    @Inject
    JwtContext jwtContext;

    @Inject
    AuditTrailService auditTrail;

    @Inject
    ObjectMapper objectMapper;

    private static final Set<String> STATUSES = Set.of("DRAFT", "IN_PROGRESS", "COMPLETED", "PUBLISHED", "ARCHIVED");

    public List<AuditDtos.AuditResponse> listAudits(UUID organizationId) {
        return auditRepository.find("organization.id = ?1 order by createdAt desc", organizationId)
            .list().stream().map(this::toResponse).toList();
    }

    public List<AuditDtos.AuditVersionResponse> listVersions(UUID auditId, UUID organizationId) {
        requireAudit(auditId, organizationId);
        return auditVersionRepository.findByAuditId(auditId).stream().map(this::toVersionResponse).toList();
    }

    @Transactional
    public AuditDtos.AuditResponse updateAudit(UUID auditId, AuditDtos.UpdateAuditRequest request, UUID organizationId) {
        Audit audit = requireAudit(auditId, organizationId);
        if (request.title != null && !request.title.isBlank()) audit.title = request.title.trim();
        if (request.description != null) audit.description = request.description;
        if (request.status != null) {
            String status = request.status.trim().toUpperCase(Locale.ROOT);
            if (!STATUSES.contains(status)) {
                throw new IllegalArgumentException("Statut d'audit invalide : " + request.status);
            }
            audit.status = status;
        }
        if (request.scheduledStartDate != null) audit.scheduledStartDate = request.scheduledStartDate;
        if (request.scheduledEndDate != null) audit.scheduledEndDate = request.scheduledEndDate;
        if (request.frameworks != null) audit.frameworks = toFrameworksJson(request.frameworks);
        audit.updatedBy = userRepository.findActiveById(jwtContext.getUserId()).orElse(null);
        audit.updatedAt = LocalDateTime.now();
        audit.persist();

        auditTrail.record(AuditTrailService.AUDIT_UPDATED, organizationId, audit.id, "AUDIT", audit.id,
            Map.of("auditCode", audit.auditCode, "status", audit.status,
                   "frameworks", String.join(",", frameworkCodes(audit))));
        return toResponse(audit);
    }

    private Audit requireAudit(UUID auditId, UUID organizationId) {
        var audit = auditRepository.findActiveById(auditId)
            .orElseThrow(() -> new IllegalArgumentException("Audit not found"));
        if (!audit.organization.id.equals(organizationId)) {
            throw new IllegalArgumentException("Audit not found");
        }
        return audit;
    }

    private ArrayNode toFrameworksJson(List<String> codes) {
        Set<String> known = FrameworkCatalog.FRAMEWORKS.stream().map(FrameworkCatalog.Framework::code)
            .collect(java.util.stream.Collectors.toSet());
        ArrayNode node = objectMapper.createArrayNode();
        for (String code : codes) {
            if (code == null) continue;
            String upper = code.trim().toUpperCase(Locale.ROOT);
            if (!known.contains(upper)) {
                throw new IllegalArgumentException("Référentiel inconnu : " + code);
            }
            node.add(upper);
        }
        return node;
    }

    public static List<String> frameworkCodes(Audit audit) {
        List<String> codes = new ArrayList<>();
        if (audit.frameworks != null && audit.frameworks.isArray()) {
            audit.frameworks.forEach(n -> codes.add(n.asText()));
        }
        return codes;
    }

    @Transactional
    public AuditDtos.AuditResponse createAudit(AuditDtos.CreateAuditRequest request, UUID organizationId) {
        var org = organizationRepository.findActiveById(organizationId)
            .orElseThrow(() -> new IllegalArgumentException("Organization not found"));

        if (auditRepository.findByCodeInOrg(request.auditCode, organizationId).isPresent()) {
            throw new IllegalArgumentException("Audit code already exists in this organization");
        }

        Audit audit = new Audit();
        audit.auditCode = request.auditCode;
        audit.title = request.title;
        audit.description = request.description;
        audit.organization = org;
        audit.status = "DRAFT";
        audit.createdBy = userRepository.findActiveById(jwtContext.getUserId()).orElse(null);
        audit.createdAt = LocalDateTime.now();
        audit.version = 1;

        if (request.clientOrganizationId != null) {
            var clientOrg = organizationRepository.findActiveById(request.clientOrganizationId)
                .orElseThrow(() -> new IllegalArgumentException("Client organization not found"));
            audit.clientOrganization = clientOrg;
        }

        if (request.scheduledStartDate != null) audit.scheduledStartDate = request.scheduledStartDate;
        if (request.scheduledEndDate != null) audit.scheduledEndDate = request.scheduledEndDate;
        if (request.frameworks != null) audit.frameworks = toFrameworksJson(request.frameworks);

        audit.persist();

        // Create initial version
        AuditVersion version = createInitialVersion(audit);
        audit.currentVersionId = version.id;
        audit.persist();

        auditTrail.record(AuditTrailService.AUDIT_CREATED, organizationId, audit.id, "AUDIT", audit.id,
            Map.of("auditCode", audit.auditCode, "title", audit.title, "version", 1));

        return toResponse(audit);
    }

    @Transactional
    public AuditDtos.AuditVersionResponse createVersion(UUID auditId, AuditDtos.CreateAuditVersionRequest request,
                                                        UUID organizationId) {
        var audit = auditRepository.findActiveById(auditId)
            .orElseThrow(() -> new IllegalArgumentException("Audit not found"));

        if (!audit.organization.id.equals(organizationId)) {
            throw new IllegalArgumentException("Audit does not belong to this organization");
        }

        var currentVersion = auditVersionRepository.findLatestByAuditId(auditId)
            .orElseThrow(() -> new IllegalArgumentException("Current version not found"));

        AuditVersion newVersion = new AuditVersion();
        newVersion.audit = audit;
        newVersion.organization = audit.organization;
        newVersion.versionNumber = currentVersion.versionNumber + 1;
        newVersion.title = request.title != null ? request.title : currentVersion.title;
        newVersion.description = request.description != null ? request.description : currentVersion.description;
        newVersion.status = "DRAFT";
        newVersion.parentVersion = currentVersion;
        newVersion.changeSummary = request.changeSummary;
        newVersion.createdBy = userRepository.findActiveById(jwtContext.getUserId()).orElse(null);
        newVersion.createdAt = LocalDateTime.now();
        newVersion.persist();

        audit.currentVersionId = newVersion.id;
        audit.version = newVersion.versionNumber;
        audit.persist();

        auditTrail.record(AuditTrailService.VERSION_CREATED, organizationId, audit.id, "AUDIT_VERSION", newVersion.id,
            Map.of("auditCode", audit.auditCode, "version", newVersion.versionNumber,
                   "changeSummary", request.changeSummary == null ? "" : request.changeSummary));

        return toVersionResponse(newVersion);
    }

    @Transactional
    public AuditDtos.AuditVersionResponse publishVersion(UUID auditId, UUID versionId,
                                                         AuditDtos.PublishAuditVersionRequest request,
                                                         UUID organizationId) {
        var version = auditVersionRepository.find("id = ?1 and audit.id = ?2", versionId, auditId)
            .firstResultOptional()
            .orElseThrow(() -> new IllegalArgumentException("Version not found"));

        if (!version.organization.id.equals(organizationId)) {
            throw new IllegalArgumentException("Version does not belong to this organization");
        }

        version.status = "PUBLISHED";
        version.publishedAt = LocalDateTime.now();
        version.publishedBy = userRepository.findActiveById(jwtContext.getUserId()).orElse(null);
        version.hash = generateHash(versionId.toString());
        version.lockedAt = LocalDateTime.now();
        version.persist();

        auditTrail.record(AuditTrailService.VERSION_PUBLISHED, organizationId, auditId, "AUDIT_VERSION", version.id,
            Map.of("version", version.versionNumber, "hash", version.hash));

        return toVersionResponse(version);
    }

    public AuditDtos.AuditResponse getAudit(UUID auditId, UUID organizationId) {
        var audit = auditRepository.findActiveById(auditId)
            .orElseThrow(() -> new IllegalArgumentException("Audit not found"));

        if (!audit.organization.id.equals(organizationId)) {
            throw new IllegalArgumentException("Audit does not belong to this organization");
        }

        return toResponse(audit);
    }

    private AuditVersion createInitialVersion(Audit audit) {
        AuditVersion version = new AuditVersion();
        version.audit = audit;
        version.organization = audit.organization;
        version.versionNumber = 1;
        version.title = audit.title;
        version.description = audit.description;
        version.status = "DRAFT";
        version.createdBy = audit.createdBy;
        version.createdAt = LocalDateTime.now();
        version.persist();
        return version;
    }

    private String generateHash(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] messageDigest = md.digest(input.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : messageDigest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            return UUID.randomUUID().toString();
        }
    }

    private AuditDtos.AuditResponse toResponse(Audit audit) {
        var response = new AuditDtos.AuditResponse(
            audit.id,
            audit.auditCode,
            audit.title,
            audit.description,
            audit.status,
            audit.version,
            audit.currentVersionId,
            audit.createdAt,
            audit.createdBy != null ? audit.createdBy.email : null
        );
        response.currentVersionNumber = audit.version;
        response.updatedAt = audit.updatedAt;
        response.scheduledStartDate = audit.scheduledStartDate;
        response.scheduledEndDate = audit.scheduledEndDate;
        response.frameworks = frameworkCodes(audit);
        return response;
    }

    private AuditDtos.AuditVersionResponse toVersionResponse(AuditVersion version) {
        var response = new AuditDtos.AuditVersionResponse(
            version.id,
            version.versionNumber,
            version.title,
            version.status,
            version.hash,
            version.publishedAt,
            version.createdAt
        );
        response.changeSummary = version.changeSummary;
        response.createdByEmail = version.createdBy != null ? version.createdBy.email : null;
        return response;
    }
}
