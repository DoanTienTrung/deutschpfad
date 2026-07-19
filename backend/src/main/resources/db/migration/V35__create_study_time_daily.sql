CREATE TABLE study_time_daily (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    study_date DATE NOT NULL,
    seconds INTEGER NOT NULL DEFAULT 0,
    UNIQUE (user_id, study_date)
);

CREATE INDEX idx_study_time_daily_user_id ON study_time_daily(user_id);
