package com.cyberas.domain.risk;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static com.cyberas.domain.risk.RiskInput.CompensatingControls;
import static com.cyberas.domain.risk.RiskInput.Criticality;
import static com.cyberas.domain.risk.RiskInput.DataSensitivity;
import static com.cyberas.domain.risk.RiskInput.EvidenceQuality;
import static com.cyberas.domain.risk.RiskInput.Exploitability;
import static com.cyberas.domain.risk.RiskInput.Impact;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Le moteur de risque doit être défendable devant un auditeur : ces tests fixent
 * son comportement sur les situations qui décident réellement d'une priorisation.
 */
class RiskEngineTest {

    private RiskEngine engine;
    private RiskScoringConfig config;

    @BeforeEach
    void setUp() {
        config = new RiskScoringConfig();
        engine = new RiskEngine(config);
    }

    @Nested
    @DisplayName("Contextualisation du CVSS")
    class Contextualisation {

        @Test
        @DisplayName("Un CVSS élevé sur un actif peu critique ne produit pas un risque critique")
        void cvssEleveActifPeuCritique() {
            var result = engine.evaluate(RiskInput.builder()
                .cvss(9.8)
                .exploitability(Exploitability.FUNCTIONAL)
                .internetExposure(false)
                .assetCriticality(Criticality.LOW)
                .businessImpact(Impact.MINOR)
                .dataSensitivity(DataSensitivity.PUBLIC)
                .questionnaireMaturity(3)
                .evidenceQuality(EvidenceQuality.STRONG)
                .build());

            assertNotEquals(RiskLevel.CRITICAL, result.riskLevel(),
                "un CVSS élevé sur un actif sans enjeu ne justifie pas une alerte critique");
            assertTrue(result.impact() < 0.4,
                "l'impact doit rester bas : " + result.impact());
        }

        @Test
        @DisplayName("Un CVSS moyen sur un actif critique exposé produit un risque élevé")
        void cvssMoyenActifCritiqueExpose() {
            var result = engine.evaluate(RiskInput.builder()
                .cvss(5.5)
                .exploitability(Exploitability.PROOF_OF_CONCEPT)
                .internetExposure(true)
                .assetCriticality(Criticality.CRITICAL)
                .businessImpact(Impact.SEVERE)
                .dataSensitivity(DataSensitivity.REGULATED)
                .questionnaireMaturity(1)
                .controlFailures(4)
                .evidenceQuality(EvidenceQuality.STRONG)
                .build());

            assertTrue(result.riskLevel().isElevated(),
                "attendu HIGH ou CRITICAL, obtenu " + result.riskLevel()
                    + " (score " + result.riskScore() + ")");
            assertTrue(result.impact() > 0.8, "impact attendu élevé : " + result.impact());
        }

        @Test
        @DisplayName("À contexte égal, un CVSS plus élevé donne toujours un score supérieur")
        void monotonieSurCvss() {
            var faible = engine.evaluate(baseInput().cvss(3.0).build());
            var moyen = engine.evaluate(baseInput().cvss(6.0).build());
            var eleve = engine.evaluate(baseInput().cvss(9.0).build());

            assertTrue(faible.riskScore() < moyen.riskScore());
            assertTrue(moyen.riskScore() < eleve.riskScore());
        }
    }

    @Nested
    @DisplayName("Exploitabilité")
    class Exploitabilite {

        @Test
        @DisplayName("Une vulnérabilité critique activement exploitée atteint le niveau critique")
        void critiqueActivementExploitee() {
            var result = engine.evaluate(RiskInput.builder()
                .cvss(9.8)
                .exploitability(Exploitability.ACTIVELY_EXPLOITED)
                .internetExposure(true)
                .assetCriticality(Criticality.CRITICAL)
                .businessImpact(Impact.SEVERE)
                .dataSensitivity(DataSensitivity.REGULATED)
                .questionnaireMaturity(0)
                .controlFailures(8)
                .evidenceQuality(EvidenceQuality.STRONG)
                .build());

            assertEquals(RiskLevel.CRITICAL, result.riskLevel(),
                "score obtenu : " + result.riskScore());
            assertEquals(1, result.riskLevel().remediationDays());
        }

