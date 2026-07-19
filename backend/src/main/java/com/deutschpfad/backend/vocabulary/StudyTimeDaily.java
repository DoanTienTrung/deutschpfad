package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.auth.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "study_time_daily")
@Getter
@Setter
public class StudyTimeDaily {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "study_date", nullable = false)
    private LocalDate studyDate;

    @Column(nullable = false)
    private Integer seconds = 0;
}
