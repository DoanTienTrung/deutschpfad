package com.deutschpfad.backend.auth;

import com.deutschpfad.backend.common.Uuidv7;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Id ổn định để lộ ra bên ngoài (API, sau này nếu merge/đồng bộ nhiều DB) thay cho id
    // tăng dần nội bộ -- tránh lộ số lượng user và tránh đụng id nếu có nhiều DB độc lập.
    @Column(name = "public_id", nullable = false, unique = true, updatable = false)
    private UUID publicId = Uuidv7.randomUUID();

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    private String goal;

    @Column(name = "target_certificate")
    private String targetCertificate;

    @Column(name = "current_level")
    private String currentLevel;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Role {
        USER, ADMIN
    }
}
