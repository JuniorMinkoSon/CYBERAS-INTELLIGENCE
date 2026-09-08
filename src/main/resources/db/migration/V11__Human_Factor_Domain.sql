-- V11 : domaine « facteur humain »
--
-- Le questionnaire couvrait treize domaines, tous techniques, organisationnels
-- ou réglementaires. Aucun ne portait sur les personnes, alors que c'est par
-- elles que passe la majorité des compromissions réelles : hameçonnage,
-- réutilisation de mots de passe, comptes laissés ouverts après un départ.
--
-- La seule question qui s'en approchait — GOV-03, sur la sensibilisation —
-- était rangée dans la gouvernance, où elle pesait comme une formalité de plus.
-- Elle y reste : la déplacer casserait les réponses déjà saisies, qui la
-- référencent par son code. Les questions ci-dessous la complètent sur ce que
-- la sensibilisation seule ne couvre pas.
--
-- Ce domaine est le quatrième pilier de la lecture par familles : technique,
-- organisationnel, humain, conformité.

INSERT INTO questionnaire_questions (id, code, domain, position, text, guidance, weight) VALUES
-- FACTEUR HUMAIN
(gen_random_uuid(), 'HUM-01', 'HUMAN', 1,
 'Les arrivées, mobilités et départs déclenchent-ils une révocation ou un ajustement effectif des accès, dans un délai défini ?',
 'Procédure d''entrée et de sortie, délai constaté entre le départ et la révocation, comptes orphelins détectés lors de la dernière revue.',
 3),

(gen_random_uuid(), 'HUM-02', 'HUMAN', 2,
 'Les collaborateurs disposent-ils d''un moyen simple de signaler un message suspect, et les signalements sont-ils traités ?',
 'Bouton de signalement, boîte dédiée, nombre de signalements sur les douze derniers mois et suites données. Un dispositif sans traitement décourage le signalement suivant.',
 3),

(gen_random_uuid(), 'HUM-03', 'HUMAN', 3,
 'Les populations les plus exposées — direction, comptabilité, administrateurs — font-elles l''objet de mesures renforcées ?',
 'Sensibilisation ciblée, double validation des virements, authentification renforcée pour les comptes à privilèges. Ces fonctions sont visées nommément par la fraude au président et le hameçonnage ciblé.',
 3);
