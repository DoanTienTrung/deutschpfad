-- Bài tập cho 3 chủ điểm Lektion 1.
--
-- Vì sao tách riêng khỏi V47: ba chủ điểm này được soạn tay qua API admin lúc dựng khung (Đợt 1),
-- nên chúng chỉ tồn tại trên máy dev chứ chưa từng nằm trong migration nào. Nếu không có file này,
-- production sẽ có lý thuyết nhưng KHÔNG có bài tập ở đúng ba chủ điểm đầu tiên người học gặp.
--
-- Bốn chủ điểm còn lại cũng thiếu bài trên production (a1-nomen-genusregeln,
-- a1-nomen-artikel-nominativ/-akkusativ/-dativ) thì KHÔNG seed ở đây: chúng vốn sinh deterministic
-- từ vocabulary_items + german_noun_genders, mà production có 9696 từ so với vài trăm từ ở máy dev
-- — bấm "Sinh từ dữ liệu" trên production sẽ cho bài tốt hơn hẳn seed cứng ở đây.
--
-- Đáp án trắc nghiệm đã rải sẵn A/B/C ngay khi soạn, vì V49 (cân bằng đáp án) chạy trước file này.

INSERT INTO grammar_exercises
  (topic_id, order_index, exercise_type, prompt_de, hint_vi, option_a, option_b, option_c, correct_answer, explanation_vi, generated_by, reviewed)
SELECT t.id, v.order_index, v.exercise_type, v.prompt_de, v.hint_vi, v.option_a, v.option_b, v.option_c, v.correct_answer, v.explanation_vi, 'MANUAL', true
FROM (VALUES

-- ===== Verb - Konjugation =====
('a1-verb-konjugation', 0, 'CONJUGATE', 'Ich ___ jeden Tag Deutsch. (lernen)', 'Chủ ngữ ich → đuôi -e', NULL, NULL, NULL, 'lerne', 'Thân từ lern- cộng đuôi -e cho ngôi ich.'),
('a1-verb-konjugation', 1, 'CONJUGATE', 'Du ___ bei Siemens. (arbeiten)', 'Thân từ kết thúc bằng -t nên phải thêm -e-', NULL, NULL, NULL, 'arbeitest', 'arbeit- kết thúc bằng -t, nên là du arbeitest chứ không phải du arbeitst.'),
('a1-verb-konjugation', 2, 'FILL_BLANK', 'Wir ___ aus Vietnam. (sein)', 'sein là động từ bất quy tắc, phải thuộc lòng', NULL, NULL, NULL, 'sind', 'sein chia bất quy tắc: wir sind.'),
('a1-verb-konjugation', 3, 'MULTIPLE_CHOICE', 'Welche Form ist richtig?', NULL, 'ihr sind', 'ihr bist', 'ihr seid', 'C', 'Ngôi ihr của động từ sein là seid.'),
('a1-verb-konjugation', 4, 'WORD_ORDER', 'heute / ich / Deutsch / lerne', 'Động từ chia luôn đứng vị trí thứ hai trong câu kể', NULL, NULL, NULL, 'Heute lerne ich Deutsch', 'Quy tắc V2: dù câu mở đầu bằng heute, động từ chia vẫn phải đứng ở vị trí thứ hai.'),
('a1-verb-konjugation', 5, 'CONJUGATE', 'Ihr ___ sehr gut. (kochen)', 'Ngôi ihr dùng đuôi nào?', NULL, NULL, NULL, 'kocht', 'Ngôi ihr dùng đuôi -t: kocht.'),

-- ===== Personalpronomen - Nominativ =====
('a1-personalpronomen-nominativ', 0, 'MULTIPLE_CHOICE', '___ ist meine Schwester.', 'Schwester là giống cái', 'Sie', 'Er', 'Es', 'A', 'Schwester (chị/em gái) là giống cái nên dùng sie.'),
('a1-personalpronomen-nominativ', 1, 'FILL_BLANK', '___ seid aus Hanoi, oder?', 'Đuôi động từ seid ứng với ngôi nào?', NULL, NULL, NULL, 'Ihr', 'Động từ seid chỉ đi với ngôi ihr (các bạn).'),
('a1-personalpronomen-nominativ', 2, 'FILL_BLANK', 'Guten Tag, Herr Müller! Wie geht es ___?', 'Nói chuyện lịch sự với người lạ', NULL, NULL, NULL, 'Ihnen', 'Với người lạ dùng đại từ lịch sự Sie; ở cách 3 thành Ihnen, luôn viết hoa.'),
('a1-personalpronomen-nominativ', 3, 'MULTIPLE_CHOICE', 'Anna und Tom kommen aus Berlin. ___ sind Studenten.', 'Hai người trở lên', 'Er', 'Ihr', 'Sie', 'C', 'Hai người trở lên thì dùng sie (họ), đi với động từ sind.'),
('a1-personalpronomen-nominativ', 4, 'MULTIPLE_CHOICE', 'Welcher Satz zeigt "sie" als "cô ấy"?', 'Nhìn đuôi động từ để phân biệt', 'Sie sind Lehrer.', 'sie ist Lehrerin.', 'sie sind Studenten.', 'B', 'Động từ số ít (ist) cho biết sie ở đây là "cô ấy"; sind là "họ".'),

-- ===== Wortstellung - Hauptsatz / Fragesatz =====
('a1-wortstellung-hauptsatz', 0, 'WORD_ORDER', 'in Hamburg / wohne / ich', 'Câu kể, động từ ở vị trí thứ hai', NULL, NULL, NULL, 'Ich wohne in Hamburg', 'Chủ ngữ ich ở vị trí 1, động từ wohne ở vị trí 2.'),
('a1-wortstellung-hauptsatz', 1, 'WORD_ORDER', 'Morgen / ich / nach Berlin / fahre', 'Morgen đứng đầu thì chủ ngữ phải lùi ra sau động từ', NULL, NULL, NULL, 'Morgen fahre ich nach Berlin', 'Đưa Morgen lên vị trí 1 thì động từ fahre vẫn giữ vị trí 2, ich bị đẩy xuống vị trí 3.'),
('a1-wortstellung-hauptsatz', 2, 'MULTIPLE_CHOICE', 'Welcher Satz ist richtig?', 'Nhớ quy tắc V2', 'Heute ich arbeite viel.', 'Ich heute arbeite viel.', 'Heute arbeite ich viel.', 'C', 'Chỉ câu C tuân thủ quy tắc V2: động từ arbeite ở vị trí thứ hai.'),
('a1-wortstellung-hauptsatz', 3, 'FILL_BLANK', '___ wohnst du? — In München.', 'Câu trả lời cho biết đang hỏi về nơi chốn', NULL, NULL, NULL, 'Wo', 'Hỏi về nơi chốn dùng wo, đứng đầu câu, động từ wohnst giữ vị trí 2.'),
('a1-wortstellung-hauptsatz', 4, 'MULTIPLE_CHOICE', 'Wie lautet die Ja/Nein-Frage zu "Du lernst Deutsch."?', 'Câu hỏi Có/Không thì động từ ở đâu?', 'Lernst du Deutsch?', 'Du lernst Deutsch?', 'Was lernst du Deutsch?', 'A', 'Câu hỏi Có/Không đưa động từ lên đầu câu: Lernst du Deutsch?')

) AS v(slug, order_index, exercise_type, prompt_de, hint_vi, option_a, option_b, option_c, correct_answer, explanation_vi)
JOIN grammar_topics t ON t.slug = v.slug
WHERE NOT EXISTS (SELECT 1 FROM grammar_exercises e WHERE e.topic_id = t.id);
