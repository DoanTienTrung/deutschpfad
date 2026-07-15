package com.deutschpfad.backend.vocabulary;

public enum ReviewQuality {
    FORGOT(0),
    REMEMBERED(3),
    EASY(5);

    private final int quality;

    ReviewQuality(int quality) {
        this.quality = quality;
    }

    public int getQuality() {
        return quality;
    }
}
