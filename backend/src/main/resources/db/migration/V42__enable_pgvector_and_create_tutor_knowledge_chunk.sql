CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE tutor_knowledge_chunk (
    embedding_id uuid NOT NULL,
    embedding    vector(1024),
    text         text,
    metadata     jsonb,
    PRIMARY KEY (embedding_id)
);
