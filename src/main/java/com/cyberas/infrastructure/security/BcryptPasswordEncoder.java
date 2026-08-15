package com.cyberas.infrastructure.security;

import at.favre.lib.crypto.bcrypt.BCrypt;

/**
 * Phase 0 Security Fix #2: Proper Password Hashing with Bcrypt
 * Replaces plaintext hashing in AuthService
 *
 * Dependency: Add to pom.xml
 * <dependency>
 *     <groupId>at.favre.lib</groupId>
 *     <artifactId>bcrypt</artifactId>
 *     <version>0.10.2</version>
 * </dependency>
 */
public class BcryptPasswordEncoder {

    private static final int STRENGTH = 12; // 2^12 iterations (slow but secure)

    /**
     * Hash password using bcrypt
     */
    public static String hash(String password) {
        return BCrypt.withDefaults().hashToString(STRENGTH, password.toCharArray());
    }

    /**
     * Verify password against bcrypt hash
     */
    public static boolean verify(String password, String hash) {
        return BCrypt.verifyer().verify(password.toCharArray(), hash).verified;
    }
}
