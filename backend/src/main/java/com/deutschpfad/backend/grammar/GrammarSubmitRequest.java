package com.deutschpfad.backend.grammar;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record GrammarSubmitRequest(List<Answer> answers) {
    public record Answer(@NotNull Long exerciseId, String answer) {
    }
}
