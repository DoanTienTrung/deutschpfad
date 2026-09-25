-- Rải đều đáp án trắc nghiệm của 7 chủ điểm bổ sung ở V59/V60.
--
-- Chạy chủ động theo quy trình đã chốt từ V58: soạn tay xong là cân bằng bằng migration, không
-- tin vào việc tự nhớ rải đều (đã tái phạm ở V49 và V55).
--
-- Chỉ động vào đúng 7 slug mới, không xáo lại các chủ điểm đã cân bằng ở V49/V55/V58.

WITH target AS (
    SELECT
        e.id,
        e.correct_answer AS cur,
        (ARRAY['A', 'B', 'C'])[(row_number() OVER (ORDER BY e.id) % 3) + 1] AS tgt
    FROM grammar_exercises e
    JOIN grammar_topics t ON t.id = e.topic_id
    WHERE t.slug IN (
            'a2-negation', 'b1-relativsatz', 'b1-adjektivdeklination-ohne-artikel',
            'b2-konjunktiv-1', 'b2-passiv-erweitert', 'b2-nominalisierung', 'b2-modalpartikel'
          )
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
