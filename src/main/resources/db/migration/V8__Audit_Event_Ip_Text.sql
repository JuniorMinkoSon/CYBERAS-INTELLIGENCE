-- V8 : ip_address de audit_events en texte
--
-- V1 déclarait cette colonne en INET, un type PostgreSQL natif, alors que
-- AuditEvent.ipAddress est une chaîne côté JPA. L'écart passait inaperçu tant
-- qu'Hibernate générait le schéma lui-même ; en mode validate il empêche le
-- démarrage de l'application.
--
-- On aligne la base sur l'entité plutôt que l'inverse : la valeur stockée est
-- une trace d'audit, pas une donnée sur laquelle on fait du calcul réseau. Elle
-- peut d'ailleurs contenir autre chose qu'une adresse — plusieurs adresses
-- transmises par un proxy, ou une mention d'origine inconnue — ce qu'INET
-- rejetterait.
--
-- 45 caractères couvrent une IPv6 pleine forme avec zone d'interface ; 64 laisse
-- la marge nécessaire et s'aligne sur assets.ip_address introduit en V5.

ALTER TABLE audit_events
    ALTER COLUMN ip_address TYPE VARCHAR(64) USING ip_address::TEXT;
