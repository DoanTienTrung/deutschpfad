-- Đổi dấu gạch dài (U+2014) thành gạch ngang thường trong nội dung hiển thị cho người học: lý thuyết
-- và bài tập ngữ pháp, bảng tra cứu, mô tả bài "Sống ở Đức". Dấu gạch dài dày đặc khiến nội dung đọc
-- như văn bản do AI viết. Các migration seed cũ (V44-V64, V72) đã chạy nên không sửa tại chỗ được.
-- Ô bảng chỉ có một dấu gạch ("| — |" = không có) vẫn đúng nghĩa khi thành "| - |". Không dòng nào
-- bắt đầu bằng dấu gạch dài, nên không có dòng nào bị biến thành gạch đầu dòng markdown.

UPDATE grammar_topics SET
    title_vi = replace(replace(title_vi, ' — ', ' - '), '—', '-'),
    summary_vi = replace(replace(summary_vi, ' — ', ' - '), '—', '-'),
    theory_md = replace(replace(theory_md, ' — ', ' - '), '—', '-')
WHERE title_vi LIKE '%—%' OR summary_vi LIKE '%—%' OR theory_md LIKE '%—%';

UPDATE grammar_exercises SET
    prompt_de = replace(replace(prompt_de, ' — ', ' - '), '—', '-'),
    hint_vi = replace(replace(hint_vi, ' — ', ' - '), '—', '-'),
    explanation_vi = replace(replace(explanation_vi, ' — ', ' - '), '—', '-')
WHERE prompt_de LIKE '%—%' OR hint_vi LIKE '%—%' OR explanation_vi LIKE '%—%';

UPDATE grammar_reference_tables SET
    title_vi = replace(replace(title_vi, ' — ', ' - '), '—', '-'),
    content_md = replace(replace(content_md, ' — ', ' - '), '—', '-')
WHERE title_vi LIKE '%—%' OR content_md LIKE '%—%';

UPDATE lessons SET description = replace(replace(description, ' — ', ' - '), '—', '-')
WHERE source = 'LIFE' AND description LIKE '%—%';
