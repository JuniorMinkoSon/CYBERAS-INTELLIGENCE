-- Cartographie des risques dérivée des logs de scan (SIEM simplifié, MEHARI).
--
-- Une ligne par (organisation, audit, catégorie, protocole), alimentée par la
-- télémétrie de scan publiée sur Kafka (cyberas-scan-events) : chaque constat
-- incrémente occurrences et ne fait progresser risk_level que vers le haut.
-- Distincte de audit_risk_assessments : celle-ci lit un flux d'événements,
-- l'autre porte le score déterministe et opposable d'un audit.
CREATE TABLE risk_cartography_entries (
    id              UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    audit_id        UUID REFERENCES audits(id),
    category        VARCHAR(20) NOT NULL,
    protocol        VARCHAR(10),
    risk_level      VARCHAR(20) NOT NULL DEFAULT 'LOW',
    occurrences     INTEGER NOT NULL DEFAULT 0,
    last_summary    TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

-- NULLS NOT DISTINCT n'existe qu'à partir de PostgreSQL 15 ; un index partiel
-- sur audit_id IS NULL couvre le même besoin pour les versions antérieures,
-- et l'unicité "normale" suffit dès qu'un audit est renseigné.
CREATE UNIQUE INDEX idx_risk_cartography_unique
    ON risk_cartography_entries (organization_id, audit_id, category, protocol)
    WHERE audit_id IS NOT NULL AND protocol IS NOT NULL;

CREATE UNIQUE INDEX idx_risk_cartography_unique_no_protocol
    ON risk_cartography_entries (organization_id, audit_id, category)
    WHERE audit_id IS NOT NULL AND protocol IS NULL;

CREATE INDEX idx_risk_cartography_org ON risk_cartography_entries(organization_id, updated_at DESC);
CREATE INDEX idx_risk_cartography_audit ON risk_cartography_entries(audit_id, updated_at DESC);
