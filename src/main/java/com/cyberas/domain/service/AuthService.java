package com.cyberas.domain.service;

import com.cyberas.domain.entity.Organization;
import com.cyberas.domain.entity.Role;
import com.cyberas.domain.entity.User;
import com.cyberas.domain.entity.UserRole;
import com.cyberas.domain.repository.OrganizationRepository;
import com.cyberas.domain.repository.RoleRepository;
import com.cyberas.domain.repository.UserRepository;
import com.cyberas.security.JwtUtils;
import com.cyberas.security.Roles;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.mindrot.jbcrypt.BCrypt;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@ApplicationScoped
public class AuthService {

    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    @Inject
    UserRepository userRepository;

    @Inject
    OrganizationRepository organizationRepository;

    @Inject
    RoleRepository roleRepository;

    @Inject
    JwtUtils jwtUtils;

    @Inject
    AuditTrailService auditTrail;

    /**
     * Authentifie un utilisateur. L'organisation est optionnelle : si l'email n'existe
     * que dans une organisation, elle est déduite ; sinon elle doit être précisée.
     */
    @Transactional
    public AuthResponse login(String email, String password, UUID organizationId) {
        if (email == null || password == null) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        String normalizedEmail = email.trim().toLowerCase();

        User user;
        if (organizationId != null) {
            user = userRepository.findByEmailInOrg(normalizedEmail, organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        } else {
            List<User> candidates = userRepository.find("lower(email) = ?1 and active = true", normalizedEmail).list();
            if (candidates.isEmpty()) {
                throw new IllegalArgumentException("Invalid credentials");
            }
            if (candidates.size() > 1) {
                throw new IllegalArgumentException("Plusieurs organisations pour cet email : précisez organizationId");
            }
            user = candidates.get(0);
        }

        if (!user.active) {
            throw new IllegalArgumentException("User is inactive");
        }
        if (user.passwordHash == null || !BCrypt.checkpw(password, user.passwordHash)) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        if (user.lockedUntil != null && LocalDateTime.now().isBefore(user.lockedUntil)) {
            throw new IllegalArgumentException("Account locked");
        }

        String role = primaryRole(user);
        UUID orgId = user.organization.id;

        user.lastLoginAt = LocalDateTime.now();
        user.persist();

        String accessToken = jwtUtils.generateToken(user.id, user.email, orgId, role);
        String refreshToken = jwtUtils.generateRefreshToken(user.id, orgId);

        auditTrail.recordAs(AuditTrailService.LOGIN, orgId, null, user.id, "USER", user.id,
            Map.of("email", user.email, "role", role));

        return new AuthResponse(accessToken, refreshToken, user.id, user.email, role,
            orgId, user.organization.name, displayName(user));
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        var userId = jwtUtils.getUserIdFromToken(refreshToken)
            .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));
        var organizationId = jwtUtils.getOrganizationIdFromToken(refreshToken)
            .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        var user = userRepository.findActiveById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String role = primaryRole(user);
        String newAccessToken = jwtUtils.generateToken(user.id, user.email, organizationId, role);

