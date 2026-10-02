-- Lịch ôn SM-2 gắn với TỪ (word_key) thay vì gắn với DÒNG (vocabulary_item_id).
--
-- Trước đây cùng một "die Mutter" ở 3 lộ trình (tần suất / Goethe / giáo trình) có 3 lịch ôn độc
-- lập. Tái hiện được bằng chính code production: ôn "die Mutter" qua 3 dòng cho ra 3 trạng thái
-- mâu thuẫn — "đã nhớ" (hệ số 2,50), "dễ" (2,60) và "đã quên" (1,70) cùng lúc.
--
-- Cột word_key do V67 tính sẵn (bằng Java, cùng hàm WordKey.of() mà ứng dụng dùng).


ALTER TABLE user_vocabulary ADD COLUMN word_key VARCHAR(255);

UPDATE user_vocabulary uv
   SET word_key = v.word_key
  FROM vocabulary_items v
 WHERE v.id = uv.vocabulary_item_id;


-- ---------------------------------------------------------------------------------------------
-- Gộp các lịch ôn trùng của cùng một từ: giữ bản được ôn GẦN NHẤT.
--
-- Lần ôn gần nhất phản ánh đúng nhất người học đang nhớ từ này tới đâu. Ví dụ ở trên: lần ôn cuối
-- là "đã quên" → giữ trạng thái đã quên, dù hai bản kia nói "đã nhớ". Giữ bản "tiến xa nhất" thay
-- vào đó sẽ là tự đánh lừa mình — đẩy một từ người học vừa quên ra xa nhiều ngày.
-- (Hoà về thời gian thì giữ id lớn hơn, để kết quả luôn xác định.)
-- ---------------------------------------------------------------------------------------------

DELETE FROM user_vocabulary a
 USING user_vocabulary b
 WHERE a.user_id = b.user_id
   AND a.word_key = b.word_key
   AND a.id <> b.id
   AND (COALESCE(a.last_reviewed_at, a.created_at), a.id)
     < (COALESCE(b.last_reviewed_at, b.created_at), b.id);


ALTER TABLE user_vocabulary ALTER COLUMN word_key SET NOT NULL;

-- Mỗi người học chỉ có MỘT lịch ôn cho mỗi từ.
ALTER TABLE user_vocabulary DROP CONSTRAINT user_vocabulary_user_id_vocabulary_item_id_key;
ALTER TABLE user_vocabulary ADD CONSTRAINT uq_user_vocabulary_user_word UNIQUE (user_id, word_key);

-- vocabulary_item_id được giữ lại: là dòng mà người học đã gặp từ này lần đầu, dùng để hiển thị
-- nghĩa / câu ví dụ trên thẻ ôn tập.
