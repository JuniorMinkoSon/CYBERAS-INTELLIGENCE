-- V14 : modèle de référentiel — Framework, FrameworkVersion, Control, mapping
--
-- Jusqu'ici, les référentiels n'existaient que dans une constante Java
-- (FrameworkCatalog.DOMAIN_MAPPINGS) dont la clé était le DOMAINE interne, pas
-- le contrôle. On pouvait donc dire « le domaine ACCESS obtient 2,3/4 », jamais
-- « le contrôle A.5.15 est conforme ». Un score par référentiel était par
-- construction impossible, et la version du référentiel n'était écrite nulle
-- part — deux rapports produits à un an d'écart n'étaient pas comparables.
--
-- Ces quatre tables portent le modèle réel. Elles n'altèrent aucune table
-- existante : les questions, les réponses et les preuves gardent leur schéma et
-- leurs données. Le rattachement se fait par une table de correspondance, ce
-- qui permet à une question de contribuer à plusieurs contrôles — et à un
-- contrôle d'être étayé par plusieurs questions.

-- ---------------------------------------------------------------------------
-- Référentiel
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS frameworks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(50)  NOT NULL,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    provider        VARCHAR(200),
    reference_url   VARCHAR(500),
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_framework_code UNIQUE (code)
);

COMMENT ON TABLE frameworks IS
    'Référentiel d''audit. Ne contient aucun texte normatif protégé : seulement '
    'un identifiant, un nom d''usage et les métadonnées nécessaires au rattachement.';

-- ---------------------------------------------------------------------------
-- Version du référentiel
--
-- Séparée du référentiel parce qu'une norme est révisée : ISO/IEC 27001 a
-- changé de structure entre 2013 et 2022, et les contrôles ne se correspondent
-- pas un à un. Rattacher les contrôles à une version, et non au référentiel,
-- est ce qui permet à un audit ancien de rester lisible après une révision.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS framework_versions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id    UUID         NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
    version         VARCHAR(50)  NOT NULL,
    status          VARCHAR(30)  NOT NULL DEFAULT 'DRAFT',
    effective_from  DATE,
    metadata        JSONB        NOT NULL DEFAULT '{}'::jsonb,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_framework_version UNIQUE (framework_id, version),
    CONSTRAINT chk_framework_version_status
        CHECK (status IN ('DRAFT', 'ACTIVE', 'DEPRECATED'))
);

CREATE INDEX IF NOT EXISTS idx_framework_versions_framework
    ON framework_versions (framework_id, status);

-- ---------------------------------------------------------------------------
-- Contrôle
--
-- `code` est l'identifiant du contrôle dans le référentiel (« A.5.15 »). Il est
-- factuel et se cite librement. `title` et `description` sont des formulations
-- Cyberas : reproduire le texte officiel d'ISO/IEC 27001 exposerait à une
-- violation de droit d'auteur, et n'apporterait rien à l'audité.
--
-- `domain` conserve le domaine interne Cyberas quand il est connu. Il devient
-- une métadonnée du contrôle, plus le niveau principal de navigation.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS controls (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_version_id    UUID         NOT NULL REFERENCES framework_versions(id) ON DELETE CASCADE,
    code                    VARCHAR(30)  NOT NULL,
    title                   VARCHAR(300) NOT NULL,
    description             TEXT,
    category                VARCHAR(100),
    domain                  VARCHAR(50),
    weight                  INTEGER      NOT NULL DEFAULT 1,
    position                INTEGER      NOT NULL,
    active                  BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_control_code UNIQUE (framework_version_id, code),
    CONSTRAINT chk_control_weight CHECK (weight BETWEEN 1 AND 5)
);

CREATE INDEX IF NOT EXISTS idx_controls_version
    ON controls (framework_version_id, active);
CREATE INDEX IF NOT EXISTS idx_controls_category
    ON controls (framework_version_id, category);

-- ---------------------------------------------------------------------------
-- Correspondance question → contrôle
--
-- Table dédiée plutôt qu'une colonne sur la question, pour trois raisons :
--
--   1. Une question Cyberas peut étayer plusieurs contrôles, et un contrôle
--      être étayé par plusieurs questions. Une clé étrangère simple aurait figé
--      un rapport un-à-un que le métier ne respecte pas.
--
--   2. La même question doit pouvoir se rattacher à ISO aujourd'hui et à NIST
--      demain, sans modification de schéma.
--
--   3. Un rattachement doit être justifiable. `mapping_rationale` porte le motif
--      et `status` distingue ce qui est établi de ce qui reste à vérifier — un
--      score fondé sur une correspondance inventée ne serait pas défendable
--      devant un auditeur.
--
-- L'absence de ligne signifie « non rattaché » : c'est un état légitime, pas une
-- anomalie. Une question sans correspondance fiable ne doit pas en recevoir une
-- au forceps.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS question_control_mapping (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id         UUID             NOT NULL REFERENCES questionnaire_questions(id) ON DELETE CASCADE,
    control_id          UUID             NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
    mapping_type        VARCHAR(20)      NOT NULL DEFAULT 'PRIMARY',
    status              VARCHAR(20)      NOT NULL DEFAULT 'CONFIRMED',
    confidence          DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    source              VARCHAR(50)      NOT NULL DEFAULT 'MANUAL',
    mapping_rationale   TEXT,
    created_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_question_control UNIQUE (question_id, control_id),
    CONSTRAINT chk_mapping_type
        CHECK (mapping_type IN ('PRIMARY', 'SECONDARY')),
    CONSTRAINT chk_mapping_status
        CHECK (status IN ('CONFIRMED', 'REVIEW_REQUIRED', 'REJECTED')),
    CONSTRAINT chk_mapping_confidence
        CHECK (confidence >= 0 AND confidence <= 1)
);

CREATE INDEX IF NOT EXISTS idx_mapping_question
    ON question_control_mapping (question_id);
CREATE INDEX IF NOT EXISTS idx_mapping_control
    ON question_control_mapping (control_id, status);
