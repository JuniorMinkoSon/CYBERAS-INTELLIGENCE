package com.cyberas.domain.service;

import com.cyberas.api.error.ApiExceptionMapper.NotFoundException;
import com.cyberas.domain.entity.Audit;
import com.cyberas.domain.entity.Document;
import com.cyberas.domain.entity.Evidence;
import com.cyberas.domain.entity.Finding;
import com.cyberas.domain.entity.Question;
import com.cyberas.domain.entity.Recommendation;
import com.cyberas.domain.repository.DocumentRepository;
import com.cyberas.domain.repository.EvidenceRepository;
import com.cyberas.domain.repository.FindingRepository;
import com.cyberas.domain.repository.QuestionRepository;
import com.cyberas.domain.repository.RecommendationRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Stockage des documents de preuve sur le système de fichiers, métadonnées en base
 * (nom, taille, type, SHA-256, auteur, organisation, audit, statut).
 */
@ApplicationScoped
public class DocumentService {

    private static final Map<String, String> ALLOWED_EXTENSIONS = Map.of(
        "pdf", "application/pdf",
        "docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "csv", "text/csv",
        "txt", "text/plain"
    );

    private static final Set<String> STATUSES = Set.of("UPLOADED", "REVIEWED", "REJECTED");

    @ConfigProperty(name = "cyberas.storage.documents-dir", defaultValue = "data/documents")
    String documentsDir;

    @ConfigProperty(name = "cyberas.storage.max-file-size-bytes", defaultValue = "26214400")
    long maxFileSizeBytes;

    @Inject
    DocumentRepository documentRepository;

    @Inject
    EvidenceRepository evidenceRepository;

    @Inject
    FindingRepository findingRepository;

    @Inject
    QuestionRepository questionRepository;

    @Inject
    RecommendationRepository recommendationRepository;

    @Inject
    AuditAccessService auditAccess;

    @Inject
    AuditTrailService auditTrail;

    public List<Document> list(UUID auditId, UUID organizationId) {
        auditAccess.requireAudit(auditId, organizationId);
        return documentRepository.list("audit.id = ?1 order by uploadedAt desc", auditId);
    }

    public Document require(UUID documentId, UUID organizationId) {
        Document doc = documentRepository.findById(documentId);
        if (doc == null || !doc.organization.id.equals(organizationId)) {
            throw new NotFoundException("Document introuvable");
        }
        return doc;
    }

    public Path resolvePath(Document doc) {
        return Path.of(doc.storagePath);
    }

    @Transactional
    public Document store(UUID auditId, String originalName, String declaredContentType,
                          InputStream content, String description, UUID organizationId) throws IOException {
        Audit audit = auditAccess.requireAudit(auditId, organizationId);

        String safeName = sanitize(originalName);
        String extension = extensionOf(safeName);
        String contentType = ALLOWED_EXTENSIONS.get(extension);
        if (contentType == null) {
            throw new IllegalArgumentException(
                "Format non autorisé (" + extension + "). Formats acceptés : PDF, DOCX, XLSX, CSV, TXT");
        }

        Path dir = Path.of(documentsDir, organizationId.toString(), auditId.toString());
        Files.createDirectories(dir);
        UUID documentId = UUID.randomUUID();
        Path target = dir.resolve(documentId + "." + extension);

        MessageDigest digest = sha256Digest();
        long size;
        try (InputStream in = new java.security.DigestInputStream(content, digest)) {
            size = Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }
        if (size == 0) {
            Files.deleteIfExists(target);
            throw new IllegalArgumentException("Fichier vide");
        }
        if (size > maxFileSizeBytes) {
            Files.deleteIfExists(target);
            throw new IllegalArgumentException("Fichier trop volumineux (max " + (maxFileSizeBytes / 1024 / 1024) + " Mo)");
        }

        Document doc = new Document();
        doc.id = documentId;
        doc.organization = audit.organization;
        doc.audit = audit;
        doc.fileName = safeName;
        doc.contentType = declaredContentType != null && !declaredContentType.isBlank()
            ? declaredContentType : contentType;
        doc.sizeBytes = size;
        doc.sha256 = hex(digest.digest());
        doc.storagePath = target.toString();
        doc.status = "UPLOADED";
        doc.description = description;
        doc.uploadedBy = auditAccess.currentUser();
        doc.persist();

        auditTrail.record(AuditTrailService.DOCUMENT_UPLOADED, organizationId, auditId,
            "DOCUMENT", doc.id, Map.of("fileName", doc.fileName, "sha256", doc.sha256, "sizeBytes", size));

        return doc;
    }

