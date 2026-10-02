-- Bản dịch tiếng Việt của câu ví dụ. Production: 100% từ có câu ví dụ nhưng chưa câu nào có bản
-- dịch — người học A1 đọc câu ví dụ mà không hiểu thì câu ví dụ không giúp được gì.
-- Điền bằng job AI (admin bấm chạy, xem ExampleTranslationJob); NULL = chưa dịch.
ALTER TABLE vocabulary_items ADD COLUMN example_sentence_vi TEXT;
