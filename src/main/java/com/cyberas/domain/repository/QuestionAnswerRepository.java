package com.cyberas.domain.repository;

import com.cyberas.domain.entity.QuestionAnswer;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.UUID;

@ApplicationScoped
public class QuestionAnswerRepository implements PanacheRepositoryBase<QuestionAnswer, UUID> {
}
