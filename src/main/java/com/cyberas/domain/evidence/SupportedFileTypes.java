package com.cyberas.domain.evidence;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * Types de fichiers acceptés comme pièces justificatives.
 *
 * <h2>Pourquoi une source unique</h2>
 *
 * <p>La liste vivait en deux endroits qui ne disaient pas la même chose : le
 * service de dépôt n'acceptait que PDF, DOCX, XLSX, CSV et TXT, tandis que
 * l'analyseur déclarait savoir lire PNG, JPEG et WebP. Le téléverseur refusait
 * donc des formats que l'analyse aurait su exploiter, et personne ne pouvait le
 * constater sans lire les deux fichiers.
 *
 * <p>Toute évolution de la liste se fait ici, et nulle part ailleurs.
 *
 * <h2>Lecture intégrale ou métadonnées</h2>
 *
 * <p>{@code readableInline} distingue les formats dont le contenu parvient
 * réellement à l'analyseur de ceux qu'il ne sait ouvrir — un DOCX ou un PPTX
 * est un conteneur compressé, transmis tel quel il n'apprendrait rien au
 * modèle. Ces formats restent acceptés : l'analyse se fait alors sur les seules
 * métadonnées, avec une confiance abaissée qui en tient compte.
 *
 * <p>C'est la règle de fond : <strong>ne pas savoir lire une pièce n'est pas un
 * constat de non-conformité</strong>. Un format opaque réduit la confiance de
 * l'analyse, jamais la note de l'audité.
 */
public final class SupportedFileTypes {

    /**
     * @param extension     extension en minuscules, sans point
     * @param mimeType      type MIME retenu quand le client n'en déclare pas
     * @param readableInline l'analyseur reçoit-il le contenu, ou seulement le nom
     */
    public record Type(String extension, String mimeType, boolean readableInline) {}

    private static final Map<String, Type> BY_EXTENSION = index(
        // Documents dont le contenu est transmis à l'analyse
        new Type("pdf",  "application/pdf", true),

        // Images : lisibles par l'analyseur, souvent la seule preuve disponible
        // (capture d'une console d'administration, photo d'un local technique).
        new Type("png",  "image/png",  true),
        new Type("jpg",  "image/jpeg", true),
        new Type("jpeg", "image/jpeg", true),
        new Type("webp", "image/webp", true),

        // Texte : transmis en clair, tronqué au besoin
        new Type("csv",  "text/csv",   false),
        new Type("txt",  "text/plain", false),

        // Conteneurs bureautiques : acceptés, analysés sur leurs métadonnées
        new Type("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", false),
        new Type("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", false),
        new Type("pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation", false)
    );

    private SupportedFileTypes() {
    }

    /** Type reconnu pour cette extension, vide si le format n'est pas accepté. */
    public static Optional<Type> byExtension(String extension) {
        if (extension == null) return Optional.empty();
        return Optional.ofNullable(BY_EXTENSION.get(extension.toLowerCase(Locale.ROOT)));
    }

    /** L'analyseur reçoit-il le contenu des fichiers de ce type MIME ? */
    public static boolean isReadableInline(String mimeType) {
        if (mimeType == null) return false;
        String normalized = mimeType.toLowerCase(Locale.ROOT);
        return BY_EXTENSION.values().stream()
            .anyMatch(t -> t.readableInline() && t.mimeType().equals(normalized));
    }

    public static Set<String> extensions() {
        return BY_EXTENSION.keySet();
    }

    /**
     * Le contenu correspond-il vraiment au type annoncé par l'extension ?
     *
     * <p>L'extension est ce que l'expéditeur a bien voulu écrire : un exécutable
     * renommé « rapport.pdf » la passe. Les premiers octets, eux, ne se
     * choisissent pas. Chaque famille a sa signature : {@code %PDF}, l'en-tête
     * PNG, {@code FF D8} pour JPEG, {@code RIFF….WEBP}, {@code PK} pour les
     * documents Office (des archives ZIP). Les fichiers texte n'ont pas de
     * signature : on vérifie qu'ils ne contiennent ni octet nul ni caractère de
     * contrôle — un binaire déguisé en .txt n'y survit pas.
     *
     * @param head les 16 premiers octets du fichier (ou moins s'il est plus court)
     */
    public static boolean matchesContent(Type type, byte[] head) {
        if (head == null || head.length == 0) return false;
        return switch (type.extension()) {
            case "pdf" -> startsWith(head, "%PDF".getBytes(java.nio.charset.StandardCharsets.US_ASCII));
            case "png" -> startsWith(head, new byte[] {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A});
            case "jpg", "jpeg" -> startsWith(head, new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF});
            case "webp" -> head.length >= 12
                && startsWith(head, "RIFF".getBytes(java.nio.charset.StandardCharsets.US_ASCII))
                && head[8] == 'W' && head[9] == 'E' && head[10] == 'B' && head[11] == 'P';
            case "docx", "xlsx", "pptx" -> startsWith(head, new byte[] {'P', 'K', 0x03, 0x04});
            case "csv", "txt" -> looksLikeText(head);
            default -> false;
        };
    }

    private static boolean startsWith(byte[] data, byte[] prefix) {
        if (data.length < prefix.length) return false;
        for (int i = 0; i < prefix.length; i++) {
            if (data[i] != prefix[i]) return false;
        }
        return true;
    }

    private static boolean looksLikeText(byte[] head) {
        for (byte b : head) {
            int c = b & 0xFF;
            // Tabulation, retour chariot, saut de ligne et tout ce qui suit
            // l'espace sont du texte ; le reste des caractères de contrôle, non.
            if (c == 0 || (c < 0x20 && c != 0x09 && c != 0x0A && c != 0x0D)) return false;
        }
        return true;
    }

    /** Énumération lisible, destinée aux messages d'erreur rendus à l'utilisateur. */
    public static String acceptedLabel() {
        return BY_EXTENSION.keySet().stream()
            .map(e -> e.toUpperCase(Locale.ROOT))
            .reduce((a, b) -> a + ", " + b)
            .orElse("");
    }

    private static Map<String, Type> index(Type... types) {
        // LinkedHashMap conservée telle quelle, et non copiée par Map.copyOf :
        // celui-ci ne garantit pas l'ordre d'itération, alors que le message
        // d'erreur se lit mieux groupé par famille qu'en ordre arbitraire.
        Map<String, Type> map = new LinkedHashMap<>();
        for (Type type : types) {
            map.put(type.extension(), type);
        }
        return Collections.unmodifiableMap(map);
    }
}
