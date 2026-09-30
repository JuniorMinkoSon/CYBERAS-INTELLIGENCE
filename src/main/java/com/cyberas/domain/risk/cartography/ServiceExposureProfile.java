package com.cyberas.domain.risk.cartography;

import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Ce qu'un service exposé met en jeu, à partir de ce que le scan a observé.
 *
 * <h2>Pourquoi le protocole de transport ne suffisait pas</h2>
 *
 * <p>La classification précédente tenait en trois lignes : UDP donnait
 * disponibilité, TCP donnait confidentialité, le reste traçabilité. Comme la
 * sévérité n'est jamais vide sur le chemin de scan, la troisième branche était
 * morte, et l'intégrité n'était retournée par aucune. Deux catégories sur
 * quatre étaient donc inatteignables.
 *
 * <p>Pire : la clé d'agrégation de la cartographie étant
 * {@code (organisation, audit, catégorie, protocole)} et la catégorie une
 * fonction du seul protocole, une mission ne pouvait produire que deux lignes.
 * Une cible n'exposant que du TCP en produisait une seule, où MySQL, SMB et un
 * HTTPS correctement chiffré comptaient pour la même chose. Ce n'était pas une
 * cartographie, c'était un compteur.
 *
 * <h2>Ce qui change</h2>
 *
 * <p>Le critère de sécurité se déduit du <strong>service observé</strong>, qui
 * est le fait que le scanner rapporte. Un Telnet en clair expose des
 * identifiants : c'est la confidentialité. Une base de données joignable se lit
 * et s'écrit : confidentialité <em>et</em> intégrité. Un DNS ou un NTP ouvert
 * sert de réflecteur d'amplification : disponibilité. Un collecteur de journaux
 * atteignable permet d'effacer ses traces : traçabilité.
 *
 * <p>Un service peut donc relever de plusieurs critères, ce que le modèle à une
 * catégorie par constat ne savait pas dire.
 *
 * <h2>Ce que ce profil n'est pas</h2>
 *
 * <p><strong>Ce n'est pas une analyse MEHARI.</strong> MEHARI classe des
 * scénarios de risque — actif primaire, événement redouté, critère atteint — et
 * demande une classification des actifs valeur par valeur, une base de
 * connaissance des services de sécurité, et une grille gravité = f(potentialité,
 * impact). Un scan réseau ne porte aucun des trois : il ne sait pas ce que
 * l'actif vaut pour le métier.
 *
 * <p>Les quatre critères retenus — disponibilité, intégrité, confidentialité,
 * traçabilité — ne sont pas propres à MEHARI : c'est le vocabulaire commun de
 * la sécurité de l'information, celui-là même qu'ISO 27001 emploie. Les nommer
 * ainsi est exact ; les présenter comme le produit d'une méthode MEHARI ne le
 * serait pas.
 *
 * <p>Les codes de risque cités reprennent la taxonomie R01-R12 portée par les
 * 551 contrôles des référentiels du dépôt, identique dans les sept fichiers.
 * C'est le seul vocabulaire de risque que ce dépôt possède réellement ; en
 * inventer un second l'aurait fait diverger du premier.
 */
public final class ServiceExposureProfile {

    private ServiceExposureProfile() {
    }

    /** Un critère de sécurité mis en jeu, et le risque correspondant. */
    public record Atteinte(MehariCategory categorie, String codeRisque, String motif) {
    }

    /**
     * Services en clair : ce qui transite se lit sur le réseau.
     *
     * <p>Identifiants compris, ce qui fait de l'exposition un problème de
     * confidentialité avant d'être un problème d'authentification.
     */
    private static final Set<String> CLAIR = Set.of(
        "telnet", "ftp", "ftp-data", "http", "pop3", "imap", "smtp", "snmp",
        "ldap", "rsh", "rlogin", "rexec", "tftp", "finger");

    /**
     * Bases de données et entrepôts : la donnée s'y lit et s'y écrit.
     *
     * <p>Deux critères, donc, et c'est le cas typique que le modèle précédent
     * ne pouvait pas exprimer.
     */
    private static final Set<String> DONNEES = Set.of(
        "mysql", "postgresql", "postgres", "ms-sql-s", "mssql", "oracle",
        "mongodb", "redis", "elasticsearch", "cassandra", "memcached",
        "couchdb", "influxdb", "neo4j", "db2");

    /**
     * Administration à distance : qui entre modifie le système.
     *
     * <p>L'atteinte première est l'intégrité. La confidentialité suit lorsque
     * le canal n'est pas chiffré, ce que {@link #CLAIR} traite à part.
     */
    private static final Set<String> ADMINISTRATION = Set.of(
        "ssh", "rdp", "ms-wbt-server", "vnc", "winrm", "smb", "microsoft-ds",
        "netbios-ssn", "ipmi", "ilo", "idrac", "vmware-auth", "vmrdp");

