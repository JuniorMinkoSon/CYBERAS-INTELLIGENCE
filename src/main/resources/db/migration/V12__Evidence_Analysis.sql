-- V12 : analyse des pièces justificatives
--
-- Une pièce jointe à une réponse de questionnaire n'était jusqu'ici qu'un
-- fichier stocké : personne ne savait ce qu'elle démontrait réellement. Un
-- auditeur pouvait déclarer une maturité de 4 et joindre une note de service
-- d'une page — la réponse valait autant que si elle avait été étayée par une
-- politique signée et revue.
--
-- Ces colonnes portent le résultat de l'analyse : ce que la pièce établit, avec
-- quelle confiance, et pourquoi.
--
-- Elles vivent sur le document et non sur le lien de preuve : une même pièce
-- peut être rattachée à plusieurs questions, et son contenu ne change pas d'une
-- question à l'autre. Ce qui varie — l'écart entre ce qui est déclaré et ce qui
-- est démontré — se calcule au moment de la lecture.

ALTER TABLE documents
    -- Niveau de maturité que la pièce démontre, sur la même échelle 0-4 que les
    -- réponses. NULL tant que l'analyse n'a pas eu lieu : c'est différent de
    -- zéro, qui signifierait « la pièce ne démontre rien ».
    ADD COLUMN IF NOT EXISTS evidence_level INTEGER,

    -- Confiance de l'analyse elle-même, entre 0 et 1. Une pièce illisible ou
    -- d'un format non exploitable donne une confiance basse, ce qui limite
    -- l'effet de son niveau sur la pondération.
    ADD COLUMN IF NOT EXISTS analysis_confidence DOUBLE PRECISION,

    -- Justification lisible, destinée à l'auditeur comme à l'audité. Une note
    -- sans motif n'est pas opposable.
    ADD COLUMN IF NOT EXISTS analysis_rationale TEXT,

    -- Identité de l'analyseur et sa version. Deux notes produites par deux
    -- versions différentes ne sont pas comparables ; sans cette trace, un
    -- rapport ancien deviendrait inexplicable.
    ADD COLUMN IF NOT EXISTS analyzer VARCHAR(100),

    ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMP;

-- Les valeurs hors échelle n'ont pas de sens et fausseraient tout ratio.
ALTER TABLE documents
    ADD CONSTRAINT chk_documents_evidence_level
        CHECK (evidence_level IS NULL OR (evidence_level >= 0 AND evidence_level <= 4));

ALTER TABLE documents
    ADD CONSTRAINT chk_documents_analysis_confidence
        CHECK (analysis_confidence IS NULL
               OR (analysis_confidence >= 0 AND analysis_confidence <= 1));

-- Chemin d'accès de la file d'analyse : les pièces pas encore traitées.
CREATE INDEX IF NOT EXISTS idx_documents_pending_analysis
    ON documents (audit_id) WHERE evidence_level IS NULL;
