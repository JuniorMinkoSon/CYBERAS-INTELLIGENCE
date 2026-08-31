package com.cyberas.security;

import jakarta.enterprise.context.RequestScoped;
import java.util.UUID;

@RequestScoped
public class JwtContext {

    private UUID userId;
    private UUID organizationId;
    private String email;
    private String role;
    private String token;
    private boolean authenticated = false;

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public UUID getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(UUID organizationId) {
        this.organizationId = organizationId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public boolean isAuthenticated() {
        return authenticated;
    }

    public void setAuthenticated(boolean authenticated) {
        this.authenticated = authenticated;
    }

    public void clear() {
        this.userId = null;
        this.organizationId = null;
        this.email = null;
        this.role = null;
        this.token = null;
        this.authenticated = false;
    }
}
