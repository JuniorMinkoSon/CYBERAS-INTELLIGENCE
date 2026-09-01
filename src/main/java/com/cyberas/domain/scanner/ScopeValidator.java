package com.cyberas.domain.scanner;

import com.cyberas.domain.entity.AuditScope;
import com.cyberas.domain.repository.AuditScopeRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.net.Inet4Address;
import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Validation du périmètre de scan.
 *
 * Un scan n'est autorisé que si sa cible correspond à au moins une entrée de
 * périmètre active de l'audit. Le refus est la valeur par défaut : en l'absence
 * de périmètre déclaré, aucun scan ne passe.
 *
 * Deux barrières successives :
 *   1. Liste de blocage absolue (loopback, link-local, metadata cloud, broadcast)
 *      qui prime sur toute autorisation — protection SSRF / pivot interne.
 *   2. Correspondance avec le périmètre autorisé de l'audit.
 */
@ApplicationScoped
public class ScopeValidator {

    @Inject
    AuditScopeRepository auditScopeRepository;

    /** Hostname RFC 1123, éventuellement pleinement qualifié. */
    private static final Pattern HOSTNAME_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?(\\.[a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?)*$"
    );

    /**
     * Adresses IPv4 des services de métadonnées cloud et des plages qui ne doivent
     * jamais être scannées, même si quelqu'un les déclare dans un périmètre.
     */
    private static final String[] HARD_BLOCKED_CIDRS = {
        "127.0.0.0/8",      // loopback
        "169.254.0.0/16",   // link-local — inclut 169.254.169.254 (metadata AWS/GCP/Azure)
        "0.0.0.0/8",        // "this network"
        "224.0.0.0/4",      // multicast
        "240.0.0.0/4"       // réservé
    };

    /** Résultat de validation : décision + motif exploitable en audit trail. */
    public record Result(boolean allowed, String reason, UUID matchedScopeId) {
        public static Result deny(String reason) {
            return new Result(false, reason, null);
        }

        public static Result allow(String reason, UUID scopeId) {
            return new Result(true, reason, scopeId);
        }
    }

    /**
     * Valide une cible contre le périmètre autorisé d'un audit.
     *
     * @param target   cible demandée (IP ou hostname)
     * @param auditId  audit portant le périmètre
     * @return décision motivée ; jamais null
     */
    public Result validate(String target, UUID auditId) {
        if (target == null || target.isBlank()) {
            return Result.deny("Cible vide");
        }

        String normalized = normalize(target);

        if (!isWellFormed(normalized)) {
            return Result.deny("Cible malformée : " + target);
        }

        // Barrière 1 — blocage absolu, non contournable par une déclaration de périmètre.
        String blocked = hardBlockReason(normalized);
        if (blocked != null) {
            return Result.deny(blocked);
        }

        // Barrière 2 — correspondance avec le périmètre déclaré et autorisé.
        List<AuditScope> scopes = auditScopeRepository.findActiveByAuditId(auditId);
        if (scopes.isEmpty()) {
            return Result.deny("Aucun périmètre autorisé n'est déclaré pour cet audit");
        }

        for (AuditScope scope : scopes) {
            if (matches(normalized, scope)) {
                return Result.allow(
                    "Cible couverte par le périmètre " + scope.scopeType + " " + scope.value,
                    scope.id
                );
            }
        }

        return Result.deny("Cible " + target + " hors du périmètre autorisé de l'audit");
    }

    /** Minuscules et suppression d'un éventuel port ou d'une barre finale. */
    private String normalize(String target) {
        String t = target.trim().toLowerCase(Locale.ROOT);
        if (t.endsWith("/")) {
            t = t.substring(0, t.length() - 1);
        }
        // Retire un port éventuel sur une cible non-IPv6 (host:port)
        int colon = t.indexOf(':');
        if (colon > 0 && t.indexOf(':', colon + 1) < 0 && !t.startsWith("[")) {
            String maybePort = t.substring(colon + 1);
            if (maybePort.matches("\\d{1,5}")) {
                t = t.substring(0, colon);
            }
        }
        return t;
    }

    private boolean isWellFormed(String target) {
        return isIpLiteral(target) || HOSTNAME_PATTERN.matcher(target).matches();
    }

