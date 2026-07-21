package com.deutschpfad.backend.auth;

import jakarta.validation.constraints.NotBlank;

public record UpdateProfileRequest(
    @NotBlank String fullName,
    String goal,
    String targetCertificate,
    String currentLevel
) {}
