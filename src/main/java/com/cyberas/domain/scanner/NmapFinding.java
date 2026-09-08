package com.cyberas.domain.scanner;

/**
 * Observation technique issue d'un scan de ports.
 *
 * <p>Ce modèle décrit <em>ce qui a été constaté</em>, pas ce qu'il faut en
 * conclure. Un port ouvert n'est pas une vulnérabilité : c'est un fait, dont la
 * gravité éventuelle dépend du service qui écoute, de sa version, des
 * vulnérabilités connues qui la visent, de l'exposition de la machine et de la
 * criticité de l'actif. Confondre les deux fait dire au rapport que
 * « 22/tcp ouvert » est un défaut de sécurité, ce qui est faux dans la plupart
 * des parcs.
 *
 * <p>L'enrichissement (CPE, CVE, CVSS) et l'évaluation du risque interviennent
 * plus tard, sur des classes distinctes. Ici, rien n'est déduit.
 *
 * <p><strong>Champs absents.</strong> {@code null} signifie « non observé » et
 * jamais « absent donc sans importance ». Une version que nmap n'a pas
 * identifiée reste nulle : inventer une valeur ferait entrer une supposition
 * dans une chaîne de preuve.
 *
 * @param port         numéro de port
 * @param protocol     tcp, udp…
 * @param state        open, closed, filtered, unfiltered, open|filtered…
 * @param serviceName  nom du service tel que nmap le nomme (ssh, http…), ou null
 * @param product      produit identifié (OpenSSH, nginx…), ou null
 * @param version      version identifiée, ou null
 * @param extraInfo    complément fourni par nmap (« protocol 2.0 »…), ou null
 */
public record NmapFinding(
    int port,
    String protocol,
    String state,
    String serviceName,
    String product,
    String version,
    String extraInfo
) {

    /** États considérés comme une écoute effective. */
    public static final String STATE_OPEN = "open";

    /**
     * Le port répond-il à une écoute confirmée ?
     *
     * <p>Un port {@code closed} ou {@code filtered} est une information utile —
     * il documente ce qui a été testé — mais il ne décrit aucun service, et ne
     * doit donner lieu à aucun constat de sécurité.
     */
    public boolean isOpen() {
        return STATE_OPEN.equalsIgnoreCase(state);
    }

    /**
     * Description du service telle qu'on peut l'écrire dans une preuve, sans
     * rien ajouter à ce que nmap a réellement renvoyé.
     *
     * <p>Exemple : {@code "ssh OpenSSH 9.6p1 (protocol 2.0)"}. Retourne null si
     * aucune information de service n'a été obtenue.
     */
    public String serviceDescription() {
        if (serviceName == null && product == null && version == null) {
            return null;
        }
        StringBuilder sb = new StringBuilder();
        if (serviceName != null) sb.append(serviceName);
        if (product != null) sb.append(sb.isEmpty() ? "" : " ").append(product);
        if (version != null) sb.append(sb.isEmpty() ? "" : " ").append(version);
        if (extraInfo != null) sb.append(" (").append(extraInfo).append(')');
        return sb.toString();
    }

    /**
     * Le produit et la version sont-ils tous deux identifiés ?
     *
     * <p>C'est la condition minimale pour envisager une correspondance CPE puis
     * une recherche de CVE. Sans elle, toute association serait une conjecture.
     */
    public boolean hasIdentifiedVersion() {
        return product != null && !product.isBlank()
            && version != null && !version.isBlank();
    }
}
