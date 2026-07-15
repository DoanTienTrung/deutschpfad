CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'USER',
    email_verified BOOLEAN     NOT NULL DEFAULT FALSE,
    goal          VARCHAR(50),
    target_certificate VARCHAR(50),
    current_level VARCHAR(10),
    created_at    TIMESTAMP    NOT NULL DEFAULT now()
);
