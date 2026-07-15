package com.deutschpfad.backend.listening;

import com.deutschpfad.backend.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserListeningItemRepository extends JpaRepository<UserListeningItem, Long> {
    List<UserListeningItem> findByUserOrderByCreatedAtDesc(User user);
}
