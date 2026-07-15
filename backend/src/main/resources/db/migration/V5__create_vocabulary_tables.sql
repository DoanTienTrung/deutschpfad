CREATE TABLE topics (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE lessons (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    level       VARCHAR(10) NOT NULL,
    order_index INT NOT NULL,
    description VARCHAR(500),
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE vocabulary_items (
    id                  BIGSERIAL PRIMARY KEY,
    german_word         VARCHAR(255) NOT NULL,
    vietnamese_meaning  VARCHAR(500) NOT NULL,
    word_type           VARCHAR(50),
    example_sentence    VARCHAR(1000),
    image_url           VARCHAR(500),
    level               VARCHAR(10) NOT NULL,
    topic_id            BIGINT REFERENCES topics(id),
    lesson_id           BIGINT REFERENCES lessons(id),
    created_at          TIMESTAMP NOT NULL DEFAULT now()
);

