-- V2 : périmètre autorisé des audits
--
-- Aucun scan ne peut sortir de ce périmètre. Une entrée décrit une cible ou une
-- plage autorisée, et porte la preuve de son autorisation (qui, quand, sur quelle
-- base). L'absence d'entrée active vaut refus.

CREATE TABLE audit_scopes (
    id                      UUID PRIMARY KEY,
    audit_id                UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    organization_id         UUID NOT NULL REFERENCES organizations(id),

    -- CIDR | IP | HOSTNAME | DOMAIN
    scope_type              VARCHAR(20) NOT NULL,
    value                   VARCHAR(255) NOT NULL,

    -- Une entrée non autorisée décrit une cible connue mais interdit le scan.
    authorized              BOOLEAN NOT NULL DEFAULT FALSE,
    authorized_by           UUID REFERENCES users(id),
    authorized_at           TIMESTAMP,
    authorization_reference VARCHAR(255),

    notes                   TEXT,
    revoked_at              TIMESTAMP,

    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              UUID REFERENCES users(id),
    updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_audit_scope_type
        CHECK (scope_type IN ('CIDR', 'IP', 'HOSTNAME', 'DOMAIN')),

    -- Une autorisation sans auteur ni date n'est pas une preuve exploitable.
    CONSTRAINT chk_audit_scope_authorization
        CHECK (authorized = FALSE OR (authorized_by IS NOT NULL AND authorized_at IS NOT NULL))
);

CREATE INDEX idx_audit_scope_audit ON audit_scopes(audit_id);
CREATE INDEX idx_audit_scope_org   ON audit_scopes(organization_id);

-- Chemin d'accès du validateur : entrées actives d'un audit.
CREATE INDEX idx_audit_scope_active
    ON audit_scopes(audit_id)
    WHERE authorized = TRUE AND revoked_at IS NULL;

-- Une même cible ne doit pas être déclarée deux fois pour un audit.
CREATE UNIQUE INDEX uk_audit_scope_target
    ON audit_scopes(audit_id, scope_type, value)
    WHERE revoked_at IS NULL;
