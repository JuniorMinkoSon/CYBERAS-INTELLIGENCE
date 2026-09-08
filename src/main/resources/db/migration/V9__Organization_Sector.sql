-- V9 : secteur d'activité de l'organisation
--
-- Le moteur de risque prenait des valeurs médianes pour l'impact métier et la
-- sensibilité des données, faute de savoir à quelle activité il avait affaire.
-- MEHARI fait dépendre l'impact d'un sinistre de ce que l'activité a de
-- précieux : la continuité pour un industriel, la confidentialité pour un
-- cabinet de santé, la conformité pour une banque. Le secteur, demandé une
-- seule fois à l'inscription, donne une base défendable à ces deux dimensions.
--
-- La colonne est nullable et sans contrainte de valeur : les organisations
-- déjà enregistrées n'ont pas déclaré leur secteur, et refuser leur lecture
-- casserait l'application. Une valeur absente ou inconnue est traitée comme
-- « AUTRE » par le code, avec un impact médian — une organisation qui n'a pas
-- renseigné son activité ne doit pas se retrouver avantagée dans le calcul par
-- rapport à celle qui l'a fait.

ALTER TABLE organizations
    ADD COLUMN IF NOT EXISTS sector VARCHAR(50);

COMMENT ON COLUMN organizations.sector IS
    'Secteur d''activité (BusinessSector). Alimente l''impact métier et la sensibilité des données par défaut, selon l''approche MEHARI.';

-- Chemin d'accès du tableau de bord sectoriel et des comparaisons entre pairs.
CREATE INDEX IF NOT EXISTS idx_organizations_sector ON organizations (sector);
