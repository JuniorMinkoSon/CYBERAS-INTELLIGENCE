-- =============================================================================
-- NIST Cybersecurity Framework 2.0 -- referentiel et rattachements
-- =============================================================================
--
-- Deuxieme referentiel reellement exploitable de la plateforme, apres ISO 27001
-- (V15). La vitrine en annoncait six ; la base n'en portait qu'un. Celui-ci
-- comble l'ecart pour le cadre dont les donnees sont a la fois presentes dans
-- le depot et librement reutilisables.
--
-- SOURCE. data/knowledge-base/referentiels/nist-csf2.json, depose le
-- 18/09/2026. Le CSF 2.0 est une publication du gouvernement americain,
-- librement accessible et reutilisable ; les enonces de ce fichier en sont des
-- traductions-paraphrases francaises, et le texte officiel anglais fait foi.
-- Aucun texte normatif protege n'est reproduit ici.
--
-- RATTACHEMENTS. Ils ne sont pas rediges a la main comme ceux de V15, et ils
-- ne sont pas devines non plus : ils se composent.
--
--     question --(V15, etabli a la main)--> controle ISO 27001 Annexe A
--     controle ISO --(correspondance publiee par le NIST)--> sous-categorie CSF
--
-- La confiance du rattachement d'origine est reportee, attenuee selon la force
-- de la correspondance publiee : 0,95 pour une equivalence, 0,80 pour un simple
-- soutien. La source est marquee DERIVED_ISO27001 pour qu'un relecteur sache
-- d'un coup d'oeil ce qui a ete pose a la main et ce qui a ete deduit.
--
-- COUVERTURE. 106 sous-categories sont enregistrees ; celles qu'aucune question
-- n'atteint restent sans rattachement, et le calcul les classe NOT_ASSESSED.
-- Un referentiel partiellement instruit se lit comme tel : il ne se complete
-- pas avec des valeurs de remplissage.
--
-- Migration idempotente : ON CONFLICT DO NOTHING partout.
-- =============================================================================

