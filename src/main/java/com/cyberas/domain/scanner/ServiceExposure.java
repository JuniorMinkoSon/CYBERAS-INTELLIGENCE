package com.cyberas.domain.scanner;

/**
 * Exposition heuristique d'un service joignable.
 *
 * <h2>Ce que cette échelle mesure — et ce qu'elle ne mesure pas</h2>
 *
 * <p>Elle répond à une seule question : <em>à quel point est-il gênant que ce
 * service soit atteignable ?</em> Un service d'administration en clair
 * (Telnet), un partage de fichiers (SMB) ou une base de données exposée
 * méritent d'être regardés avant un site web, indépendamment de toute faille.
 *
 * <p>Elle ne dit <strong>pas</strong> qu'une vulnérabilité existe. Un serveur
 * SSH à jour, correctement configuré, reste classé {@code MEDIUM} : ce n'est
 * pas un défaut, c'est une surface d'attaque. Confondre les deux — ce que
 * faisait la version précédente en posant {@code severity = "MEDIUM"} sur tous
 * les ports — produit des rapports où « le port 443 est ouvert » figure parmi
 * les problèmes de sécurité.
 *
 * <p>C'est pourquoi la valeur circule sous le nom {@code heuristic_severity} et
 * jamais {@code severity}, et pourquoi elle ne renseigne ni {@code cvss} ni
 * {@code cve}. Le {@code RiskEngine} la reçoit comme un signal parmi d'autres,
 * pondéré par la criticité de l'actif et son exposition réelle.
 *
 * <h2>Base de la classification</h2>
 *
 * <p>Le service annoncé par nmap prime sur le numéro de port : un port 8022 qui
 * répond en SSH est un accès d'administration, tandis qu'un port 22 sur lequel
 * aucun service n'a été identifié ne prouve rien. Le port ne sert que de repli
 * quand nmap n'a rien nommé.
 */
public enum ServiceExposure {

    /** Service de consultation ordinaire, exposition attendue. */
    LOW,

    /** Accès distant ou transfert légitime, à surveiller. */
    MEDIUM,

    /** Administration en clair, partage de fichiers, ou base de données exposée. */
    HIGH;

    /**
     * Classe un service observé.
     *
     * @param port        numéro de port constaté
     * @param serviceName nom rendu par nmap, ou null s'il n'a rien identifié
     */
    public static ServiceExposure of(int port, String serviceName) {
        if (serviceName != null && !serviceName.isBlank()) {
            ServiceExposure byName = byServiceName(serviceName.toLowerCase());
            if (byName != null) {
                return byName;
            }
        }
        return byPort(port);
    }

    private static ServiceExposure byServiceName(String name) {
        return switch (name) {
            // Protocoles d'administration ou d'échange sans chiffrement : les
            // identifiants circulent en clair sur le réseau.
            case "telnet", "rlogin", "rsh", "rexec" -> HIGH;
            // Partage de fichiers Windows : cible historique des propagations.
            case "microsoft-ds", "netbios-ssn", "smb" -> HIGH;
            // Bases de données : elles n'ont normalement pas à être joignables
            // depuis l'extérieur du périmètre applicatif.
            case "mysql", "postgresql", "ms-sql-s", "oracle", "mongodb",
                 "redis", "memcached", "elasticsearch", "cassandra" -> HIGH;
            // Bureau à distance.
            case "ms-wbt-server", "rdp", "vnc" -> HIGH;

            // Accès distant chiffré, transfert de fichiers, messagerie : usage
            // légitime courant, mais surface d'authentification exposée.
            case "ssh", "ftp", "ftps", "sftp", "smtp", "submission", "smtps",
                 "imap", "imaps", "pop3", "pop3s", "ldap", "ldaps", "snmp" -> MEDIUM;

            // Services de consultation : leur exposition est le plus souvent
            // l'objet même du serveur.
            case "http", "https", "http-proxy", "domain", "ntp" -> LOW;

            default -> null;
        };
    }

    /**
     * Repli sur le numéro de port lorsque nmap n'a nommé aucun service.
     *
     * <p>Ce repli est volontairement pauvre : un port sans service identifié
     * est une observation faible, et le classer haut sur la seule foi de son
     * numéro reviendrait à affirmer ce qui n'a pas été vu.
     */
    private static ServiceExposure byPort(int port) {
        return switch (port) {
            case 23, 445, 139, 3389, 5900, 3306, 5432, 1433, 1521, 27017, 6379, 11211 -> HIGH;
            case 22, 21, 25, 110, 143, 389, 465, 587, 993, 995, 161 -> MEDIUM;
            default -> LOW;
        };
    }
}
