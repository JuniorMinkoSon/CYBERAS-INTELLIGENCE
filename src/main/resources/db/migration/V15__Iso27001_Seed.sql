-- V15 : référentiel ISO/IEC 27001:2022 — 93 contrôles de l'Annexe A
--
-- IMPORTANT — droit d'auteur
--
-- ISO/IEC 27001 est une norme protégée. Ce fichier ne reproduit AUCUN texte
-- officiel. Il retient uniquement ce qui est factuel et librement citable :
-- l'identifiant du contrôle (« A.5.15 ») et son rattachement à l'un des quatre
-- thèmes de l'Annexe A. Les titres et descriptions sont des formulations
-- Cyberas, rédigées du point de vue de ce qu'un auditeur doit vérifier.
--
-- Toute reprise ultérieure de libellés normatifs dans ces colonnes serait une
-- régression juridique, pas une amélioration de précision.
--
-- Périmètre : l'Annexe A seule, soit 93 contrôles. Les exigences du système de
-- management (clauses 4 à 10) n'en font pas partie et ne sont donc pas semées
-- ici — c'est pourquoi les questions d'analyse de risque restent sans
-- correspondance à l'issue de cette migration, ce qui est le résultat correct.
--
-- Idempotence : chaque insertion est protégée par ON CONFLICT DO NOTHING sur
-- les contraintes d'unicité posées en V14. Rejouer ce script ne crée aucun
-- doublon et ne modifie aucune donnée existante.

-- ---------------------------------------------------------------------------
-- 1. Le référentiel
-- ---------------------------------------------------------------------------
INSERT INTO frameworks (code, name, description, provider, reference_url, active)
VALUES (
    'ISO27001',
    'ISO/IEC 27001',
    'Référentiel de management de la sécurité de l''information. Cyberas en exploite l''Annexe A, soit 93 contrôles répartis en quatre thèmes.',
    'ISO/IEC',
    'https://www.iso.org/standard/27001',
    TRUE
)
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. La version
-- ---------------------------------------------------------------------------
INSERT INTO framework_versions (framework_id, version, status, effective_from, metadata)
SELECT f.id, '2022', 'ACTIVE', DATE '2022-10-25',
       jsonb_build_object(
           'annexControlCount', 93,
           'themes', jsonb_build_array('Organisationnel', 'Personnes', 'Physique', 'Technologique'),
           'scope', 'Annexe A uniquement — les clauses 4 a 10 ne sont pas des controles'
       )
