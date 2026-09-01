package com.cyberas.domain.repository;

import com.cyberas.domain.entity.AuditRiskAssessment;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.UUID;

@ApplicationScoped
public class AuditRiskAssessmentRepository implements PanacheRepositoryBase<AuditRiskAssessment, UUID> {
}
