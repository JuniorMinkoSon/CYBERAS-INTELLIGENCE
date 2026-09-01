-- V5 : parcours MVP
--
-- Actifs, questionnaire, documents/preuves, recommandations, évaluation de risque
-- au niveau de l'audit. Toutes les tables portent organization_id pour l'isolation
-- tenant, et audit_id quand la donnée appartient à une mission.

-- ACTIFS
CREATE TABLE assets (
    id                 UUID PRIMARY KEY,
    organization_id    UUID NOT NULL REFERENCES organizations(id),
    audit_id           UUID REFERENCES audits(id) ON DELETE SET NULL,
    hostname           VARCHAR(255),
    ip_address         VARCHAR(64),
    asset_type         VARCHAR(50) NOT NULL DEFAULT 'SERVER',
    operating_system   VARCHAR(100),
    environment        VARCHAR(50) NOT NULL DEFAULT 'PRODUCTION',
    criticality        VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    internet_exposed   BOOLEAN NOT NULL DEFAULT FALSE,
    owner              VARCHAR(255),
    description        TEXT,
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by         UUID REFERENCES users(id),
    updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_asset_criticality CHECK (criticality IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    CONSTRAINT chk_asset_identity CHECK (hostname IS NOT NULL OR ip_address IS NOT NULL)
);

CREATE INDEX idx_assets_org   ON assets(organization_id);
CREATE INDEX idx_assets_audit ON assets(audit_id);

-- CONSTATS : rattachement à un actif et détail réseau
ALTER TABLE findings ADD COLUMN asset_id        UUID REFERENCES assets(id) ON DELETE SET NULL;
ALTER TABLE findings ADD COLUMN port            INTEGER;
ALTER TABLE findings ADD COLUMN protocol        VARCHAR(10);
ALTER TABLE findings ADD COLUMN service_name    VARCHAR(100);
ALTER TABLE findings ADD COLUMN service_version VARCHAR(255);
ALTER TABLE findings ADD CONSTRAINT chk_finding_status
    CHECK (status IN ('OPEN','ACKNOWLEDGED','REMEDIATED','FALSE_POSITIVE'));

-- QUESTIONNAIRE
CREATE TABLE questionnaire_questions (
    id            UUID PRIMARY KEY,
    code          VARCHAR(20) NOT NULL UNIQUE,
    domain        VARCHAR(50) NOT NULL,
    position      INTEGER NOT NULL,
    text          TEXT NOT NULL,
    guidance      TEXT,
    weight        INTEGER NOT NULL DEFAULT 1,
    active        BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE questionnaire_answers (
    id               UUID PRIMARY KEY,
    audit_id         UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    organization_id  UUID NOT NULL REFERENCES organizations(id),
    question_id      UUID NOT NULL REFERENCES questionnaire_questions(id),
    -- Niveau de maturité 0 (absent) à 4 (mesuré et maîtrisé). NULL = non applicable.
    maturity_level   INTEGER,
    not_applicable   BOOLEAN NOT NULL DEFAULT FALSE,
    comment          TEXT,
    answered_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    answered_by      UUID REFERENCES users(id),
    CONSTRAINT uk_answer_audit_question UNIQUE (audit_id, question_id),
    CONSTRAINT chk_answer_level CHECK (maturity_level IS NULL OR maturity_level BETWEEN 0 AND 4)
);

CREATE INDEX idx_answers_audit ON questionnaire_answers(audit_id);

-- DOCUMENTS / PREUVES
CREATE TABLE documents (
    id               UUID PRIMARY KEY,
    organization_id  UUID NOT NULL REFERENCES organizations(id),
    audit_id         UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    file_name        VARCHAR(255) NOT NULL,
    content_type     VARCHAR(150) NOT NULL,
    size_bytes       BIGINT NOT NULL,
    sha256           VARCHAR(64) NOT NULL,
    storage_path     VARCHAR(500) NOT NULL,
    status           VARCHAR(30) NOT NULL DEFAULT 'UPLOADED',
    description      TEXT,
    uploaded_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by      UUID REFERENCES users(id),
    CONSTRAINT chk_document_status CHECK (status IN ('UPLOADED','REVIEWED','REJECTED'))
);

CREATE INDEX idx_documents_audit ON documents(audit_id);
CREATE INDEX idx_documents_org   ON documents(organization_id);

-- RECOMMANDATIONS
CREATE TABLE recommendations (
    id               UUID PRIMARY KEY,
    organization_id  UUID NOT NULL REFERENCES organizations(id),
    audit_id         UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    finding_id       UUID REFERENCES findings(id) ON DELETE SET NULL,
    question_id      UUID REFERENCES questionnaire_questions(id),
    -- Clé stable évitant les doublons lors des régénérations.
    source_key       VARCHAR(120) NOT NULL,
    problem          TEXT NOT NULL,
    risk             TEXT NOT NULL,
    recommendation   TEXT NOT NULL,
    priority         VARCHAR(20) NOT NULL,
    status           VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    framework_refs   JSONB,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_reco_source UNIQUE (audit_id, source_key),
    CONSTRAINT chk_reco_priority CHECK (priority IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    CONSTRAINT chk_reco_status CHECK (status IN ('OPEN','IN_PROGRESS','DONE'))
);

CREATE INDEX idx_reco_audit ON recommendations(audit_id);

-- PREUVES : lien document -> question / constat / recommandation
CREATE TABLE evidences (
    id                 UUID PRIMARY KEY,
    organization_id    UUID NOT NULL REFERENCES organizations(id),
    audit_id           UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    document_id        UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    question_id        UUID REFERENCES questionnaire_questions(id),
    finding_id         UUID REFERENCES findings(id) ON DELETE CASCADE,
    recommendation_id  UUID REFERENCES recommendations(id) ON DELETE CASCADE,
    note               TEXT,
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by         UUID REFERENCES users(id),
    CONSTRAINT chk_evidence_target CHECK (
        question_id IS NOT NULL OR finding_id IS NOT NULL OR recommendation_id IS NOT NULL
    )
);

CREATE INDEX idx_evidences_audit    ON evidences(audit_id);
CREATE INDEX idx_evidences_document ON evidences(document_id);

-- ÉVALUATION DE RISQUE AU NIVEAU DE L'AUDIT
-- Agrégation des évaluations par constat et de la maturité déclarée.
CREATE TABLE audit_risk_assessments (
    id                   UUID PRIMARY KEY,
    audit_id             UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    organization_id      UUID NOT NULL REFERENCES organizations(id),
    risk_score           INTEGER NOT NULL,
    risk_level           VARCHAR(20) NOT NULL,
    maturity_score       DOUBLE PRECISION,
    completion_rate      DOUBLE PRECISION,
    findings_count       INTEGER NOT NULL DEFAULT 0,
    critical_count       INTEGER NOT NULL DEFAULT 0,
    high_count           INTEGER NOT NULL DEFAULT 0,
    rationale            TEXT,
    contributing_factors JSONB,
    engine_version       VARCHAR(20) NOT NULL,
    is_current           BOOLEAN NOT NULL DEFAULT TRUE,
    calculated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    calculated_by        UUID REFERENCES users(id),
    CONSTRAINT chk_ara_score CHECK (risk_score BETWEEN 0 AND 100),
    CONSTRAINT chk_ara_level CHECK (risk_level IN ('INFORMATION','LOW','MEDIUM','HIGH','CRITICAL'))
);

CREATE INDEX idx_ara_audit ON audit_risk_assessments(audit_id, is_current);
CREATE INDEX idx_ara_org   ON audit_risk_assessments(organization_id);