FROM frameworks f
WHERE f.code = 'ISO27001'
ON CONFLICT (framework_id, version) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. Les 93 contrôles
--
-- Poids : 3 pour les contrôles dont l'absence expose directement (accès,
-- sauvegarde, correctifs), 2 pour l'essentiel du corpus, 1 pour ceux dont
-- l'effet est indirect ou fortement dépendant du contexte.
-- ---------------------------------------------------------------------------
INSERT INTO controls (framework_version_id, code, title, description, category, domain, weight, position)
SELECT v.id, c.code, c.title, c.description, c.category, c.domain, c.weight, c.position
FROM framework_versions v
JOIN frameworks f ON f.id = v.framework_id AND f.code = 'ISO27001'
CROSS JOIN (VALUES
    -- ===================== A.5 — Organisationnel (37) =====================
    ('A.5.1',  'Politiques de sécurité de l''information', 'Un corps de politiques est approuvé par la direction, diffusé et revu à intervalle défini.', 'Organisationnel', 'GOVERNANCE', 3, 1),
    ('A.5.2',  'Rôles et responsabilités de sécurité', 'Les responsabilités de sécurité sont attribuées nommément et connues des intéressés.', 'Organisationnel', 'GOVERNANCE', 3, 2),
    ('A.5.3',  'Séparation des tâches', 'Les fonctions dont le cumul permettrait une fraude ou une erreur non détectée sont séparées.', 'Organisationnel', 'GOVERNANCE', 2, 3),
    ('A.5.4',  'Implication de la direction', 'La direction exige et soutient l''application des règles de sécurité.', 'Organisationnel', 'GOVERNANCE', 2, 4),
    ('A.5.5',  'Relations avec les autorités', 'Les contacts avec les autorités compétentes sont identifiés et entretenus.', 'Organisationnel', NULL, 1, 5),
    ('A.5.6',  'Relations avec les groupes spécialisés', 'L''organisation entretient un lien avec des groupes professionnels de sécurité.', 'Organisationnel', NULL, 1, 6),
    ('A.5.7',  'Renseignement sur les menaces', 'Les informations sur les menaces sont collectées et exploitées pour ajuster les mesures.', 'Organisationnel', 'DETECTION', 2, 7),
    ('A.5.8',  'Sécurité dans la gestion de projet', 'Les exigences de sécurité sont prises en compte dès la conception des projets.', 'Organisationnel', NULL, 2, 8),
    ('A.5.9',  'Inventaire des actifs et des informations', 'Un inventaire est tenu à jour, chaque actif ayant un propriétaire identifié.', 'Organisationnel', 'ASSETS', 3, 9),
    ('A.5.10', 'Règles d''usage des actifs', 'Les usages autorisés des actifs et de l''information sont définis et portés à connaissance.', 'Organisationnel', 'ASSETS', 2, 10),
    ('A.5.11', 'Restitution des actifs', 'Les actifs confiés sont restitués au départ ou au changement de fonction.', 'Organisationnel', 'ASSETS', 2, 11),
    ('A.5.12', 'Classification de l''information', 'L''information est classée selon sa sensibilité, avec des règles de traitement par niveau.', 'Organisationnel', 'DATA', 2, 12),
    ('A.5.13', 'Marquage de l''information', 'Le niveau de classification est porté sur les supports et les documents.', 'Organisationnel', 'DATA', 1, 13),
    ('A.5.14', 'Transfert d''information', 'Les échanges internes et externes sont encadrés par des règles et des moyens protégés.', 'Organisationnel', 'DATA', 2, 14),
    ('A.5.15', 'Contrôle d''accès', 'Les règles d''accès sont définies à partir des besoins métier et du moindre privilège.', 'Organisationnel', 'ACCESS', 3, 15),
    ('A.5.16', 'Gestion des identités', 'Le cycle de vie des identités est maîtrisé, de la création à la suppression.', 'Organisationnel', 'ACCESS', 3, 16),
    ('A.5.17', 'Secrets d''authentification', 'L''attribution et la gestion des mots de passe et autres secrets suivent un processus maîtrisé.', 'Organisationnel', 'ACCESS', 3, 17),
    ('A.5.18', 'Attribution et revue des droits d''accès', 'Les droits sont accordés, modifiés et retirés selon un processus, et revus périodiquement.', 'Organisationnel', 'ACCESS', 3, 18),
    ('A.5.19', 'Sécurité dans les relations fournisseurs', 'Les risques liés au recours à des tiers sont identifiés et traités.', 'Organisationnel', 'SUPPLIERS', 2, 19),
    ('A.5.20', 'Clauses de sécurité dans les accords fournisseurs', 'Les exigences de sécurité figurent dans les contrats et sont opposables.', 'Organisationnel', 'SUPPLIERS', 2, 20),
    ('A.5.21', 'Sécurité de la chaîne d''approvisionnement', 'Les risques portés par la chaîne d''approvisionnement des produits et services sont maîtrisés.', 'Organisationnel', 'SUPPLIERS', 2, 21),
    ('A.5.22', 'Suivi et revue des services fournisseurs', 'Le niveau de service et de sécurité des tiers est surveillé et revu.', 'Organisationnel', 'SUPPLIERS', 2, 22),
    ('A.5.23', 'Sécurité des services cloud', 'L''acquisition, l''usage et la sortie des services cloud sont encadrés.', 'Organisationnel', 'SUPPLIERS', 2, 23),
    ('A.5.24', 'Préparation à la gestion des incidents', 'Les rôles, les procédures et les moyens de réponse sont définis avant l''incident.', 'Organisationnel', 'INCIDENTS', 3, 24),
    ('A.5.25', 'Qualification des événements', 'Les événements de sécurité sont évalués pour décider s''ils constituent un incident.', 'Organisationnel', 'INCIDENTS', 2, 25),
    ('A.5.26', 'Traitement des incidents', 'Les incidents sont traités conformément aux procédures établies.', 'Organisationnel', 'INCIDENTS', 3, 26),
    ('A.5.27', 'Enseignements tirés des incidents', 'Les incidents alimentent le renforcement des mesures.', 'Organisationnel', 'INCIDENTS', 2, 27),
    ('A.5.28', 'Collecte de preuves', 'Les éléments de preuve sont identifiés, collectés et conservés de façon exploitable.', 'Organisationnel', 'INCIDENTS', 2, 28),
    ('A.5.29', 'Sécurité pendant une perturbation', 'Le niveau de sécurité est maintenu pendant les situations dégradées.', 'Organisationnel', 'CONTINUITY', 2, 29),
    ('A.5.30', 'Continuité des services TIC', 'La continuité informatique est préparée, documentée et testée.', 'Organisationnel', 'CONTINUITY', 3, 30),
    ('A.5.31', 'Exigences légales, réglementaires et contractuelles', 'Les obligations applicables sont identifiées, documentées et tenues à jour.', 'Organisationnel', 'COMPLIANCE', 2, 31),
    ('A.5.32', 'Propriété intellectuelle', 'Les droits de propriété intellectuelle et les licences logicielles sont respectés.', 'Organisationnel', 'COMPLIANCE', 1, 32),
    ('A.5.33', 'Protection des enregistrements', 'Les enregistrements sont protégés contre la perte, l''altération et l''accès non autorisé.', 'Organisationnel', 'COMPLIANCE', 2, 33),
    ('A.5.34', 'Protection des données à caractère personnel', 'Les traitements de données personnelles respectent les exigences applicables.', 'Organisationnel', 'COMPLIANCE', 2, 34),
    ('A.5.35', 'Revue indépendante de la sécurité', 'La démarche de sécurité fait l''objet de revues indépendantes planifiées.', 'Organisationnel', 'COMPLIANCE', 2, 35),
    ('A.5.36', 'Conformité aux politiques internes', 'L''application effective des politiques et procédures est contrôlée.', 'Organisationnel', 'COMPLIANCE', 2, 36),
    ('A.5.37', 'Procédures d''exploitation documentées', 'Les procédures d''exploitation sont écrites et accessibles aux personnes concernées.', 'Organisationnel', NULL, 2, 37),

    -- ======================= A.6 — Personnes (8) =========================
    ('A.6.1',  'Vérification avant embauche', 'Les vérifications préalables sont proportionnées à la sensibilité du poste.', 'Personnes', 'HUMAN', 2, 38),
    ('A.6.2',  'Clauses de sécurité dans les contrats', 'Les obligations de sécurité figurent dans les contrats de travail.', 'Personnes', 'HUMAN', 2, 39),
    ('A.6.3',  'Sensibilisation et formation', 'Le personnel est sensibilisé et formé selon son rôle, de façon continue.', 'Personnes', 'HUMAN', 3, 40),
    ('A.6.4',  'Processus disciplinaire', 'Un processus connu sanctionne les manquements avérés aux règles de sécurité.', 'Personnes', 'HUMAN', 1, 41),
    ('A.6.5',  'Obligations après départ ou mobilité', 'Les droits et les obligations sont ajustés lors des départs et des changements de poste.', 'Personnes', 'HUMAN', 3, 42),
    ('A.6.6',  'Engagements de confidentialité', 'Des engagements de confidentialité sont signés et tenus à jour.', 'Personnes', 'HUMAN', 2, 43),
    ('A.6.7',  'Travail à distance', 'Le travail hors des locaux est encadré par des mesures adaptées.', 'Personnes', 'NETWORK', 2, 44),
    ('A.6.8',  'Signalement des événements de sécurité', 'Chacun dispose d''un moyen simple et connu de signaler un événement suspect.', 'Personnes', 'HUMAN', 3, 45),

    -- ======================== A.7 — Physique (14) ========================
    ('A.7.1',  'Périmètres de sécurité physique', 'Des périmètres protègent les zones abritant des actifs sensibles.', 'Physique', 'PHYSICAL', 2, 46),
    ('A.7.2',  'Contrôle des entrées', 'Les accès physiques sont contrôlés et tracés.', 'Physique', 'PHYSICAL', 3, 47),
    ('A.7.3',  'Sécurisation des bureaux et des locaux', 'Les locaux sont conçus et protégés en fonction des actifs qu''ils abritent.', 'Physique', 'PHYSICAL', 2, 48),
    ('A.7.4',  'Surveillance physique', 'Les zones sensibles font l''objet d''une surveillance permettant de détecter les accès non autorisés.', 'Physique', 'PHYSICAL', 2, 49),
    ('A.7.5',  'Menaces physiques et environnementales', 'Les protections contre l''incendie, l''eau et les autres menaces sont en place.', 'Physique', 'PHYSICAL', 2, 50),
    ('A.7.6',  'Travail en zone sécurisée', 'Des règles encadrent le travail dans les zones sensibles.', 'Physique', 'PHYSICAL', 1, 51),
    ('A.7.7',  'Bureau propre et écran verrouillé', 'Les documents et les sessions ne restent pas exposés sans surveillance.', 'Physique', 'PHYSICAL', 1, 52),
    ('A.7.8',  'Emplacement et protection des équipements', 'Les équipements sont installés de façon à limiter les risques et les accès.', 'Physique', 'PHYSICAL', 2, 53),
    ('A.7.9',  'Protection des actifs hors des locaux', 'Les actifs utilisés à l''extérieur bénéficient de protections équivalentes.', 'Physique', 'PHYSICAL', 2, 54),
    ('A.7.10', 'Gestion des supports de stockage', 'Le cycle de vie des supports est maîtrisé, du marquage à la destruction.', 'Physique', 'ASSETS', 2, 55),
    ('A.7.11', 'Alimentation et services généraux', 'Les équipements sont protégés des défaillances d''alimentation et des services support.', 'Physique', 'PHYSICAL', 2, 56),
    ('A.7.12', 'Sécurité du câblage', 'Les câblages d''alimentation et de données sont protégés des atteintes et des interceptions.', 'Physique', 'PHYSICAL', 1, 57),
    ('A.7.13', 'Maintenance des équipements', 'La maintenance est réalisée de façon à préserver la disponibilité et la confidentialité.', 'Physique', 'PHYSICAL', 2, 58),
    ('A.7.14', 'Mise au rebut ou réemploi sécurisé', 'Les équipements sont effacés ou détruits de façon vérifiable avant sortie ou réemploi.', 'Physique', 'ASSETS', 2, 59),

    -- ===================== A.8 — Technologique (34) ======================
    ('A.8.1',  'Sécurisation des terminaux', 'Les postes et terminaux sont configurés et protégés selon un standard.', 'Technologique', 'DETECTION', 3, 60),
    ('A.8.2',  'Droits d''accès privilégiés', 'Les comptes à privilèges sont limités, nominatifs et surveillés.', 'Technologique', 'ACCESS', 3, 61),
    ('A.8.3',  'Restriction d''accès à l''information', 'L''accès à l''information est restreint conformément à la politique d''accès.', 'Technologique', 'ACCESS', 3, 62),
    ('A.8.4',  'Accès au code source', 'L''accès en lecture et en écriture au code source est contrôlé.', 'Technologique', 'APPLICATIONS', 2, 63),
    ('A.8.5',  'Authentification sécurisée', 'Les moyens d''authentification sont adaptés au risque, notamment pour les accès distants et privilégiés.', 'Technologique', 'ACCESS', 3, 64),
    ('A.8.6',  'Dimensionnement des capacités', 'Les capacités sont surveillées et anticipées pour préserver la disponibilité.', 'Technologique', 'CONTINUITY', 1, 65),
    ('A.8.7',  'Protection contre les programmes malveillants', 'Des protections sont déployées, tenues à jour et supervisées.', 'Technologique', 'DETECTION', 3, 66),
    ('A.8.8',  'Gestion des vulnérabilités techniques', 'Les vulnérabilités sont recherchées, qualifiées et corrigées dans des délais définis.', 'Technologique', 'VULNERABILITIES', 3, 67),
    ('A.8.9',  'Gestion des configurations', 'Les configurations suivent des standards de durcissement et sont contrôlées dans la durée.', 'Technologique', 'VULNERABILITIES', 3, 68),
    ('A.8.10', 'Suppression des informations', 'Les informations qui ne sont plus nécessaires sont supprimées de façon sûre.', 'Technologique', 'DATA', 2, 69),
    ('A.8.11', 'Masquage des données', 'Les données sensibles sont masquées lorsque leur exposition n''est pas nécessaire.', 'Technologique', 'DATA', 1, 70),
    ('A.8.12', 'Prévention des fuites de données', 'Des mesures détectent et empêchent les extractions non autorisées.', 'Technologique', 'DATA', 2, 71),
    ('A.8.13', 'Sauvegarde des informations', 'Les sauvegardes sont réalisées, protégées et restaurées à l''essai.', 'Technologique', 'CONTINUITY', 3, 72),
    ('A.8.14', 'Redondance des moyens de traitement', 'La redondance est dimensionnée sur les exigences de disponibilité.', 'Technologique', 'CONTINUITY', 2, 73),
    ('A.8.15', 'Journalisation', 'Les journaux sont produits, protégés contre l''altération et conservés.', 'Technologique', 'DETECTION', 3, 74),
    ('A.8.16', 'Surveillance des activités', 'Les systèmes et les réseaux sont surveillés pour détecter les comportements anormaux.', 'Technologique', 'DETECTION', 3, 75),
    ('A.8.17', 'Synchronisation des horloges', 'Les horloges sont synchronisées sur une source de référence commune.', 'Technologique', 'DETECTION', 1, 76),
    ('A.8.18', 'Usage des utilitaires à privilèges', 'Les outils capables de contourner les contrôles sont restreints et tracés.', 'Technologique', 'ACCESS', 2, 77),
    ('A.8.19', 'Installation de logiciels en exploitation', 'L''installation de logiciels sur les systèmes en production est encadrée.', 'Technologique', 'APPLICATIONS', 2, 78),
    ('A.8.20', 'Sécurité des réseaux', 'Les réseaux sont protégés et administrés de façon à préserver les systèmes qu''ils portent.', 'Technologique', 'NETWORK', 3, 79),
    ('A.8.21', 'Sécurité des services réseau', 'Les mécanismes de sécurité et niveaux de service des services réseau sont identifiés et appliqués.', 'Technologique', 'NETWORK', 3, 80),
    ('A.8.22', 'Cloisonnement des réseaux', 'Les groupes de services et de systèmes sont séparés sur le réseau.', 'Technologique', 'NETWORK', 3, 81),
    ('A.8.23', 'Filtrage web', 'Les accès aux sites externes sont filtrés pour réduire l''exposition.', 'Technologique', 'NETWORK', 1, 82),
    ('A.8.24', 'Usage de la cryptographie', 'Les règles d''usage de la cryptographie et de gestion des clés sont définies et appliquées.', 'Technologique', 'DATA', 3, 83),
    ('A.8.25', 'Cycle de développement sécurisé', 'Des règles de développement sécurisé encadrent la construction des logiciels.', 'Technologique', 'APPLICATIONS', 2, 84),
    ('A.8.26', 'Exigences de sécurité applicatives', 'Les exigences de sécurité sont spécifiées avant le développement ou l''acquisition.', 'Technologique', 'APPLICATIONS', 2, 85),
    ('A.8.27', 'Architecture et ingénierie sécurisées', 'Des principes d''architecture sécurisée sont établis et appliqués.', 'Technologique', 'APPLICATIONS', 2, 86),
    ('A.8.28', 'Codage sécurisé', 'Des pratiques de codage sécurisé sont appliquées et vérifiées.', 'Technologique', 'APPLICATIONS', 2, 87),
    ('A.8.29', 'Tests de sécurité', 'Les tests de sécurité font partie des critères d''acceptation.', 'Technologique', 'APPLICATIONS', 3, 88),
    ('A.8.30', 'Développement externalisé', 'Le développement confié à des tiers est encadré et contrôlé.', 'Technologique', 'SUPPLIERS', 2, 89),
    ('A.8.31', 'Séparation des environnements', 'Les environnements de développement, de test et de production sont séparés.', 'Technologique', 'APPLICATIONS', 2, 90),
    ('A.8.32', 'Gestion des changements', 'Les changements sur les systèmes en production suivent un processus maîtrisé.', 'Technologique', 'APPLICATIONS', 2, 91),
    ('A.8.33', 'Protection des données de test', 'Les jeux de test sont choisis et protégés pour éviter l''exposition de données réelles.', 'Technologique', 'DATA', 2, 92),
    ('A.8.34', 'Protection pendant les tests d''audit', 'Les contrôles menés sur les systèmes en exploitation sont planifiés pour limiter les perturbations.', 'Technologique', 'COMPLIANCE', 1, 93)
) AS c(code, title, description, category, domain, weight, position)
ON CONFLICT (framework_version_id, code) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4. Correspondance des 42 questions Cyberas vers les contrôles ISO
--
-- Chaque ligne porte son motif. Les correspondances marquées REVIEW_REQUIRED
-- sont défendables mais incomplètes : elles doivent être tranchées par un
-- auditeur avant d'alimenter un score opposable.
--
-- Les questions RSK-01 à RSK-03 n'apparaissent volontairement pas : l'analyse
-- de risque relève des clauses 6.1.2 et 6.1.3 du système de management, hors
-- Annexe A. Leur inventer un contrôle serait une correspondance fausse.
-- ---------------------------------------------------------------------------
INSERT INTO question_control_mapping
    (question_id, control_id, mapping_type, status, confidence, source, mapping_rationale)
