package com.cyberas.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class JwtUtils {

    @ConfigProperty(name = "mp.jwt.verify.issuer", defaultValue = "https://cyberas-audit-service")
    String issuer;

    @ConfigProperty(name = "jwt.secret", defaultValue = "cyberas-audit-service-dev-secret-key-minimum-256-bits-required-for-hs256")
    String secret;

    @ConfigProperty(name = "jwt.expiration-minutes", defaultValue = "1440")
    Long expirationMinutes;

    @ConfigProperty(name = "jwt.refresh-expiration-minutes", defaultValue = "10080")
    Long refreshExpirationMinutes;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(UUID userId, String email, UUID organizationId, String role) {
        return generateToken(userId, email, organizationId, role, expirationMinutes);
    }

    public String generateToken(UUID userId, String email, UUID organizationId, String role, Long expirationMinutes) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", userId.toString());
        claims.put("email", email);
        claims.put("org_id", organizationId.toString());
        claims.put("role", role);
        claims.put("iat", Instant.now().getEpochSecond());

        Instant issuedAt = Instant.now();
        Instant expiration = issuedAt.plusSeconds(expirationMinutes * 60);

        return Jwts.builder()
            .setClaims(claims)
            .setIssuer(issuer)
            .setIssuedAt(Date.from(issuedAt))
            .setExpiration(Date.from(expiration))
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
    }

    public String generateRefreshToken(UUID userId, UUID organizationId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", userId.toString());
        claims.put("org_id", organizationId.toString());
        claims.put("type", "REFRESH");

        Instant issuedAt = Instant.now();
        Instant expiration = issuedAt.plusSeconds(refreshExpirationMinutes * 60);

        return Jwts.builder()
            .setClaims(claims)
            .setIssuer(issuer)
            .setIssuedAt(Date.from(issuedAt))
            .setExpiration(Date.from(expiration))
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
    }

    public Optional<Claims> validateAndGetClaims(String token) {
        try {
            Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
            return Optional.of(claims);
        } catch (ExpiredJwtException e) {
            throw new JwtException("Token expired");
        } catch (SignatureException e) {
            throw new JwtException("Invalid signature");
        } catch (MalformedJwtException e) {
            throw new JwtException("Malformed token");
        } catch (JwtException e) {
            throw new JwtException("Invalid token");
        }
    }

    public Optional<UUID> getUserIdFromToken(String token) {
        try {
            Claims claims = validateAndGetClaims(token).orElse(null);
            if (claims == null) return Optional.empty();
            return Optional.of(UUID.fromString(claims.getSubject()));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public Optional<UUID> getOrganizationIdFromToken(String token) {
        try {
            Claims claims = validateAndGetClaims(token).orElse(null);
            if (claims == null) return Optional.empty();
            Object orgId = claims.get("org_id");
            if (orgId == null) return Optional.empty();
            return Optional.of(UUID.fromString(orgId.toString()));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public Optional<String> getRoleFromToken(String token) {
        try {
            Claims claims = validateAndGetClaims(token).orElse(null);
            if (claims == null) return Optional.empty();
            return Optional.ofNullable((String) claims.get("role"));
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
