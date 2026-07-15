CREATE TABLE listening_exercises (
    id                BIGSERIAL PRIMARY KEY,
    title             VARCHAR(255) NOT NULL,
    level             VARCHAR(10) NOT NULL,
    youtube_video_id  VARCHAR(50) NOT NULL,
    description       VARCHAR(1000),
    order_index       INT NOT NULL,
    created_at        TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE listening_sentences (
    id             BIGSERIAL PRIMARY KEY,
    exercise_id    BIGINT NOT NULL REFERENCES listening_exercises(id) ON DELETE CASCADE,
    order_index    INT NOT NULL,
    text           TEXT NOT NULL,
    start_seconds  INT NOT NULL,
    end_seconds    INT NOT NULL
);

CREATE INDEX idx_listening_sentences_exercise ON listening_sentences (exercise_id, order_index);
