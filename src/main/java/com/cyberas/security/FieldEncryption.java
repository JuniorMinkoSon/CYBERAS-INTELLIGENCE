package com.cyberas.security;

import org.eclipse.microprofile.config.ConfigProvider;
import org.jboss.logging.Logger;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Chiffrement des colonnes sensibles au repos.
 *
 * <p>Les commentaires du questionnaire et la sortie brute des scans décrivent
 * précisément les faiblesses d'une société. Une sauvegarde de la base qui
 * fuit, ou un accès direct à PostgreSQL, ne doit pas les livrer en clair. La
 * clé vit hors de la base, dans {@code CYBERAS_DATA_KEY} (32 octets en
 * base64) ; sans elle, la base seule ne dit rien.
 *
 * <p>AES-256-GCM, nonce aléatoire de 12 octets par valeur, stocké devant le
 * texte chiffré. La valeur en base commence par {@code enc:v1:} — les lignes
 * écrites avant l'activation du chiffrement n'ont pas ce préfixe et sont
 * relues telles quelles ; elles sont chiffrées à leur prochaine écriture.
 *
 * <p>Sans clé configurée, rien n'est chiffré et un avertissement est écrit au
 * démarrage : c'est le mode de développement local, jamais celui d'une
 * instance qui porte des données réelles. Une valeur chiffrée relue sans clé
 * lève une erreur explicite plutôt que de renvoyer le texte chiffré.
 */
public final class FieldEncryption {

    private static final Logger LOG = Logger.getLogger(FieldEncryption.class);
    private static final String PREFIX = "enc:v1:";
    private static final int NONCE_BYTES = 12;
    private static final int TAG_BITS = 128;
    private static final SecureRandom RANDOM = new SecureRandom();

    private static volatile SecretKey key;
    private static volatile boolean resolved;

    private FieldEncryption() {}

    private static SecretKey key() {
        if (!resolved) {
            synchronized (FieldEncryption.class) {
                if (!resolved) {
                    String raw = ConfigProvider.getConfig()
                        .getOptionalValue("cyberas.data-key", String.class).orElse("");
                    if (raw.isBlank()) {
                        LOG.warn("CYBERAS_DATA_KEY absente : les colonnes sensibles sont stockées en clair. "
                            + "Acceptable en développement seulement.");
                        key = null;
                    } else {
                        byte[] bytes = Base64.getDecoder().decode(raw.trim());
                        if (bytes.length != 32) {
                            throw new IllegalStateException(
                                "CYBERAS_DATA_KEY doit faire 32 octets (256 bits) en base64, reçu " + bytes.length);
                        }
                        key = new SecretKeySpec(bytes, "AES");
                    }
                    resolved = true;
                }
            }
        }
        return key;
    }

    public static boolean enabled() {
        return key() != null;
    }

    public static String encrypt(String plain) {
        if (plain == null) return null;
        SecretKey k = key();
        if (k == null) return plain;
        try {
            byte[] nonce = new byte[NONCE_BYTES];
            RANDOM.nextBytes(nonce);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, k, new GCMParameterSpec(TAG_BITS, nonce));
            byte[] cipherText = cipher.doFinal(plain.getBytes(StandardCharsets.UTF_8));
            byte[] out = new byte[nonce.length + cipherText.length];
            System.arraycopy(nonce, 0, out, 0, nonce.length);
            System.arraycopy(cipherText, 0, out, nonce.length, cipherText.length);
            return PREFIX + Base64.getEncoder().encodeToString(out);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Chiffrement impossible", e);
        }
    }

    public static String decrypt(String stored) {
        if (stored == null || !stored.startsWith(PREFIX)) return stored;
        SecretKey k = key();
        if (k == null) {
            throw new IllegalStateException(
                "Valeur chiffrée relue sans CYBERAS_DATA_KEY : configurez la clé qui a servi à l'écrire.");
        }
        try {
            byte[] in = Base64.getDecoder().decode(stored.substring(PREFIX.length()));
            GCMParameterSpec spec = new GCMParameterSpec(TAG_BITS, in, 0, NONCE_BYTES);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, k, spec);
            byte[] plain = cipher.doFinal(in, NONCE_BYTES, in.length - NONCE_BYTES);
            return new String(plain, StandardCharsets.UTF_8);
        } catch (GeneralSecurityException | IllegalArgumentException e) {
            throw new IllegalStateException("Déchiffrement impossible : clé différente ou donnée altérée", e);
        }
    }
}