        @Test
        @DisplayName("L'absence de vecteur d'exploitation abaisse nettement le risque")
        void absenceExploitation() {
            var exploitee = engine.evaluate(baseInput()
                .exploitability(Exploitability.ACTIVELY_EXPLOITED).build());
            var inexploitable = engine.evaluate(baseInput()
                .exploitability(Exploitability.NONE).build());

            assertTrue(inexploitable.riskScore() < exploitee.riskScore(),
                inexploitable.riskScore() + " devrait être inférieur à " + exploitee.riskScore());
        }
    }

    @Nested
    @DisplayName("Mesures compensatoires")
    class Compensation {

        @Test
        @DisplayName("Des mesures compensatoires fortes réduisent le score")
        void compensationForte() {
            var sans = engine.evaluate(baseInput()
                .compensatingControls(CompensatingControls.NONE).build());
            var avec = engine.evaluate(baseInput()
                .compensatingControls(CompensatingControls.STRONG).build());

            assertTrue(avec.riskScore() < sans.riskScore());
            assertTrue(avec.riskScore() <= sans.riskScore() * 0.5,
                "une compensation forte doit retirer environ la moitié du risque : "
                    + sans.riskScore() + " -> " + avec.riskScore());
        }

        @Test
        @DisplayName("L'atténuation apparaît comme contribution négative explicite")
        void attenuationVisible() {
            var result = engine.evaluate(baseInput()
                .compensatingControls(CompensatingControls.SUBSTANTIAL).build());

            var mitigation = result.contributingFactors().stream()
                .filter(f -> f.name().equals("compensatingControls"))
                .findFirst();

            assertTrue(mitigation.isPresent(), "l'atténuation doit être tracée");
            assertTrue(mitigation.get().contribution() < 0,
                "la contribution doit être négative");
        }

        @Test
        @DisplayName("La compensation gradue le score de manière monotone")
        void compensationGraduee() {
            int aucune = engine.evaluate(baseInput()
                .compensatingControls(CompensatingControls.NONE).build()).riskScore();
            int partielle = engine.evaluate(baseInput()
                .compensatingControls(CompensatingControls.PARTIAL).build()).riskScore();
            int substantielle = engine.evaluate(baseInput()
                .compensatingControls(CompensatingControls.SUBSTANTIAL).build()).riskScore();
            int forte = engine.evaluate(baseInput()
                .compensatingControls(CompensatingControls.STRONG).build()).riskScore();

            assertTrue(aucune > partielle && partielle > substantielle && substantielle > forte);
        }
    }

    @Nested
    @DisplayName("Confiance et qualité de preuve")
    class Confiance {

        @Test
        @DisplayName("Une preuve faible abaisse la confiance sans abaisser le risque")
        void preuveFaibleNAbaissePasLeRisque() {
            var forte = engine.evaluate(baseInput()
                .evidenceQuality(EvidenceQuality.STRONG).build());
            var faible = engine.evaluate(baseInput()
                .evidenceQuality(EvidenceQuality.WEAK).build());

            assertEquals(forte.riskScore(), faible.riskScore(),
                "la qualité de preuve ne doit pas modifier le score de risque");
            assertTrue(faible.confidence() < forte.confidence(),
                "elle doit en revanche abaisser la confiance");
        }

        @Test
        @DisplayName("Une absence totale de preuve donne une confiance faible")
        void aucunePreuve() {
            var result = engine.evaluate(baseInput()
                .evidenceQuality(EvidenceQuality.NONE).build());

            assertTrue(result.confidence() < config.lowConfidenceThreshold,
                "confiance obtenue : " + result.confidence());
        }

        @Test
        @DisplayName("Les données manquantes pénalisent la confiance")
        void donneesManquantes() {
            var complet = engine.evaluate(baseInput()
                .cvss(7.0).questionnaireMaturity(2).build());
            var incomplet = engine.evaluate(baseInput()
                .cvss(null).questionnaireMaturity(null).build());

            assertTrue(incomplet.confidence() < complet.confidence());
        }

        @Test
        @DisplayName("Un risque élevé peu documenté est signalé comme à consolider")
        void risqueEleveMalDocumente() {
            var result = engine.evaluate(RiskInput.builder()
                .cvss(9.5)
                .exploitability(Exploitability.ACTIVELY_EXPLOITED)
                .internetExposure(true)
                .assetCriticality(Criticality.CRITICAL)
                .businessImpact(Impact.SEVERE)
                .dataSensitivity(DataSensitivity.REGULATED)
                .questionnaireMaturity(0)
                .evidenceQuality(EvidenceQuality.NONE)
                .build());

            assertTrue(result.riskLevel().isElevated());
            assertTrue(result.needsReview(config.lowConfidenceThreshold));
            assertTrue(result.rationale().contains("consolidée"));
        }
    }

