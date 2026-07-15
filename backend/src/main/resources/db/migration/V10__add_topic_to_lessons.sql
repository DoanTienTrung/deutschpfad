ALTER TABLE lessons ADD COLUMN topic_id BIGINT REFERENCES topics(id);
