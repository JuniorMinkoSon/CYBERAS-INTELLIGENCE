package com.cyberas.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "documents")
public class Document extends PanacheEntityBase {

    /**
     * Identifiant attribué par l'application, et non par la base.
     *
     * <p>C'est délibéré : le fichier est écrit sur disque sous un nom dérivé de
     * cet identifiant, donc il doit exister <em>avant</em> l'insertion. Avec
     * {@code @GeneratedValue}, Hibernate voyait une entité déjà identifiée et la
     * traitait comme détachée — {@code persist()} échouait sur
     * « Detached entity passed to persist », et aucun téléversement n'aboutissait.
     *
     * <p>L'unicité reste garantie : la valeur vient de
     * {@link UUID#randomUUID()}, et la clé primaire la fait respecter.
     */
    @Id
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    public Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audit_id", nullable = false)
    public Audit audit;

    @Column(name = "file_name", nullable = false, length = 255)
    public String fileName;

    @Column(name = "content_type", nullable = false, length = 150)
    public String contentType;

    @Column(name = "size_bytes", nullable = false)
    public Long sizeBytes;

    @Column(nullable = false, length = 64)
    public String sha256;

    @Column(name = "storage_path", nullable = false, length = 500)
    public String storagePath;

    @Column(nullable = false, length = 30)
    public String status = "UPLOADED"; // UPLOADED, REVIEWED, REJECTED

    @Column(columnDefinition = "TEXT")
    public String description;

    /**
     * Niveau de maturité que la pièce démontre, sur la même échelle 0-4 que les
     * réponses au questionnaire.
     *
     * <p>Distinct du niveau <em>déclaré</em> par l'audité : c'est l'écart entre
     * les deux qui informe. {@code null} signifie « pas encore analysée », ce
     * qui n'est pas la même chose que zéro — zéro voudrait dire que la pièce
     * n'établit rien.
     */
    @Column(name = "evidence_level")
    public Integer evidenceLevel;

    /**
     * Confiance de l'analyse, de 0 à 1.
     *
     * <p>Elle module l'effet de la note : un analyseur qui n'a pas lu le fichier
     * ne doit pas pouvoir diviser par deux le poids d'une réponse sur la seule
     * foi d'un nom de fichier.
     */
    @Column(name = "analysis_confidence")
    public Double analysisConfidence;

    /** Motif lisible de la note, opposable à l'audité comme à l'auditeur. */
    @Column(name = "analysis_rationale", columnDefinition = "TEXT")
    public String analysisRationale;

    /**
     * Identité et version de l'analyseur.
     *
     * <p>Deux notes produites par deux versions différentes ne sont pas
     * comparables ; sans cette trace, un rapport ancien deviendrait
     * inexplicable.
     */
    @Column(name = "analyzer", length = 100)
    public String analyzer;

    @Column(name = "analyzed_at")
    public LocalDateTime analyzedAt;

    @Column(name = "uploaded_at", nullable = false)
    public LocalDateTime uploadedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "uploaded_by")
    public User uploadedBy;
}
