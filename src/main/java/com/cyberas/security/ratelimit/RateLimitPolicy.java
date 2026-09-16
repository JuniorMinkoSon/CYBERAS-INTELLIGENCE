package com.cyberas.security.ratelimit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimitPolicy {
    PolicyType type();

    enum PolicyType {
        LOGIN, REGISTER, API,
        /** Lancement de scan : coûteux pour la plateforme et pour la cible. */
        SCAN
    }
}
