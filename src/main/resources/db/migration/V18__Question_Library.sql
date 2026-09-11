-- V18 : bibliothèque de 118 questions, en remplacement des 42 d'origine
--
-- Les 42 questions initiales — trois par domaine — couvraient large et peu
-- profond. Trente-cinq d'entre elles ont un quasi-doublon dans la nouvelle
-- bibliothèque, plus fine, organisée en thèmes au sein de cinq familles.
--
-- REMPLACER, PAS SUPPRIMER
--
-- Les anciennes questions passent à active = false. Elles ne sont ni effacées
-- ni modifiées : 159 réponses les référencent, réparties sur douze audits, et
-- ces audits doivent rester lisibles tels qu'ils ont été menés. Un score
-- calculé hier sur 42 questions ne doit pas changer parce que le catalogue a
-- grandi aujourd'hui. Les nouveaux audits ne voient que les questions actives.
--
-- AUCUN RATTACHEMENT ISO
--
-- Volontairement. Les correspondances vers les contrôles se font dans une
-- migration dédiée, à la main, avec REVIEW_REQUIRED sur ce qui est douteux.
-- Semer 118 questions et 118 rattachements d'un coup, c'est produire 118
-- correspondances que personne n'a relues.
--
-- QUATRE FAMILLES
--
-- La bibliothèque ne contient aucune question sur les locaux ou le matériel.
-- Plutôt qu'une famille « Physique » affichée vide, le catalogue présente ce
-- qui existe : Organisationnel (46), Conformité (17), Technique (37),
-- Humain (18). Le jour où des questions physiques sont écrites, la famille
-- se rouvre par une ligne dans DomainFamily.presented().
--
-- PREUVE ATTENDUE
--
-- `evidence_required` marque les questions dont la réponse se démontre par un
-- document — politique, inventaire, registre, contrat, plan. Le critère est
-- littéral : la question demande-t-elle si un artefact existe ? Une question
-- sur un comportement ne l'exige pas ; on ne joint pas de PDF pour prouver
-- qu'on verrouille son écran.

ALTER TABLE questionnaire_questions
    ADD COLUMN IF NOT EXISTS evidence_required BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN questionnaire_questions.evidence_required IS
    'La réponse se démontre par un document. Indication pour la saisie, jamais un '
    'critère de score : une réponse sans pièce n''est pas pénalisée.';

-- ---------------------------------------------------------------------------
-- 1. Les 42 questions d'origine sortent du catalogue actif.
-- ---------------------------------------------------------------------------
UPDATE questionnaire_questions
   SET active = FALSE
 WHERE code IN (
    'GOV-01','GOV-02','GOV-03','RSK-01','RSK-02','RSK-03','AST-01','AST-02','AST-03',
    'ACC-01','ACC-02','ACC-03','NET-01','NET-02','NET-03','APP-01','APP-02','APP-03',
    'VUL-01','VUL-02','VUL-03','DAT-01','DAT-02','DAT-03','DET-01','DET-02','DET-03',
    'INC-01','INC-02','INC-03','BCP-01','BCP-02','BCP-03','CMP-01','CMP-02','CMP-03',
    'HUM-01','HUM-02','HUM-03','SUP-01','SUP-02','SUP-03'
 );

