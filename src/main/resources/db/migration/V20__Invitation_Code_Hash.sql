-- Codes d'invitation hachés.
--
-- Le code était stocké en clair : une lecture de la table (sauvegarde qui
-- fuit, requête d'administration) donnait des liens d'accès prêts à l'emploi.
-- Il est désormais conservé comme un mot de passe — par son empreinte
-- SHA-256 — et n'apparaît en clair qu'une fois, à sa création. Une empreinte
-- courte à part permet toujours de reconnaître un lien dans une liste.
--
-- Les codes existants sont convertis sur place : les liens déjà envoyés
-- continuent de fonctionner.
ALTER TABLE invitations ALTER COLUMN code TYPE VARCHAR(64);
ALTER TABLE invitations ADD COLUMN code_hint VARCHAR(8);

UPDATE invitations
   SET code_hint = LEFT(code, 8),
       code      = encode(sha256(convert_to(code, 'UTF8')), 'hex')
 WHERE code_hint IS NULL AND LENGTH(code) < 64;
