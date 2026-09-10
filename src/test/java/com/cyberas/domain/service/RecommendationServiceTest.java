package com.cyberas.domain.service;

import com.cyberas.domain.entity.Finding;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Résolution du service d'un constat vers sa trame de remédiation.
 *
 * <p>Ce point a produit deux fois des recommandations manquantes sans aucun
 * message : un audit portant six constats et quinze évaluations de risque ne
 * rendait rien, quand un autre au contenu équivalent rendait trois
 * recommandations. La différence tenait à la casse d'une chaîne.
 *
 * <p>Ces tests fixent le contrat pour que la régression ne repasse pas.
 */
class RecommendationServiceTest {

    private final RecommendationService service = new RecommendationService();
    private final ObjectMapper mapper = new ObjectMapper();

    private Finding finding(String title, String declaredService) {
        Finding f = new Finding();
        f.title = title;
        if (declaredService != null) {
            ObjectNode evidence = mapper.createObjectNode();
            evidence.put("service", declaredService);
            f.evidence = evidence;
        }
        return f;
    }

    @Nested
    @DisplayName("Casse du service")
    class Casse {

        @Test
        @DisplayName("le service déclaré en minuscules est reconnu")
        void minuscules() {
            assertEquals("SSH", service.extractService(finding("Port 22/tcp ouvert — ssh", "ssh")));
        }

        @Test
        @DisplayName("le service déclaré en majuscules est reconnu")
        void majuscules() {
            assertEquals("SSH", service.extractService(finding("TCP port 22 open", "SSH")));
        }

        @Test
        @DisplayName("une clé déclarée en casse mixte reste atteignable")
        void casseMixteDansLaTable() {
            // « MySQL » est déclaré tel quel dans la table : la recherche ne doit
            // pas dépendre de cette casse d'écriture.
            assertEquals("MYSQL", service.extractService(finding("Port 3306 ouvert", "mysql")));
        }
    }

    @Nested
    @DisplayName("Repli sur le titre")
    class Repli {

        @Test
        @DisplayName("un service déclaré inconnu n'empêche pas la lecture du titre")
        void serviceInconnuPuisTitre() {
            // Le scanner rend parfois un nom que la table ignore. Rendre cette
            // valeur telle quelle court-circuitait le repli, alors que le titre
            // portait le service.
            assertEquals("HTTP", service.extractService(finding("Port 80/tcp ouvert — http", "tcpwrapped")));
        }

        @Test
        @DisplayName("le titre est lu quand aucun service n'est déclaré")
        void aucunServiceDeclare() {
            assertEquals("FTP", service.extractService(finding("Port 21/tcp ouvert — ftp", null)));
        }

        @Test
        @DisplayName("HTTPS prime sur HTTP, qu'il contient")
        void plusSpecifiqueDAbord() {
            // Sans ordre défini, l'itération de la table pouvait rendre HTTP pour
            // un titre mentionnant HTTPS, et donc la mauvaise remédiation.
            assertEquals("HTTPS", service.extractService(finding("Port 443/tcp ouvert — https", null)));
        }
    }

    @Nested
    @DisplayName("Absence de correspondance")
    class Inconnu {

        @Test
        @DisplayName("un service sans trame est rendu inconnu, pas deviné")
        void serviceSansTrame() {
            assertEquals("Unknown", service.extractService(finding("Port 9999 ouvert — chose", "chose")));
        }

        @Test
        @DisplayName("un titre absent ne fait pas échouer la résolution")
        void titreNul() {
            assertEquals("Unknown", service.extractService(finding(null, null)));
        }
    }
}
