package com.cyberas.domain.repository;

import com.cyberas.domain.entity.FindingRiskAssessment;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.UUID;

@ApplicationScoped
public class FindingRiskAssessmentRepository implements PanacheRepositoryBase<FindingRiskAssessment, UUID> {
}
