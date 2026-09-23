-- Bài tập cho 17 chủ điểm A1 chưa có bài (V45 chỉ seed lý thuyết).
-- Toàn bộ câu dưới đây soạn mới, bám đúng phần lý thuyết của từng chủ điểm; không lấy từ nguồn nào.
-- generated_by = 'MANUAL', reviewed = true: đây là bài soạn tay chứ không phải máy sinh.
--
-- Lưu ý khi sửa: logic chấm (GrammarGradingService) đã tự bỏ qua hoa/thường, khoảng trắng thừa và
-- dấu câu cuối; nhiều đáp án chấp nhận được thì ngăn bằng "/". MULTIPLE_CHOICE dùng đúng 1 chữ cái.

INSERT INTO grammar_exercises
  (topic_id, order_index, exercise_type, prompt_de, hint_vi, option_a, option_b, option_c, correct_answer, explanation_vi, generated_by, reviewed)
SELECT t.id, v.order_index, v.exercise_type, v.prompt_de, v.hint_vi, v.option_a, v.option_b, v.option_c, v.correct_answer, v.explanation_vi, 'MANUAL', true
FROM (VALUES

-- ===== Starke Verben =====
('a1-starke-verben', 0, 'CONJUGATE', 'Du ___ sehr schnell. (fahren)', 'Động từ mạnh a → ä ở ngôi du', NULL, NULL, NULL, 'fährst', 'fahren đổi a → ä ở ngôi du và er: du fährst.'),
('a1-starke-verben', 1, 'CONJUGATE', 'Er ___ kein Fleisch. (essen)', 'Động từ mạnh e → i', NULL, NULL, NULL, 'isst', 'essen đổi e → i: er isst (thân đã có -ss nên không thêm -t nữa).'),
('a1-starke-verben', 2, 'CONJUGATE', 'Sie ___ gern Bücher. (lesen)', 'Ngôi er/sie/es, kiểu đổi e → ie', NULL, NULL, NULL, 'liest', 'lesen đổi e → ie: sie liest.'),
('a1-starke-verben', 3, 'CONJUGATE', 'Wir ___ Deutsch. (sprechen)', 'Ngôi wir có đổi nguyên âm không?', NULL, NULL, NULL, 'sprechen', 'Ngôi wir KHÔNG đổi nguyên âm — chỉ du và er/sie/es mới đổi.'),
('a1-starke-verben', 4, 'MULTIPLE_CHOICE', 'Welche Form ist richtig?', NULL, 'du siehst', 'du sehst', 'du siehe', 'A', 'sehen đổi e → ie ở ngôi du: du siehst.'),
('a1-starke-verben', 5, 'MULTIPLE_CHOICE', 'Welche Form ist FALSCH?', 'Tìm dạng SAI', 'ihr fahrt', 'er schläft', 'wir läufen', 'C', 'Ngôi wir không đổi nguyên âm: phải là wir laufen, không phải wir läufen.'),

-- ===== Anrede =====
('a1-anrede', 0, 'FILL_BLANK', 'Guten Tag, Herr Müller! Woher kommen ___?', 'Nói với người lạ, lịch sự', NULL, NULL, NULL, 'Sie', 'Với người lạ dùng Sie lịch sự, luôn viết hoa.'),
('a1-anrede', 1, 'FILL_BLANK', 'Hallo Anna, wie geht es ___?', 'Bạn bè thân, một người', NULL, NULL, NULL, 'dir', 'Bạn bè dùng du; ở cách 3 (Dativ) thành dir.'),
('a1-anrede', 2, 'FILL_BLANK', 'Hallo Kinder, wo seid ___?', 'Nhiều người thân quen — nhìn động từ seid', NULL, NULL, NULL, 'ihr', 'Động từ seid chỉ đi với ngôi ihr (các bạn).'),
('a1-anrede', 3, 'MULTIPLE_CHOICE', 'Sie treffen zum ersten Mal einen neuen Kollegen. Was sagen Sie?', 'Người lạ — chọn mức lịch sự', 'Wie heißt du?', 'Wie heißen Sie?', 'Wie heißt ihr?', 'B', 'Gặp lần đầu thì mặc định dùng Sie; đổi sang du chỉ khi được mời.'),
('a1-anrede', 4, 'MULTIPLE_CHOICE', 'Welche Begrüßung ist formell?', NULL, 'Hallo!', 'Tschüss!', 'Guten Tag!', 'C', 'Guten Tag là chào trang trọng; Hallo và Tschüss là thân mật.'),

-- ===== Nomen - Komposita =====
('a1-nomen-komposita', 0, 'FILL_BLANK', 'die Hand + der Schuh = ___ Handschuh', 'Giống lấy theo từ cuối', NULL, NULL, NULL, 'der', 'Giống của từ ghép lấy theo từ CUỐI: der Schuh → der Handschuh.'),
('a1-nomen-komposita', 1, 'FILL_BLANK', 'das Haus + die Tür = ___ Haustür', 'Từ cuối là die Tür', NULL, NULL, NULL, 'die', 'Từ cuối là die Tür nên từ ghép là die Haustür.'),
('a1-nomen-komposita', 2, 'FILL_BLANK', 'die Woche + das Ende = ___ Wochenende', 'Từ cuối là das Ende', NULL, NULL, NULL, 'das', 'Từ cuối là das Ende → das Wochenende.'),
('a1-nomen-komposita', 3, 'MULTIPLE_CHOICE', 'Was bedeutet "der Bahnhof"?', 'Bahn = đường ray, Hof = sân', 'nhà ga', 'sân bay', 'bến xe buýt', 'A', 'Bahn (đường ray) + Hof (sân) = nhà ga.'),
('a1-nomen-komposita', 4, 'MULTIPLE_CHOICE', 'Welcher Artikel passt zu "das Wörterbuch"?', 'Wörter + Buch', 'der, weil Wörter maskulin ist', 'das, weil das Buch neutral ist', 'die, weil Wörter Plural ist', 'B', 'Luôn lấy giống của từ cuối cùng: das Buch → das Wörterbuch.'),

-- ===== Adjektiv =====
('a1-adjektiv', 0, 'FILL_BLANK', 'Das Auto ist ___. (neu)', 'Tính từ đứng sau động từ sein', NULL, NULL, NULL, 'neu', 'Đứng sau sein thì tính từ giữ nguyên, không thêm đuôi.'),
('a1-adjektiv', 1, 'FILL_BLANK', 'Die Bücher sind ___. (interessant)', 'Số nhiều có làm tính từ đổi không?', NULL, NULL, NULL, 'interessant', 'Sau sein, tính từ không đổi dù danh từ số nhiều.'),
('a1-adjektiv', 2, 'MULTIPLE_CHOICE', 'Das Handy kostet 900 Euro. Es ist ___.', 'Quá đắt, không mua nổi', 'sehr billig', 'zu teuer', 'ziemlich klein', 'B', 'zu = quá mức, mang nghĩa tiêu cực. sehr teuer là "rất đắt" nhưng vẫn mua được.'),
('a1-adjektiv', 3, 'MULTIPLE_CHOICE', 'Welches Wort ist das Gegenteil von "schnell"?', NULL, 'langsam', 'kurz', 'leicht', 'A', 'schnell (nhanh) ↔ langsam (chậm).'),
('a1-adjektiv', 4, 'FILL_BLANK', 'Der Film war nicht gut, er war ___. (schlecht)', 'Trái nghĩa của gut', NULL, NULL, NULL, 'schlecht', 'gut (tốt) ↔ schlecht (tệ); đứng sau war nên không đổi đuôi.'),

-- ===== Trennbare Verben =====
('a1-trennbare-verben', 0, 'WORD_ORDER', 'um 6 Uhr / ich / auf / stehe', 'Tiền tố tách ra và xuống cuối câu', NULL, NULL, NULL, 'Ich stehe um 6 Uhr auf', 'aufstehen tách được: stehe ở vị trí 2, auf xuống cuối câu.'),
('a1-trennbare-verben', 1, 'WORD_ORDER', 'heute / ein / kaufe / ich', 'einkaufen là động từ tách được', NULL, NULL, NULL, 'Ich kaufe heute ein', 'einkaufen tách: kaufe vị trí 2, ein cuối câu.'),
('a1-trennbare-verben', 2, 'FILL_BLANK', 'Ich rufe dich morgen ___. (anrufen)', 'Tiền tố nào xuống cuối?', NULL, NULL, NULL, 'an', 'anrufen tách được nên an đứng cuối câu.'),
('a1-trennbare-verben', 3, 'MULTIPLE_CHOICE', 'Welcher Satz ist richtig?', 'besuchen tách được hay không?', 'Ich be suche dich morgen.', 'Ich besuche dich morgen.', 'Ich suche dich morgen be.', 'B', 'be- là tiền tố KHÔNG tách, nên besuchen giữ nguyên một từ.'),
('a1-trennbare-verben', 4, 'MULTIPLE_CHOICE', 'Welches Verb ist NICHT trennbar?', 'Nhớ 7 tiền tố không tách: be-, emp-, ent-, er-, ge-, ver-, zer-', 'mitkommen', 'verstehen', 'aufstehen', 'B', 'ver- thuộc nhóm tiền tố không tách: ich verstehe.'),
('a1-trennbare-verben', 5, 'FILL_BLANK', 'Der Zug fährt um 8 Uhr ___. (abfahren)', NULL, NULL, NULL, NULL, 'ab', 'abfahren tách được, ab xuống cuối câu.'),

-- ===== Personalpronomen - Akkusativ =====
('a1-personalpronomen-akkusativ', 0, 'FILL_BLANK', 'Ich liebe ___. (du)', 'du ở cách 4', NULL, NULL, NULL, 'dich', 'du ở Akkusativ thành dich.'),
('a1-personalpronomen-akkusativ', 1, 'FILL_BLANK', 'Kennst du ___? (er)', 'er ở cách 4', NULL, NULL, NULL, 'ihn', 'er ở Akkusativ thành ihn.'),
('a1-personalpronomen-akkusativ', 2, 'FILL_BLANK', 'Wo ist der Schlüssel? — Ich habe ___.', 'Thay cho der Schlüssel (giống đực, cách 4)', NULL, NULL, NULL, 'ihn', 'der Schlüssel là giống đực; ở Akkusativ đại từ thay thế là ihn.'),
('a1-personalpronomen-akkusativ', 3, 'FILL_BLANK', 'Wo ist die Tasche? — Ich habe ___.', 'Thay cho die Tasche', NULL, NULL, NULL, 'sie', 'die Tasche giống cái; ở Akkusativ vẫn là sie (không đổi).'),
('a1-personalpronomen-akkusativ', 4, 'MULTIPLE_CHOICE', 'Wo ist das Buch? — Ich habe ___.', 'Thay cho das Buch', 'ihn', 'sie', 'es', 'C', 'das Buch là giống trung; đại từ thay thế ở Akkusativ là es.'),
('a1-personalpronomen-akkusativ', 5, 'FILL_BLANK', 'Der Lehrer fragt ___. (wir)', 'wir ở cách 4', NULL, NULL, NULL, 'uns', 'wir ở Akkusativ thành uns.'),

-- ===== Possessivartikel =====
('a1-possessivartikel', 0, 'FILL_BLANK', 'Das ist ___ Vater. (ich)', 'Nominativ, Vater giống đực', NULL, NULL, NULL, 'mein', 'ich → mein; Nominativ giống đực không có đuôi.'),
('a1-possessivartikel', 1, 'FILL_BLANK', 'Das ist ___ Schwester. (ich)', 'Schwester là giống cái', NULL, NULL, NULL, 'meine', 'Giống cái ở Nominativ thêm đuôi -e: meine Schwester.'),
('a1-possessivartikel', 2, 'FILL_BLANK', 'Ich besuche ___ Bruder. (ich)', 'Akkusativ, Bruder giống đực', NULL, NULL, NULL, 'meinen', 'Giống đực ở Akkusativ thêm -en: meinen Bruder.'),
('a1-possessivartikel', 3, 'MULTIPLE_CHOICE', 'Anna sucht ___ Bruder.', 'Chủ sở hữu là Anna (nữ), danh từ là Bruder (đực, cách 4)', 'seinen', 'ihren', 'ihre', 'B', 'Anna → ihr (gốc từ theo người sở hữu); Bruder đực Akkusativ → đuôi -en. Thành ihren.'),
('a1-possessivartikel', 4, 'MULTIPLE_CHOICE', 'Tom sucht ___ Schwester.', 'Chủ sở hữu là Tom (nam), danh từ Schwester (cái)', 'seine', 'ihre', 'seinen', 'A', 'Tom → sein; Schwester giống cái Akkusativ → đuôi -e. Thành seine.'),
('a1-possessivartikel', 5, 'FILL_BLANK', 'Wie ist ___ Name, bitte? (Sie)', 'Lịch sự — nhớ viết hoa', NULL, NULL, NULL, 'Ihr', 'Sie lịch sự → Ihr, luôn viết hoa; Name giống đực Nominativ không đuôi.'),

-- ===== Präteritum haben / sein =====
('a1-praeteritum-haben-sein', 0, 'FILL_BLANK', 'Gestern ___ ich krank. (sein)', 'Ngôi ich, quá khứ của sein', NULL, NULL, NULL, 'war', 'sein ở Präteritum ngôi ich là war (không đuôi).'),
('a1-praeteritum-haben-sein', 1, 'FILL_BLANK', 'Wo ___ du gestern? (sein)', 'Ngôi du', NULL, NULL, NULL, 'warst', 'Ngôi du thêm -st: du warst.'),
('a1-praeteritum-haben-sein', 2, 'FILL_BLANK', 'Wir ___ keine Zeit. (haben)', 'Ngôi wir, quá khứ của haben', NULL, NULL, NULL, 'hatten', 'haben ở Präteritum là hatte-; ngôi wir thêm -n: hatten.'),
('a1-praeteritum-haben-sein', 3, 'FILL_BLANK', 'Er ___ gestern Geburtstag. (haben)', 'Ngôi er', NULL, NULL, NULL, 'hatte', 'Ngôi ich và er/sie/es giống nhau và không có đuôi: hatte.'),
('a1-praeteritum-haben-sein', 4, 'MULTIPLE_CHOICE', 'Wie sagt man im Gespräch normalerweise?', 'Khi nói chuyện, người Đức dùng dạng nào?', 'Ich bin gestern krank gewesen.', 'Ich war gestern krank.', 'Ich habe gestern krank.', 'B', 'Với sein và haben, người Đức dùng Präteritum (war/hatte) kể cả khi nói.'),

-- ===== Zeitadverbien =====
('a1-zeitadverbien', 0, 'WORD_ORDER', 'Deutsch / lerne / heute / ich', 'Đưa heute lên đầu thì động từ vẫn vị trí 2', NULL, NULL, NULL, 'Heute lerne ich Deutsch/Ich lerne heute Deutsch', 'Cả hai trật tự đều đúng, miễn động từ giữ vị trí thứ hai.'),
('a1-zeitadverbien', 1, 'WORD_ORDER', 'nach Berlin / ich / morgen / fahre', 'Thời gian đứng trước nơi chốn', NULL, NULL, NULL, 'Ich fahre morgen nach Berlin/Morgen fahre ich nach Berlin', 'Tiếng Đức đặt thời gian trước nơi chốn — ngược với tiếng Anh.'),
('a1-zeitadverbien', 2, 'MULTIPLE_CHOICE', 'Welches Wort bedeutet 100%?', 'Tần suất cao nhất', 'oft', 'immer', 'manchmal', 'B', 'immer = luôn luôn (100%); oft ≈ 70%, manchmal ≈ 40%.'),
('a1-zeitadverbien', 3, 'MULTIPLE_CHOICE', 'Welcher Satz ist richtig?', 'Nhớ quy tắc V2', 'Morgen ich fahre nach Hause.', 'Morgen fahre ich nach Hause.', 'Ich morgen fahre nach Hause.', 'B', 'Đưa morgen lên vị trí 1 thì động từ fahre vẫn phải ở vị trí 2, chủ ngữ lùi xuống sau.'),
('a1-zeitadverbien', 4, 'FILL_BLANK', 'Ich gehe ___ ins Kino. (không bao giờ)', 'Tần suất 0%', NULL, NULL, NULL, 'nie', 'nie = không bao giờ.'),

-- ===== Pronomen - Dativ =====
('a1-pronomen-dativ', 0, 'FILL_BLANK', 'Wie geht es ___? (du)', 'Câu chào hỏi thân mật', NULL, NULL, NULL, 'dir', 'du ở Dativ thành dir. Đây là câu hỏi thăm hằng ngày.'),
('a1-pronomen-dativ', 1, 'FILL_BLANK', 'Wie geht es ___? (Sie)', 'Câu chào hỏi lịch sự — nhớ viết hoa', NULL, NULL, NULL, 'Ihnen', 'Sie lịch sự ở Dativ thành Ihnen, luôn viết hoa.'),
('a1-pronomen-dativ', 2, 'FILL_BLANK', 'Kannst du ___ helfen? (ich)', 'helfen luôn đi với Dativ', NULL, NULL, NULL, 'mir', 'helfen đòi Dativ; ich ở Dativ thành mir.'),
('a1-pronomen-dativ', 3, 'FILL_BLANK', 'Das Buch gehört ___. (er)', 'gehören đi với Dativ', NULL, NULL, NULL, 'ihm', 'er ở Dativ thành ihm.'),
('a1-pronomen-dativ', 4, 'MULTIPLE_CHOICE', 'Ich gebe ___ das Buch.', 'Người nhận là "cô ấy"', 'sie', 'ihr', 'ihnen', 'B', 'Người nhận đứng ở Dativ; sie (cô ấy) ở Dativ thành ihr.'),
('a1-pronomen-dativ', 5, 'MULTIPLE_CHOICE', 'Welche Reihenfolge ist richtig?', 'Hai tân ngữ: một đại từ, một danh từ', 'Ich gebe das Buch dir.', 'Ich gebe dir das Buch.', 'Ich gebe dir es.', 'B', 'Dativ (người) đứng trước Akkusativ (vật) khi là danh từ: Ich gebe dir das Buch.'),

-- ===== Imperativ =====
('a1-imperativ', 0, 'FILL_BLANK', '___ bitte hier! (kommen, với du)', 'Bỏ hết đuôi, bỏ luôn chủ ngữ', NULL, NULL, NULL, 'Komm', 'Imperativ ngôi du: lấy thân từ komm-, không đuôi, không chủ ngữ.'),
('a1-imperativ', 1, 'FILL_BLANK', '___ Sie bitte hier! (kommen, lịch sự)', 'Dạng Sie giữ chủ ngữ', NULL, NULL, NULL, 'Kommen', 'Dạng Sie dùng nguyên thể + Sie: Kommen Sie!'),
('a1-imperativ', 2, 'FILL_BLANK', '___ bitte lauter! (sprechen, với du)', 'Động từ mạnh e → i giữ nguyên âm đã đổi', NULL, NULL, NULL, 'Sprich', 'sprechen đổi e → i ở Imperativ ngôi du: Sprich! (không thêm -e).'),
('a1-imperativ', 3, 'MULTIPLE_CHOICE', 'Wie sagt man zu einem Kind?', 'Trẻ em dùng du', 'Kommen Sie her!', 'Komm her!', 'Kommt her!', 'B', 'Với một đứa trẻ dùng dạng du: Komm her!'),
('a1-imperativ', 4, 'MULTIPLE_CHOICE', 'Welche Form ist richtig? (fahren, du)', 'Động từ mạnh a → ä có đổi ở Imperativ không?', 'Fähr langsam!', 'Fahr langsam!', 'Fahre langsam!', 'B', 'Kiểu đổi a → ä KHÔNG áp dụng ở Imperativ: Fahr! chứ không phải Fähr!'),
('a1-imperativ', 5, 'FILL_BLANK', '___ bitte ruhig! (sein, với du)', 'sein bất quy tắc', NULL, NULL, NULL, 'Sei', 'sein ở Imperativ: Sei! / Seid! / Seien Sie!'),

-- ===== Satzstrukturen =====
('a1-satzstrukturen', 0, 'WORD_ORDER', 'ins Kino / ich / gehen / will / heute Abend', 'Modal ở vị trí 2, động từ chính xuống cuối', NULL, NULL, NULL, 'Ich will heute Abend ins Kino gehen', 'Khung câu: will ở vị trí 2, gehen ở cuối câu.'),
('a1-satzstrukturen', 1, 'WORD_ORDER', 'viel / habe / gelernt / ich / gestern', 'Perfekt cũng tạo khung câu', NULL, NULL, NULL, 'Ich habe gestern viel gelernt', 'habe ở vị trí 2, Partizip II gelernt ở cuối câu.'),
('a1-satzstrukturen', 2, 'MULTIPLE_CHOICE', 'Welcher Satz ist richtig?', 'Thời gian trước nơi chốn', 'Ich fahre nach Berlin morgen.', 'Ich fahre morgen nach Berlin.', 'Morgen ich fahre nach Berlin.', 'B', 'Thời gian (morgen) đứng trước nơi chốn (nach Berlin), và động từ giữ vị trí 2.'),
('a1-satzstrukturen', 3, 'FILL_BLANK', 'Ich habe ___ Auto. (phủ định danh từ)', 'Phủ định danh từ không xác định dùng gì?', NULL, NULL, NULL, 'kein', 'Phủ định danh từ có ein hoặc không mạo từ thì dùng kein, không dùng nicht.'),
('a1-satzstrukturen', 4, 'MULTIPLE_CHOICE', 'Wo steht "nicht"?', 'Phủ định cả câu, có động từ thứ hai', 'Ich kann nicht heute kommen.', 'Ich kann heute nicht kommen.', 'Ich nicht kann heute kommen.', 'B', 'nicht đứng gần cuối, ngay trước động từ thứ hai (kommen).'),

-- ===== Modalverben =====
('a1-modalverben', 0, 'FILL_BLANK', 'Ich ___ gut Deutsch sprechen. (können)', 'Ngôi ich của können', NULL, NULL, NULL, 'kann', 'Ngôi ich và er/sie/es của können đều là kann, không có đuôi.'),
('a1-modalverben', 1, 'FILL_BLANK', 'Du ___ mehr lernen. (müssen)', 'Ngôi du', NULL, NULL, NULL, 'musst', 'müssen ngôi du: musst (bỏ Umlaut ở số ít).'),
('a1-modalverben', 2, 'FILL_BLANK', 'Hier ___ man nicht rauchen. (dürfen)', 'man chia như ngôi er/sie/es', NULL, NULL, NULL, 'darf', 'man chia như ngôi 3 số ít: man darf.'),
('a1-modalverben', 3, 'WORD_ORDER', 'lernen / heute Abend / ich / muss / Deutsch', 'Động từ chính về cuối ở dạng nguyên thể', NULL, NULL, NULL, 'Ich muss heute Abend Deutsch lernen', 'Modal ở vị trí 2, động từ chính (nguyên thể) ở cuối câu.'),
('a1-modalverben', 4, 'MULTIPLE_CHOICE', 'Sie bestellen im Café. Was sagen Sie?', 'Chọn cách lịch sự', 'Ich will einen Kaffee.', 'Ich möchte einen Kaffee.', 'Ich muss einen Kaffee.', 'B', 'möchten lịch sự hơn wollen; wollen nghe khá cộc khi gọi món.'),
('a1-modalverben', 5, 'MULTIPLE_CHOICE', 'Was bedeutet "Du musst nicht kommen"?', 'Bẫy phủ định của müssen', 'Bạn bị cấm đến.', 'Bạn không nhất thiết phải đến.', 'Bạn nên đến.', 'B', 'müssen + nicht = không bắt buộc. Muốn nói "cấm" thì dùng dürfen nicht.'),

-- ===== Präpositionen mit Dativ =====
('a1-praeposition-dativ', 0, 'FILL_BLANK', 'Ich fahre mit ___ Bus.', 'mit đi với Dativ, Bus giống đực', NULL, NULL, NULL, 'dem', 'mit luôn đi Dativ; der Bus ở Dativ thành dem Bus.'),
('a1-praeposition-dativ', 1, 'FILL_BLANK', 'Ich komme aus ___ Schule.', 'aus đi với Dativ, Schule giống cái', NULL, NULL, NULL, 'der', 'die Schule ở Dativ thành der Schule.'),
('a1-praeposition-dativ', 2, 'FILL_BLANK', 'Ich gehe ___ Arzt. (zu + dem)', 'Dạng rút gọn của zu dem', NULL, NULL, NULL, 'zum', 'zu + dem = zum.'),
('a1-praeposition-dativ', 3, 'FILL_BLANK', 'Ich fahre ___ Arbeit. (zu + der)', 'Dạng rút gọn của zu der', NULL, NULL, NULL, 'zur', 'zu + der = zur.'),
('a1-praeposition-dativ', 4, 'MULTIPLE_CHOICE', 'Ich fliege morgen ___ Deutschland.', 'Địa danh không có mạo từ', 'zu', 'nach', 'bei', 'B', 'nach dùng với địa danh không mạo từ: nach Deutschland, nach Berlin.'),
('a1-praeposition-dativ', 5, 'MULTIPLE_CHOICE', 'Welcher Satz ist richtig?', 'seit chỉ việc bắt đầu trong quá khứ và vẫn tiếp diễn', 'Ich lerne seit zwei Jahren Deutsch.', 'Ich lerne für zwei Jahren Deutsch.', 'Ich lerne nach zwei Jahren Deutsch.', 'A', 'seit + Dativ chỉ khoảng thời gian từ quá khứ tới nay và vẫn đang tiếp diễn.'),

-- ===== Perfekt =====
('a1-perfekt', 0, 'FILL_BLANK', 'Ich ___ gestern Deutsch gelernt.', 'lernen dùng trợ động từ nào?', NULL, NULL, NULL, 'habe', 'lernen không chỉ di chuyển nên dùng haben.'),
('a1-perfekt', 1, 'FILL_BLANK', 'Er ___ nach Berlin gefahren.', 'fahren chỉ sự di chuyển', NULL, NULL, NULL, 'ist', 'Động từ chỉ di chuyển dùng sein: er ist gefahren.'),
('a1-perfekt', 2, 'FILL_BLANK', 'Ich habe viel ___. (machen)', 'Partizip II của động từ yếu', NULL, NULL, NULL, 'gemacht', 'Động từ yếu: ge- + thân + -t → gemacht.'),
('a1-perfekt', 3, 'FILL_BLANK', 'Wir haben Kaffee ___. (trinken)', 'Partizip II của động từ mạnh', NULL, NULL, NULL, 'getrunken', 'trinken là động từ mạnh: getrunken.'),
('a1-perfekt', 4, 'MULTIPLE_CHOICE', 'Wie lautet das Partizip II von "besuchen"?', 'be- là tiền tố không tách', 'gebesucht', 'besucht', 'besuchgt', 'B', 'Động từ có tiền tố không tách (be-, ver-, er-...) KHÔNG thêm ge-: besucht.'),
('a1-perfekt', 5, 'MULTIPLE_CHOICE', 'Wie lautet das Partizip II von "studieren"?', 'Đuôi -ieren', 'gestudiert', 'studiert', 'studiegt', 'B', 'Động từ kết thúc -ieren không có ge-: studiert.'),
('a1-perfekt', 6, 'WORD_ORDER', 'gelernt / ich / gestern / habe / viel', 'Partizip II ở cuối câu', NULL, NULL, NULL, 'Ich habe gestern viel gelernt', 'habe ở vị trí 2, gelernt ở cuối câu.'),

-- ===== Hauptsätze - Konjunktionen =====
('a1-hauptsatz-konjunktionen', 0, 'FILL_BLANK', 'Ich bleibe zu Hause, ___ ich bin krank.', 'Liên từ giữ trật tự V2, nghĩa "bởi vì"', NULL, NULL, NULL, 'denn', 'denn = bởi vì, và KHÔNG làm đổi trật tự từ (bin vẫn ở vị trí 2).'),
('a1-hauptsatz-konjunktionen', 1, 'FILL_BLANK', 'Das ist teuer, ___ ich kaufe es.', 'Nghĩa "nhưng"', NULL, NULL, NULL, 'aber', 'aber = nhưng.'),
('a1-hauptsatz-konjunktionen', 2, 'FILL_BLANK', 'Das ist nicht billig, ___ teuer.', 'Vế trước là phủ định, vế sau sửa lại', NULL, NULL, NULL, 'sondern', 'sondern dùng khi vế trước phủ định và vế sau sửa lại điều đó.'),
('a1-hauptsatz-konjunktionen', 3, 'MULTIPLE_CHOICE', 'Welcher Satz ist richtig?', 'denn có đổi trật tự từ không?', 'Ich komme nicht, denn ich keine Zeit habe.', 'Ich komme nicht, denn ich habe keine Zeit.', 'Ich komme nicht, denn habe ich keine Zeit.', 'B', 'Sau denn, câu giữ nguyên quy tắc V2: habe ở vị trí thứ hai.'),
('a1-hauptsatz-konjunktionen', 4, 'MULTIPLE_CHOICE', 'Welches Wort passt: "Ich trinke Tee ___ Kaffee."?', 'Đưa ra hai lựa chọn', 'und', 'oder', 'sondern', 'B', 'oder = hoặc, dùng khi nêu lựa chọn.'),

-- ===== Präpositionen mit Akkusativ =====
('a1-praeposition-akkusativ', 0, 'FILL_BLANK', 'Das Geschenk ist für ___ Lehrer.', 'für đi với Akkusativ, Lehrer giống đực', NULL, NULL, NULL, 'den', 'für luôn đi Akkusativ; der Lehrer ở Akkusativ thành den Lehrer.'),
('a1-praeposition-akkusativ', 1, 'FILL_BLANK', 'Wir gehen durch ___ Park.', 'durch đi với Akkusativ, Park giống đực', NULL, NULL, NULL, 'den', 'durch + Akkusativ; der Park → den Park.'),
('a1-praeposition-akkusativ', 2, 'FILL_BLANK', 'Das Buch ist für ___ Frau.', 'Frau giống cái — có đổi không?', NULL, NULL, NULL, 'die', 'Giống cái không đổi ở Akkusativ: die Frau.'),
('a1-praeposition-akkusativ', 3, 'FILL_BLANK', 'Ich trinke Kaffee ___ Zucker. (không có)', 'Giới từ nghĩa "không có"', NULL, NULL, NULL, 'ohne', 'ohne = không có, luôn đi với Akkusativ.'),
('a1-praeposition-akkusativ', 4, 'MULTIPLE_CHOICE', 'Der Kurs beginnt ___ 9 Uhr.', 'Chỉ giờ chính xác', 'gegen', 'um', 'für', 'B', 'um dùng cho giờ chính xác; gegen là giờ áng chừng.'),
('a1-praeposition-akkusativ', 5, 'MULTIPLE_CHOICE', 'Welche Präposition steht NICHT mit Akkusativ?', 'Nhớ DOG FU: durch, ohne, gegen, für, um', 'gegen', 'ohne', 'mit', 'C', 'mit thuộc nhóm luôn đi với Dativ, không phải Akkusativ.')

) AS v(slug, order_index, exercise_type, prompt_de, hint_vi, option_a, option_b, option_c, correct_answer, explanation_vi)
JOIN grammar_topics t ON t.slug = v.slug
-- Không chèn nếu chủ điểm đó đã có bài (admin có thể đã tự soạn trên môi trường đang chạy).
WHERE NOT EXISTS (SELECT 1 FROM grammar_exercises e WHERE e.topic_id = t.id);