        return new AuthResponse(newAccessToken, refreshToken, user.id, user.email, role,
            organizationId, user.organization.name, displayName(user));
    }

    /**
     * Inscription MVP : crée une organisation et son premier utilisateur avec le rôle ADMIN.
     * Les rôles système de l'organisation sont créés dans la foulée.
     */
    @Transactional
    public AuthResponse registerOrganization(String organizationName, String email, String password,
                                             String firstName, String lastName) {
        if (organizationName == null || organizationName.isBlank()) {
            throw new IllegalArgumentException("Le nom de l'organisation est requis");
        }
        validateEmail(email);
        validatePassword(password);

        String normalizedEmail = email.trim().toLowerCase();
        if (organizationRepository.findByName(organizationName.trim()).isPresent()) {
            throw new IllegalArgumentException("Une organisation porte déjà ce nom");
        }

        Organization org = new Organization();
        org.name = organizationName.trim();
        org.description = "Créée via inscription";
        org.active = true;
        org.persist();

        ensureSystemRoles(org);

        User user = createUser(org, normalizedEmail, password, firstName, lastName, Roles.ADMIN);

        String accessToken = jwtUtils.generateToken(user.id, user.email, org.id, Roles.ADMIN);
        String refreshToken = jwtUtils.generateRefreshToken(user.id, org.id);
        return new AuthResponse(accessToken, refreshToken, user.id, user.email, Roles.ADMIN,
            org.id, org.name, displayName(user));
    }

    /** Ajout d'un utilisateur dans une organisation existante (usage administratif). */
    @Transactional
    public User createUser(Organization org, String email, String password,
                           String firstName, String lastName, String roleName) {
        validateEmail(email);
        validatePassword(password);
        String normalizedEmail = email.trim().toLowerCase();

        if (userRepository.findByEmailInOrg(normalizedEmail, org.id).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.email = normalizedEmail;
        user.username = normalizedEmail;
        user.passwordHash = BCrypt.hashpw(password, BCrypt.gensalt());
        user.firstName = firstName;
        user.lastName = lastName;
        user.organization = org;
        user.active = true;
        user.emailVerified = true;
        user.persist();

        Role role = roleRepository.findByNameInOrg(Roles.normalize(roleName), org.id)
            .orElseGet(() -> { ensureSystemRoles(org); return roleRepository.findByNameInOrg(Roles.normalize(roleName), org.id).orElseThrow(); });

        UserRole userRole = new UserRole();
        userRole.user = user;
        userRole.role = role;
        userRole.assignedAt = LocalDateTime.now();
        userRole.persist();
        user.userRoles.add(userRole);

        return user;
    }

    @Transactional
    public void changePassword(UUID userId, String oldPassword, String newPassword) {
        var user = userRepository.findActiveById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!BCrypt.checkpw(oldPassword, user.passwordHash)) {
            throw new IllegalArgumentException("Invalid old password");
        }
        validatePassword(newPassword);
        user.passwordHash = BCrypt.hashpw(newPassword, BCrypt.gensalt());
        user.persist();
    }

    public AuthResponse me(UUID userId, UUID organizationId, String role) {
        var user = userRepository.findActiveById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!user.organization.id.equals(organizationId)) {
            throw new IllegalArgumentException("User not found");
        }
        return new AuthResponse(null, null, user.id, user.email, Roles.normalize(role),
            organizationId, user.organization.name, displayName(user));
    }

    public void ensureSystemRoles(Organization org) {
        for (String name : Roles.ALL) {
            if (roleRepository.findByNameInOrg(name, org.id).isEmpty()) {
                Role role = new Role();
                role.organization = org;
                role.name = name;
                role.description = "Rôle système " + name;
                role.isSystem = true;
                role.active = true;
                role.persist();
            }
        }
    }

    private String primaryRole(User user) {
        return user.userRoles.stream()
            .filter(ur -> ur.expiresAt == null || LocalDateTime.now().isBefore(ur.expiresAt))
            .map(ur -> Roles.normalize(ur.role.name))
            .min((a, b) -> Integer.compare(rank(a), rank(b)))
            .orElse(Roles.VIEWER);
    }

    private int rank(String role) {
        return switch (role) {
            case Roles.ADMIN -> 0;
            case Roles.RSSI -> 1;
            case Roles.AUDITOR -> 2;
            default -> 3;
        };
    }

    private String displayName(User user) {
        String full = user.getFullName().trim();
        return full.isEmpty() ? user.email : full;
    }

    private void validateEmail(String email) {
        if (email == null || !EMAIL.matcher(email.trim()).matches()) {
            throw new IllegalArgumentException("Email invalide");
        }
    }

    private void validatePassword(String password) {
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("Le mot de passe doit contenir au moins 8 caractères");
        }
    }

    public static class AuthResponse {
        public String accessToken;
        public String refreshToken;
        public UUID userId;
        public String email;
        public String role;
        public UUID organizationId;
        public String organizationName;
        public String displayName;

        public AuthResponse(String accessToken, String refreshToken, UUID userId, String email, String role,
                            UUID organizationId, String organizationName, String displayName) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.userId = userId;
            this.email = email;
            this.role = role;
            this.organizationId = organizationId;
            this.organizationName = organizationName;
            this.displayName = displayName;
        }
    }
}
