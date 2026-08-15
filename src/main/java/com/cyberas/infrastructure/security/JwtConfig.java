package com.cyberas.infrastructure.security;

import io.quarkus.runtime.Startup;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

/**
 * Phase 0 Security Fix #1: JWT Secret from Environment Variable
 * Ensures secret is never hardcoded in source code
 *
 * Usage: Set environment variable before startup
 * export CYBERAS_JWT_SECRET="your-secret-key-minimum-32-chars-long"
 */
@ApplicationScoped
@Startup
public class JwtConfig {

    private static final Logger LOG = Logger.getLogger(JwtConfig.class);

    @ConfigProperty(name = "cyberas.jwt.secret")
    String jwtSecret;

    public String getJwtSecret() {
        if (jwtSecret == null || jwtSecret.isEmpty()) {
            String msg = "CRITICAL: CYBERAS_JWT_SECRET not configured. Set environment variable before startup.";
            LOG.error(msg);
            throw new RuntimeException(msg);
        }

        if (jwtSecret.length() < 32) {
            String msg = "CRITICAL: JWT secret must be at least 32 characters long for HS256";
            LOG.error(msg);
            throw new RuntimeException(msg);
        }

        LOG.info("JWT configuration loaded from environment variable");
        return jwtSecret;
    }
}
