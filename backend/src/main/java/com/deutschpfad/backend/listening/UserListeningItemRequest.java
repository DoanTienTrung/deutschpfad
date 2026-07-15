package com.deutschpfad.backend.listening;

import jakarta.validation.constraints.NotBlank;

public record UserListeningItemRequest(
    @NotBlank String title,
    @NotBlank String youtubeVideoId,
    String description,
    String rawTranscript,
    boolean autoFetch
) {
}
