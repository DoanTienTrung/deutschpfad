package com.deutschpfad.backend.grammar;

import com.deutschpfad.backend.vocabulary.VocabularyItem;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "grammar_topics")
@Getter
@Setter
public class GrammarTopic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Dùng trong URL (/app/grammar/:slug) thay cho id để link đọc được và ổn định khi seed lại.
    @Column(nullable = false, unique = true)
    private String slug;

    @Column(name = "title_de", nullable = false)
    private String titleDe;

    @Column(name = "title_vi", nullable = false)
    private String titleVi;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VocabularyItem.Level level;

    @Column(name = "group_label")
    private String groupLabel;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(name = "summary_vi", columnDefinition = "TEXT")
    private String summaryVi;

    // Lý thuyết viết bằng tiếng Việt, định dạng markdown (GFM) -- render thẳng ở frontend bằng
    // react-markdown, nên không cần rich text editor ở trang admin.
    @Column(name = "theory_md", columnDefinition = "TEXT")
    private String theoryMd;

    /** Slug của bảng tra cứu liên quan, để nút "Mở bảng tra cứu" nhảy thẳng tới đúng bảng. */
    @Column(name = "reference_slug")
    private String referenceSlug;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
}
