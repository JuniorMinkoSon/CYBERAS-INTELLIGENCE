package com.cyberas.domain.service;

import com.cyberas.domain.entity.Finding;
import com.cyberas.domain.repository.FindingRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class FindingService {

    @Inject
    FindingRepository findingRepository;

    public List<Finding> listFindingsByOrganization(UUID organizationId) {
        return findingRepository.find("scan.organization.id = ?1", organizationId).list();
    }

    public Finding getFinding(UUID findingId, UUID organizationId) {
        return findingRepository.find("id = ?1 and scan.organization.id = ?2", findingId, organizationId)
            .firstResultOptional()
            .orElseThrow(() -> new IllegalArgumentException("Finding not found"));
    }

    public long countFindingsBySeverity(UUID organizationId, String severity) {
        return findingRepository.count("scan.organization.id = ?1 and severity = ?2", organizationId, severity);
    }

    public long countTotalFindings(UUID organizationId) {
        return findingRepository.count("scan.organization.id = ?1", organizationId);
    }
}
