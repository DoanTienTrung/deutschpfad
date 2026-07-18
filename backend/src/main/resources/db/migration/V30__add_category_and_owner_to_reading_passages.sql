ALTER TABLE reading_passages ADD COLUMN category VARCHAR(20) NOT NULL DEFAULT 'EXAM';
ALTER TABLE reading_passages ADD COLUMN owner_id BIGINT REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX idx_reading_passages_owner_id ON reading_passages(owner_id);
