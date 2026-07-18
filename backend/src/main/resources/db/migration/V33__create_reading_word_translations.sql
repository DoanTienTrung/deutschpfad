CREATE TABLE reading_word_translations (
    id BIGSERIAL PRIMARY KEY,
    passage_id BIGINT NOT NULL REFERENCES reading_passages(id) ON DELETE CASCADE,
    word VARCHAR(255) NOT NULL,
    translation TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (passage_id, word)
);

CREATE INDEX idx_reading_word_translations_passage_id ON reading_word_translations(passage_id);