    /**
     * Vérifie les plages interdites. Retourne le motif de blocage, ou null si la
     * cible passe cette barrière.
     */
    private String hardBlockReason(String target) {
        if (!isIpLiteral(target)) {
            // Un hostname qui se résout vers une plage interdite est bloqué lui aussi.
            InetAddress resolved = resolveQuietly(target);
            if (resolved == null) {
                return null; // non résoluble ici ; le périmètre reste seul juge
            }
            if (resolved.isLoopbackAddress() || resolved.isLinkLocalAddress() || resolved.isAnyLocalAddress()) {
                return "Cible interdite : " + target + " se résout vers une adresse locale (" + resolved.getHostAddress() + ")";
            }
            return null;
        }

        InetAddress addr = resolveQuietly(target);
        if (addr == null) {
            return "Adresse IP invalide : " + target;
        }
        if (addr.isLoopbackAddress() || addr.isLinkLocalAddress() || addr.isAnyLocalAddress() || addr.isMulticastAddress()) {
            return "Cible interdite : " + target + " appartient à une plage réservée";
        }
        if (addr instanceof Inet4Address) {
            for (String cidr : HARD_BLOCKED_CIDRS) {
                if (ipv4InCidr(addr, cidr)) {
                    return "Cible interdite : " + target + " appartient à la plage réservée " + cidr;
                }
            }
        }
        return null;
    }

    /** Une cible correspond-elle à une entrée de périmètre donnée ? */
    private boolean matches(String target, AuditScope scope) {
        if (!scope.isActive()) {
            return false;
        }
        String value = scope.value == null ? "" : scope.value.trim().toLowerCase(Locale.ROOT);
        if (value.isEmpty()) {
            return false;
        }

        return switch (scope.scopeType) {
            case AuditScope.TYPE_IP -> target.equals(value);
            case AuditScope.TYPE_CIDR -> matchesCidr(target, value);
            case AuditScope.TYPE_HOSTNAME -> target.equals(value);
            case AuditScope.TYPE_DOMAIN -> matchesDomain(target, value);
            default -> false;
        };
    }

    /**
     * Correspondance CIDR. Une cible hostname est résolue puis comparée : c'est le
     * seul cas où la résolution DNS entre dans la décision d'autorisation.
     */
    private boolean matchesCidr(String target, String cidr) {
        InetAddress addr = resolveQuietly(target);
        if (addr == null || !(addr instanceof Inet4Address)) {
            return false;
        }
        return ipv4InCidr(addr, cidr);
    }

    /** Correspondance domaine avec joker : *.corp.local couvre a.corp.local et corp.local. */
    private boolean matchesDomain(String target, String domain) {
        String base = domain.startsWith("*.") ? domain.substring(2) : domain;
        return target.equals(base) || target.endsWith("." + base);
    }

    private boolean ipv4InCidr(InetAddress addr, String cidr) {
        try {
            String[] parts = cidr.split("/");
            if (parts.length != 2) {
                return false;
            }
            InetAddress network = InetAddress.getByName(parts[0]);
            int prefix = Integer.parseInt(parts[1]);
            if (prefix < 0 || prefix > 32) {
                return false;
            }
            if (!(network instanceof Inet4Address)) {
                return false;
            }

            int addrBits = toInt(addr.getAddress());
            int netBits = toInt(network.getAddress());
            // Un préfixe /0 couvre tout : le décalage de 32 est indéfini en Java, on le traite à part.
            int mask = prefix == 0 ? 0 : (int) (0xFFFFFFFFL << (32 - prefix));

            return (addrBits & mask) == (netBits & mask);
        } catch (Exception e) {
            return false;
        }
    }

    private int toInt(byte[] bytes) {
        int result = 0;
        for (byte b : bytes) {
            result = (result << 8) | (b & 0xFF);
        }
        return result;
    }

    private boolean isIpLiteral(String value) {
        // Une forme purement numérique pointée, ou une notation IPv6
        return value.matches("^\\d{1,3}(\\.\\d{1,3}){3}$") || value.contains(":");
    }

    private InetAddress resolveQuietly(String host) {
        try {
            InetAddress addr = InetAddress.getByName(host);
            if (addr instanceof Inet6Address && !addr.isLoopbackAddress()) {
                return addr;
            }
            return addr;
        } catch (UnknownHostException | SecurityException e) {
            return null;
        }
    }
}