SELECT q.id, ctl.id, m.mapping_type, m.status, m.confidence, 'MANUAL', m.rationale
FROM (VALUES
    ('ACC-01', 'A.5.15', 'PRIMARY',   'CONFIRMED',       1.0,  'Le moindre privilège est la règle d''accès elle-même.'),
    ('ACC-01', 'A.5.18', 'SECONDARY', 'CONFIRMED',       0.9,  'La revue périodique des habilitations relève de l''attribution et de la revue des droits.'),
    ('ACC-02', 'A.8.5',  'PRIMARY',   'CONFIRMED',       1.0,  'L''authentification multifacteur est le moyen d''authentification sécurisée attendu sur les accès à risque.'),
    ('ACC-03', 'A.8.2',  'PRIMARY',   'CONFIRMED',       1.0,  'Comptes nominatifs, séparés et journalisés : définition même des droits privilégiés maîtrisés.'),
    ('APP-01', 'A.8.25', 'PRIMARY',   'CONFIRMED',       0.9,  'Les pratiques de développement sécurisé constituent le cycle de développement.'),
    ('APP-01', 'A.8.28', 'SECONDARY', 'CONFIRMED',       0.9,  'La revue de code et l''outillage SAST relèvent du codage sécurisé.'),
    ('APP-02', 'A.8.29', 'PRIMARY',   'CONFIRMED',       1.0,  'Tests d''intrusion et audits applicatifs sont des tests de sécurité.'),
    ('APP-03', 'A.8.31', 'PRIMARY',   'CONFIRMED',       1.0,  'Correspondance directe : séparation des environnements.'),
    ('AST-01', 'A.5.9',  'PRIMARY',   'CONFIRMED',       1.0,  'Inventaire tenu à jour des actifs matériels et logiciels.'),
    ('AST-02', 'A.5.9',  'PRIMARY',   'CONFIRMED',       0.9,  'La propriété de l''actif fait partie de l''inventaire.'),
    ('AST-02', 'A.5.12', 'SECONDARY', 'REVIEW_REQUIRED', 0.6,  'Le niveau de criticite de l''actif recoupe la classification sans s''y reduire : a trancher selon la methode de l''organisation.'),
    ('AST-03', 'A.7.14', 'PRIMARY',   'CONFIRMED',       1.0,  'Effacement ou destruction avant sortie ou réemploi.'),
    ('AST-03', 'A.8.10', 'SECONDARY', 'CONFIRMED',       0.8,  'La suppression sûre des informations portées par le support.'),
    ('CMP-01', 'A.5.31', 'PRIMARY',   'CONFIRMED',       1.0,  'Identification des obligations légales et réglementaires applicables.'),
    ('CMP-02', 'A.5.35', 'PRIMARY',   'CONFIRMED',       0.9,  'Audits internes planifiés avec suivi des écarts.'),
    ('CMP-03', 'A.5.34', 'PRIMARY',   'CONFIRMED',       1.0,  'Documentation des traitements de données personnelles.'),
    ('BCP-01', 'A.8.13', 'PRIMARY',   'CONFIRMED',       1.0,  'Sauvegardes réalisées, isolées et restaurées à l''essai.'),
    ('BCP-02', 'A.5.30', 'PRIMARY',   'CONFIRMED',       1.0,  'Plan de continuité et de reprise des services informatiques.'),
    ('BCP-02', 'A.5.29', 'SECONDARY', 'CONFIRMED',       0.8,  'Maintien du niveau de sécurité pendant la perturbation.'),
    ('BCP-03', 'A.5.30', 'PRIMARY',   'CONFIRMED',       0.9,  'Le test annuel fait partie de la préparation à la continuité.'),
    ('DAT-01', 'A.5.12', 'PRIMARY',   'CONFIRMED',       1.0,  'Classification selon la sensibilité avec règles de traitement.'),
    ('DAT-01', 'A.5.13', 'SECONDARY', 'CONFIRMED',       0.8,  'Le marquage accompagne la classification.'),
    ('DAT-02', 'A.8.24', 'PRIMARY',   'CONFIRMED',       1.0,  'Chiffrement au repos et en transit : usage de la cryptographie.'),
    ('DAT-03', 'A.8.12', 'PRIMARY',   'CONFIRMED',       1.0,  'Correspondance directe : prévention des fuites de données.'),
    ('DET-01', 'A.8.15', 'PRIMARY',   'CONFIRMED',       1.0,  'Journaux centralisés, protégés et conservés.'),
    ('DET-02', 'A.8.16', 'PRIMARY',   'CONFIRMED',       1.0,  'Surveillance de sécurité et traitement des alertes.'),
    ('DET-03', 'A.8.7',  'PRIMARY',   'CONFIRMED',       1.0,  'EDR et antimalware : protection contre les programmes malveillants.'),
    ('GOV-01', 'A.5.1',  'PRIMARY',   'CONFIRMED',       1.0,  'Politique formalisée, approuvée et revue.'),
    ('GOV-02', 'A.5.2',  'PRIMARY',   'CONFIRMED',       1.0,  'Attribution nominative des rôles de sécurité.'),
    ('GOV-02', 'A.5.4',  'SECONDARY', 'CONFIRMED',       0.8,  'La lettre de mission du RSSI matérialise l''implication de la direction.'),
    ('GOV-03', 'A.6.3',  'PRIMARY',   'CONFIRMED',       1.0,  'Programme de sensibilisation de l''ensemble du personnel.'),
    ('HUM-01', 'A.6.5',  'PRIMARY',   'CONFIRMED',       1.0,  'Arrivées, mobilités et départs : obligations liées au changement de situation.'),
    ('HUM-01', 'A.5.18', 'SECONDARY', 'CONFIRMED',       0.9,  'La révocation des droits au départ relève de la gestion des accès.'),
    ('HUM-02', 'A.6.8',  'PRIMARY',   'CONFIRMED',       1.0,  'Moyen simple de signaler un événement suspect.'),
    ('HUM-03', 'A.6.3',  'PRIMARY',   'CONFIRMED',       0.9,  'Sensibilisation renforcée des populations exposées.'),
    ('INC-01', 'A.5.24', 'PRIMARY',   'CONFIRMED',       1.0,  'Procédure de gestion des incidents formalisée.'),
    ('INC-01', 'A.5.26', 'SECONDARY', 'CONFIRMED',       0.8,  'Le traitement effectif des incidents selon la procédure.'),
    ('INC-02', 'A.5.27', 'PRIMARY',   'CONFIRMED',       1.0,  'Analyse des incidents pour en tirer des enseignements.'),
    ('INC-02', 'A.5.25', 'SECONDARY', 'CONFIRMED',       0.8,  'L''enregistrement et la qualification des événements.'),
    ('INC-03', 'A.5.24', 'PRIMARY',   'REVIEW_REQUIRED', 0.6,  'Les exercices de crise relevent de la preparation, mais l''Annexe A n''en fait pas un controle distinct : rattachement par defaut a verifier.'),
    ('NET-01', 'A.8.22', 'PRIMARY',   'CONFIRMED',       1.0,  'Segmentation réseau : cloisonnement des groupes de systèmes.'),
    ('NET-02', 'A.8.20', 'PRIMARY',   'CONFIRMED',       1.0,  'Filtrage des flux entrants : sécurité des réseaux.'),
    ('NET-02', 'A.8.21', 'SECONDARY', 'CONFIRMED',       0.8,  'Limitation aux services strictement nécessaires.'),
    ('NET-03', 'A.8.21', 'PRIMARY',   'CONFIRMED',       0.9,  'VPN et accès prestataires : mécanismes de sécurité des services réseau.'),
    ('NET-03', 'A.6.7',  'SECONDARY', 'REVIEW_REQUIRED', 0.5,  'Le travail a distance ne couvre qu''une partie des acces distants ; les acces prestataires en sortent.'),
    ('SUP-01', 'A.5.20', 'PRIMARY',   'CONFIRMED',       1.0,  'Exigences de sécurité intégrées aux contrats fournisseurs.'),
    ('SUP-02', 'A.5.22', 'PRIMARY',   'CONFIRMED',       1.0,  'Évaluation et suivi du niveau de sécurité des fournisseurs.'),
    ('SUP-03', 'A.5.19', 'PRIMARY',   'CONFIRMED',       0.9,  'Encadrement des accès des tiers au système d''information.'),
    ('SUP-03', 'A.5.15', 'SECONDARY', 'CONFIRMED',       0.8,  'La limitation de ces accès applique la politique de contrôle d''accès.'),
    ('VUL-01', 'A.8.8',  'PRIMARY',   'CONFIRMED',       1.0,  'Gestion des correctifs avec délais selon la criticité.'),
    ('VUL-02', 'A.8.8',  'PRIMARY',   'CONFIRMED',       0.9,  'Les scans réguliers sont le moyen de recherche des vulnérabilités.'),
    ('VUL-03', 'A.8.9',  'PRIMARY',   'CONFIRMED',       1.0,  'Standards de durcissement : gestion des configurations.')
) AS m(question_code, control_code, mapping_type, status, confidence, rationale)
JOIN questionnaire_questions q ON q.code = m.question_code
JOIN controls ctl ON ctl.code = m.control_code
JOIN framework_versions v ON v.id = ctl.framework_version_id AND v.version = '2022'
JOIN frameworks f ON f.id = v.framework_id AND f.code = 'ISO27001'
ON CONFLICT (question_id, control_id) DO NOTHING;
