package com.cyberas.domain.scanner;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@ApplicationScoped
public class NmapScanner {

    @Inject
    ObjectMapper objectMapper;

    /**
     * Version de l'outil, interrogée une fois puis conservée.
     *
     * Elle est enregistrée sur chaque scan : un résultat n'est interprétable que
     * si l'on sait quelle version l'a produit — les capacités de détection et le
     * format de sortie changent d'une version à l'autre.
     */
    private volatile String cachedVersion;

    public String version() {
        if (cachedVersion != null) {
            return cachedVersion;
        }
        synchronized (this) {
            if (cachedVersion != null) {
                return cachedVersion;
            }
            cachedVersion = probeVersion();
            return cachedVersion;
        }
    }

    private String probeVersion() {
        try {
            Process p = new ProcessBuilder("nmap", "--version").redirectErrorStream(true).start();
            String out = readProcessOutput(p);
            p.waitFor();

            // Première ligne : "Nmap version 7.98 ( https://nmap.org )"
            Matcher m = Pattern.compile("[Nn]map version ([0-9][0-9A-Za-z.\\-]*)").matcher(out);
            if (m.find()) {
                return m.group(1);
            }
        } catch (Exception e) {
            // Un scanner injoignable se signalera à l'exécution ; ici on se contente
            // de ne pas prétendre connaître une version.
        }
        return "unknown";
    }

    /**
     * Durée maximale d'un scan.
     *
     * <p>Un processus qui ne rend jamais la main immobilise un fil du pool de
     * travail définitivement : quelques scans bloqués suffisent à épuiser le
     * pool et à figer toute exécution ultérieure, sans qu'aucune erreur ne soit
     * remontée. Le plafond est fixé au profil le plus long — un balayage des
     * 65535 ports avec identification des services.
     */
    private static final Duration SCAN_TIMEOUT = Duration.ofMinutes(30);

    /**
     * Plafond de lecture de la sortie.
     *
     * <p>La sortie est conservée en mémoire puis stockée comme preuve. Sans
     * limite, un hôte produisant un flux anormalement long ferait tomber le
     * service sur un dépassement de mémoire.
     */
    private static final int MAX_OUTPUT_BYTES = 32 * 1024 * 1024;

    @Inject
    NmapXmlParser xmlParser;

    public ScanResult scan(String target, String profile) throws Exception {
        long startTime = System.currentTimeMillis();

        List<String> command = buildCommand(target, profile);
        if (command == null) {
            throw new IllegalArgumentException("Profil de scan inconnu : " + profile);
        }

        // Arguments passés séparément, jamais une ligne de commande assemblée :
        // la cible n'est pas interprétée par un interpréteur de commandes, ce
        // qui ferme l'injection par le champ de saisie.
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(true);

        Process process = pb.start();

        String rawOutput;
        int exitCode;
        boolean timedOut = false;
        try {
            rawOutput = readProcessOutput(process);
            if (!process.waitFor(SCAN_TIMEOUT.toSeconds(), TimeUnit.SECONDS)) {
                timedOut = true;
                exitCode = -1;
            } else {
                exitCode = process.exitValue();
            }
        } finally {
            // Un processus encore vivant ici est un processus qu'on abandonne :
            // le tuer explicitement évite de laisser des nmap orphelins.
            if (process.isAlive()) {
                process.destroyForcibly();
            }
        }

        long duration = (System.currentTimeMillis() - startTime) / 1000;

        if (timedOut) {
            return new ScanResult(rawOutput, null, "FAILED", duration,
                SCAN_TIMEOUT_CODE + " : dépassement de " + SCAN_TIMEOUT.toMinutes() + " minutes");
        }

        if (exitCode != 0) {
            // La sortie est conservée : elle porte le message d'erreur de nmap,
            // qui explique souvent le refus (hôte injoignable, droits, syntaxe).
            return new ScanResult(rawOutput, null, "FAILED", duration,
                "Nmap exit code: " + exitCode);
        }

        // L'analyse peut échouer sur un document valide côté processus mais
        // illisible : ce cas doit ressortir en échec, jamais en « zéro constat ».
        List<NmapFinding> observations;
        try {
            observations = xmlParser.parse(rawOutput);
        } catch (NmapParseException e) {
            return new ScanResult(rawOutput, null, "FAILED", duration,
                NmapParseException.CODE + " : " + e.getMessage());
        }

        return new ScanResult(rawOutput, toJson(observations), "COMPLETED", duration, null);
    }

