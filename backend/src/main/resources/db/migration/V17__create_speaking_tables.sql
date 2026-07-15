CREATE TABLE speaking_prompts (
    id BIGSERIAL PRIMARY KEY,
    level VARCHAR(10) NOT NULL,
    prompt_text TEXT NOT NULL,
    description TEXT,
    order_index INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE user_recordings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    prompt_id BIGINT NOT NULL REFERENCES speaking_prompts(id),
    transcript TEXT,
    feedback TEXT,
    low_confidence_words TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_recordings_user_prompt ON user_recordings(user_id, prompt_id);
