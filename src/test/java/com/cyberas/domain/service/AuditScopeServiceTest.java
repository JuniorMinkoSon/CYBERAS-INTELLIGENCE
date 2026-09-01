package com.cyberas.domain.service;

import com.cyberas.domain.entity.AuditScope;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Validation des formats de périmètre.
 *
 * Ces règles décident de ce qui peut entrer dans le périmètre : un format trop
 * permissif ici annule la protection du ScopeValidator en aval.
 */
class AuditScopeServiceTest {

    private final AuditScopeService service = new AuditScopeService();

    /** validateFormat est privée : on l'atteint par réflexion pour la tester isolément. */
    private void validate(String type, String value) throws Exception {
        Method m = AuditScopeService.class.getDeclaredMethod("validateFormat", String.class, String.class);
        m.setAccessible(true);
        try {
            m.invoke(service, type, value);
        } catch (java.lang.reflect.InvocationTargetException e) {
            if (e.getCause() instanceof RuntimeException re) {
                throw re;
            }
            throw e;
        }
    }

    private void assertRejected(String type, String value) {
        assertThrows(IllegalArgumentException.class, () -> validate(type, value),
            "aurait dû refuser " + type + " = " + value);
    }

    private void assertAccepted(String type, String value) {
        assertDoesNotThrow(() -> validate(type, value),
            "aurait dû accepter " + type + " = " + value);
    }

    @Test
    @DisplayName("Les CIDR bien formés dans la plage /8-/32 sont acceptés")
    void accepteCidrValide() {
        assertAccepted(AuditScope.TYPE_CIDR, "192.168.1.0/24");
        assertAccepted(AuditScope.TYPE_CIDR, "10.0.0.0/8");
        assertAccepted(AuditScope.TYPE_CIDR, "172.16.5.4/32");
    }

    @Test
    @DisplayName("Un préfixe plus large que /8 est refusé : il vaudrait autorisation générale")
    void refusePrefixeTropLarge() {
        assertRejected(AuditScope.TYPE_CIDR, "0.0.0.0/0");
        assertRejected(AuditScope.TYPE_CIDR, "10.0.0.0/4");
    }

    @Test
    @DisplayName("Un CIDR malformé est refusé")
    void refuseCidrMalforme() {
        assertRejected(AuditScope.TYPE_CIDR, "192.168.1.0");
        assertRejected(AuditScope.TYPE_CIDR, "192.168.1.0/33");
        assertRejected(AuditScope.TYPE_CIDR, "pas-un-cidr/24");
    }

    @Test
    @DisplayName("Une IP littérale valide est acceptée, une IP malformée refusée")
    void valideIp() {
        assertAccepted(AuditScope.TYPE_IP, "192.168.1.10");
        assertRejected(AuditScope.TYPE_IP, "192.168.1");
        assertRejected(AuditScope.TYPE_IP, "192.168.1.10/24");
    }

    @Test
    @DisplayName("Un hostname ne peut pas porter de joker : c'est le rôle du type DOMAIN")
    void refuseJokerSurHostname() {
        assertAccepted(AuditScope.TYPE_HOSTNAME, "srv-web-01.corp.example");
        assertRejected(AuditScope.TYPE_HOSTNAME, "*.corp.example");
    }

    @Test
    @DisplayName("Un domaine accepte le joker de premier niveau")
    void accepteJokerSurDomaine() {
        assertAccepted(AuditScope.TYPE_DOMAIN, "*.corp.example");
        assertAccepted(AuditScope.TYPE_DOMAIN, "corp.example");
    }

    @Test
    @DisplayName("Une valeur vide est refusée quel que soit le type")
    void refuseValeurVide() {
        assertRejected(AuditScope.TYPE_IP, "");
        assertRejected(AuditScope.TYPE_CIDR, "");
        assertRejected(AuditScope.TYPE_HOSTNAME, "");
    }

    @Test
    @DisplayName("Une tentative d'injection dans la valeur est refusée")
    void refuseInjection() {
        assertRejected(AuditScope.TYPE_HOSTNAME, "corp.example; rm -rf /");
        assertRejected(AuditScope.TYPE_IP, "192.168.1.1 && curl attacker.test");
    }
}