    /** Code stable pour un scan interrompu par le plafond de durée. */
    public static final String SCAN_TIMEOUT_CODE = "SCAN_TIMEOUT";

    private List<String> buildCommand(String target, String profile) {
        List<String> cmd = new ArrayList<>();
        cmd.add("nmap");

        // Connect scan explicite.
        //
        // Sans ce drapeau, nmap choisit un scan SYN, qui ouvre une socket brute
        // et exige donc les privilèges administrateur. Un service d'audit n'a pas
        // à s'exécuter avec ces droits : le connect scan passe par la pile TCP
        // ordinaire et fonctionne sous un compte non privilégié. Il est un peu
        // plus lent et plus visible dans les journaux de la cible, ce qui est un
        // compromis acceptable pour un audit mené avec autorisation.
        cmd.add("-sT");

        switch (profile) {
            case "BASIC":
                // Les 100 ports les plus courants.
                cmd.add("-F");
                break;
            case "STANDARD":
                // 1000 ports par défaut, avec identification des services.
                cmd.add("-sV");
                break;
            case "FULL":
                cmd.add("-p");
                cmd.add("1-65535");
                cmd.add("-sV");
                // La détection d'OS repose sur l'analyse de paquets bruts : elle
                // resterait sans effet ici et provoquerait le même échec de
                // privilèges. Elle est donc omise volontairement.
                break;
            case "NONE":
            default:
                return null;
        }

        // Sortie XML sur la sortie standard, lue directement par le parseur.
        cmd.add("-oX");
        cmd.add("-");

        // Pas de découverte préalable : la cible est déjà déclarée dans le
        // périmètre autorisé, et un ping bloqué ne doit pas annuler le scan.
        cmd.add("-Pn");
        cmd.add(target);

        return cmd;
    }

