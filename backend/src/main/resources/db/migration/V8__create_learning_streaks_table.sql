CREATE TABLE learning_streaks (
    id                BIGSERIAL PRIMARY KEY,
    user_id           BIGINT NOT NULL UNIQUE REFERENCES users(id),
    current_streak    INT NOT NULL DEFAULT 0,
    longest_streak    INT NOT NULL DEFAULT 0,
    last_active_date  DATE,
    updated_at        TIMESTAMP NOT NULL DEFAULT now()
);
