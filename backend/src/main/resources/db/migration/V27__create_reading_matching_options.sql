CREATE TABLE reading_matching_options (
    id BIGSERIAL PRIMARY KEY,
    passage_id BIGINT NOT NULL REFERENCES reading_passages(id) ON DELETE CASCADE,
    letter VARCHAR(2) NOT NULL,
    text TEXT NOT NULL,
    order_index INTEGER NOT NULL
);

CREATE INDEX idx_reading_matching_options_passage_id ON reading_matching_options(passage_id);
