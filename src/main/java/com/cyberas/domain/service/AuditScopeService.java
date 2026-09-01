package com.cyberas.domain.service;

import com.cyberas.domain.entity.AuditScope;
import com.cyberas.domain.repository.AuditRepository;
import com.cyberas.domain.repository.AuditScopeRepository;
import com.cyberas.domain.repository.UserRepository;
import com.cyberas.security.JwtContext;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Gestion du périmètre autorisé d'un audit.
 *
 * Déclarer une cible et l'autoriser sont deux actes distincts : une entrée créée
 * est inerte tant que quelqu'un ne l'a pas explicitement autorisée. L'autorisation
 * porte son auteur, sa date et sa référence — c'est une preuve, pas un drapeau.
 */
@ApplicationScoped
public class AuditScopeService {

    private static final Set<String> VALID_TYPES = Set.of(
        AuditScope.TYPE_CIDR, AuditScope.TYPE_IP,
        AuditScope.TYPE_HOSTNAME, AuditScope.TYPE_DOMAIN
    );

    private static final Pattern IPV4 = Pattern.compile("^\\d{1,3}(\\.\\d{1,3}){3}$");
    private static final Pattern CIDR = Pattern.compile("^\\d{1,3}(\\.\\d{1,3}){3}/\\d{1,2}$");
    private static final Pattern HOST = Pattern.compile(
        "^(\\*\\.)?[a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?(\\.[a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?)*$"
    );

    @Inject
    AuditScopeRepository auditScopeRepository;

    @Inject
    AuditRepository auditRepository;

    @Inject
    UserRepository userRepository;

    @Inject
    JwtContext jwtContext;

    /** Déclare une cible dans le périmètre. Non autorisée par défaut. */
    @Transactional
    public AuditScope declare(UUID auditId, String scopeType, String value,
                              String notes, UUID organizationId) {
        var audit = auditRepository.findActiveById(auditId)
            .orElseThrow(() -> new IllegalArgumentException("Audit introuvable"));

        if (!audit.organization.id.equals(organizationId)) {
            throw new IllegalArgumentException("Audit introuvable");
        }

        String type = scopeType == null ? "" : scopeType.trim().toUpperCase(Locale.ROOT);
        if (!VALID_TYPES.contains(type)) {
            throw new IllegalArgumentException(
                "Type de périmètre invalide : " + scopeType + " (attendu : CIDR, IP, HOSTNAME, DOMAIN)");
        }

        String normalized = value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
        validateFormat(type, normalized);

        boolean duplicate = auditScopeRepository
            .find("audit.id = ?1 and scopeType = ?2 and value = ?3 and revokedAt is null",
                  auditId, type, normalized)
            .firstResultOptional().isPresent();
        if (duplicate) {
            throw new IllegalArgumentException("Cette cible est déjà déclarée pour cet audit");
        }

        AuditScope scope = new AuditScope();
        scope.audit = audit;
        scope.organization = audit.organization;
        scope.scopeType = type;
        scope.value = normalized;
        scope.authorized = false;
        scope.notes = notes;
        scope.createdBy = currentUser();
        scope.createdAt = LocalDateTime.now();
        scope.persist();

        return scope;
    }

    /**
     * Autorise une cible déclarée. C'est cet acte, et lui seul, qui ouvre le scan.
     * La référence d'autorisation est obligatoire : elle rattache la décision à un
     * élément vérifiable côté client (bon de commande, mail, contrat).
     */
    @Transactional
    public AuditScope authorize(UUID scopeId, String authorizationReference, UUID organizationId) {
        var scope = auditScopeRepository.findByIdAndOrganization(scopeId, organizationId)
            .orElseThrow(() -> new IllegalArgumentException("Périmètre introuvable"));

        if (scope.revokedAt != null) {
            throw new IllegalArgumentException("Ce périmètre est révoqué et ne peut plus être autorisé");
        }
        if (authorizationReference == null || authorizationReference.isBlank()) {
            throw new IllegalArgumentException("Une référence d'autorisation est requise");
        }

        scope.authorized = true;
        scope.authorizedBy = currentUser();
        scope.authorizedAt = LocalDateTime.now();
        scope.authorizationReference = authorizationReference.trim();
        scope.persist();

        return scope;
    }

    /** Révoque une entrée. Les scans déjà lancés ne sont pas affectés, les suivants sont refusés. */
    @Transactional
    public void revoke(UUID scopeId, UUID organizationId) {
        var scope = auditScopeRepository.findByIdAndOrganization(scopeId, organizationId)
            .orElseThrow(() -> new IllegalArgumentException("Périmètre introuvable"));

        if (scope.revokedAt != null) {
            return; // déjà révoqué : l'opération est idempotente
        }
        scope.revokedAt = LocalDateTime.now();
        scope.authorized = false;
        scope.persist();
    }

    /** Liste complète, révoquées comprises : la traçabilité prime sur la propreté d'affichage. */
    public List<AuditScope> list(UUID auditId, UUID organizationId) {
        var audit = auditRepository.findActiveById(auditId)
            .orElseThrow(() -> new IllegalArgumentException("Audit introuvable"));
        if (!audit.organization.id.equals(organizationId)) {
            throw new IllegalArgumentException("Audit introuvable");
        }
        return auditScopeRepository.findByAuditId(auditId);
    }

    private void validateFormat(String type, String value) {
        if (value.isEmpty()) {
            throw new IllegalArgumentException("La valeur du périmètre est requise");
        }
        boolean ok = switch (type) {
            case AuditScope.TYPE_IP -> IPV4.matcher(value).matches();
            case AuditScope.TYPE_CIDR -> CIDR.matcher(value).matches() && prefixInRange(value);
            case AuditScope.TYPE_HOSTNAME -> HOST.matcher(value).matches() && !value.startsWith("*.");
            case AuditScope.TYPE_DOMAIN -> HOST.matcher(value).matches();
            default -> false;
        };
        if (!ok) {
            throw new IllegalArgumentException("Valeur invalide pour le type " + type + " : " + value);
        }
    }

    /**
     * Un préfixe trop large transforme le périmètre en autorisation générale.
     * /8 couvre déjà 16 millions d'adresses : c'est la limite basse acceptée.
     */
    private boolean prefixInRange(String cidr) {
        try {
            int prefix = Integer.parseInt(cidr.substring(cidr.indexOf('/') + 1));
            return prefix >= 8 && prefix <= 32;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private com.cyberas.domain.entity.User currentUser() {
        UUID userId = jwtContext.getUserId();
        return userId == null ? null : userRepository.findActiveById(userId).orElse(null);
    }
}
