package com.deutschpfad.backend.reading;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ReadingSubmitRequest(List<Answer> answers) {
    public record Answer(@NotNull Long questionId, @NotBlank String answer) {
    }
}
