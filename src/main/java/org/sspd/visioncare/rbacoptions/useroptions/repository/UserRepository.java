package org.sspd.visioncare.rbacoptions.useroptions.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.sspd.visioncare.rbacoptions.useroptions.model.User;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {

    boolean existsByEmail(String email);

    Optional<User> findByUsernameOrEmail(String username, String email);


}

