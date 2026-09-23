package com.deutschpfad.backend.grammar;

import com.deutschpfad.backend.vocabulary.VocabularyItem;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Một bảng tra cứu nhanh ("cheat sheet") — chia động từ theo thì, biến cách mạo từ, giới từ đi với
 * cách nào... Nội dung là <b>dữ kiện ngôn ngữ thuần</b> nên tự tổng hợp được, không dính bản quyền
 * nguồn nào (xem quyết định nguồn ở docs/phase-5-grammar.md).
 *
 * <p>Khác {@link GrammarTopic} ở mục đích dùng: chủ điểm là để học tuần tự, bảng này là để tra
 * giữa chừng lúc đang làm bài — không có bài tập, không có tiến độ.
 */
@Entity
@Table(name = "grammar_reference_tables")
@Getter
@Setter
public class GrammarReferenceTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(name = "title_vi", nullable = false)
    private String titleVi;

    /** Nhóm lọc ở trang tra cứu, vd. "Mạo từ", "Động từ", "Giới từ". */
    @Column(nullable = false)
    private String category;

    /** Null = dùng chung cho mọi trình độ (vd. bảng đại từ nhân xưng). */
    @Enumerated(EnumType.STRING)
    private VocabularyItem.Level level;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(name = "content_md", nullable = false, columnDefinition = "TEXT")
    private String contentMd;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
}
