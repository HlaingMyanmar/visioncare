package org.sspd.visioncare.rbacoptions.permissionoptions.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.sspd.visioncare.rbacoptions.permissionoptions.model.Permission;

import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission,Long> {

    Optional<Permission> findByName(String name);

    boolean existsByName(String name);




}

