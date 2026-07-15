package com.deutschpfad.backend.speaking;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "conversation_turns")
@Getter
@Setter
public class ConversationTurn {

    public enum Role {
        USER, AGENT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "recording_id", nullable = false)
    private UserRecording recording;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(name = "audio_data", columnDefinition = "bytea")
    private byte[] audioData;

    @Column(name = "turn_index", nullable = false)
    private Integer turnIndex;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
