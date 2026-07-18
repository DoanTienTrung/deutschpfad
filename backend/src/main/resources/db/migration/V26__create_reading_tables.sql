CREATE TABLE reading_passages (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    level_min VARCHAR(10) NOT NULL,
    level_max VARCHAR(10) NOT NULL,
    topic VARCHAR(255),
    source_label VARCHAR(255),
    source_url VARCHAR(500),
    order_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE reading_questions (
    id BIGSERIAL PRIMARY KEY,
    passage_id BIGINT NOT NULL REFERENCES reading_passages(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    correct_answer VARCHAR(20) NOT NULL,
    explanation TEXT
);

CREATE INDEX idx_reading_questions_passage_id ON reading_questions(passage_id);
