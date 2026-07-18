package com.deutschpfad.backend.reading;

import jakarta.validation.constraints.NotBlank;

public record ReadingMatchingOptionInput(@NotBlank String letter, @NotBlank String text) {
}
