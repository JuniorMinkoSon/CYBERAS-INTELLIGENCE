-- Projets d'évaluation.
--
-- L'administration de la plateforme inscrit plusieurs sociétés dans un même
-- projet (un appel d'offres, une campagne sectorielle, un programme de mise à
-- niveau), leur ouvre un accès par lien, puis compare leurs résultats une fois
-- questionnaires et scans terminés.
--
-- Chaque participante reçoit sa propre organisation — le cloisonnement des
-- données reste celui de toute la plateforme — et un audit dédié au projet,
-- sur lequel portent ses réponses, ses scans et son score.

-- Organisation qui administre la plateforme.
--
-- Jusqu'ici « administrateur de la plateforme » signifiait « rôle ADMIN », or
-- la première personne inscrite de chaque société reçoit ce rôle : tout client
-- voyait la vue transverse. Le drapeau désigne la seule organisation dont les
-- administrateurs regardent l'ensemble des clients.
ALTER TABLE organizations ADD COLUMN is_platform BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE organizations SET is_platform = TRUE WHERE name = 'Cyberas Demo';

CREATE TABLE evaluation_projects (
    id           UUID PRIMARY KEY,
    name         VARCHAR(200) NOT NULL,
    description  TEXT,
    -- OPEN : les sociétés répondent ; CLOSED : classement figé.
    status       VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    deadline     DATE,
    created_by   UUID REFERENCES users(id),
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at    TIMESTAMP,
    CONSTRAINT chk_evaluation_project_status CHECK (status IN ('OPEN', 'CLOSED'))
);

CREATE TABLE evaluation_participants (
    id               UUID PRIMARY KEY,
    project_id       UUID NOT NULL REFERENCES evaluation_projects(id) ON DELETE CASCADE,
    organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    -- L'audit sur lequel portent réponses, scans et score pour ce projet.
    audit_id         UUID REFERENCES audits(id) ON DELETE SET NULL,
    -- Dernier lien d'accès émis ; les précédents sont révoqués.
    invitation_id    UUID REFERENCES invitations(id) ON DELETE SET NULL,
    contact_name     VARCHAR(200),
    contact_email    VARCHAR(255),
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_evaluation_participant UNIQUE (project_id, organization_id)
);

CREATE INDEX idx_evaluation_participants_project ON evaluation_participants(project_id);
CREATE INDEX idx_evaluation_participants_org ON evaluation_participants(organization_id);
