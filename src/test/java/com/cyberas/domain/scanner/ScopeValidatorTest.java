package com.cyberas.domain.scanner;

import com.cyberas.domain.entity.AuditScope;
import com.cyberas.domain.repository.AuditScopeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Le validateur de périmètre est la barrière qui empêche un scan de sortir du
 * périmètre autorisé. Ces tests couvrent le refus par défaut, la correspondance
 * CIDR/hostname/domaine, et le blocage absolu des plages réservées.
 */
class ScopeValidatorTest {

    private ScopeValidator validator;
    private AuditScopeRepository repository;
    private final UUID auditId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        repository = mock(AuditScopeRepository.class);
        validator = new ScopeValidator();
        validator.auditScopeRepository = repository;
    }

    private AuditScope scope(String type, String value) {
        AuditScope s = new AuditScope();
        s.id = UUID.randomUUID();
        s.scopeType = type;
        s.value = value;
        s.authorized = true;
        s.authorizedAt = LocalDateTime.now();
        return s;
    }

    private void givenScopes(AuditScope... scopes) {
        when(repository.findActiveByAuditId(any())).thenReturn(List.of(scopes));
    }

    @Test
    @DisplayName("Sans périmètre déclaré, tout scan est refusé")
    void refuseQuandAucunPerimetre() {
        when(repository.findActiveByAuditId(any())).thenReturn(List.of());

        var result = validator.validate("192.168.1.10", auditId);

        assertFalse(result.allowed());
        assertTrue(result.reason().contains("Aucun périmètre"));
    }

    @Test
    @DisplayName("Une IP dans le CIDR autorisé passe")
    void accepteIpDansCidr() {
        givenScopes(scope(AuditScope.TYPE_CIDR, "192.168.1.0/24"));

        var result = validator.validate("192.168.1.10", auditId);

        assertTrue(result.allowed());
        assertNotNull(result.matchedScopeId());
    }

    @Test
    @DisplayName("Une IP hors du CIDR autorisé est refusée")
    void refuseIpHorsCidr() {
        givenScopes(scope(AuditScope.TYPE_CIDR, "192.168.1.0/24"));

        var result = validator.validate("192.168.2.10", auditId);

        assertFalse(result.allowed());
        assertTrue(result.reason().contains("hors du périmètre"));
    }

    @Test
    @DisplayName("La frontière du CIDR est respectée des deux côtés")
    void respecteBornesCidr() {
        givenScopes(scope(AuditScope.TYPE_CIDR, "10.0.0.0/30")); // .0 à .3

        assertTrue(validator.validate("10.0.0.3", auditId).allowed());
        assertFalse(validator.validate("10.0.0.4", auditId).allowed());
    }

    @Test
    @DisplayName("Le loopback est bloqué même s'il est explicitement autorisé")
    void bloqueLoopbackMalgreAutorisation() {
        givenScopes(scope(AuditScope.TYPE_IP, "127.0.0.1"));

        var result = validator.validate("127.0.0.1", auditId);

        assertFalse(result.allowed(), "Le loopback ne doit jamais être scannable");
        assertTrue(result.reason().contains("interdite"));
    }

    @Test
    @DisplayName("Le point de métadonnées cloud est bloqué même s'il est autorisé")
    void bloqueMetadataCloud() {
        givenScopes(scope(AuditScope.TYPE_CIDR, "0.0.0.0/0"));

        var result = validator.validate("169.254.169.254", auditId);

        assertFalse(result.allowed(), "169.254.169.254 expose les credentials d'instance");
    }

    @Test
    @DisplayName("Un hostname exact autorisé passe, un autre non")
    void accepteHostnameExact() {
        givenScopes(scope(AuditScope.TYPE_HOSTNAME, "srv-web-01.corp.example"));

        assertTrue(validator.validate("srv-web-01.corp.example", auditId).allowed());
        assertFalse(validator.validate("srv-web-02.corp.example", auditId).allowed());
    }

    @Test
    @DisplayName("Un domaine joker couvre ses sous-domaines et sa racine")
    void accepteDomaineJoker() {
        givenScopes(scope(AuditScope.TYPE_DOMAIN, "*.corp.example"));

        assertTrue(validator.validate("api.corp.example", auditId).allowed());
        assertTrue(validator.validate("corp.example", auditId).allowed());
        assertFalse(validator.validate("corp.example.attacker.test", auditId).allowed());
    }

    @Test
    @DisplayName("Une entrée révoquée ne donne plus accès")
    void refuseScopeRevoque() {
        AuditScope revoked = scope(AuditScope.TYPE_IP, "192.168.1.10");
        revoked.revokedAt = LocalDateTime.now();
        givenScopes(revoked);

        assertFalse(validator.validate("192.168.1.10", auditId).allowed());
    }

    @Test
    @DisplayName("Une entrée non autorisée ne donne pas accès")
    void refuseScopeNonAutorise() {
        AuditScope pending = scope(AuditScope.TYPE_IP, "192.168.1.10");
        pending.authorized = false;
        givenScopes(pending);

        assertFalse(validator.validate("192.168.1.10", auditId).allowed());
    }

    @Test
    @DisplayName("Une cible vide ou malformée est refusée")
    void refuseCibleMalformee() {
        givenScopes(scope(AuditScope.TYPE_CIDR, "192.168.1.0/24"));

        assertFalse(validator.validate("", auditId).allowed());
        assertFalse(validator.validate(null, auditId).allowed());
        assertFalse(validator.validate("192.168.1.1; rm -rf /", auditId).allowed());
    }

    @Test
    @DisplayName("Le port est ignoré dans la comparaison de périmètre")
    void ignorePort() {
        givenScopes(scope(AuditScope.TYPE_IP, "192.168.1.10"));

        assertTrue(validator.validate("192.168.1.10:8080", auditId).allowed());
    }
}
