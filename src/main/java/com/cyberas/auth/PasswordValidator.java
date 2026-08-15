package com.cyberas.auth;

import java.util.regex.Pattern;

/**
 * Phase 0 Security Fix #6: Password Policy Enforcement
 * Requires: 12+ chars, uppercase, lowercase, digit, special char
 */
public class PasswordValidator {

    private static final int MIN_LENGTH = 12;
    private static final String UPPERCASE_PATTERN = ".*[A-Z].*";
    private static final String LOWERCASE_PATTERN = ".*[a-z].*";
    private static final String DIGIT_PATTERN = ".*\\d.*";
    private static final String SPECIAL_PATTERN = ".*[!@#$%^&*()_+\\-=\\[\\]{};:'\",.<>?/\\\\|`~].*";

    private static final Pattern[] PATTERNS = {
        Pattern.compile(UPPERCASE_PATTERN),
        Pattern.compile(LOWERCASE_PATTERN),
        Pattern.compile(DIGIT_PATTERN),
        Pattern.compile(SPECIAL_PATTERN)
    };

    public static class PasswordValidationResult {
        public boolean valid;
        public String message;

        public PasswordValidationResult(boolean valid, String message) {
            this.valid = valid;
            this.message = message;
        }
    }

    public static PasswordValidationResult validate(String password) {
        if (password == null || password.isEmpty()) {
            return new PasswordValidationResult(false, "Password cannot be empty");
        }

        if (password.length() < MIN_LENGTH) {
            return new PasswordValidationResult(false,
                String.format("Password must be at least %d characters long", MIN_LENGTH));
        }

        if (!PATTERNS[0].matcher(password).matches()) {
            return new PasswordValidationResult(false, "Password must contain at least one uppercase letter");
        }

        if (!PATTERNS[1].matcher(password).matches()) {
            return new PasswordValidationResult(false, "Password must contain at least one lowercase letter");
        }

        if (!PATTERNS[2].matcher(password).matches()) {
            return new PasswordValidationResult(false, "Password must contain at least one digit");
        }

        if (!PATTERNS[3].matcher(password).matches()) {
            return new PasswordValidationResult(false, "Password must contain at least one special character");
        }

        return new PasswordValidationResult(true, "Password is valid");
    }
}
