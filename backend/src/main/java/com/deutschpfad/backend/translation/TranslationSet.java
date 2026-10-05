package com.deutschpfad.backend.translation;

import com.deutschpfad.backend.grammar.GrammarTopic;
import com.deutschpfad.backend.vocabulary.VocabularyItem;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/** Một bài luyện dịch Việt → Đức: theo chủ điểm ngữ pháp, nhóm collocation, một đoạn văn hoặc một essay. */
@Entity
@Table(name = "translation_sets")
@Getter
@Setter
public class TranslationSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VocabularyItem.Level level;

    @Column(nullable = false)
    private String title;

    @ManyToOne
    @JoinColumn(name = "grammar_topic_id")
    private GrammarTopic grammarTopic;

    private String theme;

    /** Công thức / lưu ý hiện ở đầu bài, vd Perfekt: "haben/sein + Partizip II cuối câu". */
    @Column(name = "structure_note", columnDefinition = "TEXT")
    private String structureNote;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.DRAFT;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum Type { GRAMMAR, COLLOCATION, PARAGRAPH, ESSAY }

    public enum Status { DRAFT, PUBLISHED }
}
