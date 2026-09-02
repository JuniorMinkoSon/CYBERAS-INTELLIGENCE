package com.cyberas.domain.repository;

import com.cyberas.domain.entity.Invitation;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class InvitationRepository implements PanacheRepositoryBase<Invitation, UUID> {

    public Optional<Invitation> findByCode(String code) {
        return find("code = ?1", code).firstResultOptional();
    }
}
