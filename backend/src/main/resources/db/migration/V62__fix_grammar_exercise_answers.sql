-- Sửa 3 nhóm lỗi tìm ra khi rà lại toàn bộ 508 bài tập (2026-09-25).
--
-- Cả ba đều cùng một gốc: đáp án lưu quá chặt, nên NGƯỜI HỌC VIẾT ĐÚNG TIẾNG ĐỨC VẪN BỊ CHẤM SAI.
-- Đây là kiểu lỗi tệ nhất với một app học tập — nó dạy sai và làm mất niềm tin vào phần chấm.

-- ---------------------------------------------------------------------------
-- Nhóm 1: đáp án là câu hoàn chỉnh nhưng THIẾU DẤU PHẨY.
--
-- Tiếng Đức bắt buộc dấu phẩy trước mệnh đề phụ. Đáp án cũ vừa hiển thị sai chính tả cho người
-- học ("đáp án đúng" mà lại thiếu dấu phẩy), vừa khiến ai viết đúng bị chấm sai.
-- GrammarGradingService giờ đã bỏ qua dấu phẩy khi so khớp, nhưng đáp án HIỂN THỊ vẫn phải đúng.
-- ---------------------------------------------------------------------------

UPDATE grammar_exercises SET correct_answer = 'Ich lerne, um die Prüfung zu bestehen'
WHERE correct_answer = 'Ich lerne um die Prüfung zu bestehen';

UPDATE grammar_exercises SET correct_answer = 'Das ist der Film, der mir gefallen hat'
WHERE correct_answer = 'Das ist der Film der mir gefallen hat';

UPDATE grammar_exercises SET correct_answer = 'Hätte ich Zeit, würde ich kommen'
WHERE correct_answer = 'Hätte ich Zeit würde ich kommen';

UPDATE grammar_exercises SET correct_answer = 'Es ist wichtig, dass wir pünktlich sind'
WHERE correct_answer = 'Es ist wichtig dass wir pünktlich sind';

-- ---------------------------------------------------------------------------
-- Nhóm 2: bài sắp xếp câu chỉ nhận MỘT trật tự, trong khi quy tắc V2 cho phép hai.
--
-- Với các từ cho sẵn, đưa trạng ngữ hay tân ngữ lên vị trí 1 đều là câu đúng — chính điều mà
-- chủ điểm Wortstellung dạy. Bổ sung biến thể thứ hai theo quy ước "/" đã dùng sẵn.
-- ---------------------------------------------------------------------------

UPDATE grammar_exercises SET correct_answer = 'Heute lerne ich Deutsch/Ich lerne heute Deutsch'
WHERE correct_answer = 'Heute lerne ich Deutsch';

UPDATE grammar_exercises SET correct_answer = 'Ich wohne in Hamburg/In Hamburg wohne ich'
WHERE correct_answer = 'Ich wohne in Hamburg';

UPDATE grammar_exercises SET correct_answer = 'Morgen fahre ich nach Berlin/Ich fahre morgen nach Berlin'
WHERE correct_answer = 'Morgen fahre ich nach Berlin';

UPDATE grammar_exercises SET correct_answer = 'Ich stehe um 6 Uhr auf/Um 6 Uhr stehe ich auf'
WHERE correct_answer = 'Ich stehe um 6 Uhr auf';

UPDATE grammar_exercises SET correct_answer = 'Ich kaufe heute ein/Heute kaufe ich ein'
WHERE correct_answer = 'Ich kaufe heute ein';

UPDATE grammar_exercises SET correct_answer = 'Ich will heute Abend ins Kino gehen/Heute Abend will ich ins Kino gehen'
WHERE correct_answer = 'Ich will heute Abend ins Kino gehen';

UPDATE grammar_exercises SET correct_answer = 'Ich habe gestern viel gelernt/Gestern habe ich viel gelernt'
WHERE correct_answer = 'Ich habe gestern viel gelernt';

UPDATE grammar_exercises SET correct_answer = 'Ich muss heute Abend Deutsch lernen/Heute Abend muss ich Deutsch lernen'
WHERE correct_answer = 'Ich muss heute Abend Deutsch lernen';

UPDATE grammar_exercises SET correct_answer = 'Ich schenke meiner Mutter Blumen/Meiner Mutter schenke ich Blumen'
WHERE correct_answer = 'Ich schenke meiner Mutter Blumen';

UPDATE grammar_exercises SET correct_answer = 'An deiner Stelle würde ich mit dem Chef sprechen/Ich würde an deiner Stelle mit dem Chef sprechen'
WHERE correct_answer = 'An deiner Stelle würde ich mit dem Chef sprechen';

UPDATE grammar_exercises SET correct_answer = 'Ich gebe dem Kind einen Apfel/Dem Kind gebe ich einen Apfel'
WHERE correct_answer = 'Ich gebe dem Kind einen Apfel';

-- ---------------------------------------------------------------------------
-- Nhóm 3: bài trắc nghiệm có hai phương án TRÙNG HỆT NHAU.
--
-- "Welche Form ist richtig? (fahren, Präteritum, ich)" vốn được soạn với option_a và option_c
-- cùng là "ich fahrte"; sau khi V58 xáo vị trí thì chúng nằm cạnh nhau ở A và B. Đáp án đúng
-- (ich fuhr) không sai, nhưng câu hỏi chỉ còn 2 lựa chọn thật.
-- ---------------------------------------------------------------------------

UPDATE grammar_exercises
SET option_a = 'ich fahrte', option_b = 'ich fuhr', option_c = 'ich fuhrte', correct_answer = 'B'
WHERE exercise_type = 'MULTIPLE_CHOICE'
  AND prompt_de = 'Welche Form ist richtig? (fahren, Präteritum, ich)'
  AND option_a = option_b;
