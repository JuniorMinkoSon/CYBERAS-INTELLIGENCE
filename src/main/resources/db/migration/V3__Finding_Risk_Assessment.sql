-- V3 : évaluations de risque des constats
--
-- Le score Cyberas est contextualisé (actif, exposition, maturité, preuves) et se
-- distingue du CVSS porté par le constat lui-même. Les deux cohabitent : l'un
-- décrit la vulnérabilité, l'autre ce qu'elle représente pour l'organisation.
--
-- Historisation par insertion : un recalcul ajoute une ligne et bascule les
-- précédentes hors de l'état courant. Rien n'est écrasé, ce qui permet de
-- reconstituer une décision passée avec la version du moteur qui l'a produite.

CREATE TABLE finding_risk_assessments (
    id                   UUID PRIMARY KEY,
    finding_id           UUID NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
    audit_id             UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    organization_id      UUID NOT NULL REFERENCES organizations(id),

    risk_score           INTEGER NOT NULL,
    risk_level           VARCHAR(20) NOT NULL,
    likelihood           DOUBLE PRECISION NOT NULL,
    impact               DOUBLE PRECISION NOT NULL,
    confidence           DOUBLE PRECISION NOT NULL,

    rationale            TEXT,
    contributing_factors JSONB,

    -- Sans les entrées, le score n'est pas reproductible et donc pas auditable.
    input_snapshot       JSONB,

    engine_version       VARCHAR(20) NOT NULL,
    needs_review         BOOLEAN NOT NULL DEFAULT FALSE,
    is_current           BOOLEAN NOT NULL DEFAULT TRUE,

    calculated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    calculated_by        UUID REFERENCES users(id),

    CONSTRAINT chk_fra_score  CHECK (risk_score BETWEEN 0 AND 100),
    CONSTRAINT chk_fra_level  CHECK (risk_level IN ('INFORMATION','LOW','MEDIUM','HIGH','CRITICAL')),
    CONSTRAINT chk_fra_bounds CHECK (
        likelihood BETWEEN 0 AND 1
        AND impact BETWEEN 0 AND 1
        AND confidence BETWEEN 0 AND 1
    )
);

CREATE INDEX idx_fra_finding ON finding_risk_assessments(finding_id);
CREATE INDEX idx_fra_audit   ON finding_risk_assessments(audit_id);
CREATE INDEX idx_fra_org     ON finding_risk_assessments(organization_id);
CREATE INDEX idx_fra_level   ON finding_risk_assessments(risk_level);

-- Un constat n'a qu'une évaluation courante à la fois.
CREATE UNIQUE INDEX uk_fra_current
    ON finding_risk_assessments(finding_id)
    WHERE is_current = TRUE;

-- Chemin d'accès du tableau de bord : risques élevés courants d'un audit.
CREATE INDEX idx_fra_elevated
    ON finding_risk_assessments(audit_id, risk_score DESC)
    WHERE is_current = TRUE AND risk_level IN ('HIGH','CRITICAL');

-- File de revue : niveaux élevés que les preuves ne soutiennent pas fermement.
CREATE INDEX idx_fra_review
    ON finding_risk_assessments(organization_id)
    WHERE is_current = TRUE AND needs_review = TRUE;
