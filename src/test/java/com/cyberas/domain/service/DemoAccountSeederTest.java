package com.cyberas.domain.service;

import com.cyberas.domain.entity.Organization;
import com.cyberas.domain.entity.User;
import com.cyberas.domain.repository.UserRepository;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mindrot.jbcrypt.BCrypt;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Le compte de démonstration, et ce qu'on attend de lui.
 *
 * <p>Ces tests portent sur des propriétés qui se vérifient mal à l'œil : qu'un
 * redémarrage ne duplique rien, que le mot de passe n'atteigne jamais la base
 * en clair, et que le compte soit rattaché à l'organisation nommée plutôt qu'à
 * une seconde, vide, créée à côté.
 */
@QuarkusTest
class DemoAccountSeederTest {

    @Inject
    UserRepository userRepository;

    @Inject
    AuthService authService;

    /**
     * Le seed s'exécute au démarrage : sous le profil de test, l'application
     * démarre avec le profil de développement désactivé, on crée donc le compte
     * explicitement pour éprouver le même chemin.
     */
    @Transactional
    User creerSiAbsent() {
        return userRepository.find("lower(email) = ?1", DemoAccountSeeder.EMAIL)
            .firstResultOptional()
            .orElseGet(() -> {
                Organization org = Organization.find("name = ?1", DemoAccountSeeder.ORGANISATION)
                    .firstResult();
                if (org == null) {
                    org = new Organization();
                    org.name = DemoAccountSeeder.ORGANISATION;
                    org.persist();
                }
                return authService.createUser(org, DemoAccountSeeder.EMAIL, "CyberasDemo@2026!",
                    DemoAccountSeeder.PRENOM, DemoAccountSeeder.NOM, DemoAccountSeeder.ROLE);
            });
    }

    /**
     * Le mot de passe ne doit jamais se retrouver en base tel qu'il est saisi.
     *
     * <p>C'est la propriété la plus facile à casser en écrivant un seed
     * directement en SQL : une migration qui insérerait la chaîne littérale
     * passerait tous les autres tests, et l'application refuserait simplement
     * la connexion — ou pire, l'accepterait si quelqu'un « corrigeait » la
     * comparaison.
     */
    @Test
    @DisplayName("Le mot de passe est stocké en BCrypt, jamais en clair")
    void motDePasseHache() {
        User u = creerSiAbsent();
        assertNotNull(u.passwordHash, "Un compte sans hash ne peut pas s'authentifier");
        assertFalse(u.passwordHash.contains("CyberasDemo"),
            "Le mot de passe ne doit jamais apparaître en clair dans la base");
        assertTrue(u.passwordHash.startsWith("$2"),
            "Le hash doit être un BCrypt, comme pour tout autre compte");
        assertTrue(BCrypt.checkpw("CyberasDemo@2026!", u.passwordHash),
            "Le hash doit correspondre au mot de passe documenté");
    }

    /**
     * Le compte rejoint l'organisation nommée, il n'en crée pas une seconde.
     *
     * <p>Sans cela, le compte se connecterait sur une organisation vide et la
     * cartographie serait déserte — tout en répondant 200, ce qui se lit comme
     * « aucun risque » au lieu de « mauvaise organisation ».
     */
    @Test
    @DisplayName("Le compte est rattaché à l'organisation nommée, pas à une nouvelle")
    void rattacheALOrganisationNommee() {
        User u = creerSiAbsent();
        assertEquals(DemoAccountSeeder.ORGANISATION, u.organization.name);

        long combien = Organization.count("name = ?1", DemoAccountSeeder.ORGANISATION);
        assertEquals(1, combien,
            "Une seule organisation de ce nom : en créer une seconde disperserait les données");
    }

    /**
     * Un redémarrage ne doit ni dupliquer le compte ni réinitialiser son mot de
     * passe — quelqu'un a pu le changer entre-temps, et un seed qui écrase
     * ferait perdre cette décision à chaque relance.
     */
    @Test
    @DisplayName("Rejouer le seed ne duplique rien")
    void seedIdempotent() {
        creerSiAbsent();
        String hashAvant = userRepository.find("lower(email) = ?1", DemoAccountSeeder.EMAIL)
            .firstResult().passwordHash;

        creerSiAbsent();

        long combien = userRepository.count("lower(email) = ?1", DemoAccountSeeder.EMAIL);
        assertEquals(1, combien, "Un second passage ne doit pas créer de doublon");
        assertEquals(hashAvant,
            userRepository.find("lower(email) = ?1", DemoAccountSeeder.EMAIL).firstResult().passwordHash,
            "Un second passage ne doit pas réécrire le mot de passe");
    }

    /**
     * AUDITOR suffit, et c'est volontaire.
     *
     * <p>Les écrans visés ne demandent qu'une session authentifiée. Donner ADMIN
     * n'ouvrirait rien de plus et masquerait une régression le jour où un
     * contrôle de rôle apparaîtrait sur ces routes.
     */
    @Test
    @Transactional
    @DisplayName("Le rôle est AUDITOR, pas ADMIN")
    void rolePrudent() {
        assertEquals("AUDITOR", DemoAccountSeeder.ROLE);
        creerSiAbsent();

        // La lecture se fait dans la transaction : userRoles est paresseuse, et
        // la parcourir sur une entité détachée lèverait, ce qui ferait échouer
        // le test sur un défaut du test et non du code.
        User u = userRepository.find("lower(email) = ?1", DemoAccountSeeder.EMAIL).firstResult();
        assertTrue(u.userRoles.stream().anyMatch(ur -> "AUDITOR".equals(ur.role.name)),
            "Le compte doit porter le rôle AUDITOR");
    }
}
