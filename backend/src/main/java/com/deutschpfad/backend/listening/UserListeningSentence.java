package com.deutschpfad.backend.listening;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "user_listening_sentences")
@Getter
@Setter
public class UserListeningSentence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    private UserListeningItem item;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(name = "start_seconds", nullable = false)
    private Integer startSeconds;

    @Column(name = "end_seconds", nullable = false)
    private Integer endSeconds;

    @Column(columnDefinition = "TEXT")
    private String translation;

    @Column(columnDefinition = "TEXT")
    private String phonetic;
}
