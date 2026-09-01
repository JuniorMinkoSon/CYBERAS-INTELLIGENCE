-- V6 : questionnaire MVP (39 questions, 13 domaines)
--
-- Formulations propres à Cyberas. Les correspondances vers les référentiels
-- (ISO 27001/27002, NIST CSF, CIS, OWASP, MITRE ATT&CK) sont portées en métadonnées
-- côté application (ReferenceCatalog) et ne reproduisent aucun texte protégé.

INSERT INTO questionnaire_questions (id, code, domain, position, text, guidance, weight) VALUES
-- GOUVERNANCE
(gen_random_uuid(), 'GOV-01', 'GOVERNANCE', 1, 'Une politique de sécurité de l''information est-elle formalisée, approuvée par la direction et revue périodiquement ?', 'Politique signée, date de dernière revue, diffusion aux collaborateurs.', 3),
(gen_random_uuid(), 'GOV-02', 'GOVERNANCE', 2, 'Les rôles et responsabilités en matière de sécurité (RSSI, propriétaires de risques, référents) sont-ils définis et attribués ?', 'Organigramme, fiches de poste, lettre de mission du RSSI.', 2),
(gen_random_uuid(), 'GOV-03', 'GOVERNANCE', 3, 'Un programme de sensibilisation à la sécurité est-il déployé pour l''ensemble du personnel ?', 'Sessions, taux de participation, campagnes de phishing simulé.', 2),
-- GESTION DES RISQUES
(gen_random_uuid(), 'RSK-01', 'RISK', 1, 'Une analyse de risques cyber est-elle réalisée selon une méthode documentée et mise à jour au moins annuellement ?', 'Registre des risques, méthode utilisée, date de dernière mise à jour.', 3),
(gen_random_uuid(), 'RSK-02', 'RISK', 2, 'Les risques identifiés font-ils l''objet d''un plan de traitement suivi avec des responsables et des échéances ?', 'Plan de traitement, indicateurs de suivi.', 2),
(gen_random_uuid(), 'RSK-03', 'RISK', 3, 'Les risques résiduels sont-ils formellement acceptés par la direction ?', 'Décisions d''acceptation signées.', 2),
-- ACTIFS
(gen_random_uuid(), 'AST-01', 'ASSETS', 1, 'Un inventaire des actifs matériels et logiciels est-il maintenu et tenu à jour ?', 'CMDB, outil de découverte, fréquence de mise à jour.', 3),
(gen_random_uuid(), 'AST-02', 'ASSETS', 2, 'Chaque actif dispose-t-il d''un propriétaire identifié et d''un niveau de criticité ?', 'Champ propriétaire et criticité dans l''inventaire.', 2),
(gen_random_uuid(), 'AST-03', 'ASSETS', 3, 'Les supports et équipements sont-ils effacés ou détruits de façon sécurisée en fin de vie ?', 'Procédure de mise au rebut, certificats de destruction.', 1),
-- ACCÈS
(gen_random_uuid(), 'ACC-01', 'ACCESS', 1, 'Les accès sont-ils attribués selon le principe du moindre privilège et revus périodiquement ?', 'Revue des habilitations, matrice de rôles.', 3),
(gen_random_uuid(), 'ACC-02', 'ACCESS', 2, 'L''authentification multifacteur est-elle imposée pour les accès distants, administratifs et aux services cloud ?', 'Couverture MFA par population et par service.', 3),
(gen_random_uuid(), 'ACC-03', 'ACCESS', 3, 'Les comptes à privilèges sont-ils nominatifs, séparés des comptes standards et journalisés ?', 'Bastion, PAM, liste des comptes admin.', 3),
-- RÉSEAU
(gen_random_uuid(), 'NET-01', 'NETWORK', 1, 'Le réseau est-il segmenté (zones, VLAN, filtrage) pour isoler les systèmes critiques ?', 'Schéma réseau, règles de filtrage inter-zones.', 3),
(gen_random_uuid(), 'NET-02', 'NETWORK', 2, 'Les flux entrants depuis Internet sont-ils limités aux services strictement nécessaires et filtrés ?', 'Règles pare-feu, revue des expositions.', 3),
(gen_random_uuid(), 'NET-03', 'NETWORK', 3, 'Les accès distants (VPN, accès prestataires) sont-ils chiffrés, authentifiés et surveillés ?', 'Configuration VPN, journaux de connexion.', 2),
-- APPLICATIONS
(gen_random_uuid(), 'APP-01', 'APPLICATIONS', 1, 'Des pratiques de développement sécurisé (revue de code, tests de sécurité) sont-elles appliquées ?', 'Politique de développement, outils SAST/DAST.', 2),
(gen_random_uuid(), 'APP-02', 'APPLICATIONS', 2, 'Les applications exposées font-elles l''objet de tests d''intrusion ou d''audits réguliers ?', 'Rapports de tests, plan de remédiation.', 3),
(gen_random_uuid(), 'APP-03', 'APPLICATIONS', 3, 'Les environnements de développement, test et production sont-ils séparés avec des données de test anonymisées ?', 'Cartographie des environnements.', 1),
-- VULNÉRABILITÉS
(gen_random_uuid(), 'VUL-01', 'VULNERABILITIES', 1, 'Un processus de gestion des correctifs est-il défini avec des délais selon la criticité ?', 'Politique de patch management, délais cibles, taux de conformité.', 3),
(gen_random_uuid(), 'VUL-02', 'VULNERABILITIES', 2, 'Des scans de vulnérabilités sont-ils réalisés régulièrement sur le périmètre interne et externe ?', 'Fréquence, outil, couverture.', 3),
(gen_random_uuid(), 'VUL-03', 'VULNERABILITIES', 3, 'Les configurations des systèmes suivent-elles des standards de durcissement documentés ?', 'Guides de durcissement, contrôle de conformité.', 2),
-- DONNÉES
(gen_random_uuid(), 'DAT-01', 'DATA', 1, 'Les données sont-elles classifiées selon leur sensibilité avec des règles de manipulation associées ?', 'Schéma de classification, marquage.', 2),
(gen_random_uuid(), 'DAT-02', 'DATA', 2, 'Les données sensibles sont-elles chiffrées au repos et en transit ?', 'Inventaire des chiffrements, gestion des clés.', 3),
(gen_random_uuid(), 'DAT-03', 'DATA', 3, 'Des mesures de prévention des fuites de données (DLP, contrôle des supports amovibles) sont-elles en place ?', 'Politique supports amovibles, outil DLP.', 1),
-- DÉTECTION
(gen_random_uuid(), 'DET-01', 'DETECTION', 1, 'Les journaux des systèmes critiques sont-ils centralisés, protégés et conservés sur une durée définie ?', 'SIEM ou collecteur, durée de rétention.', 3),
(gen_random_uuid(), 'DET-02', 'DETECTION', 2, 'Une surveillance de sécurité (SOC interne ou externalisé, alertes) est-elle opérationnelle ?', 'Couverture horaire, cas d''usage de détection.', 3),
(gen_random_uuid(), 'DET-03', 'DETECTION', 3, 'Une protection des postes et serveurs (EDR/antimalware) est-elle déployée et administrée de façon centralisée ?', 'Taux de couverture, console de gestion.', 2),
-- INCIDENTS
(gen_random_uuid(), 'INC-01', 'INCIDENTS', 1, 'Une procédure de gestion des incidents de sécurité est-elle formalisée et connue des équipes ?', 'Procédure, canaux de signalement, rôles.', 3),
(gen_random_uuid(), 'INC-02', 'INCIDENTS', 2, 'Les incidents sont-ils enregistrés, qualifiés et analysés pour en tirer des enseignements ?', 'Registre des incidents, retours d''expérience.', 2),
(gen_random_uuid(), 'INC-03', 'INCIDENTS', 3, 'Des exercices de réponse à incident (simulation, crise) sont-ils réalisés ?', 'Comptes rendus d''exercices.', 1),
-- CONTINUITÉ
(gen_random_uuid(), 'BCP-01', 'CONTINUITY', 1, 'Les sauvegardes sont-elles réalisées régulièrement, isolées du réseau de production et testées en restauration ?', 'Politique de sauvegarde, tests de restauration, copie hors ligne.', 3),
(gen_random_uuid(), 'BCP-02', 'CONTINUITY', 2, 'Un plan de continuité et de reprise d''activité couvrant les systèmes critiques existe-t-il ?', 'PCA/PRA, RTO/RPO définis.', 2),
(gen_random_uuid(), 'BCP-03', 'CONTINUITY', 3, 'Le plan de reprise est-il testé au moins une fois par an ?', 'Comptes rendus de tests PRA.', 2),
-- FOURNISSEURS
(gen_random_uuid(), 'SUP-01', 'SUPPLIERS', 1, 'Les exigences de sécurité sont-elles intégrées dans les contrats avec les fournisseurs et prestataires ?', 'Clauses contractuelles, PAS.', 2),
(gen_random_uuid(), 'SUP-02', 'SUPPLIERS', 2, 'Le niveau de sécurité des fournisseurs critiques est-il évalué et suivi ?', 'Questionnaires, audits, certifications.', 2),
(gen_random_uuid(), 'SUP-03', 'SUPPLIERS', 3, 'Les accès des tiers au système d''information sont-ils encadrés, limités dans le temps et tracés ?', 'Comptes tiers, revue périodique.', 2),
-- CONFORMITÉ
(gen_random_uuid(), 'CMP-01', 'COMPLIANCE', 1, 'Les obligations légales et réglementaires applicables (protection des données, secteur) sont-elles identifiées et suivies ?', 'Registre des obligations, responsable conformité.', 2),
(gen_random_uuid(), 'CMP-02', 'COMPLIANCE', 2, 'Des audits internes de sécurité sont-ils planifiés et leurs écarts suivis jusqu''à clôture ?', 'Programme d''audit, suivi des écarts.', 2),
(gen_random_uuid(), 'CMP-03', 'COMPLIANCE', 3, 'Les traitements de données personnelles sont-ils documentés avec les mesures de protection associées ?', 'Registre des traitements, analyses d''impact.', 2);
