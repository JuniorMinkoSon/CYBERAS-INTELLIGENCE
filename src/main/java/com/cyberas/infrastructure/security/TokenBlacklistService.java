package com.cyberas.infrastructure.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.value.SetArgs;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

/**
 * Phase 0 Security Fix #5: Token Blacklist for Logout
 * Stores invalidated tokens in Redis with TTL = token expiration time
 * On token validation, check if token is blacklisted before accepting it
 */
@ApplicationScoped
public class TokenBlacklistService {

    private static final Logger LOG = Logger.getLogger(TokenBlacklistService.class);
    private static final String BLACKLIST_PREFIX = "token:blacklist:";

    @Inject
    RedisDataSource redisDataSource;

    @ConfigProperty(name = "cyberas.jwt.secret", defaultValue = "dev-secret-key-minimum-32-chars-long-not-for-production")
    String secretKey;

    /**
     * Blacklist token (on logout)
     * Extracts expiration time and sets Redis TTL accordingly
     */
    public void blacklistToken(String token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String jti = claims.getSubject(); // or use claims.getId() if JWT has explicit JTI
            Date expiration = claims.getExpiration();

            if (expiration != null) {
                // Calculate TTL: time until token expires
                long ttlSeconds = (expiration.getTime() - System.currentTimeMillis()) / 1000;

                if (ttlSeconds > 0) {
                    String key_entry = BLACKLIST_PREFIX + jti;
                    redisDataSource.value(String.class)
                            .set(key_entry, "blacklisted", new SetArgs().ex(Duration.ofSeconds(ttlSeconds)));
                    LOG.info("Token blacklisted: " + jti + " (TTL: " + ttlSeconds + "s)");
                }
            }
        } catch (Exception e) {
            LOG.error("Error blacklisting token", e);
            throw new RuntimeException("Failed to blacklist token", e);
        }
    }

    /**
     * Check if token is blacklisted
     * Returns true if token is in blacklist, false otherwise
     */
    public boolean isBlacklisted(String token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String jti = claims.getSubject();
            String key_entry = BLACKLIST_PREFIX + jti;

            String blacklisted = redisDataSource.value(String.class).get(key_entry);
            return blacklisted != null;
        } catch (Exception e) {
            // If token is invalid anyway, it's effectively blacklisted
            return true;
        }
    }
}
