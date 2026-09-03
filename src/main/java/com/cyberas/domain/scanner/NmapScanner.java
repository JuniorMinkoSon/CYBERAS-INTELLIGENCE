package com.cyberas.domain.scanner;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
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

    public ScanResult scan(String target, String profile) throws Exception {
        long startTime = System.currentTimeMillis();

        // Build nmap command based on profile
        List<String> command = buildCommand(target, profile);

        // Execute nmap
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(true);

        Process process = pb.start();

        // Read output
        String rawOutput = readProcessOutput(process);

        int exitCode = process.waitFor();
        long duration = System.currentTimeMillis() - startTime;

        // Parse output
        JsonNode parsed = parseNmapOutput(rawOutput);

        return new ScanResult(
            rawOutput,
            parsed,
            exitCode == 0 ? "COMPLETED" : "FAILED",
            duration / 1000,
            exitCode == 0 ? null : "Nmap exit code: " + exitCode
        );
    }

    private List<String> buildCommand(String target, String profile) {
        List<String> cmd = new ArrayList<>();
        cmd.add("nmap");

        // Profile-based scanning
        switch (profile) {
            case "BASIC":
                // Quick scan - top 100 ports
                cmd.add("-F");
                break;
            case "STANDARD":
                // Standard scan - top 1000 ports (default)
                cmd.add("-sV"); // Service version detection
                break;
            case "FULL":
                // Comprehensive scan - all ports
                cmd.add("-p");
                cmd.add("1-65535");
                cmd.add("-sV");
                cmd.add("-O"); // OS detection
                break;
            case "NONE":
            default:
                // No actual scanning
                return null;
        }

        // Output format: JSON (requires nmap 7.80+)
        cmd.add("-oX");
        cmd.add("-"); // stdout

        // Other useful flags
        cmd.add("-Pn"); // No ping (assume host is up)
        cmd.add(target);

        return cmd;
    }

    private String readProcessOutput(Process process) throws IOException {
        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }
        return output.toString();
    }

    private JsonNode parseNmapOutput(String xmlOutput) {
        ArrayNode findings = objectMapper.createArrayNode();

        try {
            // Parse XML format output
            // Looking for patterns like:
            // <port protocol="tcp" portid="22"><state state="open"/><service name="ssh" product="OpenSSH"/></port>

            Pattern portPattern = Pattern.compile(
                "<port protocol=\"(\\w+)\" portid=\"(\\d+)\">.*?<state state=\"(\\w+)\".*?(?:</port>)"
            );

            Matcher matcher = portPattern.matcher(xmlOutput);
            while (matcher.find()) {
                String protocol = matcher.group(1);
                String port = matcher.group(2);
                String state = matcher.group(3);

                if ("open".equals(state)) {
                    ObjectNode finding = objectMapper.createObjectNode();
                    finding.put("port", Integer.parseInt(port));
                    finding.put("protocol", protocol);
                    finding.put("state", state);
                    finding.put("title", protocol.toUpperCase() + " port " + port + " open");
                    finding.put("severity", "MEDIUM");
                    finding.put("description", "Port " + port + "/" + protocol + " is open");
                    finding.put("service", guessService(Integer.parseInt(port)));

                    findings.add(finding);
                }
            }

            // Extract hostnames
            Pattern hostPattern = Pattern.compile("<hostname name=\"([^\"]+)\"");
            Matcher hostMatcher = hostPattern.matcher(xmlOutput);
            if (hostMatcher.find()) {
                ObjectNode hostInfo = objectMapper.createObjectNode();
                hostInfo.put("hostname", hostMatcher.group(1));
                hostInfo.put("source", "NMAP");
            }

        } catch (Exception e) {
            // If parsing fails, return raw output in findings
            ObjectNode error = objectMapper.createObjectNode();
            error.put("error", "Failed to parse nmap output");
            error.put("raw", xmlOutput.substring(0, Math.min(1000, xmlOutput.length())));
            findings.add(error);
        }

        return findings;
    }

    private String guessService(int port) {
        return switch (port) {
            case 22 -> "SSH";
            case 80 -> "HTTP";
            case 443 -> "HTTPS";
            case 3306 -> "MySQL";
            case 5432 -> "PostgreSQL";
            case 6379 -> "Redis";
            case 27017 -> "MongoDB";
            case 3389 -> "RDP";
            case 21 -> "FTP";
            case 25, 587, 465 -> "SMTP";
            case 53 -> "DNS";
            case 139, 445 -> "SMB";
            default -> "Unknown";
        };
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
