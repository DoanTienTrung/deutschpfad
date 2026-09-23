-- Rải đều đáp án đúng của bài trắc nghiệm B2 ra A/B/C — cùng cách làm với V49 và V55.
--
-- Lần này chạy CHỦ ĐỘNG chứ không phải để sửa lỗi: sau hai lần tái phạm ở V49 (A1/A2) và V55 (B1),
-- kết luận rút ra là không thể tin vào việc "sẽ nhớ rải đều khi soạn tay". Cứ soạn xong rồi cân
-- bằng bằng migration — rẻ và chắc chắn hơn việc tự kiểm.
--
-- Chỉ động vào chủ điểm level B2; A1/A2 đã cân bằng ở V49, B1 ở V55 — xáo lại là thừa.

WITH target AS (
    SELECT
        e.id,
        e.correct_answer AS cur,
        (ARRAY['A', 'B', 'C'])[(row_number() OVER (ORDER BY e.id) % 3) + 1] AS tgt
    FROM grammar_exercises e
    JOIN grammar_topics t ON t.id = e.topic_id
    WHERE t.level = 'B2'
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