    /**
     * Services amplificateurs : détournables en réflecteurs de déni de service.
     *
     * <p>Un résolveur ouvert ou un NTP répondant à {@code monlist} renvoie au
     * tiers visé un volume sans commune mesure avec la requête reçue.
     */
    private static final Set<String> AMPLIFICATEURS = Set.of(
        "domain", "dns", "ntp", "snmp", "ssdp", "chargen", "netbios-ns",
        "memcached", "quote", "daytime");

    /** Collecte et conservation des traces : l'effacement des preuves. */
    private static final Set<String> JOURNALISATION = Set.of(
        "syslog", "rsyslog", "graylog", "splunk", "logstash", "fluentd");

    /**
     * Ce que l'exposition de ce service met en jeu.
     *
     * <p>Jamais vide : un service non répertorié, ou qu'nmap n'a pas identifié,
     * rend une atteinte à la traçabilité. Un port ouvert dont on ignore ce
     * qu'il sert est d'abord un défaut d'inventaire — R10, défaut de
     * gouvernance — et le dire vaut mieux que de le ranger au hasard dans un
     * critère technique.
     *
     * @param service nom du service tel que nmap le rapporte, ou {@code null}
     * @param port    port observé, utilisé en repli quand le service est inconnu
     * @param protocolz protocole de transport, seul signal restant sans service
     */
    public static List<Atteinte> atteintes(String service, Integer port, String protocolz) {
        String s = service == null ? "" : service.trim().toLowerCase(Locale.ROOT);
        String proto = protocolz == null ? "" : protocolz.trim().toUpperCase(Locale.ROOT);

        // Le nom du service prime, parce qu'il décrit ce qui est exposé.
        // Le port ne sert qu'à rattraper les cas qu'nmap laisse en « unknown ».
        if (s.isEmpty() || "unknown".equals(s) || "tcpwrapped".equals(s)) {
            s = parDefautPourPort(port);
        }

        List<Atteinte> out = new java.util.ArrayList<>();

        if (DONNEES.contains(s)) {
            out.add(new Atteinte(MehariCategory.CONFIDENTIALITE, "R04",
                "Entrepôt de données joignable : la donnée qu'il porte est lisible par qui l'atteint."));
            out.add(new Atteinte(MehariCategory.INTEGRITE, "R01",
                "Un entrepôt joignable s'écrit autant qu'il se lit : la donnée peut être altérée."));
        }

        if (CLAIR.contains(s)) {
            out.add(new Atteinte(MehariCategory.CONFIDENTIALITE, "R04",
                "Service en clair : ce qui transite, identifiants compris, se lit sur le réseau."));
        }

        if (ADMINISTRATION.contains(s)) {
            out.add(new Atteinte(MehariCategory.INTEGRITE, "R01",
                "Accès d'administration exposé : qui entre modifie le système."));
        }

        if (AMPLIFICATEURS.contains(s)) {
            out.add(new Atteinte(MehariCategory.DISPONIBILITE, "R08",
                "Service détournable en réflecteur : il répond plus qu'on ne lui demande."));
        }

        if (JOURNALISATION.contains(s)) {
            out.add(new Atteinte(MehariCategory.TRACABILITE, "R12",
                "Collecte de journaux atteignable : les traces peuvent être altérées ou effacées."));
        }

        if (out.isEmpty()) {
            // Ni catégorie technique arbitraire, ni silence. Un service ouvert
            // qu'on ne sait pas nommer est un trou d'inventaire, et c'est
            // exactement ce que la cartographie doit remonter.
            out.add(new Atteinte(MehariCategory.TRACABILITE, "R10",
                "Service exposé non identifié" + (proto.isEmpty() ? "" : " (" + proto + ")")
                + " : ce qui est ouvert sans être inventorié ne peut pas être surveillé."));
        }

        return out;
    }

    /**
     * Service probable d'un port, quand nmap n'a pas su l'identifier.
     *
     * <p>Volontairement court : seuls les ports dont l'attribution ne prête pas
     * à discussion figurent ici. Deviner au-delà reviendrait à qualifier une
     * exposition sur une supposition, ce qu'un constat d'audit ne tolère pas —
     * et le repli « non identifié » dit alors la vérité.
     */
    private static String parDefautPourPort(Integer port) {
        if (port == null) {
            return "";
        }
        return switch (port) {
            case 21 -> "ftp";
            case 22 -> "ssh";
            case 23 -> "telnet";
            case 25 -> "smtp";
            case 53 -> "domain";
            case 123 -> "ntp";
            case 139 -> "netbios-ssn";
            case 161 -> "snmp";
            case 389 -> "ldap";
            case 445 -> "microsoft-ds";
            case 514 -> "syslog";
            case 1433 -> "ms-sql-s";
            case 3306 -> "mysql";
            case 3389 -> "ms-wbt-server";
            case 5432 -> "postgresql";
            case 5900 -> "vnc";
            case 6379 -> "redis";
            case 9200 -> "elasticsearch";
            case 11211 -> "memcached";
            case 27017 -> "mongodb";
            default -> "";
        };
    }
}