    /**
     * Lit la sortie du processus, dans la limite de {@link #MAX_OUTPUT_BYTES}.
     *
     * <p>La lecture doit être poursuivie même une fois le plafond atteint : un
     * processus dont personne ne vide le tuyau se bloque en écriture et ne
     * rendra jamais la main. On continue donc à consommer, sans accumuler.
     */
    private String readProcessOutput(Process process) throws IOException {
        StringBuilder output = new StringBuilder();
        boolean truncated = false;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (output.length() + line.length() + 1 > MAX_OUTPUT_BYTES) {
                    truncated = true;
                    continue;
                }
                output.append(line).append('\n');
            }
        }

        if (truncated) {
            // La marque reste dans la preuve : un document tronqué ne doit pas
            // se lire comme un document complet. Le parseur échouera ensuite sur
            // un XML incomplet, ce qui est le comportement voulu.
            output.append("<!-- sortie tronquée : plafond de ")
                  .append(MAX_OUTPUT_BYTES).append(" octets atteint -->\n");
        }
        return output.toString();
    }

    /**
     * Sérialise les observations pour la persistance.
     *
     * <p>Seuls les ports ouverts donnent lieu à un constat : un port fermé ou
     * filtré documente ce qui a été testé, mais ne décrit aucun service.
     *
     * <p><strong>Ce que ce document ne contient pas.</strong> Ni {@code cvss},
     * ni {@code cve}. La version précédente posait {@code severity = "MEDIUM"}
     * sur chaque port ouvert : un port 22 et un port 3389 ressortaient
     * identiques, et le rapport présentait une observation comme une
     * vulnérabilité. La gravité éventuelle dépend du service, de sa version,
     * des vulnérabilités qui la visent et du contexte de l'actif — rien de tout
     * cela n'est connu ici.
     *
     * <p>Ce qui est produit à la place est une <em>sévérité heuristique</em>,
     * nommée comme telle : une appréciation de l'exposition d'un service, pas
     * un défaut confirmé.
     */
    private JsonNode toJson(List<NmapFinding> observations) {
        ArrayNode array = objectMapper.createArrayNode();

        for (NmapFinding f : observations) {
            if (!f.isOpen()) {
                continue;
            }
            ObjectNode node = objectMapper.createObjectNode();

            node.put("type", FINDING_TYPE_OBSERVATION);
            node.put("port", f.port());
            node.put("protocol", f.protocol());
            node.put("state", f.state());

            // Le nom du service vient de nmap, jamais d'une table de ports :
            // déduire « 3306 donc MySQL » revient à affirmer ce qu'on n'a pas vu.
            putIfPresent(node, "service", f.serviceName());
            putIfPresent(node, "product", f.product());
            putIfPresent(node, "version", f.version());
            putIfPresent(node, "extra_info", f.extraInfo());

            node.put("title", title(f));
            node.put("description", description(f));

            // Exposition du service, distincte d'une vulnérabilité confirmée.
            node.put("heuristic_severity", ServiceExposure.of(f.port(), f.serviceName()).name());

            // Confiance dans l'observation elle-même. Un port ouvert constaté
            // par un scan de connexion est un fait établi ; l'identification du
            // service l'est moins quand nmap n'a rendu qu'un nom sans version.
            node.put("confidence", f.hasIdentifiedVersion() ? "HIGH" : "MEDIUM");

            // La preuve accompagne le constat : un auditeur doit pouvoir voir
            // sur quoi CYBERAS s'est appuyé sans rouvrir la sortie brute.
            ObjectNode evidence = objectMapper.createObjectNode();
            evidence.put("source", "NMAP");
            evidence.put("observed", f.port() + "/" + f.protocol() + " " + f.state()
                + (f.serviceDescription() == null ? "" : " " + f.serviceDescription()));
            node.set("evidence", evidence);

            array.add(node);
        }
        return array;
    }

    /** Catégorie de constat : ce qui a été observé, pas ce qui est vulnérable. */
    public static final String FINDING_TYPE_OBSERVATION = "OBSERVATION";

    private void putIfPresent(ObjectNode node, String field, String value) {
        if (value != null && !value.isBlank()) {
            node.put(field, value);
        }
    }

    private String title(NmapFinding f) {
        String service = f.serviceName() == null ? "service non identifié" : f.serviceName();
        return "Port " + f.port() + "/" + f.protocol() + " ouvert — " + service;
    }

    private String description(NmapFinding f) {
        StringBuilder sb = new StringBuilder();
        sb.append("Le port ").append(f.port()).append('/').append(f.protocol())
          .append(" accepte les connexions.");

        String desc = f.serviceDescription();
        if (desc == null) {
            sb.append(" Aucun service n'a pu être identifié : l'observation ne permet")
              .append(" pas, en l'état, de rechercher des vulnérabilités connues.");
        } else if (f.hasIdentifiedVersion()) {
            sb.append(" Service identifié : ").append(desc).append('.')
              .append(" Le produit et la version permettent une recherche de")
              .append(" vulnérabilités connues.");
        } else {
            sb.append(" Service identifié : ").append(desc).append('.')
              .append(" La version n'étant pas déterminée, aucune vulnérabilité")
              .append(" ne peut lui être associée de façon fiable.");
        }
        return sb.toString();
    }

    public static class ScanResult {
        public String rawOutput;
        public JsonNode parsedFindings;
        public String status;
        public Long durationSeconds;
        public String errorMessage;

        public ScanResult(String rawOutput, JsonNode parsedFindings, String status,
                         Long durationSeconds, String errorMessage) {
            this.rawOutput = rawOutput;
            this.parsedFindings = parsedFindings;
            this.status = status;
            this.durationSeconds = durationSeconds;
            this.errorMessage = errorMessage;
        }
    }
}
