package com.cyberas.domain.risk.answers;

import com.cyberas.domain.service.QuestionnaireService;
import com.cyberas.domain.telemetry.AnswerEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * L'événement de réponse : ce qu'il déclare être un écart, et sa capacité à
 * franchir Kafka sans rien perdre.
 *
 * <p>Ces deux propriétés portent la projection tout entière. Si le seuil
 * d'écart diverge de celui de la synthèse, le tableau de bord et l'écran de
 * questionnaire annoncent deux nombres différents pour la même chose. Si la
 * sérialisation perd un champ, la projection se peuple avec des trous que rien
 * ne signale.
 */
class AnswerEventTest {

    private final ObjectMapper mapper = new ObjectMapper()
        .findAndRegisterModules();

    private static AnswerEvent reponse(Integer degre, boolean sansObjet) {
        return AnswerEvent.of(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
            UUID.randomUUID(), "ACC-01", "ACCESS", "TECHNIQUE", degre, sansObjet);
    }

    @Nested
    @DisplayName("Ce qui compte comme un écart")
    class Ecarts {

        @Test
        @DisplayName("Un degré sous le seuil est un écart")
        void sousLeSeuil() {
            assertTrue(reponse(0, false).estUnEcart(QuestionnaireService.WEAK_THRESHOLD));
            assertTrue(reponse(1, false).estUnEcart(QuestionnaireService.WEAK_THRESHOLD));
        }

        @Test
        @DisplayName("Le seuil lui-même n'est pas un écart")
        void auSeuil() {
            assertFalse(reponse(QuestionnaireService.WEAK_THRESHOLD, false)
                .estUnEcart(QuestionnaireService.WEAK_THRESHOLD));
        }

        @Test
        @DisplayName("Un degré au-dessus du seuil n'est pas un écart")
        void auDessus() {
            assertFalse(reponse(3, false).estUnEcart(QuestionnaireService.WEAK_THRESHOLD));
            assertFalse(reponse(4, false).estUnEcart(QuestionnaireService.WEAK_THRESHOLD));
        }

        @Test
        @DisplayName("Une question sans objet n'est jamais un écart, même sans degré")
        void sansObjet() {
            // Le point important : une mesure hors périmètre ne creuse pas
            // d'écart. La compter comme un zéro ferait baisser le score d'une
            // organisation pour des questions qui ne la concernent pas.
            assertFalse(reponse(null, true).estUnEcart(QuestionnaireService.WEAK_THRESHOLD));
            assertFalse(reponse(0, true).estUnEcart(QuestionnaireService.WEAK_THRESHOLD));
        }

        @Test
        @DisplayName("Une réponse sans degré ni mention « sans objet » n'est pas un écart")
        void degreAbsent() {
            // Ni écart ni maturité : la projection l'ignore plutôt que de
            // supposer. Un trou dans les données n'est pas une mauvaise note.
            assertFalse(reponse(null, false).estUnEcart(QuestionnaireService.WEAK_THRESHOLD));
        }
    }

    @Nested
    @DisplayName("Passage par Kafka")
    class Serialisation {

        @Test
        @DisplayName("L'événement se relit à l'identique après sérialisation")
        void allerRetour() throws Exception {
            AnswerEvent envoye = reponse(3, false);

            String charge = mapper.writeValueAsString(envoye);
            AnswerEvent recu = mapper.readValue(charge, AnswerEvent.class);

            assertEquals(envoye.answerId(), recu.answerId());
            assertEquals(envoye.organizationId(), recu.organizationId());
            assertEquals(envoye.auditId(), recu.auditId());
            assertEquals(envoye.questionCode(), recu.questionCode());
            assertEquals(envoye.domain(), recu.domain());
            assertEquals(envoye.domainFamily(), recu.domainFamily());
            assertEquals(envoye.maturityLevel(), recu.maturityLevel());
            assertEquals(envoye.notApplicable(), recu.notApplicable());
            assertEquals(envoye.occurredAt(), recu.occurredAt());
        }

        @Test
        @DisplayName("Le degré absent survit au voyage sans devenir zéro")
        void degreNulPreserve() throws Exception {
            // Si Jackson rendait 0 au lieu de null, une question sans objet
            // compterait comme une maturité nulle et ferait chuter la moyenne
            // de sa famille.
            AnswerEvent recu = mapper.readValue(
                mapper.writeValueAsString(reponse(null, true)), AnswerEvent.class);

            assertNull(recu.maturityLevel());
            assertTrue(recu.notApplicable());
        }
    }
}
