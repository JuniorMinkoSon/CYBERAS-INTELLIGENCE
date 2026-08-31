package com.cyberas.domain.service;

import com.cyberas.api.dto.UserDtos;
import com.cyberas.domain.entity.Organization;
import com.cyberas.domain.entity.User;
import com.cyberas.domain.repository.OrganizationRepository;
import com.cyberas.domain.repository.UserRepository;
import com.cyberas.security.JwtContext;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.mindrot.jbcrypt.BCrypt;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class UserService {

    @Inject
    UserRepository userRepository;

    @Inject
    OrganizationRepository organizationRepository;

    @Inject
    JwtContext jwtContext;

    @Transactional
    public UserDtos.UserResponse createUser(UserDtos.CreateUserRequest request, UUID organizationId) {
        var org = organizationRepository.findActiveById(organizationId)
            .orElseThrow(() -> new IllegalArgumentException("Organization not found"));

        if (userRepository.findByEmailInOrg(request.email, organizationId).isPresent()) {
            throw new IllegalArgumentException("Email already exists in this organization");
        }

        if (userRepository.findByUsernameInOrg(request.username, organizationId).isPresent()) {
            throw new IllegalArgumentException("Username already exists in this organization");
        }

        User user = new User();
        user.email = request.email;
        user.username = request.username;
        user.passwordHash = BCrypt.hashpw(request.password, BCrypt.gensalt());
        user.firstName = request.firstName;
        user.lastName = request.lastName;
        user.organization = org;
        user.active = true;
        user.createdBy = jwtContext.getUserId();
        user.persist();

        return toResponse(user);
    }

    @Transactional
    public UserDtos.UserResponse updateUser(UUID userId, UserDtos.UpdateUserRequest request, UUID organizationId) {
        var user = userRepository.findActiveById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.organization.id.equals(organizationId)) {
            throw new IllegalArgumentException("User does not belong to this organization");
        }

        if (request.firstName != null) user.firstName = request.firstName;
        if (request.lastName != null) user.lastName = request.lastName;
        if (request.email != null) {
            if (!user.email.equals(request.email) &&
                userRepository.findByEmailInOrg(request.email, organizationId).isPresent()) {
                throw new IllegalArgumentException("Email already in use");
            }
            user.email = request.email;
        }

        user.updatedBy = jwtContext.getUserId();
        user.updatedAt = LocalDateTime.now();
        user.persist();

        return toResponse(user);
    }

    @Transactional
    public void deactivateUser(UUID userId, UUID organizationId) {
        var user = userRepository.findActiveById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.organization.id.equals(organizationId)) {
            throw new IllegalArgumentException("User does not belong to this organization");
        }

        user.active = false;
        user.updatedBy = jwtContext.getUserId();
        user.updatedAt = LocalDateTime.now();
        user.persist();
    }

    public UserDtos.UserResponse getUser(UUID userId, UUID organizationId) {
        var user = userRepository.findActiveById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.organization.id.equals(organizationId)) {
            throw new IllegalArgumentException("User does not belong to this organization");
        }

        return toResponse(user);
    }

    public UserDtos.UserListResponse listUsers(UUID organizationId, Integer page, Integer pageSize) {
        page = page != null && page > 0 ? page : 1;
        pageSize = pageSize != null && pageSize > 0 ? pageSize : 20;

        var users = userRepository.find("organization.id = ?1 and active = true", organizationId)
            .page(page - 1, pageSize).list();

        var total = userRepository.count("organization.id = ?1 and active = true", organizationId);

        var responses = users.stream().map(this::toResponse).collect(Collectors.toList());
        return new UserDtos.UserListResponse(responses, total, page, pageSize);
    }

    private UserDtos.UserResponse toResponse(User user) {
        return new UserDtos.UserResponse(
            user.id,
            user.email,
            user.username,
            user.firstName,
            user.lastName,
            user.active,
            user.emailVerified,
            user.lastLoginAt,
            user.createdAt
        );
    }
}
