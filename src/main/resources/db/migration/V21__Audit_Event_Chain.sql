-- Journal d'audit chaîné.
--
-- Chaque événement porte l'empreinte de l'événement précédent de la même
-- organisation et sa propre empreinte, calculée sur son contenu et sur celle
-- du précédent. Supprimer ou modifier une ligne rompt la chaîne pour toutes
-- les suivantes : l'altération se voit, elle ne peut plus être silencieuse.
--
-- Les événements antérieurs à cette migration n'ont pas d'empreinte : la
-- chaîne commence au premier événement enregistré après elle.
ALTER TABLE audit_events ADD COLUMN prev_hash  VARCHAR(64);
ALTER TABLE audit_events ADD COLUMN entry_hash VARCHAR(64);

CREATE INDEX idx_audit_events_org_chain ON audit_events(organization_id, timestamp DESC, id DESC);
