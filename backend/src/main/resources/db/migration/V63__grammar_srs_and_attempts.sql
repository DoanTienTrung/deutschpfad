-- Hạ tầng cho 3 cải tiến: ôn tập ngắt quãng, lưu kết quả từng câu, và liên kết bảng tra cứu.

-- ---------------------------------------------------------------------------
-- 1. Ôn tập ngắt quãng cho ngữ pháp
--
-- Trước đây đạt "Thành thạo" là hết — không bao giờ nhắc quay lại, nên hai tháng sau người học
-- quên sạch mà huy hiệu vẫn sáng. Module Từ vựng đã có SM-2 từ Phase 2; ở đây tái dùng đúng
-- thuật toán đó qua Sm2Calculator (hàm thuần, không phải viết lại).
--
-- Ba cột dưới đây đúng bộ tham số SM-2 giống bảng user_vocabulary.
-- ---------------------------------------------------------------------------
ALTER TABLE user_grammar_progress
    ADD COLUMN repetitions   INTEGER          NOT NULL DEFAULT 0,
    ADD COLUMN ease_factor   DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    ADD COLUMN interval_days INTEGER          NOT NULL DEFAULT 0,
    ADD COLUMN next_review_date DATE;

-- Chủ điểm đã luyện trước khi có tính năng này thì cho đến hạn ôn ngay hôm nay, thay vì để
-- next_review_date NULL rồi không bao giờ xuất hiện trong hàng chờ ôn.
UPDATE user_grammar_progress SET next_review_date = CURRENT_DATE WHERE last_practiced_at IS NOT NULL;

CREATE INDEX idx_user_grammar_progress_due ON user_grammar_progress(user_id, next_review_date);

-- ---------------------------------------------------------------------------
-- 2. Lưu kết quả TỪNG CÂU
--
-- user_grammar_progress chỉ đếm tổng đúng/sai theo chủ điểm, nên không biết người học yếu ở dạng
-- bài nào hay câu nào. Có bảng này mới làm được "ôn lại đúng chỗ sai", và admin cũng nhìn ra được
-- bài tập nào bị sai/gây hiểu nhầm (câu mà đa số người học cùng chọn sai).
-- ---------------------------------------------------------------------------
CREATE TABLE grammar_exercise_attempts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id BIGINT NOT NULL REFERENCES grammar_exercises(id) ON DELETE CASCADE,
    correct BOOLEAN NOT NULL,
    submitted_answer TEXT,
    attempted_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_grammar_attempts_user ON grammar_exercise_attempts(user_id, attempted_at);
CREATE INDEX idx_grammar_attempts_exercise ON grammar_exercise_attempts(exercise_id);

-- ---------------------------------------------------------------------------
-- 3. Liên kết chủ điểm với bảng tra cứu liên quan
--
-- Nút "Mở bảng tra cứu" ở trang chủ điểm hiện mở ra danh sách chung 14 bảng, người học phải tự
-- tìm. Đang học "Danh từ và mạo từ ở cách 3" thì nên nhảy thẳng tới bảng mạo từ 4 cách.
-- ---------------------------------------------------------------------------
ALTER TABLE grammar_topics ADD COLUMN reference_slug VARCHAR(160);

UPDATE grammar_topics SET reference_slug = 'artikel-bestimmt'
WHERE slug IN ('a1-nomen-artikel-nominativ', 'a1-nomen-artikel-akkusativ', 'a1-nomen-artikel-dativ',
               'a1-nomen-genusregeln', 'b2-nomen-kasus', 'b2-nomen-genus');

UPDATE grammar_topics SET reference_slug = 'artikel-unbestimmt'
WHERE slug IN ('a1-possessivartikel', 'a2-pronomen-artikel', 'a2-negation');

UPDATE grammar_topics SET reference_slug = 'personalpronomen'
WHERE slug IN ('a1-personalpronomen-nominativ', 'a1-personalpronomen-akkusativ', 'a1-pronomen-dativ',
               'b1-relativsatz');

UPDATE grammar_topics SET reference_slug = 'verb-praesens'
WHERE slug IN ('a1-verb-konjugation', 'a1-imperativ');

UPDATE grammar_topics SET reference_slug = 'verb-starke-praesens'
WHERE slug = 'a1-starke-verben';

UPDATE grammar_topics SET reference_slug = 'verb-perfekt'
WHERE slug IN ('a1-perfekt', 'a2-praeteritum', 'a1-praeteritum-haben-sein',
               'b1-verben-vergangenheit', 'b1-passiv', 'b2-passiv-erweitert');

UPDATE grammar_topics SET reference_slug = 'modalverben'
WHERE slug IN ('a1-modalverben', 'a2-praeteritum-modalverben', 'b1-modalverben',
               'b1-brauchen-lassen', 'b1-konjunktiv-2-werden', 'a2-konjunktiv-2', 'b2-konjunktiv-1');

UPDATE grammar_topics SET reference_slug = 'praeposition-akkusativ'
WHERE slug = 'a1-praeposition-akkusativ';

UPDATE grammar_topics SET reference_slug = 'praeposition-dativ'
WHERE slug IN ('a1-praeposition-dativ', 'b1-praeposition-lokal', 'b1-praeposition-temporal');

UPDATE grammar_topics SET reference_slug = 'wechselpraeposition'
WHERE slug IN ('a2-wechselpraeposition', 'b2-praeposition-kasus');

UPDATE grammar_topics SET reference_slug = 'adjektiv-deklination'
WHERE slug IN ('a1-adjektiv', 'a2-adjektivdeklination', 'b1-adjektive',
               'b1-adjektivdeklination-ohne-artikel', 'a2-steigerung');

UPDATE grammar_topics SET reference_slug = 'n-deklination'
WHERE slug IN ('a2-n-deklination', 'b2-n-deklination', 'a2-genitiv', 'b1-genitiv',
               'b1-praeposition-genitiv', 'b2-nomen-numerus', 'a1-nomen-komposita');

UPDATE grammar_topics SET reference_slug = 'satzstruktur'
WHERE slug IN ('a1-wortstellung-hauptsatz', 'a1-satzstrukturen', 'a1-trennbare-verben',
               'a1-zeitadverbien', 'a1-anrede', 'b2-wortstellung', 'b2-nominalisierung',
               'b2-modalpartikel', 'b1-infinitivkonstruktionen', 'b2-infinitivsatz');

UPDATE grammar_topics SET reference_slug = 'nebensatz'
WHERE slug IN ('a1-hauptsatz-konjunktionen', 'a2-nebensatz-kausal', 'a2-nebensatz-konditional',
               'a2-nebensatz-dass', 'a2-futur-1', 'a2-reflexive-verben',
               'a2-verben-dativ-akkusativ', 'a2-verben-praepositionalobjekt',
               'b1-kausale-konnektoren', 'b1-nebensatz-fragesatz', 'b1-nebensatz-temporal',
               'b1-nebensatz-konzessiv', 'b1-nebensatz-final', 'b1-verben-praepositionalobjekt',
               'b1-pronominaladverbien', 'b2-nebensatz-modal', 'b2-nebensatz-konsekutiv',
               'b2-nebensatz-adversativ', 'b2-nebensatz-konditional', 'b2-subjekt-objektsatz');
