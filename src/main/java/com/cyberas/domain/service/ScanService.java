package com.cyberas.domain.service;

import com.cyberas.domain.entity.*;
import com.cyberas.domain.repository.*;
import com.cyberas.domain.scanner.NmapScanner;
import com.cyberas.security.JwtContext;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class ScanService {

    @Inject
    AuditRepository auditRepository;

    @Inject
    AuditVersionRepository auditVersionRepository;

    @Inject
    ScanRepository scanRepository;

    @Inject
    FindingRepository findingRepository;

    @Inject
    UserRepository userRepository;

    @Inject
    NmapScanner nmapScanner;

    @Inject
    JwtContext jwtContext;

    @Inject
    ObjectMapper objectMapper;

    @Transactional
    public Scan createScan(UUID auditId, UUID auditVersionId, String target, String scannerType,
                          String profile, UUID organizationId) {
        var audit = auditRepository.findActiveById(auditId)
            .orElseThrow(() -> new IllegalArgumentException("Audit not found"));

        var version = auditVersionRepository.find("id = ?1 and audit.id = ?2", auditVersionId, auditId)
            .firstResultOptional()
            .orElseThrow(() -> new IllegalArgumentException("Audit version not found"));

        // Validate target is in scope (simplified - should check against scope/assets)
        if (!isTargetInScope(target, audit)) {
            throw new IllegalArgumentException("Target " + target + " is not in audit scope");
        }

        Scan scan = new Scan();
        scan.audit = audit;
        scan.auditVersion = version;
        scan.organization = audit.organization;
        scan.scannerType = scannerType;
        scan.target = target;
        scan.scanProfile = profile;
        scan.status = "QUEUED";
        scan.createdBy = userRepository.findActiveById(jwtContext.getUserId()).orElse(null);
        scan.createdAt = LocalDateTime.now();

        scan.persist();

        // Queue scan job asynchronously (in production, use Kafka/Job queue)
        executeScanAsync(scan);

        return scan;
    }

    @Transactional
    public void executeScanAsync(Scan scan) {
        try {
            scan.status = "RUNNING";
            scan.startedAt = LocalDateTime.now();
            scan.progress = 0;
            scan.persist();

            // Execute actual scan based on scanner type
            NmapScanner.ScanResult result = null;
            if ("NMAP".equals(scan.scannerType)) {
                result = nmapScanner.scan(scan.target, scan.scanProfile);
            } else {
                throw new IllegalArgumentException("Unsupported scanner: " + scan.scannerType);
            }

            // Store raw output
            scan.rawOutput = result.rawOutput;
            scan.parsedOutput = result.parsedFindings;
            scan.status = result.status;
            scan.durationSeconds = result.durationSeconds;
            scan.errorMessage = result.errorMessage;
            scan.hash = generateHash(result.rawOutput);
            scan.progress = 100;
            scan.finishedAt = LocalDateTime.now();
            scan.persist();

            // Create findings from parsed output
            if (result.parsedFindings != null && result.parsedFindings.isArray()) {
                result.parsedFindings.forEach(finding -> {
                    Finding f = new Finding();
                    f.scan = scan;
                    f.audit = scan.audit;
                    f.organization = scan.organization;
                    f.title = finding.get("title").asText("Unknown finding");
                    f.description = finding.get("description").asText("");
                    f.severity = finding.get("severity").asText("MEDIUM");
                    var cvssNode = finding.get("cvss_score");
                    f.cvssScore = cvssNode != null && !cvssNode.isNull() ? cvssNode.asDouble() : null;
                    f.cve = finding.get("cve").asText(null);
                    f.source = scan.scannerType;
                    f.sourceId = finding.get("port").asText("") + "/" + finding.get("protocol").asText("");
                    f.confidence = 1.0;
                    f.evidence = finding;
                    f.metadata = finding;
                    f.createdBy = scan.createdBy;
                    f.persist();
                });
            }

        } catch (Exception e) {
            scan.status = "FAILED";
            scan.errorMessage = e.getMessage();
            scan.progress = 0;
            scan.finishedAt = LocalDateTime.now();
            scan.persist();
        }
    }

    public Scan getScan(UUID scanId, UUID organizationId) {
        var scan = scanRepository.findActiveById(scanId)
            .orElseThrow(() -> new IllegalArgumentException("Scan not found"));

        if (!scan.organization.id.equals(organizationId)) {
            throw new IllegalArgumentException("Scan does not belong to this organization");
        }

        return scan;
    }

    public List<Scan> listScans(UUID auditId, UUID organizationId) {
        return scanRepository.findByAuditId(auditId);
    }

    public List<Finding> getScanFindings(UUID scanId, UUID organizationId) {
        var scan = getScan(scanId, organizationId);
        return findingRepository.findByScanId(scanId);
    }

    @Transactional
    public void cancelScan(UUID scanId, UUID organizationId) {
        var scan = getScan(scanId, organizationId);

        if ("COMPLETED".equals(scan.status) || "FAILED".equals(scan.status)) {
            throw new IllegalArgumentException("Cannot cancel a finished scan");
        }

        scan.status = "CANCELLED";
        scan.finishedAt = LocalDateTime.now();
        scan.persist();
    }

    private boolean isTargetInScope(String target, Audit audit) {
        // Simplified scope check - in production, check against audit scope/assets
        return true;
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
}
