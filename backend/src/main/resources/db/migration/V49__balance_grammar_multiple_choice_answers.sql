-- Rải đều đáp án đúng của bài trắc nghiệm ra A/B/C.
--
-- Vì sao cần: khi soạn tay V47/V48, đáp án đúng vô tình dồn 78% vào ô B (thói quen đặt phương án
-- sai trước rồi mới tới phương án đúng). Người học chỉ cần luôn chọn B là đạt ~78% mà không biết
-- chữ tiếng Đức nào — bài tập mất tác dụng đo lường.
--
-- Cách làm: hoán đổi hai chiều nội dung giữa ô đang đúng và ô đích (đích lấy luân phiên A/B/C theo
-- thứ tự id). Hoán đổi hai chiều nên không mất phương án nào, chỉ đổi vị trí.

WITH target AS (
    SELECT
        id,
        correct_answer AS cur,
        (ARRAY['A', 'B', 'C'])[(row_number() OVER (ORDER BY id) % 3) + 1] AS tgt
    FROM grammar_exercises
    WHERE exercise_type = 'MULTIPLE_CHOICE'
      AND generated_by = 'MANUAL'
      AND correct_answer IN ('A', 'B', 'C')
),
texts AS (
    SELECT
        t.id, t.cur, t.tgt,
        CASE t.cur WHEN 'A' THEN e.option_a WHEN 'B' THEN e.option_b ELSE e.option_c END AS cur_text,
        CASE t.tgt WHEN 'A' THEN e.option_a WHEN 'B' THEN e.option_b ELSE e.option_c END AS tgt_text
    FROM target t
    JOIN grammar_exercises e ON e.id = t.id
)
UPDATE grammar_exercises e
SET option_a = CASE WHEN x.cur = 'A' THEN x.tgt_text WHEN x.tgt = 'A' THEN x.cur_text ELSE e.option_a END,
    option_b = CASE WHEN x.cur = 'B' THEN x.tgt_text WHEN x.tgt = 'B' THEN x.cur_text ELSE e.option_b END,
    option_c = CASE WHEN x.cur = 'C' THEN x.tgt_text WHEN x.tgt = 'C' THEN x.cur_text ELSE e.option_c END,
    correct_answer = x.tgt
FROM texts x
WHERE e.id = x.id AND x.cur <> x.tgt;
