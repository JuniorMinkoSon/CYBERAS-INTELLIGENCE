package com.cyberas.domain.scanner;

import com.cyberas.domain.entity.Finding;
import com.cyberas.domain.entity.Scan;
import com.cyberas.domain.repository.ScanRepository;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.security.MessageDigest;
import java.time.LocalDateTime;
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

        try {
            storeResult(scanId, result);
        } catch (Exception e) {
            LOG.errorf(e, "Échec de persistance du scan %s", scanId);
            markFailed(scanId, "Persistance impossible : " + e.getMessage());
        }
    }

    @Transactional
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
    }

    /** Persiste la sortie brute, le statut et les findings normalisés. */
    @Transactional
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

        if (result.parsedFindings != null && result.parsedFindings.isArray()) {
            result.parsedFindings.forEach(node -> persistFinding(scan, node));
        }
    }

    private void persistFinding(Scan scan, JsonNode node) {
        // Un nœud d'erreur de parsing ne décrit pas une vulnérabilité : on ne le
        // transforme pas en finding.
        if (node.has("error")) {
            LOG.warnf("Scan %s : nœud de parsing en erreur ignoré", scan.id);
            return;
        }

        Finding f = new Finding();
        f.scan = scan;
        f.audit = scan.audit;
        f.organization = scan.organization;
        f.title = text(node, "title", "Constat sans titre");
        f.description = text(node, "description", "");
        f.severity = text(node, "severity", "MEDIUM");
        f.cve = text(node, "cve", null);

        JsonNode cvss = node.get("cvss_score");
        f.cvssScore = cvss != null && cvss.isNumber() ? cvss.asDouble() : null;

        f.source = scan.scannerType;
        f.sourceId = text(node, "port", "") + "/" + text(node, "protocol", "");
        f.confidence = 1.0;
        f.evidence = node;
        f.metadata = node;
        f.createdBy = scan.createdBy;
        f.persist();
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
