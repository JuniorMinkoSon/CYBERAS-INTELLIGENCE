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

    @ConfigProperty(name = "rate-limit.scan.max", defaultValue = "10")
    int scanMaxLaunches;

    @ConfigProperty(name = "rate-limit.scan.window-seconds", defaultValue = "3600")
    int scanWindowSeconds;

    /**
     * Lancements de scan, comptés par organisation.
     *
     * <p>Un scan mobilise nmap sur le serveur pendant des minutes et frappe
     * une cible réelle : une boucle qui en lance cent n'est pas un usage,
     * c'est une attaque — sur la plateforme ou sur la cible.
     */
    public boolean isScanAllowed() {
        String identifier = jwtContext.isAuthenticated() && jwtContext.getOrganizationId() != null
            ? "scan:org:" + jwtContext.getOrganizationId()
            : "scan:ip:" + com.cyberas.security.RequestContext.getIpAddress();
        return checkLimit(identifier, scanMaxLaunches, scanWindowSeconds);
    }

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
