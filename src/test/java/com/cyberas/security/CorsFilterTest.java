package com.cyberas.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Origines autorisées à lire les réponses de l'API.
 *
 * <p>Ces tests portent sur une décision de sécurité : qui peut lire les données
 * renvoyées à un utilisateur authentifié. Le joker de sous-domaine, introduit
 * pour les adresses de prévisualisation qui changent à chaque déploiement, ne
 * doit pas ouvrir plus large qu'annoncé — un domaine qui se contente de finir
 * par la même chaîne n'est pas un sous-domaine.
 */
class CorsFilterTest {

    private CorsFilter filter(String origins) {
        CorsFilter f = new CorsFilter();
        f.allowedOrigins = origins;
        return f;
    }

    @Nested
    @DisplayName("Correspondance exacte")
    class Exacte {

        @Test
        @DisplayName("une origine listée est acceptée")
        void listee() {
            assertTrue(filter("https://cyberas.ci,https://app.cyberas.ci")
                .isAllowed("https://app.cyberas.ci"));
        }

        @Test
        @DisplayName("une origine absente est refusée")
        void absente() {
            assertFalse(filter("https://cyberas.ci").isAllowed("https://autre.fr"));
        }

        @Test
        @DisplayName("la casse de l'hôte n'est pas discriminante")
        void casse() {
            // Refuser pour une majuscule produirait une panne incompréhensible.
            assertTrue(filter("https://Cyberas.ci").isAllowed("https://cyberas.ci"));
        }

        @Test
        @DisplayName("les espaces autour des entrées sont tolérés")
        void espaces() {
            assertTrue(filter(" https://cyberas.ci , https://app.cyberas.ci ")
                .isAllowed("https://app.cyberas.ci"));
        }
    }

    @Nested
    @DisplayName("Joker de sous-domaine")
    class Joker {

        private final CorsFilter f = filter("https://*.vercel.app");

        @Test
        @DisplayName("un sous-domaine est accepté")
        void sousDomaine() {
            assertTrue(f.isAllowed("https://cyberas-git-main-junior.vercel.app"));
        }

        @Test
        @DisplayName("le protocole reste comparé")
        void protocole() {
            assertFalse(f.isAllowed("http://cyberas.vercel.app"));
        }

        @Test
        @DisplayName("un domaine qui finit par le suffixe sans en être un sous-domaine est refusé")
        void suffixeTrompeur() {
            // « evil-vercel.app » se termine par « vercel.app » sans être un
            // sous-domaine : l'accepter ouvrirait l'API à n'importe qui sachant
            // enregistrer ce nom.
            assertFalse(f.isAllowed("https://evil-vercel.app"));
        }

        @Test
        @DisplayName("le domaine nu, sans sous-domaine, est refusé")
        void domaineNu() {
            assertFalse(f.isAllowed("https://vercel.app"));
        }

        @Test
        @DisplayName("un sous-domaine vide est refusé")
        void sousDomaineVide() {
            assertFalse(f.isAllowed("https://.vercel.app"));
        }
    }
}