INSERT INTO frameworks (code, name, description, provider, reference_url, active)
VALUES (
    'NIST_CSF',
    'NIST Cybersecurity Framework 2.0',
    'Cadre de resultats attendus, organise en six fonctions (Gouverner, Identifier, Proteger, Detecter, Repondre, Retablir), 22 categories et 106 sous-categories.',
    'NIST',
    'https://www.nist.gov/cyberframework',
    TRUE
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO framework_versions (framework_id, version, status, effective_from, metadata)
SELECT f.id, '2.0', 'ACTIVE', DATE '2024-02-26',
       jsonb_build_object(
           'subcategoryCount', 106,
           'categoryCount', 22,
           'functions', jsonb_build_array('GV', 'ID', 'PR', 'DE', 'RS', 'RC'),
           'source', 'data/knowledge-base/referentiels/nist-csf2.json',
           'nature', 'Publication NIST en domaine public ; enonces = traductions-paraphrases francaises, texte officiel anglais faisant foi',
           'mappingMethod', 'Compose : question -> ISO 27001 Annexe A (V15, manuel) -> sous-categorie CSF (correspondance publiee)'
       )
FROM frameworks f
WHERE f.code = 'NIST_CSF'
ON CONFLICT (framework_id, version) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Les 106 sous-categories
-- -----------------------------------------------------------------------------
INSERT INTO controls (framework_version_id, code, title, description, category, domain, weight, position, active)
SELECT fv.id, c.code, c.title, c.description, c.category, c.domain, c.weight, c.position, TRUE
FROM (VALUES
    ('GV.OC-01', 'La mission de l''organisation est comprise et éclaire la gestion des risques cyber', 'Ancrer le SMSI dans la réalité de l''organisation (marché, menaces, réglementation, culture) pour des décisions de sécurité pertinentes.', 'Contexte organisationnel', 'GV', 3, 1),
    ('GV.OC-02', 'Les parties prenantes internes et externes et leurs besoins vis-à-vis de la cybersécurité sont compris', 'Garantir que les attentes des clients, régulateurs, assureurs et partenaires sont connues et arbitrées.', 'Contexte organisationnel', 'GV', 3, 2),
    ('GV.OC-03', 'Les exigences légales, réglementaires et contractuelles de cybersécurité, y compris vie privée, sont comprises et gérées', 'Connaître ses obligations (RGPD, NIS2, sectorielles, contrats clients) et prouver leur prise en compte.', 'Contexte organisationnel', 'GV', 4, 3),
    ('GV.OC-04', 'Les objectifs, capacités et services critiques attendus par les parties prenantes sont compris et communiqués', 'Éviter que la crise ne devienne un moment de sécurité dégradée exploitée (contrôles maintenus en mode dégradé).', 'Contexte organisationnel', 'GV', 3, 4),
    ('GV.OC-05', 'Les résultats, capacités et services dont l''organisation dépend sont compris et communiqués', 'Voir au-delà du fournisseur direct : composants, logiciels tiers et sous-traitants de rang 2.', 'Contexte organisationnel', 'GV', 3, 5),
    ('GV.RM-01', 'Les objectifs de gestion des risques sont établis et validés par les parties prenantes', 'Traduire la politique en cibles concrètes et mesurables pilotant l''action.', 'Stratégie de gestion des risques', 'GV', 3, 6),
    ('GV.RM-02', 'L''appétence et les tolérances au risque sont établies, communiquées et tenues à jour', 'Fonder toutes les décisions de sécurité sur une vision des risques structurée, comparable dans le temps.', 'Stratégie de gestion des risques', 'GV', 4, 7),
    ('GV.RM-03', 'La gestion des risques cyber est intégrée aux processus de gestion des risques d''entreprise', 'Traiter les risques pesant sur le SMSI lui-même (ressources, adhésion, dérive documentaire), pas seulement les risques SI.', 'Stratégie de gestion des risques', 'GV', 3, 8),
    ('GV.RM-04', 'Une orientation stratégique sur les options de réponse au risque est établie et communiquée', 'Relier chaque risque à des mesures décidées, et justifier l''inclusion/exclusion de chacune des 93 mesures de l''Annexe A.', 'Stratégie de gestion des risques', 'GV', 3, 9),
    ('GV.RM-05', 'Des lignes de communication sur les risques cyber sont établies dans toute l''organisation et avec les tiers', 'Structurer les flux de communication sécurité (alertes, reporting, communication de crise, clients).', 'Stratégie de gestion des risques', 'GV', 2, 10),
    ('GV.RM-06', 'Une méthode standardisée de calcul, documentation, catégorisation et priorisation des risques est établie et appliquée', 'Fonder toutes les décisions de sécurité sur une vision des risques structurée, comparable dans le temps.', 'Stratégie de gestion des risques', 'GV', 5, 11),
    ('GV.RM-07', 'Les opportunités stratégiques (risques positifs) sont caractérisées et intégrées aux discussions sur le risque', 'Traiter les risques pesant sur le SMSI lui-même (ressources, adhésion, dérive documentaire), pas seulement les risques SI.', 'Stratégie de gestion des risques', 'GV', 1, 12),
    ('GV.RR-01', 'Le leadership de la direction sur le risque cyber est établi, redevable, et porteur d''une culture du risque', 'Assurer un portage au bon niveau : sans direction engagée, le SMSI n''a ni moyens ni autorité.', 'Rôles, responsabilités et autorités', 'GV', 4, 13),
    ('GV.RR-02', 'Les rôles, responsabilités et autorités cyber sont établis, communiqués, compris et appliqués', 'Éviter les zones grises : chacun sait qui décide, qui exécute, qui rend compte.', 'Rôles, responsabilités et autorités', 'GV', 4, 14),
    ('GV.RR-03', 'Des ressources adéquates sont allouées en proportion de la stratégie de risque, des rôles et des politiques', 'Donner au SMSI des moyens humains, financiers et techniques proportionnés aux risques.', 'Rôles, responsabilités et autorités', 'GV', 3, 15),
    ('GV.RR-04', 'La cybersécurité est intégrée aux pratiques de gestion des ressources humaines', 'Réduire le risque d''embaucher pour un poste sensible une personne présentant un risque avéré, dans le strict cadre légal.', 'Rôles, responsabilités et autorités', 'GV', 3, 16),
    ('GV.PO-01', 'Une politique de gestion des risques cyber est établie sur la base du contexte, communiquée et appliquée', 'Donner le cap et le mandat officiels de la sécurité dans l''organisation.', 'Politique', 'GV', 4, 17),
    ('GV.PO-02', 'La politique est revue, mise à jour, communiquée et son application maintenue face aux évolutions', 'Établir le corpus de règles officiel qui fonde toutes les mesures opérationnelles.', 'Politique', 'GV', 3, 18),
    ('GV.OV-01', 'Les résultats de la stratégie de gestion des risques cyber sont revus pour orienter et ajuster la stratégie', 'Boucler le pilotage au sommet : la direction constate, décide et arbitre sur la base des faits.', 'Supervision', 'GV', 4, 19),
    ('GV.OV-02', 'La stratégie est revue et ajustée pour assurer la couverture des exigences et risques de l''organisation', 'Boucler le pilotage au sommet : la direction constate, décide et arbitre sur la base des faits.', 'Supervision', 'GV', 3, 20),
    ('GV.OV-03', 'La performance de la cybersécurité est évaluée et revue pour les ajustements nécessaires', 'Piloter par les faits : indicateurs définis, mesurés, analysés et exploités.', 'Supervision', 'GV', 4, 21),
    ('GV.SC-01', 'Un programme de gestion des risques de la chaîne d''approvisionnement cyber (stratégie, objectifs, politiques, processus) est établi et validé', 'Maîtriser le risque tiers : identifier, évaluer et suivre les fournisseurs selon leur criticité.', 'Gestion des risques de la chaîne d''approvisionnement', 'GV', 4, 22),
    ('GV.SC-02', 'Les rôles et responsabilités cyber des fournisseurs, clients et partenaires sont établis, communiqués et coordonnés', 'Maîtriser le risque tiers : identifier, évaluer et suivre les fournisseurs selon leur criticité.', 'Gestion des risques de la chaîne d''approvisionnement', 'GV', 3, 23),
    ('GV.SC-03', 'La gestion des risques supply chain est intégrée à la gestion des risques cyber et d''entreprise', 'Voir au-delà du fournisseur direct : composants, logiciels tiers et sous-traitants de rang 2.', 'Gestion des risques de la chaîne d''approvisionnement', 'GV', 3, 24),
    ('GV.SC-04', 'Les fournisseurs sont connus et priorisés par criticité', 'Maîtriser le risque tiers : identifier, évaluer et suivre les fournisseurs selon leur criticité.', 'Gestion des risques de la chaîne d''approvisionnement', 'GV', 4, 25),
    ('GV.SC-05', 'Les exigences de traitement des risques cyber de la chaîne d''approvisionnement sont établies, priorisées et intégrées aux contrats', 'Rendre la sécurité contractuellement opposable aux fournisseurs (clauses, audit, notification, réversibilité).', 'Gestion des risques de la chaîne d''approvisionnement', 'GV', 4, 26),
    ('GV.SC-06', 'Une planification et des vérifications préalables (due diligence) réduisent les risques avant d''entrer en relation', 'Maîtriser le risque tiers : identifier, évaluer et suivre les fournisseurs selon leur criticité.', 'Gestion des risques de la chaîne d''approvisionnement', 'GV', 3, 27),
    ('GV.SC-07', 'Les risques posés par un fournisseur et ses produits/services sont compris, enregistrés, priorisés, évalués, traités et surveillés pendant la relation', 'Vérifier dans la durée que les fournisseurs tiennent leurs engagements de sécurité.', 'Gestion des risques de la chaîne d''approvisionnement', 'GV', 4, 28),
    ('GV.SC-08', 'Les fournisseurs pertinents sont inclus dans la planification, la réponse et le rétablissement des incidents', 'Être prêt avant l''incident : rôles, procédures, canaux et moyens définis à froid.', 'Gestion des risques de la chaîne d''approvisionnement', 'GV', 3, 29),
    ('GV.SC-09', 'Les pratiques de sécurité de la chaîne d''approvisionnement sont intégrées aux programmes cyber et surveillées sur tout le cycle de vie', 'Vérifier dans la durée que les fournisseurs tiennent leurs engagements de sécurité.', 'Gestion des risques de la chaîne d''approvisionnement', 'GV', 3, 30),
    ('GV.SC-10', 'Des plans de fin de relation (cessation, réversibilité) intégrant la cybersécurité sont établis', 'Rendre la sécurité contractuellement opposable aux fournisseurs (clauses, audit, notification, réversibilité).', 'Gestion des risques de la chaîne d''approvisionnement', 'GV', 2, 31),
    ('ID.AM-01', 'Les inventaires du matériel géré par l''organisation sont tenus à jour', 'Savoir ce que l''on possède pour pouvoir le protéger : l''inventaire conditionne vulnérabilités, sauvegardes et accès.', 'Gestion des actifs', 'ID', 4, 32),
    ('ID.AM-02', 'Les inventaires des logiciels, services et systèmes gérés sont tenus à jour', 'Savoir ce que l''on possède pour pouvoir le protéger : l''inventaire conditionne vulnérabilités, sauvegardes et accès.', 'Gestion des actifs', 'ID', 4, 33),
    ('ID.AM-03', 'Les représentations des communications réseau autorisées et des flux de données internes/externes sont tenues à jour', 'Faire du réseau une infrastructure administrée et durcie : équipements maîtrisés, flux contrôlés, administration sécurisée.', 'Gestion des actifs', 'ID', 3, 34),
    ('ID.AM-04', 'Les inventaires des services fournis par des tiers sont tenus à jour', 'Maîtriser le cycle de vie complet des services cloud, du choix à la réversibilité, avec un partage des responsabilités explicite.', 'Gestion des actifs', 'ID', 4, 35),
    ('ID.AM-05', 'Les actifs sont priorisés selon leur classification, criticité, ressources et impact sur la mission', 'Adapter le niveau de protection à la sensibilité réelle de chaque information.', 'Gestion des actifs', 'ID', 4, 36),
    ('ID.AM-07', 'Les inventaires des données et métadonnées des types de données désignés sont tenus à jour', 'Adapter le niveau de protection à la sensibilité réelle de chaque information.', 'Gestion des actifs', 'ID', 3, 37),
    ('ID.AM-08', 'Systèmes, matériels, logiciels, services et données sont gérés sur tout leur cycle de vie', 'Encadrer l''usage quotidien des moyens informatiques et de l''information (charte utilisateur).', 'Gestion des actifs', 'ID', 3, 38),
    ('ID.RA-01', 'Les vulnérabilités des actifs sont identifiées, validées et enregistrées', 'Réduire la fenêtre d''exposition : connaître son parc, scanner en continu, corriger sous SLA en priorisant l''exploitabilité réelle.', 'Appréciation des risques', 'ID', 5, 39),
    ('ID.RA-02', 'Le renseignement sur les menaces est reçu de sources et forums de partage d''information', 'Anticiper les menaces pesant réellement sur l''organisation et prioriser les défenses en conséquence.', 'Appréciation des risques', 'ID', 3, 40),
    ('ID.RA-03', 'Les menaces internes et externes sont identifiées et enregistrées', 'Anticiper les menaces pesant réellement sur l''organisation et prioriser les défenses en conséquence.', 'Appréciation des risques', 'ID', 3, 41),
    ('ID.RA-04', 'Les impacts potentiels et vraisemblances d''exploitation des vulnérabilités par les menaces sont identifiés et enregistrés', 'Fonder toutes les décisions de sécurité sur une vision des risques structurée, comparable dans le temps.', 'Appréciation des risques', 'ID', 4, 42),
    ('ID.RA-05', 'Menaces, vulnérabilités, vraisemblances et impacts servent à comprendre le risque inhérent et prioriser la réponse', 'Fonder toutes les décisions de sécurité sur une vision des risques structurée, comparable dans le temps.', 'Appréciation des risques', 'ID', 4, 43),
    ('ID.RA-06', 'Des réponses aux risques sont choisies, priorisées, planifiées, suivies et communiquées', 'Relier chaque risque à des mesures décidées, et justifier l''inclusion/exclusion de chacune des 93 mesures de l''Annexe A.', 'Appréciation des risques', 'ID', 4, 44),
    ('ID.RA-07', 'Les changements et exceptions sont gérés, évalués en risque et enregistrés', 'Éviter les incidents et les régressions de sécurité causés par des changements non maîtrisés : évaluation, approbation, test, retour arrière.', 'Appréciation des risques', 'ID', 3, 45),
    ('ID.RA-08', 'Des processus de réception, analyse et réponse aux divulgations de vulnérabilités sont établis', 'Réduire la fenêtre d''exposition : connaître son parc, scanner en continu, corriger sous SLA en priorisant l''exploitabilité réelle.', 'Appréciation des risques', 'ID', 3, 46),
    ('ID.RA-09', 'L''authenticité et l''intégrité du matériel et des logiciels sont évaluées avant acquisition et utilisation', 'Voir au-delà du fournisseur direct : composants, logiciels tiers et sous-traitants de rang 2.', 'Appréciation des risques', 'ID', 3, 47),
    ('ID.RA-10', 'Les fournisseurs critiques sont évalués avant acquisition', 'Maîtriser le risque tiers : identifier, évaluer et suivre les fournisseurs selon leur criticité.', 'Appréciation des risques', 'ID', 3, 48),
    ('ID.IM-01', 'Des améliorations sont identifiées à partir des évaluations', 'Installer une dynamique où le SMSI progresse d''un cycle à l''autre au lieu de s''éroder.', 'Amélioration', 'ID', 3, 49),
    ('ID.IM-02', 'Des améliorations sont identifiées à partir des tests et exercices, y compris avec les fournisseurs', 'Éviter que la crise ne devienne un moment de sécurité dégradée exploitée (contrôles maintenus en mode dégradé).', 'Amélioration', 'ID', 3, 50),
    ('ID.IM-03', 'Des améliorations sont identifiées à partir de l''exécution des processus, procédures et activités opérationnelles', 'Installer une dynamique où le SMSI progresse d''un cycle à l''autre au lieu de s''éroder.', 'Amélioration', 'ID', 3, 51),
    ('ID.IM-04', 'Les plans de réponse et de rétablissement et autres plans cyber sont établis, communiqués, maintenus et améliorés', 'Être prêt avant l''incident : rôles, procédures, canaux et moyens définis à froid.', 'Amélioration', 'ID', 4, 52),
    ('PR.AA-01', 'Les identités et informations d''identification des utilisateurs, services et matériels autorisés sont gérées', 'Garantir qu''à chaque identité correspond une personne (ou un service) identifiable et responsable.', 'Gestion des identités, authentification et contrôle d''accès', 'PR', 4, 53),
    ('PR.AA-02', 'Les identités sont vérifiées et rattachées à des informations d''identification selon le contexte d''interaction', 'Protéger les secrets d''authentification sur tout leur cycle de vie (émission, transport, stockage, renouvellement).', 'Gestion des identités, authentification et contrôle d''accès', 'PR', 3, 54),
    ('PR.AA-03', 'Les utilisateurs, services et matériels sont authentifiés', 'Vérifier robustement l''identité, avec authentification multifacteur partout où le risque l''exige — en priorité accès distants, cloud et comptes à pouvoir.', 'Gestion des identités, authentification et contrôle d''accès', 'PR', 5, 55),
    ('PR.AA-04', 'Les assertions d''identité sont protégées, transmises et vérifiées', 'Vérifier robustement l''identité, avec authentification multifacteur partout où le risque l''exige — en priorité accès distants, cloud et comptes à pouvoir.', 'Gestion des identités, authentification et contrôle d''accès', 'PR', 3, 56),
    ('PR.AA-05', 'Les autorisations d''accès, droits et permissions sont définis, gérés, appliqués et revus selon le moindre privilège et la séparation des tâches', 'Fonder tous les accès sur les principes du besoin d''en connaître et du moindre privilège.', 'Gestion des identités, authentification et contrôle d''accès', 'PR', 5, 57),
    ('PR.AA-06', 'L''accès physique aux actifs est géré, surveillé et contrôlé en proportion du risque', 'Que chaque franchissement de zone sensible soit autorisé, tracé et révocable.', 'Gestion des identités, authentification et contrôle d''accès', 'PR', 3, 58),
    ('PR.AT-01', 'Le personnel reçoit la sensibilisation et la formation nécessaires à ses tâches générales en cybersécurité', 'Faire de l''humain une ligne de défense : des comportements sûrs, entretenus dans le temps, adaptés aux rôles.', 'Sensibilisation et formation', 'PR', 4, 59),
    ('PR.AT-02', 'Les personnes occupant des rôles spécialisés reçoivent une sensibilisation et une formation adaptées', 'Faire de l''humain une ligne de défense : des comportements sûrs, entretenus dans le temps, adaptés aux rôles.', 'Sensibilisation et formation', 'PR', 3, 60),
    ('PR.DS-01', 'La confidentialité, l''intégrité et la disponibilité des données au repos sont protégées', 'Protéger la confidentialité et l''intégrité par un chiffrement à l''état de l''art et une gestion des clés maîtrisée (génération, stockage, rotation, révocation).', 'Sécurité des données', 'PR', 4, 61),
    ('PR.DS-02', 'La confidentialité, l''intégrité et la disponibilité des données en transit sont protégées', 'Protéger la confidentialité et l''intégrité par un chiffrement à l''état de l''art et une gestion des clés maîtrisée (génération, stockage, rotation, révocation).', 'Sécurité des données', 'PR', 4, 62),
    ('PR.DS-10', 'La confidentialité, l''intégrité et la disponibilité des données en cours d''utilisation sont protégées', 'Limiter l''exposition des données sensibles par masquage, pseudonymisation ou anonymisation, notamment hors production.', 'Sécurité des données', 'PR', 3, 63),
    ('PR.DS-11', 'Des sauvegardes des données sont créées, protégées, maintenues et testées', 'Garantir la capacité réelle de restauration après incident, panne ou rançongiciel : couverture complète, copie isolée, tests probants.', 'Sécurité des données', 'PR', 5, 64),
    ('PR.PS-01', 'Des pratiques de gestion de configuration sont établies et appliquées', 'Partir de configurations durcies documentées et détecter les dérives par rapport à ces référentiels.', 'Sécurité des plateformes', 'PR', 4, 65),
    ('PR.PS-02', 'Les logiciels sont maintenus, remplacés et retirés en proportion du risque', 'Réduire la fenêtre d''exposition : connaître son parc, scanner en continu, corriger sous SLA en priorisant l''exploitabilité réelle.', 'Sécurité des plateformes', 'PR', 4, 66),
    ('PR.PS-03', 'Le matériel est maintenu, remplacé et retiré en proportion du risque', 'Maintenir les équipements en condition sûre, y compris lors des interventions de tiers.', 'Sécurité des plateformes', 'PR', 3, 67),
    ('PR.PS-04', 'Des journaux d''événements sont générés et mis à disposition pour la surveillance continue', 'Disposer de traces fiables, complètes, protégées et conservées assez longtemps pour détecter et investiguer.', 'Sécurité des plateformes', 'PR', 4, 68),
    ('PR.PS-05', 'L''installation et l''exécution de logiciels non autorisés sont empêchées', 'Maîtriser ce qui s''exécute en production : logiciels approuvés, sources sûres, installation contrôlée.', 'Sécurité des plateformes', 'PR', 3, 69),
    ('PR.PS-06', 'Des pratiques de développement logiciel sécurisé sont intégrées et leur performance surveillée sur le cycle de vie', 'Encadrer tout le cycle de développement (méthodes, environnements, revues, dépendances) pour produire du logiciel sûr.', 'Sécurité des plateformes', 'PR', 4, 70),
    ('PR.IR-01', 'Les réseaux et environnements sont protégés contre les accès logiques et usages non autorisés', 'Faire du réseau une infrastructure administrée et durcie : équipements maîtrisés, flux contrôlés, administration sécurisée.', 'Résilience de l''infrastructure technologique', 'PR', 4, 71),
    ('PR.IR-02', 'Les actifs technologiques sont protégés contre les menaces environnementales', 'Réduire l''exposition aux sinistres : incendie, eau, foudre, températures, malveillance physique.', 'Résilience de l''infrastructure technologique', 'PR', 3, 72),
    ('PR.IR-03', 'Des mécanismes de résilience sont mis en œuvre en conditions normales et défavorables', 'Éliminer les points uniques de défaillance des services critiques, à hauteur des besoins de disponibilité.', 'Résilience de l''infrastructure technologique', 'PR', 3, 73),
    ('PR.IR-04', 'Une capacité de ressources adéquate pour assurer la disponibilité est maintenue', 'Anticiper les saturations (stockage, calcul, réseau, licences) qui provoquent pannes et pertes de données.', 'Résilience de l''infrastructure technologique', 'PR', 2, 74),
    ('DE.CM-01', 'Les réseaux et services réseau sont surveillés pour détecter les événements potentiellement défavorables', 'Passer de traces passives à une détection active : règles, alertes, qualification et réaction dans des délais mesurés, 24/7 si le risque l''exige.', 'Surveillance continue', 'DE', 4, 75),
    ('DE.CM-02', 'L''environnement physique est surveillé pour détecter les événements potentiellement défavorables', 'Détecter et dissuader les intrusions physiques (vidéo, détection d''intrusion, gardiennage) dans le respect du droit.', 'Surveillance continue', 'DE', 3, 76),
    ('DE.CM-03', 'L''activité du personnel et l''utilisation des technologies sont surveillées pour détecter les événements potentiellement défavorables', 'Passer de traces passives à une détection active : règles, alertes, qualification et réaction dans des délais mesurés, 24/7 si le risque l''exige.', 'Surveillance continue', 'DE', 3, 77),
    ('DE.CM-06', 'Les activités et services des prestataires externes sont surveillés pour détecter les événements potentiellement défavorables', 'Vérifier dans la durée que les fournisseurs tiennent leurs engagements de sécurité.', 'Surveillance continue', 'DE', 3, 78),
    ('DE.CM-09', 'Le matériel et les logiciels informatiques, environnements d''exécution et leurs données sont surveillés', 'Passer de traces passives à une détection active : règles, alertes, qualification et réaction dans des délais mesurés, 24/7 si le risque l''exige.', 'Surveillance continue', 'DE', 4, 79),
    ('DE.AE-02', 'Les événements potentiellement défavorables sont analysés pour mieux comprendre les activités associées', 'Trier vite et bien : distinguer le bruit des vrais incidents grâce à des critères objectifs.', 'Analyse des événements défavorables', 'DE', 4, 80),
    ('DE.AE-03', 'Les informations sont corrélées à partir de sources multiples', 'Disposer de traces fiables, complètes, protégées et conservées assez longtemps pour détecter et investiguer.', 'Analyse des événements défavorables', 'DE', 3, 81),
    ('DE.AE-04', 'L''impact et l''étendue estimés des événements défavorables sont compris', 'Trier vite et bien : distinguer le bruit des vrais incidents grâce à des critères objectifs.', 'Analyse des événements défavorables', 'DE', 3, 82),
    ('DE.AE-06', 'Les informations sur les événements défavorables sont fournies au personnel et aux outils autorisés', 'Trier vite et bien : distinguer le bruit des vrais incidents grâce à des critères objectifs.', 'Analyse des événements défavorables', 'DE', 3, 83),
    ('DE.AE-07', 'Le renseignement cyber et les autres informations contextuelles sont intégrés à l''analyse', 'Anticiper les menaces pesant réellement sur l''organisation et prioriser les défenses en conséquence.', 'Analyse des événements défavorables', 'DE', 2, 84),
    ('DE.AE-08', 'Les incidents sont déclarés lorsque les événements défavorables satisfont les critères définis', 'Trier vite et bien : distinguer le bruit des vrais incidents grâce à des critères objectifs.', 'Analyse des événements défavorables', 'DE', 4, 85),
    ('RS.MA-01', 'Le plan de réponse aux incidents est exécuté en coordination avec les tiers pertinents dès la déclaration d''un incident', 'Être prêt avant l''incident : rôles, procédures, canaux et moyens définis à froid.', 'Gestion des incidents', 'RS', 5, 86),
    ('RS.MA-02', 'Les signalements d''incidents sont triés et validés', 'Trier vite et bien : distinguer le bruit des vrais incidents grâce à des critères objectifs.', 'Gestion des incidents', 'RS', 4, 87),
    ('RS.MA-03', 'Les incidents sont catégorisés et priorisés', 'Trier vite et bien : distinguer le bruit des vrais incidents grâce à des critères objectifs.', 'Gestion des incidents', 'RS', 4, 88),
    ('RS.MA-04', 'Les incidents sont escaladés ou transférés selon les besoins', 'Contenir, éradiquer et rétablir de façon coordonnée et tracée.', 'Gestion des incidents', 'RS', 3, 89),
    ('RS.MA-05', 'Les critères de déclenchement du rétablissement sont appliqués', 'Contenir, éradiquer et rétablir de façon coordonnée et tracée.', 'Gestion des incidents', 'RS', 3, 90),
    ('RS.AN-03', 'Une analyse est réalisée pour établir ce qui s''est produit et la cause racine de l''incident', 'Ne jamais subir deux fois le même incident : capitaliser systématiquement.', 'Analyse des incidents', 'RS', 3, 91),
    ('RS.AN-06', 'Les actions réalisées pendant l''investigation sont enregistrées avec garantie d''intégrité et de provenance', 'Préserver des preuves recevables (chaîne de conservation) pour l''enquête, l''assurance ou la justice.', 'Analyse des incidents', 'RS', 3, 92),
    ('RS.AN-07', 'Les données et métadonnées de l''incident sont collectées et leur intégrité et provenance préservées', 'Préserver des preuves recevables (chaîne de conservation) pour l''enquête, l''assurance ou la justice.', 'Analyse des incidents', 'RS', 3, 93),
    ('RS.AN-08', 'L''ampleur de l''incident est estimée et validée', 'Trier vite et bien : distinguer le bruit des vrais incidents grâce à des critères objectifs.', 'Analyse des incidents', 'RS', 2, 94),
    ('RS.CO-02', 'Les parties prenantes internes et externes sont notifiées des incidents', 'Savoir qui contacter, comment et sous quel délai en cas d''incident ou d''obligation légale.', 'Communication et notification', 'RS', 4, 95),
    ('RS.CO-03', 'Les informations sont partagées avec les parties prenantes désignées', 'Savoir qui contacter, comment et sous quel délai en cas d''incident ou d''obligation légale.', 'Communication et notification', 'RS', 3, 96),
    ('RS.MI-01', 'Les incidents sont contenus', 'Contenir, éradiquer et rétablir de façon coordonnée et tracée.', 'Atténuation des incidents', 'RS', 4, 97),
    ('RS.MI-02', 'Les incidents sont éradiqués', 'Contenir, éradiquer et rétablir de façon coordonnée et tracée.', 'Atténuation des incidents', 'RS', 4, 98),
    ('RC.RP-01', 'Le volet rétablissement du plan de réponse est exécuté dès son déclenchement', 'Contenir, éradiquer et rétablir de façon coordonnée et tracée.', 'Exécution du plan de rétablissement', 'RC', 4, 99),
    ('RC.RP-02', 'Les actions de rétablissement sont sélectionnées, ordonnancées, priorisées et exécutées', 'Garantir la capacité technique de reprise (RTO/RPO tenus, plans testés) alignée sur les besoins métiers.', 'Exécution du plan de rétablissement', 'RC', 3, 100),
    ('RC.RP-03', 'L''intégrité des sauvegardes et autres actifs de restauration est vérifiée avant leur utilisation', 'Garantir la capacité réelle de restauration après incident, panne ou rançongiciel : couverture complète, copie isolée, tests probants.', 'Exécution du plan de rétablissement', 'RC', 4, 101),
    ('RC.RP-04', 'Les fonctions critiques et la gestion des risques sont prises en compte pour établir les normes opérationnelles post-incident', 'Garantir la capacité technique de reprise (RTO/RPO tenus, plans testés) alignée sur les besoins métiers.', 'Exécution du plan de rétablissement', 'RC', 2, 102),
    ('RC.RP-05', 'L''intégrité des actifs restaurés est vérifiée, les systèmes remis en service et le retour à la normale confirmé', 'Contenir, éradiquer et rétablir de façon coordonnée et tracée.', 'Exécution du plan de rétablissement', 'RC', 3, 103),
    ('RC.RP-06', 'La fin du rétablissement est déclarée selon des critères définis et la documentation d''incident complétée', 'Contenir, éradiquer et rétablir de façon coordonnée et tracée.', 'Exécution du plan de rétablissement', 'RC', 2, 104),
    ('RC.CO-03', 'Les activités de rétablissement et le retour à la normale sont communiqués aux parties internes et externes désignées', 'Être prêt avant l''incident : rôles, procédures, canaux et moyens définis à froid.', 'Communication du rétablissement', 'RC', 3, 105),
    ('RC.CO-04', 'Les mises à jour publiques sur le rétablissement sont partagées par des méthodes et messages approuvés', 'Structurer les flux de communication sécurité (alertes, reporting, communication de crise, clients).', 'Communication du rétablissement', 'RC', 2, 106)
) AS c(code, title, description, category, domain, weight, position)
CROSS JOIN (
    SELECT fv.id
    FROM framework_versions fv
    JOIN frameworks f ON f.id = fv.framework_id
    WHERE f.code = 'NIST_CSF' AND fv.version = '2.0'
) AS fv
ON CONFLICT (framework_version_id, code) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Rattachements deduits
-- -----------------------------------------------------------------------------
INSERT INTO question_control_mapping
    (question_id, control_id, mapping_type, status, confidence, source, mapping_rationale)
SELECT que.id, ctl.id, m.mapping_type, 'CONFIRMED', m.confidence, 'DERIVED_ISO27001', m.rationale
FROM (VALUES
    ('ACC-01', 'PR.AA-05', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.15 (rattachement etabli dans V15), et la sous-categorie PR.AA-05 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('ACC-02', 'PR.AA-03', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.8.5 (rattachement etabli dans V15), et la sous-categorie PR.AA-03 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('ACC-02', 'PR.AA-04', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.8.5 (rattachement etabli dans V15), et la sous-categorie PR.AA-04 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('ACC-03', 'PR.AA-05', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.8.2 (rattachement etabli dans V15), et la sous-categorie PR.AA-05 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('APP-01', 'PR.PS-06', 'PRIMARY', 0.85, 'Deduit : la question porte le controle A.8.25 (rattachement etabli dans V15), et la sous-categorie PR.PS-06 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('APP-02', 'ID.IM-02', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.8.29 (rattachement etabli dans V15), et la sous-categorie ID.IM-02 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('AST-01', 'ID.AM-01', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.9 (rattachement etabli dans V15), et la sous-categorie ID.AM-01 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('AST-01', 'ID.AM-02', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.9 (rattachement etabli dans V15), et la sous-categorie ID.AM-02 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('AST-02', 'ID.AM-01', 'PRIMARY', 0.85, 'Deduit : la question porte le controle A.5.9 (rattachement etabli dans V15), et la sous-categorie ID.AM-01 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('AST-02', 'ID.AM-02', 'PRIMARY', 0.85, 'Deduit : la question porte le controle A.5.9 (rattachement etabli dans V15), et la sous-categorie ID.AM-02 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('AST-03', 'ID.AM-08', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.7.14 (rattachement etabli dans V15), et la sous-categorie ID.AM-08 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('AST-03', 'PR.PS-03', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.7.14 (rattachement etabli dans V15), et la sous-categorie PR.PS-03 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('BCP-01', 'PR.DS-11', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.8.13 (rattachement etabli dans V15), et la sous-categorie PR.DS-11 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('BCP-01', 'RC.RP-03', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.8.13 (rattachement etabli dans V15), et la sous-categorie RC.RP-03 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('BCP-02', 'GV.OC-04', 'SECONDARY', 0.76, 'Deduit : la question porte le controle A.5.29 (rattachement etabli dans V15), et la sous-categorie GV.OC-04 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('BCP-02', 'ID.IM-02', 'SECONDARY', 0.76, 'Deduit : la question porte le controle A.5.29 (rattachement etabli dans V15), et la sous-categorie ID.IM-02 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('BCP-02', 'ID.IM-04', 'SECONDARY', 0.76, 'Deduit : la question porte le controle A.5.29 (rattachement etabli dans V15), et la sous-categorie ID.IM-04 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('BCP-02', 'RC.RP-01', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.30 (rattachement etabli dans V15), et la sous-categorie RC.RP-01 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('BCP-02', 'RC.RP-02', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.30 (rattachement etabli dans V15), et la sous-categorie RC.RP-02 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('BCP-02', 'RC.RP-04', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.30 (rattachement etabli dans V15), et la sous-categorie RC.RP-04 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('BCP-03', 'RC.RP-01', 'PRIMARY', 0.85, 'Deduit : la question porte le controle A.5.30 (rattachement etabli dans V15), et la sous-categorie RC.RP-01 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('BCP-03', 'RC.RP-02', 'PRIMARY', 0.85, 'Deduit : la question porte le controle A.5.30 (rattachement etabli dans V15), et la sous-categorie RC.RP-02 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('BCP-03', 'RC.RP-04', 'PRIMARY', 0.85, 'Deduit : la question porte le controle A.5.30 (rattachement etabli dans V15), et la sous-categorie RC.RP-04 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('CMP-01', 'GV.OC-03', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.31 (rattachement etabli dans V15), et la sous-categorie GV.OC-03 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('CMP-02', 'ID.IM-01', 'PRIMARY', 0.85, 'Deduit : la question porte le controle A.5.35 (rattachement etabli dans V15), et la sous-categorie ID.IM-01 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('CMP-03', 'GV.OC-03', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.34 (rattachement etabli dans V15), et la sous-categorie GV.OC-03 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('CMP-03', 'ID.AM-07', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.34 (rattachement etabli dans V15), et la sous-categorie ID.AM-07 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('CMP-03', 'RS.CO-02', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.34 (rattachement etabli dans V15), et la sous-categorie RS.CO-02 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('DAT-01', 'ID.AM-05', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.12 (rattachement etabli dans V15), et la sous-categorie ID.AM-05 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('DAT-01', 'ID.AM-07', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.12 (rattachement etabli dans V15), et la sous-categorie ID.AM-07 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('DAT-02', 'PR.AA-04', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.8.24 (rattachement etabli dans V15), et la sous-categorie PR.AA-04 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('DAT-02', 'PR.DS-01', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.8.24 (rattachement etabli dans V15), et la sous-categorie PR.DS-01 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('DAT-02', 'PR.DS-02', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.8.24 (rattachement etabli dans V15), et la sous-categorie PR.DS-02 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('DAT-03', 'PR.DS-10', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.8.12 (rattachement etabli dans V15), et la sous-categorie PR.DS-10 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('DET-01', 'DE.AE-03', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.8.15 (rattachement etabli dans V15), et la sous-categorie DE.AE-03 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('DET-01', 'PR.PS-04', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.8.15 (rattachement etabli dans V15), et la sous-categorie PR.PS-04 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('DET-02', 'DE.AE-03', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.8.16 (rattachement etabli dans V15), et la sous-categorie DE.AE-03 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('DET-02', 'DE.CM-01', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.8.16 (rattachement etabli dans V15), et la sous-categorie DE.CM-01 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('DET-02', 'DE.CM-03', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.8.16 (rattachement etabli dans V15), et la sous-categorie DE.CM-03 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('DET-02', 'DE.CM-09', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.8.16 (rattachement etabli dans V15), et la sous-categorie DE.CM-09 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('DET-03', 'DE.CM-09', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.8.7 (rattachement etabli dans V15), et la sous-categorie DE.CM-09 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('GOV-01', 'GV.PO-01', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.1 (rattachement etabli dans V15), et la sous-categorie GV.PO-01 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('GOV-01', 'GV.PO-02', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.1 (rattachement etabli dans V15), et la sous-categorie GV.PO-02 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('GOV-02', 'GV.RR-02', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.2 (rattachement etabli dans V15), et la sous-categorie GV.RR-02 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('GOV-02', 'GV.SC-02', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.2 (rattachement etabli dans V15), et la sous-categorie GV.SC-02 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('GOV-03', 'PR.AT-01', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.6.3 (rattachement etabli dans V15), et la sous-categorie PR.AT-01 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('GOV-03', 'PR.AT-02', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.6.3 (rattachement etabli dans V15), et la sous-categorie PR.AT-02 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('HUM-01', 'GV.RR-04', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.6.5 (rattachement etabli dans V15), et la sous-categorie GV.RR-04 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('HUM-01', 'PR.AA-05', 'SECONDARY', 0.85, 'Deduit : la question porte le controle A.5.18 (rattachement etabli dans V15), et la sous-categorie PR.AA-05 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('HUM-02', 'DE.AE-06', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.6.8 (rattachement etabli dans V15), et la sous-categorie DE.AE-06 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('HUM-02', 'RS.MA-02', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.6.8 (rattachement etabli dans V15), et la sous-categorie RS.MA-02 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('HUM-03', 'PR.AT-01', 'PRIMARY', 0.85, 'Deduit : la question porte le controle A.6.3 (rattachement etabli dans V15), et la sous-categorie PR.AT-01 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('HUM-03', 'PR.AT-02', 'PRIMARY', 0.85, 'Deduit : la question porte le controle A.6.3 (rattachement etabli dans V15), et la sous-categorie PR.AT-02 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('INC-01', 'GV.SC-08', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.24 (rattachement etabli dans V15), et la sous-categorie GV.SC-08 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('INC-01', 'ID.IM-04', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.24 (rattachement etabli dans V15), et la sous-categorie ID.IM-04 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('INC-01', 'RC.CO-03', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.24 (rattachement etabli dans V15), et la sous-categorie RC.CO-03 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('INC-01', 'RC.RP-01', 'SECONDARY', 0.76, 'Deduit : la question porte le controle A.5.26 (rattachement etabli dans V15), et la sous-categorie RC.RP-01 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('INC-01', 'RC.RP-05', 'SECONDARY', 0.76, 'Deduit : la question porte le controle A.5.26 (rattachement etabli dans V15), et la sous-categorie RC.RP-05 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('INC-01', 'RC.RP-06', 'SECONDARY', 0.76, 'Deduit : la question porte le controle A.5.26 (rattachement etabli dans V15), et la sous-categorie RC.RP-06 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('INC-01', 'RS.MA-01', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.24 (rattachement etabli dans V15), et la sous-categorie RS.MA-01 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('INC-01', 'RS.MA-04', 'SECONDARY', 0.76, 'Deduit : la question porte le controle A.5.26 (rattachement etabli dans V15), et la sous-categorie RS.MA-04 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('INC-01', 'RS.MA-05', 'SECONDARY', 0.76, 'Deduit : la question porte le controle A.5.26 (rattachement etabli dans V15), et la sous-categorie RS.MA-05 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('INC-01', 'RS.MI-01', 'SECONDARY', 0.76, 'Deduit : la question porte le controle A.5.26 (rattachement etabli dans V15), et la sous-categorie RS.MI-01 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('INC-01', 'RS.MI-02', 'SECONDARY', 0.76, 'Deduit : la question porte le controle A.5.26 (rattachement etabli dans V15), et la sous-categorie RS.MI-02 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('INC-02', 'DE.AE-02', 'SECONDARY', 0.76, 'Deduit : la question porte le controle A.5.25 (rattachement etabli dans V15), et la sous-categorie DE.AE-02 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('INC-02', 'DE.AE-04', 'SECONDARY', 0.76, 'Deduit : la question porte le controle A.5.25 (rattachement etabli dans V15), et la sous-categorie DE.AE-04 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('INC-02', 'DE.AE-06', 'SECONDARY', 0.76, 'Deduit : la question porte le controle A.5.25 (rattachement etabli dans V15), et la sous-categorie DE.AE-06 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('INC-02', 'DE.AE-08', 'SECONDARY', 0.76, 'Deduit : la question porte le controle A.5.25 (rattachement etabli dans V15), et la sous-categorie DE.AE-08 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('INC-02', 'RS.AN-03', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.27 (rattachement etabli dans V15), et la sous-categorie RS.AN-03 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('INC-02', 'RS.AN-08', 'SECONDARY', 0.76, 'Deduit : la question porte le controle A.5.25 (rattachement etabli dans V15), et la sous-categorie RS.AN-08 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('INC-02', 'RS.MA-02', 'SECONDARY', 0.76, 'Deduit : la question porte le controle A.5.25 (rattachement etabli dans V15), et la sous-categorie RS.MA-02 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('INC-02', 'RS.MA-03', 'SECONDARY', 0.76, 'Deduit : la question porte le controle A.5.25 (rattachement etabli dans V15), et la sous-categorie RS.MA-03 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('NET-01', 'ID.AM-03', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.8.22 (rattachement etabli dans V15), et la sous-categorie ID.AM-03 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('NET-01', 'PR.IR-01', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.8.22 (rattachement etabli dans V15), et la sous-categorie PR.IR-01 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('NET-02', 'ID.AM-03', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.8.20 (rattachement etabli dans V15), et la sous-categorie ID.AM-03 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('NET-02', 'PR.IR-01', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.8.20 (rattachement etabli dans V15), et la sous-categorie PR.IR-01 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('SUP-01', 'GV.SC-05', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.20 (rattachement etabli dans V15), et la sous-categorie GV.SC-05 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('SUP-01', 'GV.SC-10', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.20 (rattachement etabli dans V15), et la sous-categorie GV.SC-10 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('SUP-02', 'DE.CM-06', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.22 (rattachement etabli dans V15), et la sous-categorie DE.CM-06 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('SUP-02', 'GV.SC-06', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.22 (rattachement etabli dans V15), et la sous-categorie GV.SC-06 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('SUP-02', 'GV.SC-07', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.22 (rattachement etabli dans V15), et la sous-categorie GV.SC-07 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('SUP-02', 'GV.SC-09', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.5.22 (rattachement etabli dans V15), et la sous-categorie GV.SC-09 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('SUP-03', 'GV.SC-01', 'PRIMARY', 0.85, 'Deduit : la question porte le controle A.5.19 (rattachement etabli dans V15), et la sous-categorie GV.SC-01 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('SUP-03', 'GV.SC-02', 'PRIMARY', 0.85, 'Deduit : la question porte le controle A.5.19 (rattachement etabli dans V15), et la sous-categorie GV.SC-02 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('SUP-03', 'GV.SC-04', 'PRIMARY', 0.85, 'Deduit : la question porte le controle A.5.19 (rattachement etabli dans V15), et la sous-categorie GV.SC-04 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('SUP-03', 'GV.SC-06', 'PRIMARY', 0.85, 'Deduit : la question porte le controle A.5.19 (rattachement etabli dans V15), et la sous-categorie GV.SC-06 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('SUP-03', 'ID.AM-04', 'PRIMARY', 0.85, 'Deduit : la question porte le controle A.5.19 (rattachement etabli dans V15), et la sous-categorie ID.AM-04 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('SUP-03', 'ID.RA-10', 'PRIMARY', 0.85, 'Deduit : la question porte le controle A.5.19 (rattachement etabli dans V15), et la sous-categorie ID.RA-10 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('SUP-03', 'PR.AA-05', 'SECONDARY', 0.76, 'Deduit : la question porte le controle A.5.15 (rattachement etabli dans V15), et la sous-categorie PR.AA-05 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('VUL-01', 'ID.RA-01', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.8.8 (rattachement etabli dans V15), et la sous-categorie ID.RA-01 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('VUL-01', 'ID.RA-08', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.8.8 (rattachement etabli dans V15), et la sous-categorie ID.RA-08 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('VUL-01', 'PR.PS-02', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.8.8 (rattachement etabli dans V15), et la sous-categorie PR.PS-02 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('VUL-02', 'ID.RA-01', 'PRIMARY', 0.85, 'Deduit : la question porte le controle A.8.8 (rattachement etabli dans V15), et la sous-categorie ID.RA-01 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('VUL-02', 'ID.RA-08', 'PRIMARY', 0.85, 'Deduit : la question porte le controle A.8.8 (rattachement etabli dans V15), et la sous-categorie ID.RA-08 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('VUL-02', 'PR.PS-02', 'PRIMARY', 0.85, 'Deduit : la question porte le controle A.8.8 (rattachement etabli dans V15), et la sous-categorie PR.PS-02 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.'),
    ('VUL-03', 'PR.PS-01', 'PRIMARY', 0.95, 'Deduit : la question porte le controle A.8.9 (rattachement etabli dans V15), et la sous-categorie PR.PS-01 est equivalente a ce controle selon la correspondance ISO 27001 publiee avec le CSF 2.0.')
) AS m(question_code, control_code, mapping_type, confidence, rationale)
JOIN questionnaire_questions que ON que.code = m.question_code
JOIN controls ctl ON ctl.code = m.control_code
JOIN framework_versions fv ON fv.id = ctl.framework_version_id
JOIN frameworks f ON f.id = fv.framework_id AND f.code = 'NIST_CSF'
ON CONFLICT (question_id, control_id) DO NOTHING;
