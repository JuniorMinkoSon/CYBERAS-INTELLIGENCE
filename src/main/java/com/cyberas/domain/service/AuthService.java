package com.cyberas.domain.service;

import com.cyberas.domain.entity.User;
import com.cyberas.domain.entity.Organization;
import com.cyberas.domain.repository.UserRepository;
import com.cyberas.domain.repository.OrganizationRepository;
import com.cyberas.security.JwtUtils;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.mindrot.jbcrypt.BCrypt;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class AuthService {

    @Inject
    UserRepository userRepository;

    @Inject
    OrganizationRepository organizationRepository;

    @Inject
    JwtUtils jwtUtils;

    @Transactional
    public AuthResponse login(String email, String password, UUID organizationId) {
        var user = userRepository.findByEmailInOrg(email, organizationId)
            .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!user.active) {
            throw new IllegalArgumentException("User is inactive");
        }

        if (!BCrypt.checkpw(password, user.passwordHash)) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        if (user.lockedUntil != null && LocalDateTime.now().isBefore(user.lockedUntil)) {
            throw new IllegalArgumentException("Account locked");
        }

        // Fetch user's primary role
        var userRole = user.userRoles.stream()
            .filter(ur -> ur.expiresAt == null || LocalDateTime.now().isBefore(ur.expiresAt))
            .findFirst();

        String role = userRole.map(ur -> ur.role.name).orElse("VIEWER");

        // Update last login
        user.lastLoginAt = LocalDateTime.now();
        user.persist();

        // Generate tokens
        String accessToken = jwtUtils.generateToken(user.id, user.email, organizationId, role);
        String refreshToken = jwtUtils.generateRefreshToken(user.id, organizationId);

        return new AuthResponse(accessToken, refreshToken, user.id, user.email, role);
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        var userId = jwtUtils.getUserIdFromToken(refreshToken)
            .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        var organizationId = jwtUtils.getOrganizationIdFromToken(refreshToken)
            .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        var user = userRepository.findActiveById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        var userRole = user.userRoles.stream()
            .filter(ur -> ur.expiresAt == null || LocalDateTime.now().isBefore(ur.expiresAt))
            .findFirst();

        String role = userRole.map(ur -> ur.role.name).orElse("VIEWER");
        String newAccessToken = jwtUtils.generateToken(user.id, user.email, organizationId, role);

        return new AuthResponse(newAccessToken, refreshToken, user.id, user.email, role);
    }

    @Transactional
    public void register(String email, String username, String password, String firstName, String lastName, UUID organizationId) {
        var org = organizationRepository.findActiveById(organizationId)
            .orElseThrow(() -> new IllegalArgumentException("Organization not found"));

        if (userRepository.findByEmailInOrg(email, organizationId).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }

        if (userRepository.findByUsernameInOrg(username, organizationId).isPresent()) {
            throw new IllegalArgumentException("Username already taken");
        }

        User user = new User();
        user.email = email;
        user.username = username;
        user.passwordHash = BCrypt.hashpw(password, BCrypt.gensalt());
        user.firstName = firstName;
        user.lastName = lastName;
        user.organization = org;
        user.active = true;
        user.persist();
    }

    @Transactional
    public void changePassword(UUID userId, String oldPassword, String newPassword) {
        var user = userRepository.findActiveById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!BCrypt.checkpw(oldPassword, user.passwordHash)) {
            throw new IllegalArgumentException("Invalid old password");
        }

        user.passwordHash = BCrypt.hashpw(newPassword, BCrypt.gensalt());
        user.persist();
    }

    public static class AuthResponse {
        public String accessToken;
        public String refreshToken;
        public UUID userId;
        public String email;
        public String role;

        public AuthResponse(String accessToken, String refreshToken, UUID userId, String email, String role) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.userId = userId;
            this.email = email;
            this.role = role;
        }
    }
}
