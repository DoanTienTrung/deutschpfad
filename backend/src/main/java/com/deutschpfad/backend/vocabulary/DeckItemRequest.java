package com.deutschpfad.backend.vocabulary;

import jakarta.validation.constraints.NotBlank;

public record DeckItemRequest(
    @NotBlank String germanWord,
    @NotBlank String vietnameseMeaning,
    String wordType,
    String exampleSentence
) {}
