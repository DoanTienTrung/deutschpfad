CREATE TABLE lesson_progress (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(id),
    lesson_id    BIGINT NOT NULL REFERENCES lessons(id),
    mode         VARCHAR(30) NOT NULL,
    completed_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (user_id, lesson_id, mode)
);
