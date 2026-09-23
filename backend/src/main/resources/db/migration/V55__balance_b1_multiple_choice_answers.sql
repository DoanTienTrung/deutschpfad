-- Rải đều đáp án đúng của bài trắc nghiệm B1 ra A/B/C — cùng lý do và cùng cách làm với V49.
--
-- Lỗi lặp lại: khi soạn tay V54, đáp án đúng lại dồn 78% vào ô B (thói quen liệt kê phương án sai
-- trước rồi mới tới phương án đúng). Người học chỉ cần luôn chọn B là đạt ~78% mà không cần biết
-- tiếng Đức.
--
-- Chỉ động vào chủ điểm level B1; A1/A2 đã được V49 cân bằng rồi, xáo lại là thừa.

WITH target AS (
    SELECT
        e.id,
        e.correct_answer AS cur,
        (ARRAY['A', 'B', 'C'])[(row_number() OVER (ORDER BY e.id) % 3) + 1] AS tgt
    FROM grammar_exercises e
    JOIN grammar_topics t ON t.id = e.topic_id
    WHERE t.level = 'B1'
      AND e.exercise_type = 'MULTIPLE_CHOICE'
      AND e.correct_answer IN ('A', 'B', 'C')
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
