package com.cyberas.security;

import java.util.Set;

/** Rôles système. Un rôle absent du jeton est traité comme VIEWER (lecture seule). */
public final class Roles {
    public static final String ADMIN = "ADMIN";
    public static final String RSSI = "RSSI";
    public static final String AUDITOR = "AUDITOR";
    public static final String VIEWER = "VIEWER";

    public static final Set<String> ALL = Set.of(ADMIN, RSSI, AUDITOR, VIEWER);
    /** Rôles autorisés à modifier les données d'une mission. */
    public static final String[] WRITERS = {ADMIN, RSSI, AUDITOR};

    private Roles() {}

    public static String normalize(String role) {
        if (role == null) return VIEWER;
        String upper = role.trim().toUpperCase();
        return switch (upper) {
            case "AUDITEUR" -> AUDITOR;
            default -> ALL.contains(upper) ? upper : VIEWER;
        };
    }
}
