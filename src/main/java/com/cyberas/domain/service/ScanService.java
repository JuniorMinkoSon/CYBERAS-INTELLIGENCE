package com.cyberas.domain.service;

import com.cyberas.domain.entity.*;
import com.cyberas.domain.repository.*;
import com.cyberas.domain.scanner.NmapScanner;
import com.cyberas.domain.scanner.ScanExecutor;
import com.cyberas.domain.scanner.ScopeValidator;
import com.cyberas.security.JwtContext;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import com.cyberas.domain.scanner.ScanRequested;
import jakarta.enterprise.event.Event;
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
    ScopeValidator scopeValidator;

    @Inject
    ScanExecutor scanExecutor;

    /** Consommé par ScanDispatcher une fois la transaction de création validée. */
    @Inject
    Event<ScanRequested> scanRequested;

    @Inject
    JwtContext jwtContext;

    @Inject
    ObjectMapper objectMapper;

    @Inject
    AuditTrailService auditTrail;

    @Transactional
    public Scan createScan(UUID auditId, UUID auditVersionId, String target, String scannerType,
                          String profile, UUID organizationId) {
        var audit = auditRepository.findActiveById(auditId)
            .orElseThrow(() -> new IllegalArgumentException("Audit not found"));

        var version = auditVersionRepository.find("id = ?1 and audit.id = ?2", auditVersionId, auditId)
            .firstResultOptional()
            .orElseThrow(() -> new IllegalArgumentException("Audit version not found"));

        // Isolation tenant : l'audit doit appartenir à l'organisation de l'appelant.
        if (!audit.organization.id.equals(organizationId)) {
            throw new IllegalArgumentException("Audit not found");
        }

        // Validation du périmètre : refus par défaut, motif conservé pour l'audit trail.
        ScopeValidator.Result scopeCheck = checkScope(target, audit);
        if (!scopeCheck.allowed()) {
            throw new ScopeViolationException(scopeCheck.reason());
        }

        Scan scan = new Scan();
        scan.audit = audit;
        scan.auditVersion = version;
        scan.organization = audit.organization;
        scan.scannerType = scannerType;
        // La version de l'outil est figée au lancement : un résultat n'est
        // interprétable que si l'on sait quelle version l'a produit.
        scan.scannerVersion = "NMAP".equals(scannerType) ? nmapScanner.version() : "unknown";
        scan.target = target;
        scan.scanProfile = profile;
        scan.status = "QUEUED";
        scan.createdBy = userRepository.findActiveById(jwtContext.getUserId()).orElse(null);
        scan.createdAt = LocalDateTime.now();

        scan.persist();

        auditTrail.recordForVersion(AuditTrailService.SCAN_STARTED, organizationId, audit.id, version.id, "SCAN", scan.id,
            java.util.Map.of("target", target, "scannerType", scannerType, "profile", profile));

        // Le scan part hors du thread de requête : un profil FULL dure des minutes
        // et ne doit ni bloquer la réponse HTTP ni tenir la transaction ouverte.
        UUID scanId = scan.id;
        // L'exécution est confiée à ScanDispatcher, qui n'agit qu'après le
        // commit : lancée ici, elle chercherait un scan que sa propre
        // transaction ne voit pas encore.
        scanRequested.fire(new ScanRequested(scanId));

        return scan;
    }

    /** Levée quand une cible sort du périmètre autorisé. Traduite en 403 côté REST. */
    public static class ScopeViolationException extends RuntimeException {
        public ScopeViolationException(String message) {
            super(message);
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
        if (auditId == null) {
            return scanRepository.list("organization.id = ?1 order by createdAt desc", organizationId);
        }
        return scanRepository.list("organization.id = ?1 and audit.id = ?2 order by createdAt desc",
            organizationId, auditId);
    }

    public List<Scan> listScansByOrganization(UUID organizationId) {
        return scanRepository.find("organization.id = ?1", organizationId).list();
    }

    public List<Finding> getScanFindings(UUID scanId, UUID organizationId) {
        getScan(scanId, organizationId);
        return findingRepository.list("scan.id = ?1 and organization.id = ?2 order by detectedAt desc",
            scanId, organizationId);
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

        auditTrail.record(AuditTrailService.SCAN_CANCELLED, organizationId, scan.audit.id, "SCAN", scan.id,
            java.util.Map.of("target", scan.target));
    }

    /**
     * Valide la cible contre le périmètre autorisé de l'audit.
     *
     * Le refus est la valeur par défaut : sans périmètre déclaré et autorisé,
     * aucun scan ne part. Le motif est remonté tel quel à l'appelant pour être
     * enregistré dans l'audit trail.
     */
    private ScopeValidator.Result checkScope(String target, Audit audit) {
        return scopeValidator.validate(target, audit.id);
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
