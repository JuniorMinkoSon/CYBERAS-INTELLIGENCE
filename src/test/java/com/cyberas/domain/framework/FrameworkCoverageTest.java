package com.cyberas.domain.framework;

import com.cyberas.domain.entity.Control;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Ce que la base porte réellement, référentiel par référentiel.
 *
 * <p>Ce test existe à cause d'un écart qui a tenu longtemps sans être vu : le
 * catalogue déclarait six référentiels et la vitrine les annonçait tous
 * « couverts », alors qu'un seul possédait ses contrôles en base. Rien ne
 * cassait — le calcul renvoyait simplement {@code null} — et personne ne
 * pouvait le constater sans ouvrir la base.
 *
 * <p>Les assertions portent donc sur la couverture elle-même. Elles échouent
 * si une migration de seed disparaît, si un rattachement se perd, ou si
 * quelqu'un déclare un référentiel sans l'instruire.
 */
@QuarkusTest
class FrameworkCoverageTest {

    /**
     * ISO 27001 : les 93 contrôles de l'Annexe A, dont 42 atteints par une
     * question.
     *
     * <p>Les cinquante et un autres ne sont pas un défaut : aucun questionnaire
     * de cent dix-huit questions ne couvre une annexe entière. Ils ressortent
     * NOT_ASSESSED, ce qui est la lecture honnête. Le chiffre est figé ici pour
     * qu'une régression du mapping se voie — s'il baisse, des contrôles ont
     * cessé d'être évalués sans que personne l'ait décidé.
     *
     * <p><strong>42 et non 43.</strong> V15 pose des rattachements vers 43
     * contrôles distincts, mais {@code A.6.7} n'en reçoit qu'un seul, marqué
     * REVIEW_REQUIRED (question NET-03). Or le calcul ne retient que les
     * rattachements CONFIRMED : un rattachement en attente de relecture ne doit
     * pas peser sur un score d'audit tant qu'un humain ne l'a pas validé.
     * Ce contrôle est donc déclaré, rattaché, et malgré tout non évaluable —
     * lire le SQL suffisait à compter 43 et à se tromper.
     */
    @Test
    @Transactional
    @DisplayName("ISO 27001 porte ses 93 contrôles, dont 42 rattachés et confirmés")
    void iso27001Instruit() {
        assertEquals(93, Control.countByFrameworkCode("ISO27001"),
            "Les 93 contrôles de l'Annexe A doivent être en base (V15)");
        assertEquals(42, Control.countMappedByFrameworkCode("ISO27001"),
            "42 contrôles portent au moins un rattachement CONFIRMED ; A.6.7 "
            + "est rattaché mais en REVIEW_REQUIRED, donc hors calcul");
    }

    /**
     * NIST CSF 2.0 : les 106 sous-catégories, dont 69 atteintes par dérivation.
     *
     * <p>Les rattachements ne sont pas écrits à la main : ils composent les
     * rattachements ISO établis dans V15 avec les correspondances ISO 27001
     * publiées par le NIST. Le compte vérifie que cette composition a bien été
     * appliquée — une migration qui s'appliquerait à moitié laisserait les
     * contrôles sans aucune question, et le référentiel afficherait un score
     * vide sans erreur visible.
     */
    @Test
    @Transactional
    @DisplayName("NIST CSF 2.0 porte ses 106 sous-catégories, dont 69 atteintes")
    void nistCsfInstruit() {
        assertEquals(106, Control.countByFrameworkCode("NIST_CSF"),
            "Les 106 sous-catégories du CSF 2.0 doivent être en base (V24)");
        assertEquals(69, Control.countMappedByFrameworkCode("NIST_CSF"),
            "69 sous-catégories sont atteintes par dérivation depuis les "
            + "rattachements ISO 27001");
    }

    /**
     * Un référentiel déclaré sans contrôle doit se compter à zéro, pas planter.
     *
     * <p>C'est le cas de CIS, OWASP, MITRE ATT&CK et ISO 27002 : ils figurent
     * au catalogue, et l'interface doit pouvoir dire « pas encore instruit »
     * plutôt que d'afficher une couverture vide comme si elle valait zéro de
     * conformité. Les deux se ressemblent à l'écran et ne veulent pas dire la
     * même chose.
     */
    @Test
    @Transactional
    @DisplayName("Un référentiel déclaré mais non instruit compte zéro contrôle")
    void referentielNonInstruitCompteZero() {
        for (String code : new String[] {"ISO27002", "CIS", "OWASP", "MITRE_ATTACK"}) {
            assertEquals(0, Control.countByFrameworkCode(code),
                code + " n'a pas encore de migration de seed : le compte doit "
                + "valoir zéro, et l'interface annoncer « en préparation »");
            assertEquals(0, Control.countMappedByFrameworkCode(code),
                code + " ne peut avoir aucun rattachement sans contrôle");
        }
    }

    /**
     * Un code inconnu ne lève pas : il ne compte rien.
     *
     * <p>Le catalogue et la base peuvent diverger — un code ajouté d'un côté
     * et pas de l'autre. Le compte doit alors renvoyer zéro, de sorte que
     * l'endpoint du catalogue réponde « non instruit » au lieu de rendre une
     * erreur serveur au milieu d'une démonstration.
     */
    @Test
    @Transactional
    @DisplayName("Un référentiel inconnu compte zéro sans lever d'erreur")
    void referentielInconnuNeLevePas() {
        assertEquals(0, Control.countByFrameworkCode("REFERENTIEL_QUI_N_EXISTE_PAS"));
        assertEquals(0, Control.countMappedByFrameworkCode("REFERENTIEL_QUI_N_EXISTE_PAS"));
    }

    /**
     * Les contrôles rattachés sont toujours un sous-ensemble des contrôles.
     *
     * <p>Invariant simple, mais il attrape la faute la plus probable dans ces
     * deux requêtes : une jointure qui démultiplierait les lignes par le nombre
     * de rattachements ferait passer le second compte au-dessus du premier, et
     * l'interface annoncerait plus de contrôles évalués que le référentiel n'en
     * contient.
     */
    @Test
    @Transactional
    @DisplayName("Les contrôles rattachés ne dépassent jamais les contrôles existants")
    void rattachesInferieursAuTotal() {
        for (FrameworkCatalog.Framework f : FrameworkCatalog.FRAMEWORKS) {
            long total = Control.countByFrameworkCode(f.code());
            long mapped = Control.countMappedByFrameworkCode(f.code());
            assertTrue(mapped <= total,
                f.code() + " : " + mapped + " contrôles rattachés pour " + total
                + " contrôles au total — la requête compte des doublons");
        }
    }
}