-- ---------------------------------------------------------------------------
-- 2. La bibliothèque.
--
-- Poids : 3 pour ce dont l'absence expose directement (MFA, sauvegardes,
-- correctifs, comptes privilégiés, politique approuvée), 2 par défaut, 1 pour
-- ce qui relève du confort ou de la forme.
-- ---------------------------------------------------------------------------
INSERT INTO questionnaire_questions (id, code, domain, position, text, guidance, weight, active, evidence_required)
SELECT gen_random_uuid(), q.code, q.domain, q.position, q.text, q.guidance, q.weight, TRUE, q.evidence
FROM (VALUES

-- ===================== ORGANISATIONNEL · Stratégie =====================
('ORG-STR-001', 'STRATEGY', 1, 'La cybersécurité est-elle intégrée à la stratégie globale de l''organisation ?', 'Plan stratégique, feuille de route mentionnant la sécurité.', 2, TRUE),
('ORG-STR-002', 'STRATEGY', 2, 'Les risques cyber sont-ils présentés à la direction ?', 'Comptes rendus de comité, supports de présentation.', 2, TRUE),
('ORG-STR-003', 'STRATEGY', 3, 'La direction valide-t-elle les priorités de sécurité ?', 'Décisions signées, arbitrages documentés.', 2, TRUE),
('ORG-STR-004', 'STRATEGY', 4, 'Un budget cybersécurité est-il défini ?', 'Ligne budgétaire identifiée.', 2, TRUE),
('ORG-STR-005', 'STRATEGY', 5, 'Les investissements de sécurité sont-ils basés sur une analyse des risques ?', 'Lien entre registre des risques et dépenses engagées.', 2, FALSE),

-- ===================== ORGANISATIONNEL · Gouvernance =====================
('ORG-GOV-001', 'GOVERNANCE', 1, 'L''organisation dispose-t-elle d''une politique de sécurité de l''information formellement établie ?', 'Politique signée, datée, diffusée.', 3, TRUE),
('ORG-GOV-002', 'GOVERNANCE', 2, 'Les responsabilités en matière de cybersécurité sont-elles clairement définies ?', 'Organigramme, fiches de poste.', 2, TRUE),
('ORG-GOV-003', 'GOVERNANCE', 3, 'Un responsable de la sécurité de l''information est-il officiellement désigné ?', 'Lettre de mission ou nomination.', 3, TRUE),
('ORG-GOV-004', 'GOVERNANCE', 4, 'Les rôles et responsabilités des collaborateurs sont-ils documentés ?', 'Fiches de poste, matrice RACI.', 2, TRUE),
('ORG-GOV-005', 'GOVERNANCE', 5, 'Les processus critiques de l''organisation sont-ils identifiés ?', 'Cartographie des processus, analyse d''impact métier.', 2, TRUE),
('ORG-GOV-006', 'GOVERNANCE', 6, 'Les actifs critiques nécessaires à ces processus sont-ils recensés ?', 'Inventaire rattaché aux processus.', 2, TRUE),
('ORG-GOV-007', 'GOVERNANCE', 7, 'Une procédure de gestion des risques est-elle formalisée ?', 'Méthode documentée, registre des risques.', 3, TRUE),
('ORG-GOV-008', 'GOVERNANCE', 8, 'Les risques cyber sont-ils régulièrement réévalués ?', 'Dates des dernières revues.', 2, TRUE),
('ORG-GOV-009', 'GOVERNANCE', 9, 'Les risques identifiés sont-ils associés à des responsables ?', 'Colonne propriétaire dans le registre.', 2, FALSE),
('ORG-GOV-010', 'GOVERNANCE', 10, 'Les décisions de sécurité sont-elles documentées et traçables ?', 'Comptes rendus, registre des décisions.', 2, TRUE),

-- ===================== ORGANISATIONNEL · Pilotage =====================
('ORG-PIL-001', 'STEERING', 1, 'Des indicateurs de cybersécurité sont-ils suivis ?', 'Tableau de bord, indicateurs définis.', 2, TRUE),
('ORG-PIL-002', 'STEERING', 2, 'Ces indicateurs sont-ils présentés régulièrement à la direction ?', 'Fréquence et supports de présentation.', 2, FALSE),
('ORG-PIL-003', 'STEERING', 3, 'Les incidents et vulnérabilités font-ils l''objet d''un suivi jusqu''à leur résolution ?', 'Outil de suivi, états de clôture.', 3, FALSE),
('ORG-PIL-004', 'STEERING', 4, 'Les plans d''action ont-ils un responsable et une échéance ?', 'Plan d''action avec colonnes responsable et date.', 2, TRUE),
('ORG-PIL-005', 'STEERING', 5, 'Les exceptions aux politiques de sécurité sont-elles documentées ?', 'Registre des dérogations.', 2, TRUE),
('ORG-PIL-006', 'STEERING', 6, 'Les risques acceptés sont-ils formellement validés ?', 'Décisions d''acceptation signées.', 2, TRUE),

-- ===================== ORGANISATIONNEL · Gestion des incidents =====================
('ORG-INC-001', 'INCIDENTS', 1, 'Un processus de gestion des incidents est-il formalisé ?', 'Procédure écrite, diffusée.', 3, TRUE),
('ORG-INC-002', 'INCIDENTS', 2, 'Les rôles lors d''un incident sont-ils définis ?', 'Cellule de crise, astreintes, contacts.', 2, TRUE),
('ORG-INC-003', 'INCIDENTS', 3, 'Les incidents sont-ils enregistrés dans un registre ?', 'Registre des incidents.', 2, TRUE),
('ORG-INC-004', 'INCIDENTS', 4, 'Les incidents critiques sont-ils escaladés à la direction ?', 'Seuils d''escalade, exemples d''escalade passés.', 2, FALSE),
('ORG-INC-005', 'INCIDENTS', 5, 'Des exercices de réponse aux incidents sont-ils réalisés ?', 'Comptes rendus d''exercice.', 2, TRUE),
('ORG-INC-006', 'INCIDENTS', 6, 'Les retours d''expérience sont-ils utilisés pour améliorer la sécurité ?', 'Fiches de retour d''expérience, actions qui en découlent.', 2, FALSE),

-- ===================== ORGANISATIONNEL · Amélioration continue =====================
('ORG-AMC-001', 'IMPROVEMENT', 1, 'Des audits de sécurité sont-ils réalisés régulièrement ?', 'Rapports d''audit, calendrier.', 2, TRUE),
('ORG-AMC-002', 'IMPROVEMENT', 2, 'Les résultats des audits donnent-ils lieu à des plans d''action ?', 'Plan d''action rattaché à chaque audit.', 2, TRUE),
('ORG-AMC-003', 'IMPROVEMENT', 3, 'La réalisation des plans d''action est-elle contrôlée ?', 'Suivi d''avancement, revues.', 2, FALSE),
('ORG-AMC-004', 'IMPROVEMENT', 4, 'Les contrôles de sécurité sont-ils réévalués périodiquement ?', 'Calendrier de revue des contrôles.', 2, FALSE),
('ORG-AMC-005', 'IMPROVEMENT', 5, 'Les risques résiduels sont-ils connus ?', 'Registre des risques avec niveau résiduel.', 2, TRUE),
('ORG-AMC-006', 'IMPROVEMENT', 6, 'L''organisation améliore-t-elle ses dispositifs à partir des incidents et audits précédents ?', 'Exemples de mesures issues d''un incident ou d''un audit.', 2, FALSE),

-- ===================== ORGANISATIONNEL · Gestion des actifs =====================
('ORG-ACT-001', 'ASSETS', 1, 'Existe-t-il un inventaire des équipements informatiques ?', 'Inventaire matériel, outil de découverte.', 3, TRUE),
('ORG-ACT-002', 'ASSETS', 2, 'Existe-t-il un inventaire des applications et logiciels ?', 'Inventaire logiciel, licences.', 3, TRUE),
('ORG-ACT-003', 'ASSETS', 3, 'Les propriétaires des actifs sont-ils identifiés ?', 'Colonne propriétaire dans l''inventaire.', 2, FALSE),
('ORG-ACT-004', 'ASSETS', 4, 'Les actifs critiques sont-ils classifiés selon leur importance ?', 'Niveau de criticité par actif.', 2, FALSE),
('ORG-ACT-005', 'ASSETS', 5, 'Les actifs obsolètes sont-ils identifiés et traités ?', 'Liste des systèmes en fin de support, plan de retrait.', 2, FALSE),
('ORG-ACT-006', 'ASSETS', 6, 'Les équipements entrant et sortant du parc sont-ils suivis ?', 'Procédure d''entrée et de sortie, bons de mouvement.', 2, TRUE),
('ORG-ACT-007', 'ASSETS', 7, 'Les actifs appartenant à des prestataires sont-ils identifiés ?', 'Marquage dans l''inventaire.', 1, FALSE),
('ORG-ACT-008', 'ASSETS', 8, 'Les dépendances entre applications, infrastructures et processus sont-elles connues ?', 'Cartographie applicative.', 2, TRUE),

-- ===================== ORGANISATIONNEL · Gestion des fournisseurs =====================
('ORG-FRN-001', 'SUPPLIERS', 1, 'Les fournisseurs critiques font-ils l''objet d''une évaluation de sécurité ?', 'Questionnaires fournisseurs, rapports d''évaluation.', 2, TRUE),
('ORG-FRN-002', 'SUPPLIERS', 2, 'Les exigences de cybersécurité sont-elles intégrées aux contrats fournisseurs ?', 'Clauses de sécurité dans les contrats.', 2, TRUE),
('ORG-FRN-003', 'SUPPLIERS', 3, 'Les accès des prestataires sont-ils contrôlés ?', 'Comptes dédiés, durée limitée, revue.', 3, FALSE),
('ORG-FRN-004', 'SUPPLIERS', 4, 'Les fournisseurs sont-ils réévalués périodiquement ?', 'Dates des réévaluations.', 2, FALSE),
('ORG-FRN-005', 'SUPPLIERS', 5, 'Les contrats prévoient-ils des obligations en cas d''incident de sécurité ?', 'Clause de notification d''incident.', 2, TRUE),

-- ===================== CONFORMITÉ · Politiques et procédures =====================
('CNF-POL-001', 'POLICIES', 1, 'Les politiques de sécurité sont-elles officiellement approuvées ?', 'Signature de la direction, date.', 3, TRUE),
('CNF-POL-002', 'POLICIES', 2, 'Les procédures sont-elles régulièrement mises à jour ?', 'Historique des versions.', 2, TRUE),
('CNF-POL-003', 'POLICIES', 3, 'Les collaborateurs ont-ils accès aux politiques qui les concernent ?', 'Espace de publication, accusés de lecture.', 2, FALSE),
('CNF-POL-004', 'POLICIES', 4, 'Les politiques sont-elles effectivement appliquées ?', 'Constats terrain, écarts relevés.', 2, FALSE),
('CNF-POL-005', 'POLICIES', 5, 'Des contrôles permettent-ils de vérifier leur application ?', 'Plan de contrôle, résultats.', 2, TRUE),

-- ===================== CONFORMITÉ · Données personnelles =====================
('CNF-DCP-001', 'PRIVACY', 1, 'Les données personnelles traitées par l''organisation sont-elles identifiées ?', 'Registre des traitements.', 3, TRUE),
('CNF-DCP-002', 'PRIVACY', 2, 'Les finalités de traitement sont-elles documentées ?', 'Finalité par traitement dans le registre.', 2, TRUE),
('CNF-DCP-003', 'PRIVACY', 3, 'Les durées de conservation sont-elles définies ?', 'Durées par catégorie de données.', 2, TRUE),
('CNF-DCP-004', 'PRIVACY', 4, 'Les droits d''accès aux données personnelles sont-ils contrôlés ?', 'Habilitations sur les traitements sensibles.', 3, FALSE),
('CNF-DCP-005', 'PRIVACY', 5, 'Les demandes de suppression ou de modification sont-elles gérées ?', 'Procédure d''exercice des droits, délais.', 2, TRUE),
('CNF-DCP-006', 'PRIVACY', 6, 'Les incidents impliquant des données personnelles sont-ils documentés ?', 'Registre des violations.', 2, TRUE),
('CNF-DCP-007', 'PRIVACY', 7, 'Les sous-traitants manipulant des données personnelles sont-ils encadrés ?', 'Contrats de sous-traitance conformes.', 2, TRUE),

-- ===================== CONFORMITÉ · Conformité technique =====================
('CNF-TEC-001', 'COMPLIANCE', 1, 'Les systèmes sont-ils régulièrement audités ?', 'Rapports d''audit technique.', 2, TRUE),
('CNF-TEC-002', 'COMPLIANCE', 2, 'Les vulnérabilités sont-elles suivies jusqu''à leur correction ?', 'Outil de suivi, taux de clôture.', 3, FALSE),
('CNF-TEC-003', 'COMPLIANCE', 3, 'Les correctifs de sécurité sont-ils appliqués dans des délais définis ?', 'Politique de correctifs avec délais par criticité.', 3, TRUE),
('CNF-TEC-004', 'COMPLIANCE', 4, 'Les journaux nécessaires à la traçabilité sont-ils conservés ?', 'Durées de rétention, emplacement.', 2, FALSE),
('CNF-TEC-005', 'COMPLIANCE', 5, 'Les preuves de conformité sont-elles centralisées et facilement accessibles ?', 'Espace documentaire de conformité.', 1, FALSE),

-- ===================== TECHNIQUE · Infrastructure =====================
('TEC-INF-001', 'INFRASTRUCTURE', 1, 'Les serveurs exposés sur Internet sont-ils identifiés ?', 'Liste des systèmes exposés — vérifiable par scan.', 3, FALSE),
('TEC-INF-002', 'INFRASTRUCTURE', 2, 'Les ports réseau inutiles sont-ils fermés ?', 'Vérifiable par scan.', 3, FALSE),
('TEC-INF-003', 'INFRASTRUCTURE', 3, 'Les services inutilisés sont-ils désactivés ?', 'Vérifiable par scan.', 2, FALSE),
('TEC-INF-004', 'INFRASTRUCTURE', 4, 'Les systèmes d''exploitation sont-ils maintenus à jour ?', 'Versions constatées, politique de mise à jour.', 3, FALSE),
('TEC-INF-005', 'INFRASTRUCTURE', 5, 'Les logiciels installés sont-ils régulièrement mis à jour ?', 'Versions constatées — vérifiable par scan.', 3, FALSE),
('TEC-INF-006', 'INFRASTRUCTURE', 6, 'Les versions obsolètes sont-elles supprimées ?', 'Absence de versions en fin de support.', 2, FALSE),
('TEC-INF-007', 'INFRASTRUCTURE', 7, 'Les équipements réseau sont-ils correctement configurés ?', 'Standards de configuration, revues.', 2, TRUE),
('TEC-INF-008', 'INFRASTRUCTURE', 8, 'Les environnements de production et de test sont-ils séparés ?', 'Schéma d''architecture.', 2, TRUE),

-- ===================== TECHNIQUE · Réseau =====================
('TEC-RES-001', 'NETWORK', 1, 'Le réseau est-il segmenté selon les niveaux de sensibilité ?', 'Schéma réseau, VLAN, zones.', 3, TRUE),
('TEC-RES-002', 'NETWORK', 2, 'Les flux entre segments sont-ils contrôlés ?', 'Règles de filtrage inter-zones.', 3, FALSE),
('TEC-RES-003', 'NETWORK', 3, 'Un pare-feu est-il déployé et correctement configuré ?', 'Export de configuration, revue des règles.', 3, TRUE),
('TEC-RES-004', 'NETWORK', 4, 'Les règles de filtrage sont-elles régulièrement revues ?', 'Dates des dernières revues.', 2, FALSE),
('TEC-RES-005', 'NETWORK', 5, 'Les connexions administratives sont-elles sécurisées ?', 'Réseau d''administration dédié, bastion, chiffrement.', 3, FALSE),
('TEC-RES-006', 'NETWORK', 6, 'Les accès distants sont-ils protégés par un mécanisme sécurisé ?', 'VPN, MFA sur l''accès distant.', 3, FALSE),
('TEC-RES-007', 'NETWORK', 7, 'Les protocoles réseau obsolètes ou faibles sont-ils désactivés ?', 'Telnet, SMBv1, TLS 1.0 — vérifiable par scan.', 3, FALSE),

-- ===================== TECHNIQUE · Identités et accès =====================
('TEC-IAM-001', 'ACCESS', 1, 'Chaque utilisateur possède-t-il un compte individuel ?', 'Absence de comptes partagés.', 3, FALSE),
('TEC-IAM-002', 'ACCESS', 2, 'Les comptes administrateurs sont-ils séparés des comptes standards ?', 'Comptes distincts pour l''administration.', 3, FALSE),
('TEC-IAM-003', 'ACCESS', 3, 'L''authentification multifacteur est-elle utilisée pour les accès sensibles ?', 'Couverture MFA par population et par service.', 3, FALSE),
('TEC-IAM-004', 'ACCESS', 4, 'Les droits sont-ils attribués selon le principe du moindre privilège ?', 'Matrice de rôles, revue des habilitations.', 3, TRUE),
('TEC-IAM-005', 'ACCESS', 5, 'Les comptes des collaborateurs quittant l''organisation sont-ils rapidement désactivés ?', 'Procédure de départ, délai constaté.', 3, TRUE),
('TEC-IAM-006', 'ACCESS', 6, 'Les comptes inactifs sont-ils régulièrement supprimés ?', 'Revue périodique des comptes dormants.', 2, FALSE),
('TEC-IAM-007', 'ACCESS', 7, 'Les accès privilégiés sont-ils journalisés ?', 'Journaux des sessions d''administration.', 3, FALSE),

-- ===================== TECHNIQUE · Sécurité applicative =====================
('TEC-APP-001', 'APPLICATIONS', 1, 'Les applications font-elles l''objet d''analyses de sécurité ?', 'Rapports SAST/DAST, tests d''intrusion.', 2, TRUE),
('TEC-APP-002', 'APPLICATIONS', 2, 'Les dépendances logicielles sont-elles surveillées ?', 'Outil d''analyse des dépendances.', 2, FALSE),
('TEC-APP-003', 'APPLICATIONS', 3, 'Les secrets et clés API sont-ils protégés ?', 'Coffre-fort de secrets, absence de secrets dans le code.', 3, FALSE),
('TEC-APP-004', 'APPLICATIONS', 4, 'Les applications disposent-elles d''une authentification robuste ?', 'Politique de mots de passe, MFA, verrouillage.', 3, FALSE),
('TEC-APP-005', 'APPLICATIONS', 5, 'Les données sensibles sont-elles chiffrées en transit ?', 'TLS partout — vérifiable par scan.', 3, FALSE),
('TEC-APP-006', 'APPLICATIONS', 6, 'Les données sensibles sont-elles chiffrées au repos ?', 'Chiffrement des bases et des sauvegardes.', 3, FALSE),
('TEC-APP-007', 'APPLICATIONS', 7, 'Les API sont-elles authentifiées et contrôlées ?', 'Authentification, limitation de débit, journalisation.', 3, FALSE),
('TEC-APP-008', 'APPLICATIONS', 8, 'Des tests de sécurité applicative sont-ils réalisés avant mise en production ?', 'Critères d''acceptation incluant la sécurité.', 2, TRUE),

-- ===================== TECHNIQUE · Sauvegarde et continuité =====================
('TEC-SAU-001', 'CONTINUITY', 1, 'Les données critiques sont-elles sauvegardées ?', 'Politique de sauvegarde, périmètre couvert.', 3, TRUE),
('TEC-SAU-002', 'CONTINUITY', 2, 'Les sauvegardes sont-elles isolées des systèmes de production ?', 'Hors ligne ou hors réseau, immuables.', 3, FALSE),
('TEC-SAU-003', 'CONTINUITY', 3, 'Les sauvegardes sont-elles chiffrées ?', 'Chiffrement des supports et des flux.', 2, FALSE),
('TEC-SAU-004', 'CONTINUITY', 4, 'Les restaurations sont-elles régulièrement testées ?', 'Comptes rendus de test de restauration.', 3, TRUE),
('TEC-SAU-005', 'CONTINUITY', 5, 'Les objectifs RTO/RPO sont-ils définis ?', 'Objectifs par système critique.', 2, TRUE),
('TEC-SAU-006', 'CONTINUITY', 6, 'Un plan de continuité existe-t-il ?', 'Plan de continuité d''activité.', 2, TRUE),
('TEC-SAU-007', 'CONTINUITY', 7, 'Un plan de reprise après sinistre existe-t-il ?', 'Plan de reprise, procédures de bascule.', 2, TRUE),

-- ===================== HUMAIN · Sensibilisation =====================
('HUM-SEN-001', 'AWARENESS', 1, 'Les collaborateurs reçoivent-ils une formation en cybersécurité ?', 'Programme, feuilles de présence.', 3, TRUE),
('HUM-SEN-002', 'AWARENESS', 2, 'La formation est-elle renouvelée périodiquement ?', 'Fréquence, dernières sessions.', 2, FALSE),
('HUM-SEN-003', 'AWARENESS', 3, 'Les nouveaux collaborateurs sont-ils sensibilisés dès leur arrivée ?', 'Parcours d''intégration incluant la sécurité.', 2, TRUE),
('HUM-SEN-004', 'AWARENESS', 4, 'Les utilisateurs connaissent-ils les règles concernant les mots de passe ?', 'Règles diffusées, charte signée.', 2, FALSE),
('HUM-SEN-005', 'AWARENESS', 5, 'Savent-ils reconnaître une tentative de phishing ?', 'Résultats de simulation.', 3, FALSE),
('HUM-SEN-006', 'AWARENESS', 6, 'Savent-ils comment signaler un incident ?', 'Canal de signalement connu et utilisé.', 3, FALSE),
('HUM-SEN-007', 'AWARENESS', 7, 'Les dirigeants participent-ils aux actions de sensibilisation ?', 'Présence de la direction aux sessions.', 2, FALSE),

-- ===================== HUMAIN · Comportements =====================
('HUM-CMP-001', 'BEHAVIOUR', 1, 'Les utilisateurs respectent-ils les règles d''utilisation des équipements ?', 'Charte, constats.', 2, FALSE),
('HUM-CMP-002', 'BEHAVIOUR', 2, 'Les mots de passe sont-ils gérés conformément aux politiques ?', 'Gestionnaire de mots de passe, constats.', 2, FALSE),
('HUM-CMP-003', 'BEHAVIOUR', 3, 'Les utilisateurs évitent-ils de partager leurs identifiants ?', 'Constats, incidents liés.', 3, FALSE),
('HUM-CMP-004', 'BEHAVIOUR', 4, 'Les postes de travail sont-ils verrouillés lorsqu''ils sont laissés sans surveillance ?', 'Verrouillage automatique configuré, constats.', 2, FALSE),
('HUM-CMP-005', 'BEHAVIOUR', 5, 'Les supports amovibles sont-ils utilisés conformément aux règles ?', 'Règles sur les supports USB, contrôle technique.', 2, FALSE),
('HUM-CMP-006', 'BEHAVIOUR', 6, 'Les collaborateurs savent-ils identifier les informations sensibles ?', 'Règles de classification connues.', 2, FALSE),
('HUM-CMP-007', 'BEHAVIOUR', 7, 'Les informations confidentielles sont-elles correctement manipulées ?', 'Règles de manipulation, constats.', 2, FALSE),

-- ===================== HUMAIN · Tests =====================
('HUM-TST-001', 'TESTING', 1, 'Des campagnes de simulation de phishing sont-elles organisées ?', 'Rapports de campagne.', 2, TRUE),
('HUM-TST-002', 'TESTING', 2, 'Les résultats des campagnes sont-ils analysés ?', 'Analyse des taux de clic et de signalement.', 2, TRUE),
('HUM-TST-003', 'TESTING', 3, 'Les collaborateurs présentant des comportements à risque bénéficient-ils d''un accompagnement ?', 'Sessions ciblées, suivi individuel.', 2, FALSE),
('HUM-TST-004', 'TESTING', 4, 'Les incidents causés par une erreur humaine sont-ils analysés afin d''éviter leur répétition ?', 'Retours d''expérience sur incidents humains.', 2, FALSE)

) AS q(code, domain, position, text, guidance, weight, evidence)
ON CONFLICT (code) DO NOTHING;
