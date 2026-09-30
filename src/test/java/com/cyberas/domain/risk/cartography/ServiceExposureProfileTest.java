package com.cyberas.domain.risk.cartography;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Ce qu'un service exposé met en jeu.
 *
 * <p>Les assertions portent sur le raisonnement de sécurité, pas sur la table
 * de correspondance : on vérifie qu'une base de données engage bien deux
 * critères, qu'un service en clair engage la confidentialité, et surtout qu'un
 * port inconnu ne se range pas au hasard dans un critère technique.
 */
class ServiceExposureProfileTest {

    private static Set<MehariCategory> categories(String service, Integer port, String proto) {
        return ServiceExposureProfile.atteintes(service, port, proto).stream()
            .map(ServiceExposureProfile.Atteinte::categorie)
            .collect(Collectors.toSet());
    }

    @Nested
    @DisplayName("Le service observé, pas le protocole de transport")
    class ServiceEtNonTransport {

        /**
         * Le défaut d'origine, figé pour qu'il ne revienne pas.
         *
         * <p>La règle précédente rendait CONFIDENTIALITE pour tout TCP. MySQL et
         * un HTTPS correctement chiffré tombaient donc dans la même case, et la
         * cartographie d'une mission tenait en une ligne.
         */
        @Test
        @DisplayName("Deux services TCP différents ne donnent pas le même verdict")
        void deuxServicesTcpNeSeConfondentPas() {
            Set<MehariCategory> mysql = categories("mysql", 3306, "TCP");
            Set<MehariCategory> https = categories("https", 443, "TCP");
            assertFalse(mysql.equals(https),
                "Une base de données et un HTTPS ne mettent pas en jeu les mêmes critères ; "
                + "les confondre était le défaut de la classification par protocole");
        }

        @Test
        @DisplayName("Le même service donne le même verdict, quel que soit le port")
        void leServicePrimeSurLePort() {
            assertEquals(categories("mysql", 3306, "TCP"), categories("mysql", 13306, "TCP"),
                "Une base déplacée sur un port non standard reste une base");
        }
    }

    @Nested
    @DisplayName("Un service peut engager plusieurs critères")
    class PlusieursCriteres {

        /**
         * Le cas que le modèle précédent ne savait pas exprimer : une catégorie
         * par constat interdisait de dire qu'un entrepôt se lit ET s'écrit.
         */
        @Test
        @DisplayName("Une base de données engage la confidentialité et l'intégrité")
        void baseDeDonneesEngageDeuxCriteres() {
            Set<MehariCategory> c = categories("postgresql", 5432, "TCP");
            assertTrue(c.contains(MehariCategory.CONFIDENTIALITE),
                "Un entrepôt joignable se lit");
            assertTrue(c.contains(MehariCategory.INTEGRITE),
                "Un entrepôt joignable s'écrit aussi");
        }

        @Test
        @DisplayName("SNMP engage la confidentialité et la disponibilité")
        void snmpEngageDeuxCriteres() {
            Set<MehariCategory> c = categories("snmp", 161, "UDP");
            assertTrue(c.contains(MehariCategory.CONFIDENTIALITE),
                "SNMP v1/v2 transporte sa communauté en clair");
            assertTrue(c.contains(MehariCategory.DISPONIBILITE),
                "SNMP est un réflecteur d'amplification connu");
        }
    }

    @Nested
    @DisplayName("Les quatre critères sont atteignables")
    class QuatreCriteres {

        /**
         * Deux des quatre valeurs de l'enum n'étaient produites par aucun chemin
         * de code : INTEGRITE par aucune branche, TRACABILITE par une branche
         * morte, la sévérité n'étant jamais vide sur le chemin de scan.
         */
        @Test
        @DisplayName("Aucune catégorie n'est inatteignable")
        void aucuneCategorieMorte() {
            Set<MehariCategory> vues = java.util.stream.Stream.of(
                    categories("telnet", 23, "TCP"),
                    categories("ssh", 22, "TCP"),
                    categories("domain", 53, "UDP"),
                    categories("syslog", 514, "UDP"))
                .flatMap(Set::stream)
                .collect(Collectors.toSet());

            for (MehariCategory c : MehariCategory.values()) {
                assertTrue(vues.contains(c),
                    c + " n'est produite par aucun service : la catégorie serait morte");
            }
        }
    }

    @Nested
    @DisplayName("Ce qu'on ne sait pas se dit")
    class InconnuAssume {

        /**
         * Le point qui sépare une cartographie d'un classement au hasard.
         *
         * <p>Un port ouvert qu'on ne sait pas nommer n'est pas un problème de
         * confidentialité : c'est un trou d'inventaire. Le ranger dans un
         * critère technique donnerait une cartographie complète et fausse.
         */
        @Test
        @DisplayName("Un service inconnu ressort en défaut d'inventaire, pas en confidentialité")
        void serviceInconnuNeSeRangePasAuHasard() {
            List<ServiceExposureProfile.Atteinte> a =
                ServiceExposureProfile.atteintes("un-truc-inconnu", 47821, "TCP");

            assertEquals(1, a.size(), "Une seule atteinte pour un service non identifié");
            assertEquals(MehariCategory.TRACABILITE, a.get(0).categorie());
            assertEquals("R10", a.get(0).codeRisque(),
                "Défaut de gouvernance : ce qui est ouvert sans être inventorié");
        }

        @Test
        @DisplayName("Un service absent est rattrapé par le port quand il ne prête pas à discussion")
        void portConnuRattrapeServiceAbsent() {
            assertTrue(categories(null, 3306, "TCP").contains(MehariCategory.CONFIDENTIALITE),
                "Le port 3306 sans nom de service reste un MySQL");
            assertTrue(categories("unknown", 23, "TCP").contains(MehariCategory.CONFIDENTIALITE),
                "Le port 23 marqué « unknown » reste un Telnet");
        }

        @Test
        @DisplayName("Aucune entrée n'est jamais vide")
        void jamaisVide() {
            for (String s : new String[] {null, "", "  ", "unknown", "tcpwrapped", "zzz"}) {
                assertFalse(ServiceExposureProfile.atteintes(s, null, null).isEmpty(),
                    "Un constat doit toujours produire au moins une atteinte, même « non identifié »");
            }
        }
    }

    @Nested
    @DisplayName("Les codes de risque viennent de la taxonomie du dépôt")
    class TaxonomieDuDepot {

        /**
         * R01-R12 est portée par les 551 contrôles des sept référentiels,
         * identique dans les sept fichiers. En inventer une seconde l'aurait
         * fait diverger de la première.
         */
        @Test
        @DisplayName("Tout code émis appartient à R01-R12")
        void codesDansLaTaxonomie() {
            Set<String> connus = Set.of("R01", "R02", "R03", "R04", "R05", "R06",
                "R07", "R08", "R09", "R10", "R11", "R12");

            for (String s : new String[] {"mysql", "telnet", "ssh", "domain", "syslog", "zzz"}) {
                for (ServiceExposureProfile.Atteinte a : ServiceExposureProfile.atteintes(s, null, "TCP")) {
                    assertTrue(connus.contains(a.codeRisque()),
                        "Code hors taxonomie : " + a.codeRisque() + " pour " + s);
                    assertFalse(a.motif().isBlank(),
                        "Une atteinte sans motif n'est pas opposable en audit");
                }
            }
        }
    }
}
