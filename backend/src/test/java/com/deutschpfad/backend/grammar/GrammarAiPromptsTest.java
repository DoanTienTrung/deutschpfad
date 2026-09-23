package com.deutschpfad.backend.grammar;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class GrammarAiPromptsTest {

    @Test
    void parsesMultipleChoiceLine() {
        List<GrammarExerciseDraft> drafts = GrammarAiPrompts.parseExercises(
            "1. MULTIPLE_CHOICE ||| Welche Form ist richtig? ||| ihr seid ||| ihr sind ||| ihr bist "
                + "||| A ||| Ngôi ihr của sein là seid."
        );

        assertThat(drafts).hasSize(1);
        GrammarExerciseDraft draft = drafts.getFirst();
        assertThat(draft.exerciseType()).isEqualTo(GrammarExercise.ExerciseType.MULTIPLE_CHOICE);
        assertThat(draft.promptDe()).isEqualTo("Welche Form ist richtig?");
        assertThat(draft.optionA()).isEqualTo("ihr seid");
        assertThat(draft.optionC()).isEqualTo("ihr bist");
        assertThat(draft.correctAnswer()).isEqualTo("A");
    }

    @Test
    void fillBlankLine_dropsPlaceholderOptions() {
        List<GrammarExerciseDraft> drafts = GrammarAiPrompts.parseExercises(
            "2. FILL_BLANK ||| Wir ___ aus Vietnam. ||| - ||| - ||| - ||| sind ||| sein chia bất quy tắc."
        );

        assertThat(drafts).hasSize(1);
        GrammarExerciseDraft draft = drafts.getFirst();
        assertThat(draft.exerciseType()).isEqualTo(GrammarExercise.ExerciseType.FILL_BLANK);
        assertThat(draft.optionA()).isNull();
        assertThat(draft.optionB()).isNull();
        assertThat(draft.optionC()).isNull();
        assertThat(draft.correctAnswer()).isEqualTo("sind");
    }

    @Test
    void ignoresLinesWithUnknownExerciseType() {
        List<GrammarExerciseDraft> drafts = GrammarAiPrompts.parseExercises(
            "1. MATCHING ||| a ||| - ||| - ||| - ||| b ||| c\n"
                + "2. FILL_BLANK ||| Ich ___ Student. ||| - ||| - ||| - ||| bin ||| ok"
        );

        assertThat(drafts).hasSize(1);
        assertThat(drafts.getFirst().exerciseType()).isEqualTo(GrammarExercise.ExerciseType.FILL_BLANK);
    }

    @Test
    void ignoresMultipleChoiceWithNonLetterAnswer() {
        // Model trả cả câu thay vì chữ cái -> bỏ, vì logic chấm MULTIPLE_CHOICE so theo A/B/C.
        List<GrammarExerciseDraft> drafts = GrammarAiPrompts.parseExercises(
            "1. MULTIPLE_CHOICE ||| Was ist richtig? ||| x ||| y ||| z ||| ihr seid ||| giải thích"
        );

        assertThat(drafts).isEmpty();
    }

    @Test
    void ignoresPreambleAndMalformedLines() {
        List<GrammarExerciseDraft> drafts = GrammarAiPrompts.parseExercises(
            "Đây là các bài tập bạn yêu cầu:\n"
                + "1. FILL_BLANK ||| Du ___ Deutsch. ||| - ||| - ||| - ||| lernst ||| ok\n"
                + "thiếu định dạng hoàn toàn\n"
        );

        assertThat(drafts).hasSize(1);
        assertThat(drafts.getFirst().correctAnswer()).isEqualTo("lernst");
    }

    @Test
    void theoryPrompt_keepsTheOriginalWritingConstraint() {
        // Ràng buộc bản quyền của Phase 5 nằm trong chính prompt -- test để không ai xoá nhầm.
        String prompt = GrammarAiPrompts.theory("Verb - Konjugation", "Chia động từ", "A1");

        assertThat(prompt).contains("TỰ VIẾT MỚI HOÀN TOÀN");
        assertThat(prompt).contains("không dịch lại");
        assertThat(prompt).contains("Verb - Konjugation");
        assertThat(prompt).contains("A1");
    }

    @Test
    void exercisesPrompt_embedsTheoryWhenGiven() {
        String withTheory = GrammarAiPrompts.exercises("Perfekt", "A1", "## Lý thuyết mẫu", 5);
        assertThat(withTheory).contains("## Lý thuyết mẫu");
        assertThat(withTheory).contains("5 bài tập");

        String withoutTheory = GrammarAiPrompts.exercises("Perfekt", "A1", null, 5);
        assertThat(withoutTheory).doesNotContain("bám đúng phần lý thuyết");
    }
}
