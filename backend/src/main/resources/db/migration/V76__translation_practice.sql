-- Luyện dịch Việt → Đức (phần Viết). Một "bộ" là một bài luyện: theo chủ điểm ngữ pháp, nhóm
-- collocation, một đoạn văn hoặc một essay; mỗi bộ gồm nhiều câu/cụm cần dịch.
CREATE TABLE translation_sets (
    id               BIGSERIAL PRIMARY KEY,
    type             VARCHAR(16)  NOT NULL,              -- GRAMMAR | COLLOCATION | PARAGRAPH | ESSAY
    level            VARCHAR(4)   NOT NULL,
    title            VARCHAR(200) NOT NULL,
    grammar_topic_id BIGINT REFERENCES grammar_topics (id) ON DELETE SET NULL,
    theme            VARCHAR(100),
    structure_note   TEXT,                               -- công thức / lưu ý hiện đầu bài
    status           VARCHAR(16)  NOT NULL DEFAULT 'DRAFT', -- DRAFT | PUBLISHED
    order_index      INT          NOT NULL DEFAULT 0,
    created_at       TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT now()
);
CREATE INDEX idx_translation_sets_type_level ON translation_sets (type, level);
CREATE UNIQUE INDEX ux_translation_sets_grammar_topic ON translation_sets (grammar_topic_id) WHERE grammar_topic_id IS NOT NULL;

CREATE TABLE translation_items (
    id               BIGSERIAL PRIMARY KEY,
    set_id           BIGINT NOT NULL REFERENCES translation_sets (id) ON DELETE CASCADE,
    order_index      INT    NOT NULL,
    part_label       VARCHAR(60),                        -- Einleitung / Hauptteil / Schluss (essay)
    vi_text          TEXT   NOT NULL,
    de_reference     TEXT   NOT NULL,
    accepted_answers TEXT,                               -- các cách dịch đúng khác, mỗi dòng một câu
    hint_keywords    TEXT                                -- từ khoá gợi ý, ngăn bằng dấu phẩy
);
CREATE INDEX idx_translation_items_set ON translation_items (set_id, order_index);

CREATE TABLE translation_attempts (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    item_id    BIGINT      NOT NULL REFERENCES translation_items (id) ON DELETE CASCADE,
    answer     TEXT,
    mode       VARCHAR(16) NOT NULL,                     -- WORD_BANK | TYPING | REVEAL
    verdict    VARCHAR(16) NOT NULL,                     -- CORRECT | ALMOST | WRONG | REVEALED | UNGRADED
    judged_by  VARCHAR(16) NOT NULL,                     -- LOCAL | CACHE | AI | NONE
    feedback   TEXT,                                     -- JSON: corrected, errors[], note
    created_at TIMESTAMP   NOT NULL DEFAULT now()
);
CREATE INDEX idx_translation_attempts_user_item ON translation_attempts (user_id, item_id);
CREATE INDEX idx_translation_attempts_user_day ON translation_attempts (user_id, created_at);

-- Kết quả AI chấm, dùng lại cho câu trả lời giống hệt (sau chuẩn hoá) của bất kỳ ai.
CREATE TABLE translation_judgments (
    id         BIGSERIAL PRIMARY KEY,
    item_id    BIGINT      NOT NULL REFERENCES translation_items (id) ON DELETE CASCADE,
    answer_key TEXT        NOT NULL,
    verdict    VARCHAR(16) NOT NULL,
    feedback   TEXT,
    created_at TIMESTAMP   NOT NULL DEFAULT now(),
    UNIQUE (item_id, answer_key)
);
