CREATE TABLE user_decks (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id),
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE user_deck_items (
    id                  BIGSERIAL PRIMARY KEY,
    deck_id             BIGINT NOT NULL REFERENCES user_decks(id) ON DELETE CASCADE,
    german_word         VARCHAR(255) NOT NULL,
    vietnamese_meaning  VARCHAR(255) NOT NULL,
    word_type           VARCHAR(100),
    example_sentence    TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_decks_user ON user_decks (user_id);
CREATE INDEX idx_user_deck_items_deck ON user_deck_items (deck_id);
