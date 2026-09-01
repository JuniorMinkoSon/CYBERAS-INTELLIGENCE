package com.cyberas.domain.service;

import com.cyberas.api.error.ApiExceptionMapper.NotFoundException;
import com.cyberas.domain.entity.Audit;
import com.cyberas.domain.entity.User;
import com.cyberas.domain.repository.AuditRepository;
import com.cyberas.domain.repository.UserRepository;
import com.cyberas.security.JwtContext;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.UUID;

/** Résolution d'un audit dans le périmètre de l'organisation du JWT. */
@ApplicationScoped
public class AuditAccessService {

    @Inject
    AuditRepository auditRepository;

    @Inject
    UserRepository userRepository;

    @Inject
    JwtContext jwtContext;

    public Audit requireAudit(UUID auditId, UUID organizationId) {
        Audit audit = auditRepository.findActiveById(auditId)
            .orElseThrow(() -> new NotFoundException("Audit introuvable"));
        if (!audit.organization.id.equals(organizationId)) {
            throw new NotFoundException("Audit introuvable");
        }
        return audit;
    }

    public User currentUser() {
        if (!jwtContext.isAuthenticated() || jwtContext.getUserId() == null) {
            return null;
        }
        return userRepository.findActiveById(jwtContext.getUserId()).orElse(null);
    }
}
