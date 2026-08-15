-- ============================================
-- PHASE 1: PostgreSQL Complete Schema
-- Flyway Migration: V1_0__Initial_Schema.sql
-- ============================================

-- ---- Users Table ----
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- "admin", "rssi", "auditeur", "ceo"
    status VARCHAR(50) NOT NULL DEFAULT 'email_pending', -- "email_pending", "active", "suspended"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT chk_role CHECK (role IN ('admin', 'rssi', 'auditeur', 'ceo')),
    CONSTRAINT chk_status CHECK (status IN ('email_pending', 'active', 'suspended'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- ---- Verification Codes Table ----
CREATE TABLE verification_codes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP
);

CREATE INDEX idx_verification_codes_user_id ON verification_codes(user_id);
CREATE INDEX idx_verification_codes_expires_at ON verification_codes(expires_at);

-- ---- Organizations Table ----
CREATE TABLE organizations (
    id BIGSERIAL PRIMARY KEY,
    rssi_id BIGINT NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(100), -- "Banque", "Finance", "Assurance", "Santé", "Tech"...
    country VARCHAR(100),
    size VARCHAR(50), -- "<50", "50-200", "200-1000", "1000+"
    plan VARCHAR(50) DEFAULT 'starter', -- "starter", "pro", "enterprise"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT chk_size CHECK (size IN ('<50', '50-200', '200-1000', '1000+'))
);

CREATE INDEX idx_organizations_rssi_id ON organizations(rssi_id);
CREATE INDEX idx_organizations_sector ON organizations(sector);

-- ---- Auditors Table ----
CREATE TABLE auditors (
    id BIGSERIAL PRIMARY KEY,
    rssi_id BIGINT NOT NULL REFERENCES users(id),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'en_attente', -- "en_attente", "actif", "suspendu"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_access TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT uk_auditor_email UNIQUE (rssi_id, email)
);

CREATE INDEX idx_auditors_rssi_id ON auditors(rssi_id);
CREATE INDEX idx_auditors_status ON auditors(status);

-- ---- Missions Table (CORE) ----
CREATE TABLE missions (
    id BIGSERIAL PRIMARY KEY,
    org_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- "audit", "pentest", "compliance"
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- "draft", "active", "completed", "archived"
    priority VARCHAR(50), -- "low", "medium", "high", "critical"
    start_date DATE,
    end_date DATE,
    progress INT DEFAULT 0,
    version INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT chk_progress CHECK (progress >= 0 AND progress <= 100),
    CONSTRAINT chk_priority CHECK (priority IN ('low', 'medium', 'high', 'critical'))
);

CREATE INDEX idx_missions_org_id ON missions(org_id);
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_priority ON missions(priority);

-- ---- Mission Assignments ----
CREATE TABLE mission_assignments (
    id BIGSERIAL PRIMARY KEY,
    mission_id BIGINT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    auditor_id BIGINT NOT NULL REFERENCES auditors(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- "lead", "reviewer", "participant"
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_mission_auditor UNIQUE (mission_id, auditor_id)
);

CREATE INDEX idx_mission_assignments_mission_id ON mission_assignments(mission_id);
CREATE INDEX idx_mission_assignments_auditor_id ON mission_assignments(auditor_id);

-- ---- Perimeters ----
CREATE TABLE perimeters (
    id BIGSERIAL PRIMARY KEY,
    mission_id BIGINT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    asset_count INT DEFAULT 0,
    domain_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_perimeters_mission_id ON perimeters(mission_id);

-- ---- Questionnaires ----
CREATE TABLE questionnaires (
    id BIGSERIAL PRIMARY KEY,
    mission_id BIGINT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    referential VARCHAR(100), -- "ISO 27001", "NIST CSF", "PCI-DSS"...
    question_count INT DEFAULT 0,
    answered_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_questionnaires_mission_id ON questionnaires(mission_id);
CREATE INDEX idx_questionnaires_referential ON questionnaires(referential);

-- ---- Responses ----
CREATE TABLE responses (
    id BIGSERIAL PRIMARY KEY,
    questionnaire_id BIGINT NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
    question_id INT NOT NULL,
    auditor_id BIGINT NOT NULL REFERENCES auditors(id),
    answer TEXT,
    evidence_url VARCHAR(500),
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_responses_questionnaire_id ON responses(questionnaire_id);
CREATE INDEX idx_responses_auditor_id ON responses(auditor_id);

-- ---- Findings Table ----
CREATE TABLE findings (
    id BIGSERIAL PRIMARY KEY,
    mission_id BIGINT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL, -- "low", "medium", "high", "critical"
    status VARCHAR(50) NOT NULL DEFAULT 'open', -- "open", "in_progress", "resolved"
    recommendation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    CONSTRAINT chk_severity CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

CREATE INDEX idx_findings_mission_id ON findings(mission_id);
CREATE INDEX idx_findings_severity ON findings(severity);
CREATE INDEX idx_findings_status ON findings(status);

-- ---- Compliance Scores ----
CREATE TABLE compliance_scores (
    id BIGSERIAL PRIMARY KEY,
    mission_id BIGINT NOT NULL UNIQUE REFERENCES missions(id) ON DELETE CASCADE,
    compliance_score DECIMAL(5,2),
    vulnerabilities_count INT DEFAULT 0,
    critical_count INT DEFAULT 0,
    high_count INT DEFAULT 0,
    medium_count INT DEFAULT 0,
    low_count INT DEFAULT 0,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_compliance_scores_mission_id ON compliance_scores(mission_id);

-- ---- Reports Table ----
CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    mission_id BIGINT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- "draft", "validated", "published"
    file_path VARCHAR(500),
    generated_at TIMESTAMP,
    validated_by_id BIGINT REFERENCES users(id),
    validated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_mission_id ON reports(mission_id);
CREATE INDEX idx_reports_status ON reports(status);

-- ---- Audit Trail (Security) ----
CREATE TABLE audit_trail (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- "login", "logout", "create_mission", "login_failed"...
    resource_type VARCHAR(100),
    resource_id BIGINT,
    status VARCHAR(50), -- "success", "failure"
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_trail_user_id ON audit_trail(user_id);
CREATE INDEX idx_audit_trail_timestamp ON audit_trail(timestamp);
CREATE INDEX idx_audit_trail_action ON audit_trail(action);

-- ---- Token Blacklist (for logout) ----
CREATE TABLE token_blacklist (
    id BIGSERIAL PRIMARY KEY,
    token_jti VARCHAR(255) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_token_blacklist_user_id ON token_blacklist(user_id);
CREATE INDEX idx_token_blacklist_expires_at ON token_blacklist(expires_at);

-- ---- Grant Basic Permissions ----
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;
