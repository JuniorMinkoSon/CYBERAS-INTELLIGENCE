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
    com.cyberas.domain.service.RiskAssessmentService riskAssessmentService;

    @Inject
    com.cyberas.domain.service.RecommendationService recommendationService;

    @Inject
    AssetRepository assetRepository;

    @Inject
    AuditTrailService auditTrail;

    /**
     * Déroule le scan complet : marquage RUNNING, exécution, persistance du résultat.
     * Ne propage aucune exception — l'échec est enregistré sur le scan lui-même.
     */
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

        // Un scan qui n'a pas abouti — code de sortie non nul, dépassement de
        // durée, sortie illisible — ne doit pas suivre le chemin nominal. Il
        // était auparavant stocké tel quel puis journalisé comme SCAN_COMPLETED :
        // le tableau de bord affichait alors un scan terminé sans aucun constat,
        // ce qui se lit comme « rien à signaler » au lieu de « rien n'a pu être
        // analysé ». C'est l'écart le plus trompeur qu'un outil d'audit puisse
        // produire.
        if (!"COMPLETED".equals(result.status)) {
            LOG.warnf("Scan %s non abouti sur %s : %s", scanId, target, result.errorMessage);
            markFailedWithOutput(scanId, result.errorMessage, result.rawOutput);
            return;
        }

        UUID auditId;
        try {
            auditId = storeResult(scanId, result);
        } catch (Exception e) {
            LOG.errorf(e, "Échec de persistance du scan %s", scanId);
            markFailed(scanId, "Persistance impossible : " + e.getMessage());
            return;
        }

        // Le risque se calcule après le commit des constats, dans sa propre
        // transaction. Un échec ici n'invalide pas le scan : les constats sont
        // acquis, seul leur score manque, et un recalcul reste possible.
        if (auditId != null) {
            try {
                riskAssessmentService.assessAudit(auditId);
                // Les recommandations découlent des risques évalués : elles sont
                // générées ensuite, dans leur propre transaction.
                recommendationService.generateForAudit(auditId);
            } catch (Exception e) {
                LOG.errorf(e, "Scan %s enregistré, mais l'évaluation du risque a échoué", scanId);
            }
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

    /**
     * Marque un scan en échec en conservant la sortie brute produite.
     *
     * <p>Différent de {@link #markFailed} : ici le processus a bien tourné et a
     * produit quelque chose — un message d'erreur de nmap, un document tronqué,
     * une sortie illisible. Cette matière est la seule trace de ce qui s'est
     * passé, et l'effacer rendrait l'incident indiagnostiquable. Elle est donc
     * stockée comme preuve, exactement comme celle d'un scan réussi.
     */
    @Transactional
    @ActivateRequestContext
    public void markFailedWithOutput(UUID scanId, String message, String rawOutput) {
        var scan = scanRepository.findById(scanId);
        if (scan == null) {
            return;
        }
        scan.status = "FAILED";
        scan.errorMessage = message;
        scan.rawOutput = rawOutput;
        scan.hash = sha256(rawOutput);
        scan.progress = 0;
        scan.finishedAt = LocalDateTime.now();
        scan.persist();

        Map<String, Object> details = new HashMap<>();
        details.put("target", scan.target);
        details.put("error", message == null ? "" : message);
        // Le distinguo est explicite dans la piste d'audit : aucun constat parce
        // que l'analyse a échoué, et non parce que la cible était saine.
        details.put("findings", 0);
        details.put("reason", "SCAN_NOT_ANALYSABLE");
        auditTrail.recordSystemForVersion(AuditTrailService.SCAN_FAILED, scan.organization.id, scan.audit.id,
            scan.auditVersion != null ? scan.auditVersion.id : null,
            scan.createdBy != null ? scan.createdBy.id : null, "SCAN", scan.id, details);
    }

    /**
     * Persiste la sortie brute, le statut et les constats normalisés.
     *
     * @return l'audit concerné, pour que l'appelant enchaîne l'évaluation du
     *         risque dans une transaction distincte ; null si le scan a disparu.
     */
    @Transactional
    @ActivateRequestContext
    public UUID storeResult(UUID scanId, NmapScanner.ScanResult result) {
        var scan = scanRepository.findById(scanId);
        if (scan == null) {
            return null;
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

        return scan.audit != null ? scan.audit.id : null;
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

        // La sévérité provient de l'exposition heuristique du service — LOW,
        // MEDIUM ou HIGH selon ce qui écoute — et non plus d'un MEDIUM uniforme
        // posé sur chaque port ouvert. Un port 23 en Telnet et un port 443 ne
        // ressortent plus au même niveau.
        f.severity = text(node, "heuristic_severity", "LOW");

        // Ni CVE ni CVSS à ce stade : le scanner observe, il ne conclut pas.
        // Les renseigner ici reviendrait à présenter une supposition comme une
        // vulnérabilité confirmée. Ils restent nuls jusqu'à ce qu'un
        // enrichissement établisse une correspondance réelle.
        f.cve = null;
        f.cvssScore = null;

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
