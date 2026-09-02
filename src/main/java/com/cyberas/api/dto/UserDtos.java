package com.cyberas.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.UUID;

public class UserDtos {

    public static class CreateUserRequest {
        @NotBlank
        @Email
        public String email;

        @NotBlank
        @Size(min = 3, max = 50)
        public String username;

        @NotBlank
        @Size(min = 8, max = 256)
        public String password;

        @NotBlank
        @Size(min = 1, max = 100)
        public String firstName;

        @NotBlank
        @Size(min = 1, max = 100)
        public String lastName;
    }

    public static class UpdateUserRequest {
        @Size(min = 1, max = 100)
        public String firstName;

        @Size(min = 1, max = 100)
        public String lastName;

        @Email
        public String email;
    }

    public static class UserResponse {
        public UUID id;
        public String email;
        public String username;
        public String firstName;
        public String lastName;
        public Boolean active;
        public Boolean emailVerified;
        public LocalDateTime lastLoginAt;
        public LocalDateTime createdAt;

        public UserResponse(UUID id, String email, String username, String firstName, String lastName,
                          Boolean active, Boolean emailVerified, LocalDateTime lastLoginAt, LocalDateTime createdAt) {
            this.id = id;
            this.email = email;
            this.username = username;
            this.firstName = firstName;
            this.lastName = lastName;
            this.active = active;
            this.emailVerified = emailVerified;
            this.lastLoginAt = lastLoginAt;
            this.createdAt = createdAt;
        }
    }

    public static class UserListResponse {
        public java.util.List<UserResponse> users;
        public Long total;
        public Integer page;
        public Integer pageSize;

        public UserListResponse(java.util.List<UserResponse> users, Long total, Integer page, Integer pageSize) {
            this.users = users;
            this.total = total;
            this.page = page;
            this.pageSize = pageSize;
        }
    }
}
