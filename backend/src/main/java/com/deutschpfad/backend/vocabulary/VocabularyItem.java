package com.deutschpfad.backend.vocabulary;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "vocabulary_items")
@Getter
@Setter
public class VocabularyItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "german_word", nullable = false)
    private String germanWord;

    /**
     * Khoá định danh TỪ, dùng để lịch ôn SM-2 gắn với từ chứ không gắn với dòng — cùng một
     * "die Mutter" ở 3 lộ trình chỉ có một lịch ôn. Luôn được tính lại từ {@link #germanWord} trước
     * khi ghi, không set tay. Xem {@link WordKey}.
     */
    @Column(name = "word_key", nullable = false)
    @Setter(AccessLevel.NONE)
    private String wordKey;

    /**
     * Số nhiều của danh từ, không kèm mạo từ ("Bilder"). Null = không biết hoặc không có. Không set
     * tay — {@link NounPluralService} tính lại cho cả nhóm cùng {@link #wordKey} mỗi khi admin lưu.
     */
    @Column(name = "plural")
    private String plural;

    @Column(name = "vietnamese_meaning", nullable = false)
    private String vietnameseMeaning;

    @Column(name = "english_meaning")
    private String englishMeaning;

    @Column(name = "phonetic")
    private String phonetic;

    @Column(name = "word_type")
    private String wordType;

    @Column(name = "example_sentence")
    @Setter(AccessLevel.NONE)
    private String exampleSentence;

    /** Bản dịch tiếng Việt của {@link #exampleSentence}; null = chưa dịch. */
    @Column(name = "example_sentence_vi")
    private String exampleSentenceVi;

    @Column(name = "example_sentence_highlight")
    private String exampleSentenceHighlight;

    @Column(name = "image_url")
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Level level;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Source source = Source.FREQUENCY;

    @ManyToOne
    @JoinColumn(name = "topic_id")
    private Topic topic;

    @ManyToOne
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Đổi câu ví dụ thì bản dịch cũ không còn đúng → xoá, để job dịch lại. Đặt ở đây (không ở từng
     * controller) vì có nhiều đường sửa câu: admin, và job AI kiểm duyệt viết lại câu sai.
     */
    public void setExampleSentence(String exampleSentence) {
        if (!Objects.equals(this.exampleSentence, exampleSentence)) {
            this.exampleSentenceVi = null;
        }
        this.exampleSentence = exampleSentence;
    }

    // Mọi đường ghi qua JPA (admin thêm/sửa, AI kiểm duyệt…) đều đi qua đây, nên khoá không thể
    // lệch với germanWord. Riêng migration SQL sửa german_word thì phải tự cập nhật word_key.
    @PrePersist
    @PreUpdate
    void syncWordKey() {
        this.wordKey = WordKey.of(germanWord);
    }

    public enum Level {
        A1, A2, B1, B2, C1, C2
    }

    public enum Source {
        FREQUENCY, GOETHE, TEXTBOOK,
        /** Bộ từ "Sống ở Đức" theo tình huống (V72) — không theo cấp độ như các lộ trình kia. */
        LIFE
    }
}
