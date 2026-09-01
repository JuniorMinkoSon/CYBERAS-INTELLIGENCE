package com.cyberas.domain.framework;

import java.util.List;
import java.util.Map;

/**
 * Référentiels MVP : identifiants et mappings par domaine du questionnaire.
 *
 * Seules des métadonnées (codes, identifiants de contrôles) sont portées ici ;
 * aucun texte normatif protégé n'est reproduit. Ajouter un référentiel revient
 * à ajouter une entrée dans {@link #FRAMEWORKS} et ses correspondances dans
 * {@link #DOMAIN_MAPPINGS}.
 */
public final class FrameworkCatalog {

    public record Framework(String code, String name, String publisher, String version, String url) {}

    public record Reference(String framework, String controlId) {}

    public static final List<Framework> FRAMEWORKS = List.of(
        new Framework("ISO27001", "ISO/IEC 27001", "ISO/IEC", "2022", "https://www.iso.org/standard/27001"),
        new Framework("ISO27002", "ISO/IEC 27002", "ISO/IEC", "2022", "https://www.iso.org/standard/75652.html"),
        new Framework("NIST_CSF", "NIST Cybersecurity Framework", "NIST", "2.0", "https://www.nist.gov/cyberframework"),
        new Framework("CIS", "CIS Critical Security Controls", "Center for Internet Security", "8", "https://www.cisecurity.org/controls"),
        new Framework("OWASP", "OWASP Top 10", "OWASP Foundation", "2021", "https://owasp.org/Top10/"),
        new Framework("MITRE_ATTACK", "MITRE ATT&CK", "MITRE", "v15", "https://attack.mitre.org/")
    );

    public static final Map<String, List<Reference>> DOMAIN_MAPPINGS = Map.ofEntries(
        Map.entry("GOVERNANCE", List.of(
            ref("ISO27001", "5.1"), ref("ISO27002", "5.1"), ref("NIST_CSF", "GV.PO"), ref("CIS", "17"))),
        Map.entry("RISK", List.of(
            ref("ISO27001", "6.1.2"), ref("ISO27002", "5.7"), ref("NIST_CSF", "ID.RA"), ref("CIS", "18"))),
        Map.entry("ASSETS", List.of(
            ref("ISO27002", "5.9"), ref("NIST_CSF", "ID.AM"), ref("CIS", "1"), ref("CIS", "2"))),
        Map.entry("ACCESS", List.of(
            ref("ISO27002", "5.15"), ref("ISO27002", "8.5"), ref("NIST_CSF", "PR.AA"), ref("CIS", "5"), ref("CIS", "6"),
            ref("MITRE_ATTACK", "T1078"))),
        Map.entry("NETWORK", List.of(
            ref("ISO27002", "8.20"), ref("ISO27002", "8.22"), ref("NIST_CSF", "PR.IR"), ref("CIS", "12"), ref("CIS", "13"),
            ref("MITRE_ATTACK", "T1046"))),
        Map.entry("APPLICATIONS", List.of(
            ref("ISO27002", "8.25"), ref("NIST_CSF", "PR.PS"), ref("CIS", "16"), ref("OWASP", "A01:2021"),
            ref("OWASP", "A05:2021"))),
        Map.entry("VULNERABILITIES", List.of(
            ref("ISO27002", "8.8"), ref("NIST_CSF", "ID.RA-01"), ref("CIS", "7"), ref("OWASP", "A06:2021"),
            ref("MITRE_ATTACK", "T1190"))),
        Map.entry("DATA", List.of(
            ref("ISO27002", "5.12"), ref("ISO27002", "8.24"), ref("NIST_CSF", "PR.DS"), ref("CIS", "3"),
            ref("OWASP", "A02:2021"))),
        Map.entry("DETECTION", List.of(
            ref("ISO27002", "8.15"), ref("ISO27002", "8.16"), ref("NIST_CSF", "DE.CM"), ref("CIS", "8"),
            ref("OWASP", "A09:2021"))),
        Map.entry("INCIDENTS", List.of(
            ref("ISO27002", "5.24"), ref("ISO27002", "5.26"), ref("NIST_CSF", "RS.MA"), ref("CIS", "17"))),
        Map.entry("CONTINUITY", List.of(
            ref("ISO27002", "5.30"), ref("ISO27002", "8.13"), ref("NIST_CSF", "RC.RP"), ref("CIS", "11"))),
        Map.entry("SUPPLIERS", List.of(
            ref("ISO27002", "5.19"), ref("ISO27002", "5.21"), ref("NIST_CSF", "GV.SC"), ref("CIS", "15"),
            ref("OWASP", "A08:2021"))),
        Map.entry("COMPLIANCE", List.of(
            ref("ISO27001", "9.2"), ref("ISO27002", "5.31"), ref("NIST_CSF", "GV.OC"), ref("CIS", "17")))
    );

    public static List<Reference> forDomain(String domain) {
        return DOMAIN_MAPPINGS.getOrDefault(domain, List.of());
    }

    private static Reference ref(String framework, String controlId) {
        return new Reference(framework, controlId);
    }

    private FrameworkCatalog() {}
}
