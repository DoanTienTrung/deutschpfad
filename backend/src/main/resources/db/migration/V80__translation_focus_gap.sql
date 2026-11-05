-- Luyện dịch dạng Collocation, Đoạn văn, Essay.
-- focus: cụm cần luyện của câu (collocation dạng từ điển như "eine Entscheidung treffen", hoặc mẫu câu Redemittel
--        của essay). Hiện làm gợi ý và báo cho AI biết phải soi chỗ nào khi chấm.
-- gap:   từ bị khoét trong câu tiếng Đức cho chế độ "Điền từ" (vd "getroffen"); nhiều đáp án ngăn bằng |.
ALTER TABLE translation_items ADD COLUMN focus TEXT;
ALTER TABLE translation_items ADD COLUMN gap VARCHAR(120);
