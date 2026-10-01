-- =============================================================================
-- Cartographie : dire sur quelle machine le service est exposé
-- =============================================================================
--
-- Une ligne de cartographie disait « mysql, élevé, confidentialité » sans
-- jamais dire SUR QUELLE MACHINE. Un auditeur ne peut pas faire corriger un
-- service dont il ignore l'hôte, et le livrable perdait ainsi sa raison d'être :
-- désigner quoi traiter, et où.
--
-- La donnée existait pourtant. ScanExecutor.matchAsset résout l'actif et le
-- pose sur le constat ; scan.target porte l'adresse interrogée. Ni l'un ni
-- l'autre n'atteignait l'événement publié, donc ni la cartographie.
--
-- LAST_SEEN_AT répond à un second défaut. Aucune entrée n'était jamais retirée :
-- un port fermé entre deux scans laissait sa ligne en place indéfiniment, et la
-- cartographie ne pouvait que grossir. Un risque corrigé y restait comme s'il
-- courait toujours — ce qu'un livrable d'audit ne peut pas se permettre. La
-- date de dernière observation permet de distinguer ce qui est encore constaté
-- de ce qui ne l'est plus, sans effacer l'historique.
--
-- La cible entre dans la clé d'unicité : deux machines exposant le même service
-- sont deux constats distincts, et les confondre ferait disparaître l'une des
-- deux du livrable.
-- =============================================================================

ALTER TABLE risk_cartography_entries
    ADD COLUMN IF NOT EXISTS target       VARCHAR(255),
    ADD COLUMN IF NOT EXISTS asset_id     UUID REFERENCES assets(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP;

COMMENT ON COLUMN risk_cartography_entries.target IS
    'Adresse ou nom interrogé par le scan. Sans lui, la ligne ne désigne pas '
    'la machine à corriger.';
COMMENT ON COLUMN risk_cartography_entries.asset_id IS
    'Actif du périmètre correspondant à la cible, quand il en existe un.';
COMMENT ON COLUMN risk_cartography_entries.last_seen_at IS
    'Dernière observation du service. Distingue ce qui est encore constaté de '
    'ce qui ne l''est plus : aucune entrée n''étant retirée, une ligne ancienne '
    'se lirait sinon comme un risque courant.';

-- Les entrées existantes datent d'avant la cible : les supprimer plutôt que de
-- leur inventer une machine. Un nouveau scan les reconstruit complètes, et une
-- valeur devinée vaudrait moins que rien dans un livrable d'audit.
DELETE FROM risk_cartography_entries;

DROP INDEX IF EXISTS idx_risk_cartography_grain;

CREATE UNIQUE INDEX IF NOT EXISTS idx_risk_cartography_grain
    ON risk_cartography_entries (
        organization_id,
        COALESCE(audit_id, '00000000-0000-0000-0000-000000000000'::uuid),
        category,
        COALESCE(target, ''),
        COALESCE(service, ''),
        COALESCE(protocol, '')
    );
