package com.deutschpfad.backend.reading;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "reading_questions")
@Getter
@Setter
public class ReadingQuestion {

    // MATCHING: correctAnswer holds a letter referencing a shared ReadingMatchingOption for the
    // same passage (e.g. "D"), or "0" when the situation has no matching option.
    // FILL_BLANK: correctAnswer holds one or more accepted words/phrases separated by "/".
    // SHORT_ANSWER: free-text (keywords/short paraphrase) -- not reliably auto-gradable, so
    // correctAnswer is shown as a model answer for the learner to self-check rather than scored.
    public enum QuestionType { MULTIPLE_CHOICE, TRUE_FALSE, MATCHING, FILL_BLANK, SHORT_ANSWER }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "passage_id", nullable = false)
    private ReadingPassage passage;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false)
    private QuestionType questionType;

    @Column(name = "option_a", columnDefinition = "TEXT")
    private String optionA;

    @Column(name = "option_b", columnDefinition = "TEXT")
    private String optionB;

    @Column(name = "option_c", columnDefinition = "TEXT")
    private String optionC;

    @Column(name = "option_d", columnDefinition = "TEXT")
    private String optionD;

    // "A"/"B"/"C"/"D" for MULTIPLE_CHOICE, "true"/"false" for TRUE_FALSE. May hold multiple
    // "/"-separated accepted values for FILL_BLANK, or a full model-answer sentence for
    // SHORT_ANSWER -- hence TEXT rather than a short varchar.
    @Column(name = "correct_answer", nullable = false, columnDefinition = "TEXT")
    private String correctAnswer;

    @Column(columnDefinition = "TEXT")
    private String explanation;
}
