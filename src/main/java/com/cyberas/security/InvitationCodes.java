package com.cyberas.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Codes de lien d'invitation.
 *
 * <p>Le code circule en clair dans le lien remis à la personne, mais la base
 * n'en garde que l'empreinte SHA-256 : qui lit la table n'obtient aucun accès.
 * Pas de sel — le code fait 192 bits d'aléa cryptographique, une table
 * précalculée est hors de portée ; et l'empreinte doit rester cherchable par
 * égalité, ce qu'un sel par ligne interdirait.
 */
public final class InvitationCodes {

    private static final SecureRandom RANDOM = new SecureRandom();

    private InvitationCodes() {}

    /** 24 octets d'aléa, 32 caractères sûrs dans une URL. */
    public static String generate() {
        byte[] bytes = new byte[24];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /** Empreinte stockée et cherchée en base (64 caractères hexadécimaux). */
    public static String hash(String plain) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(plain.trim().getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 indisponible", e);
        }
    }

    /** Quelques caractères pour reconnaître un lien sans pouvoir s'en servir. */
    public static String hint(String plain) {
        return plain.length() < 8 ? plain : plain.substring(0, 8);
    }
}
