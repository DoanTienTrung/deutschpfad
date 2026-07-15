package com.deutschpfad.backend.vocabulary;

import jakarta.validation.constraints.NotBlank;

public record TopicRequest(@NotBlank String name) {
}
