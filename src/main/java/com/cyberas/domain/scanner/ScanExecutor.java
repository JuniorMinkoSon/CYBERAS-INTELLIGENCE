package com.cyberas.domain.scanner;

import com.cyberas.domain.entity.Asset;
import com.cyberas.domain.entity.Finding;
import com.cyberas.domain.entity.Scan;
import com.cyberas.domain.repository.AssetRepository;
import com.cyberas.domain.repository.ScanRepository;
import com.cyberas.domain.service.AuditTrailService;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.context.control.ActivateRequestContext;
import jakarta.enterprise.event.ObservesAsync;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Exécution d'un scan hors du thread de requête.
 *
 * Classe distincte de ScanService à dessein : l'auto-invocation CDI ne passe pas
 * par le proxy, donc un @Transactional appelé depuis la même classe serait ignoré.
 * Ici chaque étape ouvre sa propre transaction courte, et le scan lui-même —
 * plusieurs minutes en profil FULL — s'exécute en dehors de toute transaction.
 */
@ApplicationScoped
public class ScanExecutor {

    private static final Logger LOG = Logger.getLogger(ScanExecutor.class);

    @Inject
    ScanRepository scanRepository;

    @Inject
    NmapScanner nmapScanner;

    @Inject
    AssetRepository assetRepository;

    @Inject
    AuditTrailService auditTrail;

    /**
     * Déroule le scan complet : marquage RUNNING, exécution, persistance du résultat.
     * Ne propage aucune exception — l'échec est enregistré sur le scan lui-même.
     */
    /** Point d'entrée asynchrone : part d'un contexte transactionnel vierge. */
    public void onScanRequested(@ObservesAsync ScanRequested event) {
        run(event.scanId());
    }

    public void run(UUID scanId) {
        String target;
        String profile;
        String scannerType;

        try {
            var scan = markRunning(scanId);
            if (scan == null) {
                LOG.warnf("Scan %s introuvable au démarrage", scanId);
                return;
            }
            target = scan.target;
            profile = scan.scanProfile;
            scannerType = scan.scannerType;
        } catch (Exception e) {
            LOG.errorf(e, "Impossible de démarrer le scan %s", scanId);
            markFailed(scanId, "Démarrage impossible : " + e.getMessage());
            return;
        }

        // Hors transaction : l'appel externe peut durer plusieurs minutes.
        NmapScanner.ScanResult result;
        try {
            if (!"NMAP".equals(scannerType)) {
                markFailed(scanId, "Scanner non supporté : " + scannerType);
                return;
            }
            result = nmapScanner.scan(target, profile);
        } catch (Exception e) {
            LOG.errorf(e, "Échec d'exécution du scan %s sur %s", scanId, target);
            markFailed(scanId, e.getMessage());
            return;
        }

        try {
            storeResult(scanId, result);
        } catch (Exception e) {
            LOG.errorf(e, "Échec de persistance du scan %s", scanId);
            markFailed(scanId, "Persistance impossible : " + e.getMessage());
        }
    }

    @Transactional
    @ActivateRequestContext
    public Scan markRunning(UUID scanId) {
        var scan = scanRepository.findById(scanId);
        if (scan == null) {
            return null;
        }
        scan.status = "RUNNING";
        scan.startedAt = LocalDateTime.now();
        scan.progress = 0;
        scan.persist();
        return scan;
    }

    @Transactional
    @ActivateRequestContext
    public void markFailed(UUID scanId, String message) {
        var scan = scanRepository.findById(scanId);
        if (scan == null) {
            return;
        }
        scan.status = "FAILED";
        scan.errorMessage = message;
        scan.progress = 0;
        scan.finishedAt = LocalDateTime.now();
        scan.persist();

        Map<String, Object> details = new HashMap<>();
        details.put("target", scan.target);
        details.put("error", message == null ? "" : message);
        auditTrail.recordSystemForVersion(AuditTrailService.SCAN_FAILED, scan.organization.id, scan.audit.id,
            scan.auditVersion != null ? scan.auditVersion.id : null,
            scan.createdBy != null ? scan.createdBy.id : null, "SCAN", scan.id, details);
    }

