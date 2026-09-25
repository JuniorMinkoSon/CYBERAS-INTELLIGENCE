-- Projection des réponses au questionnaire, par famille de domaines.
--
-- Une ligne par (organisation, audit, famille), alimentée par les réponses
-- publiées sur Kafka (cyberas-answer-events). Elle tient le compte des réponses
-- reçues, des écarts constatés et du degré de maturité moyen, à la maille où la
-- restitution se lit — les quatre familles de DomainFamily, et non les quatorze
-- domaines.
--
-- Pourquoi une projection plutôt qu'un calcul à la demande. La synthèse du
-- questionnaire relit toutes les réponses d'un audit à chaque affichage et
-- recompose le total ; c'est tenable pour un audit ouvert, pas pour un tableau
-- de bord d'organisation qui en agrège plusieurs, ni pour une comparaison dans
-- le temps. La projection porte l'état courant, mis à jour réponse par réponse.
--
-- Elle ne remplace pas les réponses : question_answers reste la source de
-- vérité, et cette table peut être reconstruite intégralement en rejouant le
-- topic depuis son origine.
CREATE TABLE answer_projection_entries (
    id                  UUID PRIMARY KEY,
    organization_id     UUID NOT NULL REFERENCES organizations(id),
    audit_id            UUID NOT NULL REFERENCES audits(id),
    domain_family       VARCHAR(30) NOT NULL,

    -- Réponses prises en compte dans la moyenne : celles qui portent un degré.
    answered_count      INTEGER NOT NULL DEFAULT 0,

    -- Réponses déclarées sans objet. Comptées à part et jamais fondues dans la
    -- moyenne : une mesure hors périmètre ne creuse pas d'écart, et l'ajouter
    -- comme un zéro ferait baisser le score pour des questions qui ne
    -- concernent pas l'organisation.
    not_applicable_count INTEGER NOT NULL DEFAULT 0,

    -- Réponses sous le seuil de faiblesse, celles qui appellent une action.
    gap_count           INTEGER NOT NULL DEFAULT 0,

    -- Somme des degrés, conservée pour que la moyenne se recalcule sans relire
    -- les réponses. Stockée plutôt que la moyenne elle-même : une moyenne ne
    -- se met pas à jour de façon incrémentale sans son dénominateur.
    maturity_sum        INTEGER NOT NULL DEFAULT 0,

    created_at          TIMESTAMP NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_answer_projection_unique
    ON answer_projection_entries (organization_id, audit_id, domain_family);

CREATE INDEX idx_answer_projection_org
    ON answer_projection_entries (organization_id, updated_at DESC);

CREATE INDEX idx_answer_projection_audit
    ON answer_projection_entries (audit_id);
