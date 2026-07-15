CREATE TABLE user_listening_items (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    youtube_video_id VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE user_listening_sentences (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL REFERENCES user_listening_items(id) ON DELETE CASCADE,
    order_index INT NOT NULL,
    text TEXT NOT NULL,
    start_seconds INT NOT NULL,
    end_seconds INT NOT NULL,
    translation TEXT,
    phonetic TEXT
);

CREATE INDEX idx_user_listening_items_user ON user_listening_items(user_id);
CREATE INDEX idx_user_listening_sentences_item ON user_listening_sentences(item_id, order_index);
