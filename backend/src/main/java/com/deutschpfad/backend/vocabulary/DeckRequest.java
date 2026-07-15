package com.deutschpfad.backend.vocabulary;

import jakarta.validation.constraints.NotBlank;

public record DeckRequest(@NotBlank String name, String description) {}
