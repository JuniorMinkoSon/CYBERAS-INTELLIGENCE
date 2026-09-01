package com.cyberas.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "documents")
public class Document extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
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

    @Column(name = "uploaded_at", nullable = false)
    public LocalDateTime uploadedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "uploaded_by")
    public User uploadedBy;
}