    @Nested
    @DisplayName("Maturité et contrôles")
    class Maturite {

        @Test
        @DisplayName("Un questionnaire très immature augmente le risque")
        void questionnaireImmature() {
            var mature = engine.evaluate(baseInput().questionnaireMaturity(4).build());
            var immature = engine.evaluate(baseInput().questionnaireMaturity(0).build());

            assertTrue(immature.riskScore() > mature.riskScore(),
                "immature " + immature.riskScore() + " vs mature " + mature.riskScore());
        }

        @Test
        @DisplayName("Un domaine non évalué est traité comme médian, pas comme conforme")
        void domaineNonEvalue() {
            var mature = engine.evaluate(baseInput().questionnaireMaturity(4).build());
            var inconnu = engine.evaluate(baseInput().questionnaireMaturity(null).build());

            assertTrue(inconnu.riskScore() > mature.riskScore(),
                "l'absence d'évaluation ne doit pas valoir conformité");
        }

        @Test
        @DisplayName("La contribution des échecs de contrôle sature")
        void saturationEchecs() {
            var dix = engine.evaluate(baseInput().controlFailures(10).build());
            var cent = engine.evaluate(baseInput().controlFailures(100).build());

            assertEquals(dix.riskScore(), cent.riskScore(),
                "au-delà du seuil de saturation, le score ne doit plus bouger");
        }
    }

    @Nested
    @DisplayName("Seuils de classement")
    class Seuils {

        @Test
        @DisplayName("Chaque borne basse appartient à son niveau")
        void bornesInclusives() {
            assertEquals(RiskLevel.INFORMATION, classify(config.thresholdLow - 1));
            assertEquals(RiskLevel.LOW, classify(config.thresholdLow));
            assertEquals(RiskLevel.LOW, classify(config.thresholdMedium - 1));
            assertEquals(RiskLevel.MEDIUM, classify(config.thresholdMedium));
            assertEquals(RiskLevel.MEDIUM, classify(config.thresholdHigh - 1));
            assertEquals(RiskLevel.HIGH, classify(config.thresholdHigh));
            assertEquals(RiskLevel.HIGH, classify(config.thresholdCritical - 1));
            assertEquals(RiskLevel.CRITICAL, classify(config.thresholdCritical));
        }

        /** Atteint la méthode de classement sans passer par le calcul complet. */
        private RiskLevel classify(int score) {
            try {
                var m = RiskEngine.class.getDeclaredMethod("classify", int.class);
                m.setAccessible(true);
                return (RiskLevel) m.invoke(engine, score);
            } catch (Exception e) {
                throw new IllegalStateException(e);
            }
        }

        @Test
        @DisplayName("Le score reste borné entre 0 et 100")
        void scoreBorne() {
            var minimal = engine.evaluate(RiskInput.builder()
                .cvss(0.0)
                .exploitability(Exploitability.NONE)
                .internetExposure(false)
                .assetCriticality(Criticality.LOW)
                .businessImpact(Impact.NEGLIGIBLE)
                .dataSensitivity(DataSensitivity.PUBLIC)
                .questionnaireMaturity(4)
                .compensatingControls(CompensatingControls.STRONG)
                .build());

            var maximal = engine.evaluate(RiskInput.builder()
                .cvss(10.0)
                .exploitability(Exploitability.ACTIVELY_EXPLOITED)
                .internetExposure(true)
                .assetCriticality(Criticality.CRITICAL)
                .businessImpact(Impact.SEVERE)
                .dataSensitivity(DataSensitivity.REGULATED)
                .questionnaireMaturity(0)
                .controlFailures(50)
                .build());

            assertTrue(minimal.riskScore() >= 0);
            assertTrue(maximal.riskScore() <= 100);
            assertEquals(RiskLevel.INFORMATION, minimal.riskLevel());
            assertEquals(RiskLevel.CRITICAL, maximal.riskLevel());
        }
    }

    @Nested
    @DisplayName("Explicabilité et déterminisme")
    class Explicabilite {

