-- V10 : demandes entrantes du site public (contact et démonstration)
--
-- Les deux formulaires affichaient « Demande envoyée » sans rien envoyer : le
-- message n'était écrit nulle part et personne ne pouvait y répondre. Cette
-- table est leur destination.
--
-- Elle n'a volontairement pas de colonne organization_id : au moment où
-- quelqu'un remplit le formulaire, il n'a pas encore de compte. C'est ce qui la
-- distingue du reste du schéma, où tout est cloisonné par organisation, et
-- pourquoi sa lecture est réservée à l'administration de la plateforme.

CREATE TABLE contact_requests (
    id            UUID PRIMARY KEY,

    -- DEMO ou CONTACT : les deux formulaires alimentent une seule boîte de
    -- réception, la distinction restant visible pour le tri.
    kind          VARCHAR(20)  NOT NULL DEFAULT 'CONTACT',

    full_name     VARCHAR(200) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    company       VARCHAR(200),
    phone         VARCHAR(50),

    -- Secteur au sens de BusinessSector. Colonne libre et sans contrainte : les
    -- valeurs viennent d'un formulaire public, et une valeur inattendue ne doit
    -- pas faire échouer l'enregistrement d'une demande commerciale.
    sector        VARCHAR(50),
    company_size  VARCHAR(50),

    message       TEXT,

    status        VARCHAR(20)  NOT NULL DEFAULT 'NEW',
    handled_note  TEXT,
    source_page   VARCHAR(255),

    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_contact_kind   CHECK (kind IN ('DEMO', 'CONTACT')),
    CONSTRAINT chk_contact_status CHECK (status IN ('NEW', 'IN_PROGRESS', 'CLOSED'))
);

-- Chemin d'accès de la boîte de réception : les demandes non traitées d'abord,
-- les plus récentes en tête.
CREATE INDEX idx_contact_requests_inbox ON contact_requests (status, created_at DESC);

-- Retrouver toutes les demandes d'un même interlocuteur.
CREATE INDEX idx_contact_requests_email ON contact_requests (LOWER(email));
