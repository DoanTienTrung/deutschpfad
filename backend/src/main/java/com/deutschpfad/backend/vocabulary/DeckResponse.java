package com.deutschpfad.backend.vocabulary;

public record DeckResponse(Long id, String name, String description, int itemCount) {
    public static DeckResponse from(UserDeck deck, int itemCount) {
        return new DeckResponse(deck.getId(), deck.getName(), deck.getDescription(), itemCount);
    }
}
