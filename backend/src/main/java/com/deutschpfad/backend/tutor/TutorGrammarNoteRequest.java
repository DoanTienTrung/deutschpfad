package com.deutschpfad.backend.tutor;

import jakarta.validation.constraints.NotBlank;

public record TutorGrammarNoteRequest(
        String title,
        @NotBlank String content,
        String level,
        String topic
) {}
