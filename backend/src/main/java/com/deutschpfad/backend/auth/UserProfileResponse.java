package com.deutschpfad.backend.auth;

public record UserProfileResponse(
    Long id,
    String email,
    String fullName,
    String role,
    String goal,
    String targetCertificate,
    String currentLevel
) {
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRole().name(),
            user.getGoal(),
            user.getTargetCertificate(),
            user.getCurrentLevel()
        );
    }
}
