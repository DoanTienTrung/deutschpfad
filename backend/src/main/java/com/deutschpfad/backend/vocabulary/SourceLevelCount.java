package com.deutschpfad.backend.vocabulary;

public interface SourceLevelCount {
    VocabularyItem.Source getSource();
    VocabularyItem.Level getLevel();
    long getCount();
}
