package com.cyberas.domain.service;

import com.cyberas.api.dto.AuditDtos;
import com.cyberas.domain.entity.Audit;
import com.cyberas.domain.entity.AuditVersion;
import com.cyberas.domain.entity.Organization;
import com.cyberas.domain.repository.AuditRepository;
import com.cyberas.domain.repository.AuditVersionRepository;
import com.cyberas.domain.repository.OrganizationRepository;
import com.cyberas.domain.repository.UserRepository;
import com.cyberas.security.JwtContext;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
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

        audit.persist();

        // Create initial version
        AuditVersion version = createInitialVersion(audit);
        audit.currentVersionId = version.id;
        audit.persist();

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
        audit.persist();

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
        return new AuditDtos.AuditResponse(
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
    }

    private AuditDtos.AuditVersionResponse toVersionResponse(AuditVersion version) {
        return new AuditDtos.AuditVersionResponse(
            version.id,
            version.versionNumber,
            version.title,
            version.status,
            version.hash,
            version.publishedAt,
            version.createdAt
        );
    }
}