        @Test
        @DisplayName("Les mêmes entrées produisent toujours le même score")
        void deterministe() {
            var input = baseInput().build();
            var a = engine.evaluate(input);
            var b = engine.evaluate(input);

            assertEquals(a.riskScore(), b.riskScore());
            assertEquals(a.riskLevel(), b.riskLevel());
            assertEquals(a.confidence(), b.confidence());
        }

        @Test
        @DisplayName("Toutes les dimensions sont tracées")
        void toutesDimensionsTracees() {
            var result = engine.evaluate(baseInput().build());
            var noms = result.contributingFactors().stream()
                .map(RiskAssessment.Factor::name).toList();

            assertTrue(noms.containsAll(java.util.List.of(
                "cvss", "exploitability", "internetExposure", "assetCriticality",
                "businessImpact", "dataSensitivity", "questionnaireMaturity",
                "controlFailures")), "dimensions tracées : " + noms);
        }

        @Test
        @DisplayName("Les facteurs sont ordonnés par poids décroissant")
        void facteursOrdonnes() {
            var factors = engine.evaluate(baseInput().build()).contributingFactors();

            for (int i = 1; i < factors.size(); i++) {
                assertTrue(
                    Math.abs(factors.get(i - 1).contribution())
                        >= Math.abs(factors.get(i).contribution()),
                    "rupture d'ordre en position " + i);
            }
        }

        @Test
        @DisplayName("La justification cite le facteur dominant")
        void justificationCiteFacteurDominant() {
            var result = engine.evaluate(baseInput()
                .internetExposure(true)
                .exploitability(Exploitability.ACTIVELY_EXPLOITED)
                .build());

            assertNotNull(result.rationale());
            assertTrue(result.rationale().contains("Facteur dominant"));
            assertTrue(result.rationale().contains(String.valueOf(result.riskScore())));
        }

        @Test
        @DisplayName("La version du moteur est portée par le résultat")
        void versionTracee() {
            assertEquals(RiskEngine.ENGINE_VERSION,
                engine.evaluate(baseInput().build()).engineVersion());
        }
    }

    @Nested
    @DisplayName("Configuration")
    class Configuration {

        @Test
        @DisplayName("Un jeu de poids incohérent est refusé au démarrage")
        void poidsIncoherentsRefuses() {
            var invalide = new RiskScoringConfig();
            invalide.weightCvss = 0.90;

            assertThrows(IllegalStateException.class, invalide::validate);
        }

        @Test
        @DisplayName("Des seuils non croissants sont refusés")
        void seuilsNonCroissantsRefuses() {
            var invalide = new RiskScoringConfig();
            invalide.thresholdHigh = 20; // passe sous thresholdMedium

            assertThrows(IllegalStateException.class, invalide::validate);
        }

        @Test
        @DisplayName("La configuration par défaut est cohérente")
        void configurationParDefautValide() {
            assertDoesNotThrow(new RiskScoringConfig()::validate);
        }

        @Test
        @DisplayName("Modifier un poids modifie le score sans toucher au moteur")
        void poidsConfigurable() {
            var scoreDefaut = engine.evaluate(baseInput().internetExposure(true).build()).riskScore();

            var custom = new RiskScoringConfig();
            custom.weightExposure = 0.40;
            custom.weightCvss = 0.15;
            var scoreCustom = new RiskEngine(custom)
                .evaluate(baseInput().internetExposure(true).build()).riskScore();

            assertNotEquals(scoreDefaut, scoreCustom,
                "le score doit suivre la configuration");
        }
    }

    @Test
    @DisplayName("Une entrée nulle est refusée")
    void entreeNulleRefusee() {
        assertThrows(IllegalArgumentException.class, () -> engine.evaluate(null));
    }

    /** Contexte médian servant de référence pour les comparaisons. */
    private RiskInput.Builder baseInput() {
        return RiskInput.builder()
            .cvss(7.0)
            .exploitability(Exploitability.PROOF_OF_CONCEPT)
            .internetExposure(false)
            .assetCriticality(Criticality.HIGH)
            .businessImpact(Impact.MODERATE)
            .dataSensitivity(DataSensitivity.CONFIDENTIAL)
            .questionnaireMaturity(2)
            .controlFailures(2)
            .evidenceQuality(EvidenceQuality.MODERATE)
            .compensatingControls(CompensatingControls.NONE);
    }
}
