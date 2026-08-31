package com.cyberas.domain.service;

import com.cyberas.api.dto.OrganizationDtos;
import com.cyberas.domain.entity.Organization;
import com.cyberas.domain.repository.OrganizationRepository;
import com.cyberas.security.JwtContext;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;

@ApplicationScoped
public class OrganizationService {

    @Inject
    OrganizationRepository organizationRepository;

    @Inject
    JwtContext jwtContext;

    @Transactional
    public OrganizationDtos.OrganizationResponse createOrganization(OrganizationDtos.CreateOrganizationRequest request) {
        if (organizationRepository.findByName(request.name).isPresent()) {
            throw new IllegalArgumentException("Organization with this name already exists");
        }

        Organization org = new Organization();
        org.name = request.name;
        org.description = request.description;
        org.active = true;
        org.createdBy = jwtContext.getUserId();
        org.createdAt = LocalDateTime.now();
        org.persist();

        return toResponse(org);
    }

    @Transactional
    public OrganizationDtos.OrganizationResponse updateOrganization(UUID organizationId,
                                                                     OrganizationDtos.UpdateOrganizationRequest request) {
        var org = organizationRepository.findActiveById(organizationId)
            .orElseThrow(() -> new IllegalArgumentException("Organization not found"));

        if (request.name != null && !org.name.equals(request.name)) {
            if (organizationRepository.findByName(request.name).isPresent()) {
                throw new IllegalArgumentException("Organization name already in use");
            }
            org.name = request.name;
        }

        if (request.description != null) {
            org.description = request.description;
        }

        org.updatedBy = jwtContext.getUserId();
        org.updatedAt = LocalDateTime.now();
        org.persist();

        return toResponse(org);
    }

    public OrganizationDtos.OrganizationResponse getOrganization(UUID organizationId) {
        var org = organizationRepository.findActiveById(organizationId)
            .orElseThrow(() -> new IllegalArgumentException("Organization not found"));

        return toResponse(org);
    }

    private OrganizationDtos.OrganizationResponse toResponse(Organization org) {
        return new OrganizationDtos.OrganizationResponse(
            org.id,
            org.name,
            org.description,
            org.active,
            org.createdAt
        );
    }
}
