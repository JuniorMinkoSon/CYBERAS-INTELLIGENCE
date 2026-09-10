-- V16 : élargissement des états de document
--
-- La contrainte posée en V5 n'autorisait que UPLOADED, REVIEWED et REJECTED.
-- Trois états ne suffisent pas à distinguer les deux situations que l'analyse
-- doit absolument séparer :
--
--   NON_EXPLOITABLE  — la pièce a été lue, elle ne démontre rien
--   FAILED           — la pièce n'a pas pu être lue du tout
--
-- Les confondre reviendrait à traiter une panne technique comme une
-- non-conformité, ce qui est précisément l'erreur que la pondération des
-- preuves évite déjà côté calcul. L'état doit porter la même distinction.
--
-- REVIEWED est conservé : des lignes existantes le portent et le service
-- l'accepte. Le retirer casserait des données en place pour un gain nul.

ALTER TABLE documents DROP CONSTRAINT IF EXISTS chk_document_status;

ALTER TABLE documents ADD CONSTRAINT chk_document_status CHECK (status IN (
    -- Cycle de vie du fichier
    'UPLOADED',         -- reçu et stocké, rien de plus
    'PROCESSING',       -- extraction en cours
    'ANALYZING',        -- soumis à l'analyseur
    'ANALYZED',         -- analysé, résultat exploitable

    -- Issues de l'analyse
    'REVIEW_REQUIRED',  -- analyse peu sûre : un humain doit trancher
    'NON_EXPLOITABLE',  -- lu, mais n'établit rien d'utile
    'FAILED',           -- illisible : panne technique, jamais une non-conformité

    -- Décisions humaines
    'VALIDATED',        -- accepté par l'auditeur
    'REVIEWED',         -- conservé pour les lignes antérieures à V16
    'REJECTED'          -- écarté par l'auditeur
));

COMMENT ON COLUMN documents.status IS
    'État de la pièce. FAILED (illisible) et NON_EXPLOITABLE (lue mais sans valeur probante) '
    'sont distincts : le premier est une panne, le second un constat. Ni l''un ni l''autre '
    'ne vaut zéro de conformité.';
