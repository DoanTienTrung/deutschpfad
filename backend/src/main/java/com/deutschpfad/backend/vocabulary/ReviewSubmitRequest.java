package com.deutschpfad.backend.vocabulary;

import jakarta.validation.constraints.NotNull;

public record ReviewSubmitRequest(@NotNull ReviewQuality result) {}
