CREATE TABLE vocab_lookup_cache (
    id BIGSERIAL PRIMARY KEY,
    word VARCHAR(255) NOT NULL UNIQUE,
    german_word VARCHAR(255) NOT NULL,
    word_type VARCHAR(100),
    vietnamese_meaning TEXT NOT NULL,
    english_meaning TEXT,
    phonetic VARCHAR(255),
    example_sentence TEXT,
    synonyms TEXT,
    antonyms TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
