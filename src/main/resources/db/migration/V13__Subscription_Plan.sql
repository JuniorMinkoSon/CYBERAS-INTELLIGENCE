-- V13 : formule d'abonnement de l'organisation
--
-- La formule détermine les référentiels ouverts à l'audit. Le socle — ISO 27001
-- et 27002 — est disponible pour tous ; les référentiels complémentaires
-- relèvent de la formule annuelle.
--
-- Elle ne détermine ni la qualité de l'évaluation, ni le score, ni les
-- recommandations : un audit mené sur le socle produit un résultat complet.
-- Restreindre la justesse d'une analyse selon ce qui est payé reviendrait à
-- vendre un audit qu'on sait incomplet.
--
-- Défaut « DECOUVERTE » et non « ANNUEL » : les organisations déjà inscrites
-- n'ont rien souscrit, et leur ouvrir la formule la plus large par effet de
-- migration serait une erreur difficile à reprendre ensuite.

ALTER TABLE organizations
    ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(30) NOT NULL DEFAULT 'DECOUVERTE';

COMMENT ON COLUMN organizations.subscription_plan IS
    'Formule souscrite (SubscriptionPlan). Détermine les référentiels disponibles à l''audit.';

-- Pas de contrainte de valeur : le code retombe sur DECOUVERTE pour toute
-- valeur inconnue, et une contrainte figerait le catalogue des formules dans le
-- schéma — chaque nouvelle offre imposerait alors une migration.

CREATE INDEX IF NOT EXISTS idx_organizations_plan ON organizations (subscription_plan);
