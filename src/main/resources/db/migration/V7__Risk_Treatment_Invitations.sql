-- V7 : traitement du risque, référentiels par audit, invitations de sous-comptes
--
-- Le Risk Map a besoin d'un responsable, d'un statut de remédiation et d'une
-- échéance par constat et par recommandation. L'audit porte la liste des
-- référentiels retenus. Les invitations permettent à un propriétaire d'ouvrir
-- des sous-comptes par code d'accès, avec un niveau de permission.

ALTER TABLE audits ADD COLUMN frameworks JSONB;

ALTER TABLE findings ADD COLUMN owner_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE findings ADD COLUMN due_date DATE;
ALTER TABLE findings ADD COLUMN remediation_note TEXT;

ALTER TABLE recommendations ADD COLUMN owner_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE recommendations ADD COLUMN due_date DATE;

CREATE TABLE invitations (
    id               UUID PRIMARY KEY,
    organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code             VARCHAR(40) NOT NULL UNIQUE,
    email            VARCHAR(255),
    role             VARCHAR(50) NOT NULL,
    permissions      JSONB,
    expires_at       TIMESTAMP NOT NULL,
    used_at          TIMESTAMP,
    used_by          UUID REFERENCES users(id),
    revoked_at       TIMESTAMP,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       UUID REFERENCES users(id),
    CONSTRAINT chk_invitation_role CHECK (role IN ('ADMIN','RSSI','AUDITOR','VIEWER'))
);

CREATE INDEX idx_invitations_org ON invitations(organization_id);
