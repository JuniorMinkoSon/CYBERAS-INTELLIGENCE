-- =============================================================================
-- Cartographie : un grain par service exposé, et des constats qu'on peut citer
-- =============================================================================
--
-- La cartographie agrégeait sur (organisation, audit, catégorie, protocole).
-- Comme la catégorie se déduisait du seul protocole, ce couple n'avait qu'un
-- degré de liberté : une mission produisait au plus deux lignes, et une cible
-- n'exposant que du TCP en produisait une seule. MySQL, le partage de fichiers
-- Windows et un HTTPS correctement chiffré y comptaient pour la même chose.
--
-- Trois colonnes changent cela.
--
-- SERVICE. Le grain devient le service observé, qui est le fait que le scanner
-- rapporte. Deux services distincts ne se confondent plus, et la clé d'unicité
-- le garantit.
--
-- RISK_CODE. Le code de la taxonomie R01-R12 que les 551 contrôles des sept
-- référentiels du dépôt portent déjà, identique dans les sept fichiers. Une
-- entrée de cartographie cite donc le même vocabulaire de risque que les
-- contrôles auxquels elle renverra.
--
-- FINDING_IDS. Ce qui manquait pour qu'une entrée soit opposable. Auparavant
-- seul « lastSummary » subsistait, écrasé à chaque constat : l'entrée portait
-- un compteur dont les faits comptés avaient disparu du chemin. On ne pouvait
-- remonter d'une ligne de cartographie à aucun constat. Un livrable d'audit
-- doit pouvoir citer ce sur quoi il repose.
--
-- L'ancienne clé unique tombe, la nouvelle prend le service en compte. Les
-- entrées existantes sont supprimées plutôt que migrées : elles ont été
-- produites par une règle dont on sait maintenant qu'elle rangeait tout le TCP
-- dans une case. Les convertir donnerait des lignes d'apparence correcte sur
-- des données qui ne le sont pas ; un nouveau scan les reconstruit justement.
-- =============================================================================

DELETE FROM risk_cartography_entries;

ALTER TABLE risk_cartography_entries
    DROP CONSTRAINT IF EXISTS risk_cartography_entries_organization_id_audit_id_category_p_key;

DROP INDEX IF EXISTS idx_risk_cartography_unique;
DROP INDEX IF EXISTS idx_risk_cartography_unique_org;

ALTER TABLE risk_cartography_entries
    ADD COLUMN IF NOT EXISTS service     VARCHAR(80),
    ADD COLUMN IF NOT EXISTS risk_code   VARCHAR(10),
    ADD COLUMN IF NOT EXISTS rationale   TEXT,
    ADD COLUMN IF NOT EXISTS finding_ids TEXT;

COMMENT ON COLUMN risk_cartography_entries.service IS
    'Service observé par le scanner. Grain de l''agrégation : deux services '
    'distincts ne se confondent plus dans une même ligne.';
COMMENT ON COLUMN risk_cartography_entries.risk_code IS
    'Code de la taxonomie R01-R12 portée par les référentiels du dépôt.';
COMMENT ON COLUMN risk_cartography_entries.rationale IS
    'Pourquoi ce service met ce critère en jeu. Sans motif, une ligne de '
    'cartographie n''est pas opposable en audit.';
COMMENT ON COLUMN risk_cartography_entries.finding_ids IS
    'Identifiants des constats à l''origine de la ligne, séparés par des '
    'virgules. Permet de remonter de la cartographie aux faits.';

-- Unicité au grain du service. COALESCE plutôt que des index partiels : audit
-- et service peuvent être nuls, et un index ordinaire laisserait alors passer
-- des doublons que la lecture agrégerait en double.
CREATE UNIQUE INDEX IF NOT EXISTS idx_risk_cartography_grain
    ON risk_cartography_entries (
        organization_id,
        COALESCE(audit_id, '00000000-0000-0000-0000-000000000000'::uuid),
        category,
        COALESCE(service, ''),
        COALESCE(protocol, '')
    );

CREATE INDEX IF NOT EXISTS idx_risk_cartography_audit
    ON risk_cartography_entries (organization_id, audit_id);
