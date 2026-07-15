CREATE TABLE user_vocabulary (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES users(id),
    vocabulary_item_id  BIGINT NOT NULL REFERENCES vocabulary_items(id),
    repetitions         INT NOT NULL DEFAULT 0,
    ease_factor         DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    interval_days       INT NOT NULL DEFAULT 0,
    next_review_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    last_reviewed_at    TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (user_id, vocabulary_item_id)
);

CREATE INDEX idx_user_vocabulary_due ON user_vocabulary (user_id, next_review_date);
