package com.cyberas.domain.risk;

import com.cyberas.domain.entity.Finding;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Le mapper doit rendre visibles les dimensions qu'il ne peut pas encore renseigner.
 * Un score présenté comme complet alors qu'il repose sur des valeurs par défaut
 * induirait en erreur sur la priorisation.
 */
class FindingRiskMapperTest {

    private FindingRiskMapper mapper;
    private ObjectMapper json;

    @BeforeEach
    void setUp() {
        mapper = new FindingRiskMapper();
        json = new ObjectMapper();
    }

    private Finding finding(String severity, Double cvss, String cve, String source) {
        Finding f = new Finding();
        f.severity = severity;
        f.cvssScore = cvss;
        f.cve = cve;
        f.source = source;
        return f;
    }

    @Test
    @DisplayName("Le CVSS du constat est repris tel quel")
    void reprendCvss() {
        var result = mapper.map(finding("HIGH", 8.1, "CVE-2024-1234", "NMAP"));

        assertEquals(8.1, result.input().cvss());
    }

    @Test
    @DisplayName("Un constat sans CVSS laisse la dimension absente, pas à zéro")
    void cvssAbsentResteAbsent() {
        var result = mapper.map(finding("MEDIUM", null, null, "NMAP"));

        assertNull(result.input().cvss(),
            "un CVSS absent ne doit pas devenir 0, ce qui minimiserait le risque");
    }

    @Test
    @DisplayName("La maturité reste absente tant que le questionnaire n'existe pas")
    void maturiteAbsente() {
        var result = mapper.map(finding("HIGH", 7.5, null, "NMAP"));

        assertNull(result.input().questionnaireMaturity());
    }

    @Test
    @DisplayName("Les dimensions estimées sont énumérées")
    void dimensionsEstimeesEnumerees() {
        var result = mapper.map(finding("HIGH", 7.5, "CVE-2024-1", "NMAP"));

        assertFalse(result.isComplete(),
            "l'évaluation ne peut pas être complète sans inventaire d'actifs");
        assertTrue(result.estimatedDimensions().containsAll(java.util.List.of(
            "assetCriticality", "businessImpact", "dataSensitivity", "internetExposure")));
    }

    @Test
    @DisplayName("L'exploitabilité suit la sévérité déclarée")
    void exploitabiliteSuitSeverite() {
        assertEquals(RiskInput.Exploitability.FUNCTIONAL,
            mapper.map(finding("CRITICAL", 9.8, null, "NMAP")).input().exploitability());
        assertEquals(RiskInput.Exploitability.PROOF_OF_CONCEPT,
            mapper.map(finding("HIGH", 7.5, null, "NMAP")).input().exploitability());
        assertEquals(RiskInput.Exploitability.NONE,
            mapper.map(finding("LOW", 2.0, null, "NMAP")).input().exploitability());
    }

    @Test
    @DisplayName("Une sévérité inconnue retombe sur une hypothèse prudente")
    void severiteInconnue() {
        assertEquals(RiskInput.Exploitability.THEORETICAL,
            mapper.map(finding("BIZARRE", 5.0, null, "NMAP")).input().exploitability());
        assertEquals(RiskInput.Exploitability.THEORETICAL,
            mapper.map(finding(null, 5.0, null, "NMAP")).input().exploitability());
    }

    @Test
    @DisplayName("La qualité de preuve reflète ce que le constat transporte")
    void qualitePreuve() throws Exception {
        Finding complet = finding("HIGH", 7.5, "CVE-2024-1", "NMAP");
        complet.evidence = json.readTree("{\"port\":22,\"service\":\"ssh\"}");
        assertEquals(RiskInput.EvidenceQuality.STRONG,
            mapper.map(complet).input().evidenceQuality());

        Finding sansCve = finding("HIGH", 7.5, null, "NMAP");
        sansCve.evidence = json.readTree("{\"port\":22}");
        assertEquals(RiskInput.EvidenceQuality.MODERATE,
            mapper.map(sansCve).input().evidenceQuality());

        assertEquals(RiskInput.EvidenceQuality.WEAK,
            mapper.map(finding("HIGH", 7.5, null, "NMAP")).input().evidenceQuality());

        assertEquals(RiskInput.EvidenceQuality.NONE,
            mapper.map(finding("HIGH", 7.5, null, null)).input().evidenceQuality());
    }

    @Test
    @DisplayName("Un constat nul est refusé")
    void constatNulRefuse() {
        assertThrows(IllegalArgumentException.class, () -> mapper.map(null));
    }

    @Test
    @DisplayName("Un constat nmap typique produit une évaluation à confiance réduite")
    void constatNmapConfianceReduite() {
        var mapping = mapper.map(finding("MEDIUM", null, null, "NMAP"));
        var assessment = new RiskEngine(new RiskScoringConfig()).evaluate(mapping.input());

        assertTrue(assessment.confidence() < 0.6,
            "sans CVSS ni maturité, la confiance doit rester basse : "
                + assessment.confidence());
        assertNotNull(assessment.rationale());
    }
}
