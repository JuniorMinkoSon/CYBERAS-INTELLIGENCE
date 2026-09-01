-- V3 : scans et constats
--
-- Tables portées par les entités Scan et Finding. Elles précèdent
-- finding_risk_assessments, qui référence findings(id).

CREATE TABLE scans (
    id                 UUID PRIMARY KEY,
    audit_id           UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    audit_version_id   UUID NOT NULL REFERENCES audit_versions(id) ON DELETE CASCADE,
    organization_id    UUID NOT NULL REFERENCES organizations(id),
    scanner_type       VARCHAR(50) NOT NULL,
    scanner_version    VARCHAR(50) NOT NULL DEFAULT 'unknown',
    target             VARCHAR(255) NOT NULL,
    scan_profile       VARCHAR(50) DEFAULT 'STANDARD',
    status             VARCHAR(50) NOT NULL DEFAULT 'QUEUED',
    progress           INTEGER DEFAULT 0,
    started_at         TIMESTAMP,
    finished_at        TIMESTAMP,
    duration_seconds   BIGINT,
    configuration      JSONB,
    raw_output         TEXT,
    parsed_output      JSONB,
    hash               VARCHAR(64),
    error_message      TEXT,
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by         UUID REFERENCES users(id),
    updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_scan_status CHECK (status IN ('QUEUED','RUNNING','COMPLETED','FAILED','CANCELLED','TIMEOUT'))
);

CREATE INDEX idx_scans_audit ON scans(audit_id);
CREATE INDEX idx_scans_org   ON scans(organization_id);

CREATE TABLE findings (
    id               UUID PRIMARY KEY,
    scan_id          UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    audit_id         UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    organization_id  UUID NOT NULL REFERENCES organizations(id),
    title            VARCHAR(100) NOT NULL,
    description      TEXT,
    severity         VARCHAR(50) NOT NULL,
    cvss_score       DOUBLE PRECISION,
    cve              VARCHAR(50),
    cpe              VARCHAR(100),
    source           VARCHAR(100),
    source_id        VARCHAR(255),
    confidence       DOUBLE PRECISION DEFAULT 1.0,
    status           VARCHAR(50) DEFAULT 'OPEN',
    evidence         JSONB,
    metadata         JSONB,
    detected_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       UUID REFERENCES users(id),
    updated_at       TIMESTAMP,
    CONSTRAINT chk_finding_severity CHECK (severity IN ('CRITICAL','HIGH','MEDIUM','LOW','INFO'))
);

CREATE INDEX idx_findings_scan     ON findings(scan_id);
CREATE INDEX idx_findings_audit    ON findings(audit_id);
CREATE INDEX idx_findings_org      ON findings(organization_id);
CREATE INDEX idx_findings_severity ON findings(severity);
