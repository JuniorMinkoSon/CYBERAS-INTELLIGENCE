package com.cyberas.domain.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import com.cyberas.domain.entity.UserRole;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class UserRoleRepository implements PanacheRepository<UserRole> {

    public List<UserRole> findByUserId(UUID userId) {
        return find("user.id = ?1", userId).list();
    }

    public List<UserRole> findByRoleId(UUID roleId) {
        return find("role.id = ?1", roleId).list();
    }

    public void deleteByUserAndRole(UUID userId, UUID roleId) {
        delete("user.id = ?1 and role.id = ?2", userId, roleId);
    }
}
