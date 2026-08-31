-- V1__Initial_Schema.sql
-- Initial database schema for CYBERAS Audit Service

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ORGANIZATIONS TABLE
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID,
    version INTEGER DEFAULT 1,
    deleted_at TIMESTAMP,
    CONSTRAINT organizations_name_unique_active CHECK (active OR deleted_at IS NOT NULL)
);

-- ROLES TABLE
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID,
    version INTEGER DEFAULT 1,
    UNIQUE(organization_id, name, active)
);

-- PERMISSIONS TABLE
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    is_system BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID,
    version INTEGER DEFAULT 1,
    UNIQUE(organization_id, code, active)
);

-- ROLE_PERMISSIONS JOIN TABLE
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    UNIQUE(role_id, permission_id)
);

-- USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID,
    version INTEGER DEFAULT 1,
    locked_until TIMESTAMP,
    UNIQUE(email, organization_id),
    UNIQUE(username, organization_id)
);

-- USER_ROLES JOIN TABLE
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID,
    expires_at TIMESTAMP,
    UNIQUE(user_id, role_id)
);

-- AUDITS (MISSIONS) TABLE
CREATE TABLE audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    audit_code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    client_organization_id UUID REFERENCES organizations(id),
    audit_scope_id UUID,
    status VARCHAR(50) DEFAULT 'DRAFT',
    current_version_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id),
    version INTEGER DEFAULT 1,
    scheduled_start_date DATE,
    scheduled_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    UNIQUE(organization_id, audit_code)
);

-- AUDIT_VERSIONS TABLE (IMMUTABLE versions)
CREATE TABLE audit_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'DRAFT',
    hash VARCHAR(64),
    parent_version_id UUID REFERENCES audit_versions(id),
    change_summary TEXT,
    published_at TIMESTAMP,
    published_by UUID REFERENCES users(id),
    locked_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    data_snapshot JSONB,
    UNIQUE(audit_id, version_number),
    CHECK (status IN ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'PUBLISHED', 'ARCHIVED'))
);

-- ACCESS_GRANTS TABLE
CREATE TABLE access_grants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    audit_version_id UUID REFERENCES audit_versions(id),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    permissions JSONB NOT NULL DEFAULT '{}',
    scan_profile VARCHAR(50) DEFAULT 'STANDARD',
    scope JSONB,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    revoked_at TIMESTAMP,
    revoked_by UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    version INTEGER DEFAULT 1,
    CHECK (status IN ('PENDING', 'ACTIVE', 'EXPIRED', 'REVOKED'))
);

-- AUDIT_EVENTS TABLE (Audit trail)
CREATE TABLE audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    audit_id UUID REFERENCES audits(id) ON DELETE SET NULL,
    audit_version_id UUID REFERENCES audit_versions(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    actor_id UUID REFERENCES users(id),
    resource_type VARCHAR(50),
    resource_id UUID,
    action VARCHAR(50),
    status VARCHAR(50),
    details JSONB,
    correlation_id VARCHAR(100),
    source VARCHAR(100),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent VARCHAR(500)
);

-- INDEXES for performance
CREATE INDEX idx_organizations_active ON organizations(active, deleted_at);
CREATE INDEX idx_users_organization_id ON users(organization_id, active);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_roles_organization_id ON roles(organization_id, active);
CREATE INDEX idx_permissions_organization_id ON permissions(organization_id, active);
CREATE INDEX idx_audits_organization_id ON audits(organization_id);
CREATE INDEX idx_audits_code ON audits(audit_code);
CREATE INDEX idx_audit_versions_audit_id ON audit_versions(audit_id);
CREATE INDEX idx_access_grants_audit_id ON access_grants(audit_id);
CREATE INDEX idx_access_grants_user_id ON access_grants(user_id);
CREATE INDEX idx_access_grants_status ON access_grants(status);
CREATE INDEX idx_audit_events_organization_id ON audit_events(organization_id);
CREATE INDEX idx_audit_events_audit_id ON audit_events(audit_id);
CREATE INDEX idx_audit_events_timestamp ON audit_events(timestamp);
CREATE INDEX idx_audit_events_actor_id ON audit_events(actor_id);

-- Insert default system roles
INSERT INTO organizations (id, name, description, active)
VALUES (uuid_generate_v4(), 'SYSTEM', 'System Organization for Global Roles', true)
ON CONFLICT DO NOTHING;

-- Insert default permissions template
-- These will be duplicated per organization
