CREATE TABLE conversation_turns (
    id BIGSERIAL PRIMARY KEY,
    recording_id BIGINT NOT NULL REFERENCES user_recordings(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL,
    text TEXT NOT NULL,
    audio_data BYTEA,
    turn_index INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversation_turns_recording ON conversation_turns(recording_id, turn_index);
