package com.deutschpfad.backend.listening;

import java.util.List;

public record UserListeningItemDetailResponse(
    Long id, String title, String youtubeVideoId, String description,
    boolean autoFetched, List<UserListeningSentenceResponse> sentences
) {
    public static UserListeningItemDetailResponse from(
        UserListeningItem item, List<UserListeningSentence> sentences, boolean autoFetched
    ) {
        return new UserListeningItemDetailResponse(
            item.getId(),
            item.getTitle(),
            item.getYoutubeVideoId(),
            item.getDescription(),
            autoFetched,
            sentences.stream().map(UserListeningSentenceResponse::from).toList()
        );
    }
}
