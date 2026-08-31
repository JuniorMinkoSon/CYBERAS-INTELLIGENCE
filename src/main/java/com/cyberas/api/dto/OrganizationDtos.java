package com.cyberas.api.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class OrganizationDtos {

    public static class CreateOrganizationRequest {
        public String name;
        public String description;
    }

    public static class UpdateOrganizationRequest {
        public String name;
        public String description;
    }

    public static class OrganizationResponse {
        public UUID id;
        public String name;
        public String description;
        public Boolean active;
        public LocalDateTime createdAt;

        public OrganizationResponse(UUID id, String name, String description, Boolean active, LocalDateTime createdAt) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.active = active;
            this.createdAt = createdAt;
        }
    }
}
