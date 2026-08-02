package com.deutschpfad.backend.vocabulary;

import jakarta.validation.constraints.NotBlank;

public record VocabLookupRequest(
    @NotBlank String germanWord,
    // Optional: word type the user already picked in the form, so the AI doesn't have to guess
    // it (and can't wrongly nominalize e.g. an adjective into "der/die/das + Adjektiv-as-noun").
    String wordType
) {}
