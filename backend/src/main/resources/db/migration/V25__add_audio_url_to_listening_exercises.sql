ALTER TABLE listening_exercises ALTER COLUMN youtube_video_id DROP NOT NULL;
ALTER TABLE listening_exercises ADD COLUMN audio_url VARCHAR(1000);
ALTER TABLE listening_exercises ADD COLUMN source_label VARCHAR(255);
ALTER TABLE listening_exercises ADD COLUMN source_url VARCHAR(1000);
