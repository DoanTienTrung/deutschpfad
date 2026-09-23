-- Phase 5 — Ngữ pháp (Grammatik).
-- Nội dung lý thuyết viết mới bằng tiếng Việt và bài tập sinh mới; chỉ danh sách/thứ tự chủ điểm
-- bám theo mục lục giáo trình (dữ kiện), không sao chép nội dung có bản quyền.

CREATE TABLE grammar_topics (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(160) NOT NULL UNIQUE,
    title_de VARCHAR(255) NOT NULL,
    title_vi VARCHAR(255) NOT NULL,
    level VARCHAR(10) NOT NULL,
    -- Nhóm hiển thị theo giáo trình, vd. "Lektion 1". Null ở các level không chia Lektion (A2+).
    group_label VARCHAR(100),
    order_index INTEGER NOT NULL,
    summary_vi TEXT,
    theory_md TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_grammar_topics_level_order ON grammar_topics(level, order_index);

CREATE TABLE grammar_exercises (
    id BIGSERIAL PRIMARY KEY,
    topic_id BIGINT NOT NULL REFERENCES grammar_topics(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    exercise_type VARCHAR(20) NOT NULL,
    -- Câu tiếng Đức, dùng "___" đánh dấu chỗ trống cần điền.
    prompt_de TEXT NOT NULL,
    hint_vi TEXT,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    -- Nhiều đáp án chấp nhận được ngăn bằng "/" -- theo đúng quy ước của reading_questions.
    correct_answer TEXT NOT NULL,
    explanation_vi TEXT,
    -- MANUAL: admin gõ tay. DATA: sinh deterministic từ german_noun_genders/vocabulary_items.
    -- AI: model soạn nháp.
    generated_by VARCHAR(10) NOT NULL DEFAULT 'MANUAL',
    -- Chốt an toàn: API cho người học chỉ trả bài reviewed = true, nên bài AI sinh ra không bao
    -- giờ tới tay người học trước khi admin duyệt.
    reviewed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_grammar_exercises_topic_id ON grammar_exercises(topic_id);

CREATE TABLE grammar_reference_tables (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(160) NOT NULL UNIQUE,
    title_vi VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    level VARCHAR(10),
    order_index INTEGER NOT NULL,
    -- Bảng markdown GFM, render bằng react-markdown + remark-gfm đã có sẵn ở frontend.
    content_md TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE user_grammar_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id BIGINT NOT NULL REFERENCES grammar_topics(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'LEARNING',
    correct_count INTEGER NOT NULL DEFAULT 0,
    total_count INTEGER NOT NULL DEFAULT 0,
    last_practiced_at TIMESTAMP,
    CONSTRAINT uq_user_grammar_progress UNIQUE (user_id, topic_id)
);

CREATE INDEX idx_user_grammar_progress_user_id ON user_grammar_progress(user_id);