    @Transactional
    public Document updateStatus(UUID documentId, String status, UUID organizationId) {
        Document doc = require(documentId, organizationId);
        String upper = status == null ? "" : status.trim().toUpperCase(Locale.ROOT);
        if (!STATUSES.contains(upper)) {
            throw new IllegalArgumentException("Statut de document invalide : " + status);
        }
        doc.status = upper;
        doc.persist();
        return doc;
    }

    @Transactional
    public void delete(UUID documentId, UUID organizationId) throws IOException {
        Document doc = require(documentId, organizationId);
        evidenceRepository.delete("document.id = ?1", documentId);
        Files.deleteIfExists(resolvePath(doc));
        doc.delete();
    }

    public List<Evidence> listEvidences(UUID auditId, UUID organizationId) {
        auditAccess.requireAudit(auditId, organizationId);
        return evidenceRepository.list("audit.id = ?1 order by createdAt desc", auditId);
    }

    @Transactional
    public Evidence linkEvidence(UUID auditId, UUID documentId, String questionCode, UUID findingId,
                                 UUID recommendationId, String note, UUID organizationId) {
        Audit audit = auditAccess.requireAudit(auditId, organizationId);
        Document doc = require(documentId, organizationId);
        if (!doc.audit.id.equals(auditId)) {
            throw new IllegalArgumentException("Le document n'appartient pas à cet audit");
        }

        Evidence evidence = new Evidence();
        evidence.organization = audit.organization;
        evidence.audit = audit;
        evidence.document = doc;
        evidence.note = note;
        evidence.createdBy = auditAccess.currentUser();

        int targets = 0;
        if (questionCode != null && !questionCode.isBlank()) {
            Question q = questionRepository.find("code = ?1", questionCode).firstResultOptional()
                .orElseThrow(() -> new IllegalArgumentException("Question inconnue : " + questionCode));
            evidence.question = q;
            targets++;
        }
        if (findingId != null) {
            Finding f = findingRepository.findById(findingId);
            if (f == null || !f.audit.id.equals(auditId)) {
                throw new IllegalArgumentException("Constat introuvable dans cet audit");
            }
            evidence.finding = f;
            targets++;
        }
        if (recommendationId != null) {
            Recommendation r = recommendationRepository.findById(recommendationId);
            if (r == null || !r.audit.id.equals(auditId)) {
                throw new IllegalArgumentException("Recommandation introuvable dans cet audit");
            }
            evidence.recommendation = r;
            targets++;
        }
        if (targets == 0) {
            throw new IllegalArgumentException("Une preuve doit viser une question, un constat ou une recommandation");
        }

        evidence.persist();
        return evidence;
    }

    @Transactional
    public void deleteEvidence(UUID evidenceId, UUID organizationId) {
        Evidence e = evidenceRepository.findById(evidenceId);
        if (e == null || !e.organization.id.equals(organizationId)) {
            throw new NotFoundException("Preuve introuvable");
        }
        e.delete();
    }

    private static String sanitize(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Nom de fichier requis");
        }
        String base = Path.of(name.replace('\\', '/')).getFileName().toString();
        String cleaned = base.replaceAll("[^A-Za-z0-9._ \\-()]", "_").trim();
        if (cleaned.isEmpty() || cleaned.startsWith(".")) {
            throw new IllegalArgumentException("Nom de fichier invalide");
        }
        return cleaned.length() > 200 ? cleaned.substring(cleaned.length() - 200) : cleaned;
    }

    private static String extensionOf(String name) {
        int dot = name.lastIndexOf('.');
        return dot < 0 ? "" : name.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private static MessageDigest sha256Digest() {
        try {
            return MessageDigest.getInstance("SHA-256");
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    private static String hex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
