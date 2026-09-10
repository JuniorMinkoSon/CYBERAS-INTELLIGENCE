-- V17 : rattachement direct d'une pièce à un contrôle
--
-- Une pièce ne pouvait étayer qu'une question, un constat ou une
-- recommandation. Or toutes les preuves ne passent pas par une question : une
-- politique signée démontre A.5.1 sans qu'aucune question Cyberas n'ait besoin
-- d'exister, et un auditeur qui travaille contrôle par contrôle n'a pas à
-- chercher quelle question sert de détour.
--
-- La colonne s'ajoute aux cibles existantes au lieu de les remplacer. Le lien
-- vers la question reste la voie normale pour l'audité, qui répond à des
-- questions ; le lien vers le contrôle sert l'auditeur, qui raisonne par
-- référentiel. Les deux coexistent, et la couverture réelle d'un contrôle se
-- lit en réunissant les deux chemins :
--
--   direct    : evidences.control_id = ce contrôle
--   indirect  : evidences.question_id → question_control_mapping → ce contrôle
--
-- C'est cette réunion qui donne sa valeur aux 52 correspondances semées en
-- V15 : les pièces déjà jointes aux questions couvrent des contrôles ISO sans
-- que personne ait à les rattacher une seconde fois.

ALTER TABLE evidences
    ADD COLUMN IF NOT EXISTS control_id UUID REFERENCES controls(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_evidences_control ON evidences (control_id);

-- La contrainte garantissait qu'une preuve vise au moins quelque chose. Le
-- contrôle devient une cible légitime au même titre que les trois autres ;
-- sans cette reprise, tout rattachement direct à un contrôle serait rejeté.
ALTER TABLE evidences DROP CONSTRAINT IF EXISTS chk_evidence_target;

ALTER TABLE evidences ADD CONSTRAINT chk_evidence_target CHECK (
    question_id IS NOT NULL
    OR control_id IS NOT NULL
    OR finding_id IS NOT NULL
    OR recommendation_id IS NOT NULL
);

COMMENT ON COLUMN evidences.control_id IS
    'Contrôle directement étayé. Complémentaire de question_id, jamais exclusif : '
    'la couverture d''un contrôle réunit les pièces qui le visent et celles jointes '
    'aux questions qui lui sont rattachées.';
