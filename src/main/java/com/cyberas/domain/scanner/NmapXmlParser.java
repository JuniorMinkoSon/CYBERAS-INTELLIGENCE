package com.cyberas.domain.scanner;

import jakarta.enterprise.context.ApplicationScoped;

import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

/**
 * Lecture de la sortie XML de nmap.
 *
 * <h2>Responsabilité</h2>
 * Transformer le document produit par {@code nmap -oX -} en une liste
 * d'observations {@link NmapFinding}. Rien d'autre : aucune sévérité, aucune
 * CVE, aucun jugement. Ce qui n'a pas été observé reste nul.
 *
 * <h2>Pourquoi un vrai parseur</h2>
 * La version précédente extrayait les ports avec une expression régulière sur
 * le texte du document. Trois défauts la rendaient impropre à un outil
 * d'audit : elle ne lisait pas les attributs de {@code <service>} — donc ni le
 * produit ni la version, pourtant indispensables à toute recherche de CVE ;
 * elle dépendait de l'ordre et de l'espacement des attributs, qu'aucune
 * spécification ne garantit ; et un document mal formé ne produisait aucune
 * erreur, seulement zéro constat.
 *
 * <p>StAX est retenu plutôt que DOM : la sortie d'un scan {@code FULL} sur
 * 65535 ports peut peser plusieurs mégaoctets, et un parcours en flux n'en
 * charge jamais l'intégralité en mémoire.
 *
 * <h2>Sécurité</h2>
 * Le document analysé vient d'un processus externe qui a lui-même interrogé une
 * machine tierce. Il est donc traité comme une entrée non fiable : la
 * résolution d'entités et le chargement de DTD externes sont désactivés, ce qui
 * ferme les attaques XXE — lecture de fichiers locaux, requêtes sortantes
 * déclenchées par le seul fait d'analyser un résultat de scan.
 *
 * <h2>Limites</h2>
 * Les scripts NSE ({@code <script>}), les traces {@code <trace>} et la
 * détection d'OS ne sont pas interprétés : ils ne sont pas produits par les
 * profils actuels. Le document reste conservé intégralement comme preuve.
 */
@ApplicationScoped
public class NmapXmlParser {

    /**
     * Fabrique partagée et verrouillée.
     *
     * <p>{@link XMLInputFactory} est coûteuse à construire et sûre à réutiliser
     * une fois configurée. Les deux propriétés posées ici sont celles qui
     * neutralisent XXE :
     *
     * <ul>
     *   <li>{@code SUPPORT_DTD = false} — le document ne peut plus déclarer de
     *       DOCTYPE ni de DTD externe ; une déclaration présente fait échouer
     *       l'analyse au lieu d'être suivie.</li>
     *   <li>{@code IS_SUPPORTING_EXTERNAL_ENTITIES = false} — aucune entité
     *       externe n'est résolue, même si une implémentation tolérait la
     *       première.</li>
     * </ul>
     *
     * <p>Les deux sont posées ensemble : la seconde seule laisserait passer une
     * DTD interne capable de déclencher une expansion d'entités.
     */
    private static final XMLInputFactory FACTORY = createSecureFactory();

    private static XMLInputFactory createSecureFactory() {
        XMLInputFactory factory = XMLInputFactory.newInstance();
        factory.setProperty(XMLInputFactory.SUPPORT_DTD, Boolean.FALSE);
        factory.setProperty(XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES, Boolean.FALSE);
        // Fusionne le texte adjacent : évite qu'une valeur arrive en plusieurs
        // fragments selon l'implémentation.
        factory.setProperty(XMLInputFactory.IS_COALESCING, Boolean.TRUE);
        return factory;
    }

    /**
     * Analyse un document nmap.
     *
     * @param xml document XML produit par nmap
     * @return les observations, dans l'ordre du document ; liste vide si le scan
     *         n'a effectivement trouvé aucun port
     * @throws NmapParseException si le document est absent, vide, mal formé, ou
     *         ne ressemble pas à une sortie nmap. Ce cas n'est jamais confondu
     *         avec « aucun constat ».
     */
    public List<NmapFinding> parse(String xml) throws NmapParseException {
        if (xml == null || xml.isBlank()) {
            throw new NmapParseException("Sortie de scan vide : aucun document à analyser");
        }

        rejectDoctype(xml);

        List<NmapFinding> findings = new ArrayList<>();
        boolean sawNmapRoot = false;

        XMLStreamReader reader = null;
        try {
            reader = FACTORY.createXMLStreamReader(new StringReader(xml));

            // État du port en cours de lecture. Les attributs arrivent sur trois
            // éléments successifs (<port>, <state>, <service>) et ne sont
            // rassemblés qu'à la fermeture de <port>.
            int port = -1;
            String protocol = null;
            String state = null;
            String serviceName = null;
            String product = null;
            String version = null;
            String extraInfo = null;

            while (reader.hasNext()) {
                int event = reader.next();

                if (event == XMLStreamConstants.START_ELEMENT) {
                    switch (reader.getLocalName()) {
                        case "nmaprun" -> sawNmapRoot = true;
                        case "port" -> {
                            port = parsePort(attr(reader, "portid"));
                            protocol = attr(reader, "protocol");
                            state = null;
                            serviceName = null;
                            product = null;
                            version = null;
                            extraInfo = null;
                        }
                        case "state" -> state = attr(reader, "state");
                        case "service" -> {
                            serviceName = attr(reader, "name");
                            product = attr(reader, "product");
                            version = attr(reader, "version");
                            extraInfo = attr(reader, "extrainfo");
                        }
                        default -> { /* éléments non interprétés : ignorés sans perte */ }
                    }
                } else if (event == XMLStreamConstants.END_ELEMENT
                        && "port".equals(reader.getLocalName())) {
                    // Un port sans numéro exploitable n'est pas une observation :
                    // le rattacher à un actif serait impossible.
                    if (port > 0) {
                        findings.add(new NmapFinding(
                            port, protocol, state, serviceName, product, version, extraInfo));
                    }
                    port = -1;
                }
            }
        } catch (XMLStreamException e) {
            // Couvre le document mal formé, tronqué, et la déclaration de DOCTYPE
            // que la fabrique refuse désormais.
            throw new NmapParseException(
                "Sortie de scan illisible : " + e.getMessage(), e);
        } finally {
            closeQuietly(reader);
        }

        // Un document bien formé mais étranger à nmap (page d'erreur, sortie
        // d'un autre outil) ne doit pas passer pour un scan sans résultat.
        if (!sawNmapRoot) {
            throw new NmapParseException(
                "Le document analysé n'est pas une sortie nmap (élément <nmaprun> absent)");
        }

        return findings;
    }

