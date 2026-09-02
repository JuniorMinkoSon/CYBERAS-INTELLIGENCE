package com.cyberas.security.ratelimit;

import com.cyberas.security.JwtContext;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.UUID;

@ApplicationScoped
public class RateLimitService {

    @Inject
    RateLimitStore rateLimitStore;

    @Inject
    JwtContext jwtContext;

    @ConfigProperty(name = "rate-limit.login.max", defaultValue = "5")
    int loginMaxAttempts;

    @ConfigProperty(name = "rate-limit.login.window-seconds", defaultValue = "900")
    int loginWindowSeconds;

    @ConfigProperty(name = "rate-limit.register.max", defaultValue = "3")
    int registerMaxAttempts;

    @ConfigProperty(name = "rate-limit.register.window-seconds", defaultValue = "3600")
    int registerWindowSeconds;

    @ConfigProperty(name = "rate-limit.api.max", defaultValue = "100")
    int apiMaxRequests;

    @ConfigProperty(name = "rate-limit.api.window-seconds", defaultValue = "60")
    int apiWindowSeconds;

    public boolean isLoginAllowed(String ipAddress) {
        return checkLimit("login:" + ipAddress, loginMaxAttempts, loginWindowSeconds);
    }

    public boolean isRegisterAllowed(String ipAddress) {
        return checkLimit("register:" + ipAddress, registerMaxAttempts, registerWindowSeconds);
    }

    public boolean isApiAllowed() {
        String identifier;
        if (jwtContext.isAuthenticated()) {
            UUID userId = jwtContext.getUserId();
            identifier = "api:user:" + userId;
        } else {
            String ipAddress = com.cyberas.security.RequestContext.getIpAddress();
            identifier = "api:ip:" + ipAddress;
        }
        return checkLimit(identifier, apiMaxRequests, apiWindowSeconds);
    }

    private boolean checkLimit(String key, int maxRequests, int windowSeconds) {
        int current = rateLimitStore.getCount(key);
        if (current >= maxRequests) {
            return false;
        }
        rateLimitStore.increment(key, windowSeconds);
        return true;
    }
}
