package com.deutschpfad.backend.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    long countByGuestTrue();

    @Modifying
    @Query("DELETE FROM User u WHERE u.guest = true AND u.createdAt < :cutoff")
    int deleteGuestsCreatedBefore(@Param("cutoff") LocalDateTime cutoff);
}
