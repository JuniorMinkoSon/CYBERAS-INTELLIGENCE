package com.cyberas.domain.repository;

import com.cyberas.domain.entity.Evidence;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.UUID;

@ApplicationScoped
public class EvidenceRepository implements PanacheRepositoryBase<Evidence, UUID> {
}
