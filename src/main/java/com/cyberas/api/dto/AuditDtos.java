package com.cyberas.api.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class AuditDtos {

    public static class CreateAuditRequest {
        public String auditCode;
        public String title;
        public String description;
        public UUID clientOrganizationId;
        public LocalDate scheduledStartDate;
        public LocalDate scheduledEndDate;
    }

    public static class UpdateAuditRequest {
        public String title;
        public String description;
        public String status;
    }

    public static class CreateAuditVersionRequest {
        public String title;
        public String description;
        public String changeSummary;
    }

    public static class PublishAuditVersionRequest {
        public String changeSummary;
    }

    public static class AuditResponse {
        public UUID id;
        public String auditCode;
        public String title;
        public String description;
        public String status;
        public Integer version;
        public UUID currentVersionId;
        public LocalDateTime createdAt;
        public String createdByEmail;

        public AuditResponse(UUID id, String auditCode, String title, String description, String status,
                           Integer version, UUID currentVersionId, LocalDateTime createdAt, String createdByEmail) {
            this.id = id;
            this.auditCode = auditCode;
            this.title = title;
            this.description = description;
            this.status = status;
            this.version = version;
            this.currentVersionId = currentVersionId;
            this.createdAt = createdAt;
            this.createdByEmail = createdByEmail;
        }
    }

    public static class AuditVersionResponse {
        public UUID id;
        public Integer versionNumber;
        public String title;
        public String status;
        public String hash;
        public LocalDateTime publishedAt;
        public LocalDateTime createdAt;

        public AuditVersionResponse(UUID id, Integer versionNumber, String title, String status,
                                  String hash, LocalDateTime publishedAt, LocalDateTime createdAt) {
            this.id = id;
            this.versionNumber = versionNumber;
            this.title = title;
            this.status = status;
            this.hash = hash;
            this.publishedAt = publishedAt;
            this.createdAt = createdAt;
        }
    }
}
