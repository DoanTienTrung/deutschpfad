package com.deutschpfad.backend.reading;

public record ReadingMatchingOptionResponse(String letter, String text) {
    public static ReadingMatchingOptionResponse from(ReadingMatchingOption option) {
        return new ReadingMatchingOptionResponse(option.getLetter(), option.getText());
    }
}
