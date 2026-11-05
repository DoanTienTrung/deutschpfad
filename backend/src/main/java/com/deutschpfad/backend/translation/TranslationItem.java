package com.deutschpfad.backend.translation;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/** Một câu (hoặc cụm, phần bài) cần dịch: câu tiếng Việt, câu tiếng Đức tham khảo và các cách dịch đúng khác. */
@Entity
@Table(name = "translation_items")
@Getter
@Setter
public class TranslationItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "set_id", nullable = false)
    private TranslationSet set;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(name = "part_label")
    private String partLabel;

    @Column(name = "vi_text", nullable = false, columnDefinition = "TEXT")
    private String viText;

    @Column(name = "de_reference", nullable = false, columnDefinition = "TEXT")
    private String deReference;

    /** Các cách dịch đúng khác, mỗi dòng một câu (vd trật tự từ khác: "Heute arbeite ich." / "Ich arbeite heute."). */
    @Column(name = "accepted_answers", columnDefinition = "TEXT")
    private String acceptedAnswers;

    @Column(name = "hint_keywords", columnDefinition = "TEXT")
    private String hintKeywords;

    /** Cụm cần luyện: collocation dạng từ điển ("eine Entscheidung treffen") hoặc mẫu câu của essay. */
    @Column(columnDefinition = "TEXT")
    private String focus;

    /** Từ bị khoét cho chế độ "Điền từ", phải xuất hiện trong câu tham khảo; nhiều đáp án ngăn bằng |. */
    private String gap;

    /** Các đáp án của chỗ trống (rỗng nếu câu không có chế độ điền từ). */
    public List<String> gapAnswers() {
        List<String> answers = new ArrayList<>();
        if (gap != null) {
            for (String g : gap.split("\\|")) {
                if (!g.isBlank()) answers.add(g.strip());
            }
        }
        return answers;
    }

    /** Câu tham khảo + các cách dịch đúng khác. */
    public List<String> allAcceptedAnswers() {
        List<String> answers = new ArrayList<>();
        answers.add(deReference);
        if (acceptedAnswers != null) {
            for (String line : acceptedAnswers.split("\\R")) {
                if (!line.isBlank()) answers.add(line.strip());
            }
        }
        return answers;
    }
}
