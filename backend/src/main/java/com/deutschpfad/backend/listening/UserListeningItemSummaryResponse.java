package com.deutschpfad.backend.listening;

public record UserListeningItemSummaryResponse(
    Long id, String title, String youtubeVideoId, String description, int sentenceCount, Integer durationSeconds
) {
    public static UserListeningItemSummaryResponse from(UserListeningItem item, int sentenceCount) {
        return new UserListeningItemSummaryResponse(
            item.getId(),
            item.getTitle(),
            item.getYoutubeVideoId(),
            item.getDescription(),
            sentenceCount,
            item.getDurationSeconds()
        );
    }
}
