package com.cyberas.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Convertisseur JPA : la colonne est chiffrée, l'entité voit le texte clair.
 *
 * <p>À poser avec {@code @Convert(converter = EncryptedStringConverter.class)}
 * sur les champs texte dont le contenu ne doit pas être lisible dans la base.
 * Voir {@link FieldEncryption} pour la clé, le format et le comportement sans
 * clé.
 *
 * <p>Conséquence à connaître : une colonne chiffrée ne se cherche plus par
 * {@code LIKE} ni ne se trie côté base. Ne l'appliquer qu'aux champs qu'on
 * lit entiers, jamais à un identifiant ni à un champ filtré.
 */
@Converter
public class EncryptedStringConverter implements AttributeConverter<String, String> {

    @Override
    public String convertToDatabaseColumn(String attribute) {
        return FieldEncryption.encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        return FieldEncryption.decrypt(dbData);
    }
}
