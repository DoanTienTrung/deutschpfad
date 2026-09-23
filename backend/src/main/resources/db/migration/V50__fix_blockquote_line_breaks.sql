-- Sửa lỗi hiển thị: hai dòng trích dẫn "> ..." viết liền nhau bị markdown gộp thành MỘT đoạn,
-- nên các cặp câu đối chiếu (câu đúng / câu sai, lịch sự / cộc) dính vào nhau khó đọc.
--
-- Cách sửa chuẩn của markdown là chèn một dòng ">" trống giữa hai dòng — khi đó chúng thành hai
-- đoạn riêng nằm trong cùng một khối trích dẫn. Không dùng cách "hai khoảng trắng cuối dòng" vì
-- khoảng trắng cuối dòng rất dễ bị trình soạn thảo cắt mất.
--
-- Chạy lặp 4 lần vì regexp_replace mỗi lượt chỉ tách được một cặp trong chuỗi các dòng liền nhau;
-- 4 lượt đủ cho đoạn dài nhất hiện có (3 dòng liên tiếp).

DO $$
DECLARE
    i INTEGER;
BEGIN
    FOR i IN 1..4 LOOP
        UPDATE grammar_topics
        SET theory_md = regexp_replace(theory_md, '(\n>[^\n]*)\n(>[^\n]*)', E'\\1\n>\n\\2', 'g')
        WHERE theory_md ~ '\n>[^\n]*\n>[^\n]*';

        UPDATE grammar_reference_tables
        SET content_md = regexp_replace(content_md, '(\n>[^\n]*)\n(>[^\n]*)', E'\\1\n>\n\\2', 'g')
        WHERE content_md ~ '\n>[^\n]*\n>[^\n]*';
    END LOOP;
END $$;
