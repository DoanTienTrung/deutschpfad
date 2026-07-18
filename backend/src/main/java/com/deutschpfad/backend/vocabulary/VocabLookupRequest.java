package com.deutschpfad.backend.vocabulary;

import jakarta.validation.constraints.NotBlank;

public record VocabLookupRequest(
    @NotBlank String germanWord
) {}