    /** Persiste la sortie brute, le statut et les findings normalisés. */
    @Transactional
    @ActivateRequestContext
    public void storeResult(UUID scanId, NmapScanner.ScanResult result) {
        var scan = scanRepository.findById(scanId);
        if (scan == null) {
            return;
        }

        scan.rawOutput = result.rawOutput;
        scan.parsedOutput = result.parsedFindings;
        scan.status = result.status;
        scan.durationSeconds = result.durationSeconds;
        scan.errorMessage = result.errorMessage;
        scan.hash = sha256(result.rawOutput);
        scan.progress = 100;
        scan.finishedAt = LocalDateTime.now();
        scan.persist();

        Asset asset = matchAsset(scan);
        int created = 0;
        if (result.parsedFindings != null && result.parsedFindings.isArray()) {
            for (JsonNode node : result.parsedFindings) {
                if (persistFinding(scan, asset, node)) created++;
            }
        }

        Map<String, Object> details = new HashMap<>();
        details.put("target", scan.target);
        details.put("status", scan.status);
        details.put("findings", created);
        details.put("durationSeconds", scan.durationSeconds == null ? 0 : scan.durationSeconds);
        details.put("asset", asset == null ? "" : asset.id.toString());
        auditTrail.recordSystemForVersion(AuditTrailService.SCAN_COMPLETED, scan.organization.id, scan.audit.id,
            scan.auditVersion != null ? scan.auditVersion.id : null,
            scan.createdBy != null ? scan.createdBy.id : null, "SCAN", scan.id, details);
    }

    /** Rattache le scan à l'actif de l'audit dont l'IP ou le hostname correspond à la cible. */
    private Asset matchAsset(Scan scan) {
        if (scan.target == null || scan.audit == null) {
            return null;
        }
        String target = scan.target.trim().toLowerCase();
        return assetRepository
            .find("organization.id = ?1 and audit.id = ?2 and (lower(ipAddress) = ?3 or lower(hostname) = ?3)",
                scan.organization.id, scan.audit.id, target)
            .firstResultOptional().orElse(null);
    }

    private boolean persistFinding(Scan scan, Asset asset, JsonNode node) {
        // Un nœud d'erreur de parsing ne décrit pas une vulnérabilité : on ne le
        // transforme pas en finding.
        if (node.has("error")) {
            LOG.warnf("Scan %s : nœud de parsing en erreur ignoré", scan.id);
            return false;
        }

        Finding f = new Finding();
        f.scan = scan;
        f.audit = scan.audit;
        f.organization = scan.organization;
        f.asset = asset;
        f.title = text(node, "title", "Constat sans titre");
        f.description = text(node, "description", "");
        f.severity = text(node, "severity", "MEDIUM");
        f.cve = text(node, "cve", null);

        JsonNode cvss = node.get("cvss_score");
        f.cvssScore = cvss != null && cvss.isNumber() ? cvss.asDouble() : null;

        JsonNode port = node.get("port");
        f.port = port != null && port.isNumber() ? port.asInt() : null;
        f.protocol = text(node, "protocol", null);
        f.serviceName = text(node, "service", null);
        f.serviceVersion = text(node, "version", null);

        f.source = scan.scannerType;
        f.sourceId = text(node, "port", "") + "/" + text(node, "protocol", "");
        f.confidence = 1.0;
        f.evidence = node;
        f.metadata = node;
        f.createdBy = scan.createdBy;
        f.persist();

        Map<String, Object> details = new HashMap<>();
        details.put("title", f.title);
        details.put("severity", f.severity);
        details.put("cve", f.cve == null ? "" : f.cve);
        details.put("scan", scan.id.toString());
        auditTrail.recordSystemForVersion(AuditTrailService.FINDING_CREATED, scan.organization.id, scan.audit.id,
            scan.auditVersion != null ? scan.auditVersion.id : null,
            scan.createdBy != null ? scan.createdBy.id : null, "FINDING", f.id, details);
        return true;
    }

    /** Lecture défensive : le parseur peut omettre un champ selon la sortie nmap. */
    private String text(JsonNode node, String field, String fallback) {
        JsonNode value = node.get(field);
        return value == null || value.isNull() ? fallback : value.asText(fallback);
    }

    private String sha256(String input) {
        if (input == null) {
            return null;
        }
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(input.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            return null;
        }
    }
}
