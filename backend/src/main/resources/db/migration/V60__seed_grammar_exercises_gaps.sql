-- Bài tập cho 7 chủ điểm bổ sung ở V59. Soạn tay, bám đúng lý thuyết.
-- V61 sẽ rải đều đáp án trắc nghiệm — quy trình cố định từ sau V58.

INSERT INTO grammar_exercises
  (topic_id, order_index, exercise_type, prompt_de, hint_vi, option_a, option_b, option_c, correct_answer, explanation_vi, generated_by, reviewed)
SELECT t.id, v.order_index, v.exercise_type, v.prompt_de, v.hint_vi, v.option_a, v.option_b, v.option_c, v.correct_answer, v.explanation_vi, 'MANUAL', true
FROM (VALUES

-- ===== Negation =====
('a2-negation', 0, 'FILL_BLANK', 'Ich habe ___ Auto. (tôi không có xe nào)', 'Danh từ có ein hoặc không mạo từ', NULL, NULL, NULL, 'kein', 'Phủ định danh từ có ein hoặc không mạo từ thì dùng kein.'),
('a2-negation', 1, 'FILL_BLANK', 'Ich habe das Auto ___. (không có CHIẾC xe đó)', 'Danh từ có mạo từ xác định', NULL, NULL, NULL, 'nicht', 'Danh từ đã có mạo từ xác định thì phủ định bằng nicht.'),
('a2-negation', 2, 'MULTIPLE_CHOICE', 'Wo steht "nicht"?', 'Có động từ thứ hai', 'Ich kann nicht heute kommen.', 'Ich kann heute nicht kommen.', 'Ich nicht kann heute kommen.', 'B', 'nicht đứng gần cuối, ngay trước động từ thứ hai (kommen).'),
('a2-negation', 3, 'MULTIPLE_CHOICE', 'Was bedeutet "Ich arbeite nicht mehr hier"?', 'Phân biệt nicht mehr với noch nicht', 'Tôi chưa làm ở đây.', 'Tôi không còn làm ở đây nữa.', 'Tôi không muốn làm ở đây.', 'B', 'nicht mehr = không còn nữa; noch nicht = chưa.'),
('a2-negation', 4, 'MULTIPLE_CHOICE', 'Hast du keine Zeit? — ___! (Có chứ, tôi có thời gian)', 'Phản bác câu hỏi phủ định', 'Ja', 'Nein', 'Doch', 'C', 'Phản bác câu hỏi phủ định phải dùng doch, không dùng ja.'),
('a2-negation', 5, 'FILL_BLANK', 'Ich trinke ___ Kaffee. (không uống cà phê)', 'Danh từ không có mạo từ', NULL, NULL, NULL, 'keinen', 'Kaffee không mạo từ nên dùng kein; giống đực Akkusativ thành keinen.'),

-- ===== Relativsätze =====
('b1-relativsatz', 0, 'FILL_BLANK', 'Das ist der Mann, ___ mir geholfen hat.', 'Đại từ làm chủ ngữ của mệnh đề quan hệ', NULL, NULL, NULL, 'der', 'Giống đực (Mann) + Nominativ (chủ ngữ của "geholfen hat") → der.'),
('b1-relativsatz', 1, 'FILL_BLANK', 'Das ist der Mann, ___ ich gesehen habe.', 'Lần này đại từ là TÂN NGỮ', NULL, NULL, NULL, 'den', 'Giống đực + Akkusativ (tân ngữ của "gesehen habe") → den.'),
('b1-relativsatz', 2, 'FILL_BLANK', 'Die Frau, ___ in Berlin wohnt, ist meine Schwester.', 'Giống cái, Nominativ', NULL, NULL, NULL, 'die', 'Giống cái + Nominativ → die.'),
('b1-relativsatz', 3, 'MULTIPLE_CHOICE', 'Die Frau, ___ ich gesprochen habe, ist Ärztin.', 'sprechen mit + Dativ', 'mit der', 'mit die', 'mit den', 'A', 'mit đòi Dativ; giống cái ở Dativ là der → mit der.'),
('b1-relativsatz', 4, 'MULTIPLE_CHOICE', 'Das sind die Kinder, ___ ich geholfen habe.', 'helfen + Dativ, số nhiều', 'die', 'denen', 'deren', 'B', 'Dativ số nhiều của đại từ quan hệ là denen — khác mạo từ xác định (den).'),
('b1-relativsatz', 5, 'FILL_BLANK', 'Das ist der Mann, ___ Auto gestohlen wurde.', 'Xe CỦA ông ấy — Genitiv', NULL, NULL, NULL, 'dessen', 'Genitiv giống đực của đại từ quan hệ là dessen.'),
('b1-relativsatz', 6, 'MULTIPLE_CHOICE', 'Alles, ___ du sagst, ist richtig.', 'Bezugswort là "alles"', 'das', 'was', 'wo', 'B', 'Sau alles, nichts, etwas, das thì dùng was.'),
('b1-relativsatz', 7, 'WORD_ORDER', 'der / Das ist der Film / gefallen hat / mir', 'Động từ xuống cuối mệnh đề quan hệ', NULL, NULL, NULL, 'Das ist der Film der mir gefallen hat', 'Mệnh đề quan hệ là mệnh đề phụ nên động từ chia đứng cuối.'),

-- ===== Adjektivdeklination ohne Artikel =====
('b1-adjektivdeklination-ohne-artikel', 0, 'FILL_BLANK', 'Ich trinke ___ Wasser. (kalt, không mạo từ)', 'Giống trung, Akkusativ, đuôi mạnh', NULL, NULL, NULL, 'kaltes', 'Không mạo từ nên tính từ mang đuôi của das → kaltes.'),
('b1-adjektivdeklination-ohne-artikel', 1, 'FILL_BLANK', '___ Wein ist teuer. (gut, giống đực Nominativ)', 'Đuôi mạnh giống đực', NULL, NULL, NULL, 'Guter', 'Giống đực Nominativ không mạo từ → guter (theo der).'),
('b1-adjektivdeklination-ohne-artikel', 2, 'FILL_BLANK', 'Sie hat ___ Freunde. (nett, số nhiều Akkusativ)', 'Số nhiều không mạo từ', NULL, NULL, NULL, 'nette', 'Số nhiều Akkusativ đuôi mạnh là -e → nette Freunde.'),
('b1-adjektivdeklination-ohne-artikel', 3, 'MULTIPLE_CHOICE', 'Welche Endung ist richtig? "Ich esse gern ___ Brot." (frisch)', 'Brot là giống trung', 'frischer', 'frisches', 'frischen', 'B', 'Giống trung Akkusativ không mạo từ → frisches (theo das).'),
('b1-adjektivdeklination-ohne-artikel', 4, 'MULTIPLE_CHOICE', 'Nach "viele" benutzt man welche Endung?', 'viele có tính là mạo từ không?', 'schwache Endung (-en)', 'starke Endung wie ohne Artikel', 'gar keine Endung', 'B', 'viele, wenige, einige, mehrere không tính là mạo từ nên tính từ vẫn dùng đuôi mạnh.'),
('b1-adjektivdeklination-ohne-artikel', 5, 'MULTIPLE_CHOICE', 'Welcher Satz ist richtig?', 'Sau alle dùng đuôi nào?', 'alle guter Bücher', 'alle gute Bücher', 'alle guten Bücher', 'C', 'alle, beide, diese biến cách như mạo từ xác định nên tính từ dùng đuôi yếu -en.'),

-- ===== Konjunktiv I =====
('b2-konjunktiv-1', 0, 'FILL_BLANK', 'Er sagt, er ___ keine Zeit. (haben, Konjunktiv I)', 'Ngôi er của haben', NULL, NULL, NULL, 'habe', 'Konjunktiv I ngôi er: habe (khác dạng thường hat).'),
('b2-konjunktiv-1', 1, 'FILL_BLANK', 'Sie sagt, sie ___ krank. (sein, Konjunktiv I)', 'sein là động từ bất quy tắc', NULL, NULL, NULL, 'sei', 'sein ở Konjunktiv I ngôi er/sie/es là sei.'),
('b2-konjunktiv-1', 2, 'MULTIPLE_CHOICE', 'Warum benutzt man in "Sie sagen, sie hätten keine Zeit" Konjunktiv II?', 'Konjunktiv I của wir/sie trùng dạng thường', 'Weil Konjunktiv I hier gleich wie Präsens wäre.', 'Weil Konjunktiv I nicht existiert.', 'Weil es Vergangenheit ist.', 'A', 'Konjunktiv I "haben" trùng hệt Präsens "haben" nên phải chuyển sang Konjunktiv II.'),
('b2-konjunktiv-1', 3, 'MULTIPLE_CHOICE', 'Wie lautet die indirekte Rede zu "Ich war krank"?', 'Mọi thì quá khứ gộp thành một dạng', 'Er sagte, er war krank.', 'Er sagte, er sei krank gewesen.', 'Er sagte, er wäre krank.', 'B', 'Quá khứ trong lời dẫn gián tiếp: sei/habe + Partizip II.'),
('b2-konjunktiv-1', 4, 'MULTIPLE_CHOICE', 'Wo liest man Konjunktiv I am häufigsten?', NULL, 'in SMS an Freunde', 'in Zeitungsartikeln', 'in Kochrezepten', 'B', 'Konjunktiv I là dạng của lời dẫn gián tiếp trong báo chí và văn bản trang trọng.'),
('b2-konjunktiv-1', 5, 'FILL_BLANK', '"Ich komme morgen." → Er sagte, er ___ am nächsten Tag. (kommen)', 'Ngôi er, Konjunktiv I', NULL, NULL, NULL, 'komme', 'Konjunktiv I ngôi er của kommen là komme; "morgen" cũng đổi thành "am nächsten Tag".'),

-- ===== Passiv erweitert =====
('b2-passiv-erweitert', 0, 'MULTIPLE_CHOICE', 'Was bedeutet "Die Tür ist geöffnet"?', 'Zustandspassiv hay Vorgangspassiv?', 'Cửa đang được mở ra.', 'Cửa đang ở trạng thái mở.', 'Cửa sẽ được mở.', 'B', 'sein + Partizip II là Zustandspassiv — chỉ trạng thái kết quả.'),
('b2-passiv-erweitert', 1, 'FILL_BLANK', 'Das Haus ist gebaut ___. (Perfekt Passiv)', 'Dạng đặc biệt của werden', NULL, NULL, NULL, 'worden', 'Perfekt bị động dùng worden, không phải geworden.'),
('b2-passiv-erweitert', 2, 'MULTIPLE_CHOICE', 'Welcher Satz bedeutet dasselbe wie "Das Problem kann gelöst werden"?', 'Dạng thay thế bị động', 'Das Problem lässt sich lösen.', 'Das Problem löst sich.', 'Das Problem wird gelöst haben.', 'A', 'sich lassen + nguyên thể là một trong bốn dạng thay thế bị động.'),
('b2-passiv-erweitert', 3, 'FILL_BLANK', 'Das Problem ist lös___. (tính từ đuôi chỉ khả năng)', 'Hậu tố chỉ "có thể ... được"', NULL, NULL, NULL, 'bar', 'Hậu tố -bar biến động từ thành tính từ mang nghĩa bị động: lösbar.'),
('b2-passiv-erweitert', 4, 'MULTIPLE_CHOICE', 'Welches Verb hat KEIN Passiv?', 'Động từ không có tân ngữ Akkusativ', 'reparieren', 'gehören', 'bauen', 'B', 'gehören đi với Dativ, không có tân ngữ Akkusativ nên không chuyển bị động được.'),
('b2-passiv-erweitert', 5, 'WORD_ORDER', 'ausgefüllt / Das Formular / werden / muss', 'Bị động với động từ khiếm khuyết', NULL, NULL, NULL, 'Das Formular muss ausgefüllt werden', 'Modal ở vị trí 2, Partizip II + werden ở cuối câu.'),

-- ===== Nominalisierung =====
('b2-nominalisierung', 0, 'MULTIPLE_CHOICE', 'Wie lautet "Weil es regnete, blieben wir zu Hause" im Nominalstil?', 'weil → giới từ nào?', 'Wegen des Regens blieben wir zu Hause.', 'Wegen der Regen blieben wir zu Hause.', 'Trotz des Regens blieben wir zu Hause.', 'A', 'weil (nguyên nhân) chuyển thành wegen + Genitiv.'),
('b2-nominalisierung', 1, 'FILL_BLANK', '"Obwohl es teuer war..." → ___ des hohen Preises...', 'obwohl → giới từ nào?', NULL, NULL, NULL, 'Trotz', 'obwohl (nhượng bộ) chuyển thành trotz + Genitiv.'),
('b2-nominalisierung', 2, 'FILL_BLANK', '"Nachdem er angekommen war..." → ___ seiner Ankunft...', 'nachdem → giới từ nào?', NULL, NULL, NULL, 'Nach', 'nachdem chuyển thành nach + Dativ.'),
('b2-nominalisierung', 3, 'FILL_BLANK', 'prüfen → die ___', 'Hậu tố danh từ hoá phổ biến nhất', NULL, NULL, NULL, 'Prüfung', 'Hậu tố -ung biến động từ thành danh từ giống cái.'),
('b2-nominalisierung', 4, 'MULTIPLE_CHOICE', 'Wo benutzt man den Nominalstil am meisten?', NULL, 'im Gespräch mit Freunden', 'in Behörden- und Vertragstexten', 'in Kinderbüchern', 'B', 'Lối danh từ đặc trưng cho văn bản hành chính, hợp đồng, báo chí.'),
('b2-nominalisierung', 5, 'MULTIPLE_CHOICE', 'Welches Nomen gehört zu "möglich"?', 'Danh từ hoá tính từ', 'die Möglichkeit', 'das Mögliche', 'die Möglichung', 'A', 'Tính từ + -keit/-heit tạo danh từ: möglich → die Möglichkeit.'),

-- ===== Modalpartikeln =====
('b2-modalpartikel', 0, 'MULTIPLE_CHOICE', 'Welcher Satz klingt freundlicher?', 'Tiểu từ làm câu hỏi bớt cộc', 'Was machst du da?', 'Was machst du denn da?', 'Was du da machst?', 'B', 'denn trong câu hỏi làm giọng nghe tò mò, thân thiện thay vì tra hỏi.'),
('b2-modalpartikel', 1, 'FILL_BLANK', 'Kannst du mir ___ helfen? (làm lời đề nghị nhẹ đi)', 'Tiểu từ mềm hoá đề nghị', NULL, NULL, NULL, 'mal', 'mal làm lời đề nghị nhẹ và thân mật hơn.'),
('b2-modalpartikel', 2, 'MULTIPLE_CHOICE', 'Was drückt "Das ist ja teuer!" aus?', NULL, 'một nhận xét trung tính', 'sự ngạc nhiên', 'một câu hỏi', 'B', 'ja ở đây thể hiện ngạc nhiên trước điều vừa nhận ra.'),
('b2-modalpartikel', 3, 'MULTIPLE_CHOICE', 'Wo stehen Modalpartikeln im Satz?', NULL, 'auf Position 1', 'in der Satzmitte', 'immer am Satzende', 'B', 'Modalpartikel luôn nằm giữa câu, không bao giờ ở vị trí 1.'),
('b2-modalpartikel', 4, 'MULTIPLE_CHOICE', 'Was bedeutet "Das ist eben so"?', NULL, 'Chuyện đó vốn vậy, đành chấp nhận.', 'Chuyện đó vừa mới xảy ra.', 'Chuyện đó không đúng.', 'A', 'eben (hoặc halt) thể hiện sự chấp nhận điều đã rồi.'),
('b2-modalpartikel', 5, 'FILL_BLANK', 'Komm ___ mal her! (thúc giục nhẹ nhàng)', 'Ghép với mal thành cụm rất thông dụng', NULL, NULL, NULL, 'doch', 'doch mal là cặp tiểu từ ghép hay gặp nhất, làm lời mời gọi nghe mềm.')

) AS v(slug, order_index, exercise_type, prompt_de, hint_vi, option_a, option_b, option_c, correct_answer, explanation_vi)
JOIN grammar_topics t ON t.slug = v.slug
WHERE NOT EXISTS (SELECT 1 FROM grammar_exercises e WHERE e.topic_id = t.id);
