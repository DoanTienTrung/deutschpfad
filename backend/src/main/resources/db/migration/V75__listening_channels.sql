-- Kênh YouTube cho trang "Luyện qua Video YouTube" (lọc theo kênh như S English) và hàng chờ nhập
-- video hàng loạt: bài nghe mới tạo ở trạng thái PENDING, job nền lấy phụ đề + dịch, xong hết mới
-- READY và hiện cho người học.
CREATE TABLE listening_channels (
    id                 BIGSERIAL PRIMARY KEY,
    youtube_channel_id VARCHAR(64) UNIQUE,
    name               VARCHAR(120) NOT NULL,
    handle             VARCHAR(120),
    order_index        INT          NOT NULL DEFAULT 0,
    created_at         TIMESTAMP    NOT NULL DEFAULT now()
);

ALTER TABLE listening_exercises
    ADD COLUMN channel_id      BIGINT REFERENCES listening_channels (id),
    -- YOUTUBE: trang video YouTube; EXAM: trang luyện đề thi (kể cả đoạn đề có video YouTube)
    ADD COLUMN kind            VARCHAR(16) NOT NULL DEFAULT 'YOUTUBE',
    -- PENDING: chờ lấy phụ đề; TRANSLATING: đã có câu, còn câu chưa dịch; READY: người học thấy;
    -- FAILED: không lấy được phụ đề; HIDDEN: admin ẩn (vd bản trùng)
    ADD COLUMN status          VARCHAR(16) NOT NULL DEFAULT 'READY',
    ADD COLUMN import_error    VARCHAR(500),
    ADD COLUMN import_attempts INT         NOT NULL DEFAULT 0;

CREATE INDEX idx_listening_exercises_channel ON listening_exercises (channel_id);
CREATE INDEX idx_listening_exercises_video ON listening_exercises (youtube_video_id);

-- Đoạn đề Goethe (kể cả bản gắn video YouTube, id 74-90 trên production) thuộc trang luyện đề thi.
UPDATE listening_exercises
   SET kind = 'EXAM'
 WHERE audio_url IS NOT NULL
    OR topic = 'Goethe Modellsatz'
    OR title LIKE 'Goethe %';

-- Bản video trùng tiêu đề với một bài đề thi có audio gốc: ẩn, không xoá (đổi lại status = 'READY' để mở).
UPDATE listening_exercises v
   SET status = 'HIDDEN',
       import_error = 'Trùng với bài đề thi có audio gốc (V75)'
 WHERE v.kind = 'EXAM'
   AND v.youtube_video_id IS NOT NULL
   AND v.audio_url IS NULL
   AND EXISTS (SELECT 1 FROM listening_exercises a
                WHERE a.audio_url IS NOT NULL AND a.id <> v.id AND a.title = v.title);
