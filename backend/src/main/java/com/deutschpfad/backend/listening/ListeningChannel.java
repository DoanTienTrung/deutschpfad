package com.deutschpfad.backend.listening;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/** Kênh YouTube của các bài nghe (vd "DW Deutsch lernen"), để người học lọc video theo kênh yêu thích. */
@Entity
@Table(name = "listening_channels")
@Getter
@Setter
public class ListeningChannel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "youtube_channel_id", unique = true)
    private String youtubeChannelId;

    @Column(nullable = false)
    private String name;

    private String handle;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