    /**
     * Refus des déclarations de type de document dangereuses.
     *
     * <p>{@code SUPPORT_DTD = false} empêche la résolution d'une DTD, mais ne
     * se comporte pas uniformément : une DTD <em>interne</em> échoue à la
     * première entité inconnue, tandis qu'une DTD <em>externe</em> sans
     * référence d'entité est simplement ignorée et l'analyse se poursuit sans
     * un mot. Ce contrôle explicite comble cet angle mort.
     *
     * <p><strong>Il ne refuse pas tout DOCTYPE.</strong> nmap en émet un —
     * {@code <!DOCTYPE nmaprun>} — sur chaque sortie XML. Un refus global
     * faisait donc échouer <em>tous</em> les scans réels, avec un message
     * parlant d'attaque là où il n'y avait qu'un en-tête ordinaire. Ce cas a
     * été constaté à l'exécution, sur un scan qui aurait dû réussir.
     *
     * <p>Ce qui est refusé est ce qui peut nuire :
     * <ul>
     *   <li>un identifiant externe ({@code SYSTEM} ou {@code PUBLIC}), qui
     *       désigne une ressource à aller chercher ;</li>
     *   <li>un sous-ensemble interne ({@code [ ... ]}), seul endroit où des
     *       entités peuvent être déclarées — le vecteur XXE proprement dit.</li>
     * </ul>
     *
     * <p>Un DOCTYPE nu ne déclare rien et ne référence rien : il ne peut servir
     * à aucune de ces deux attaques.
     */
    private void rejectDoctype(String xml) throws NmapParseException {
        int start = xml.indexOf("<!DOCTYPE");
        if (start < 0) {
            return;
        }

        // La déclaration s'arrête au premier '>' qui suit, sauf si un
        // sous-ensemble interne s'ouvre avant — auquel cas le document est déjà
        // refusé ci-dessous.
        int end = xml.indexOf('>', start);
        String declaration = end < 0 ? xml.substring(start) : xml.substring(start, end);

        if (declaration.contains("[")) {
            throw new NmapParseException(
                "Document refusé : le DOCTYPE déclare un sous-ensemble interne, "
                    + "seul endroit où des entités peuvent être définies");
        }

        String upper = declaration.toUpperCase(java.util.Locale.ROOT);
        if (upper.contains("SYSTEM") || upper.contains("PUBLIC")) {
            throw new NmapParseException(
                "Document refusé : le DOCTYPE référence une ressource externe");
        }
    }

    /** Ports ouverts uniquement — ceux qui décrivent un service joignable. */
    public List<NmapFinding> parseOpenPorts(String xml) throws NmapParseException {
        return parse(xml).stream().filter(NmapFinding::isOpen).toList();
    }

    /**
     * Lecture d'attribut.
     *
     * <p>Une valeur absente ou vide est rendue nulle plutôt que chaîne vide :
     * en aval, {@code null} se lit « non observé », tandis qu'une chaîne vide
     * traverserait les contrôles et finirait affichée comme une donnée.
     */
    private String attr(XMLStreamReader reader, String name) {
        String value = reader.getAttributeValue(null, name);
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private int parsePort(String raw) {
        if (raw == null) {
            return -1;
        }
        try {
            int value = Integer.parseInt(raw);
            return (value >= 1 && value <= 65535) ? value : -1;
        } catch (NumberFormatException e) {
            return -1;
        }
    }

    private void closeQuietly(XMLStreamReader reader) {
        if (reader == null) {
            return;
        }
        try {
            reader.close();
        } catch (XMLStreamException ignored) {
            // La fermeture d'un lecteur déjà en erreur n'apporte rien de plus.
        }
    }
}
