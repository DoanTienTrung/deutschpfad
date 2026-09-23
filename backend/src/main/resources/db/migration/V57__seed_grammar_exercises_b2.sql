-- Bài tập cho 12 chủ điểm B2. Soạn tay, bám đúng lý thuyết ở V56.
-- Đáp án trắc nghiệm sẽ được V58 rải đều — không tin vào việc tự nhớ rải khi soạn, xem ghi chú
-- trong docs/phase-5-grammar.md (lỗi này đã lặp lại hai lần ở V49 và V55).

INSERT INTO grammar_exercises
  (topic_id, order_index, exercise_type, prompt_de, hint_vi, option_a, option_b, option_c, correct_answer, explanation_vi, generated_by, reviewed)
SELECT t.id, v.order_index, v.exercise_type, v.prompt_de, v.hint_vi, v.option_a, v.option_b, v.option_c, v.correct_answer, v.explanation_vi, 'MANUAL', true
FROM (VALUES

-- ===== Nomen - Genus =====
('b2-nomen-genus', 0, 'FILL_BLANK', '___ Lösung', 'Đuôi -ung', NULL, NULL, NULL, 'die', 'Đuôi -ung luôn là giống cái.'),
('b2-nomen-genus', 1, 'FILL_BLANK', '___ Zentrum', 'Đuôi -um', NULL, NULL, NULL, 'das', 'Đuôi -um luôn là giống trung.'),
('b2-nomen-genus', 2, 'FILL_BLANK', '___ Frühling', 'Đuôi -ling', NULL, NULL, NULL, 'der', 'Đuôi -ling là giống đực.'),
('b2-nomen-genus', 3, 'MULTIPLE_CHOICE', 'Warum ist "das Mädchen" neutral?', 'Quy tắc nào thắng?', 'Weil die Endung -chen stärker ist als die Bedeutung.', 'Weil Mädchen kein Geschlecht haben.', 'Weil es ein Fremdwort ist.', 'A', 'Đuôi từ thắng nghĩa: -chen luôn là giống trung dù từ chỉ người nữ.'),
('b2-nomen-genus', 4, 'MULTIPLE_CHOICE', 'Welches Wort ist die AUSNAHME bei den Tageszeiten?', 'Các buổi đều giống đực, trừ một từ', 'der Abend', 'die Nacht', 'der Morgen', 'B', 'die Nacht là ngoại lệ duy nhất; các buổi khác đều giống đực.'),
('b2-nomen-genus', 5, 'MULTIPLE_CHOICE', 'Welches Wort ist NICHT neutral?', 'Đuôi -ment thường là giống trung', 'das Argument', 'das Dokument', 'der Moment', 'C', 'der Moment và der Zement là hai ngoại lệ của đuôi -ment.'),

-- ===== Nomen - Numerus =====
('b2-nomen-numerus', 0, 'FILL_BLANK', 'das Kind → die ___', 'Giống trung đơn âm tiết', NULL, NULL, NULL, 'Kinder', 'Giống trung đơn âm tiết thường thêm -er: die Kinder.'),
('b2-nomen-numerus', 1, 'FILL_BLANK', 'das Buch → die ___', 'Thêm -er kèm Umlaut', NULL, NULL, NULL, 'Bücher', 'Buch → Bücher (thêm -er và Umlaut).'),
('b2-nomen-numerus', 2, 'FILL_BLANK', 'die Lehrerin → die ___', 'Đuôi -in chỉ nghề nữ', NULL, NULL, NULL, 'Lehrerinnen', 'Đuôi -in thêm -nen ở số nhiều.'),
('b2-nomen-numerus', 3, 'MULTIPLE_CHOICE', 'Welcher Plural ist richtig? (der Lehrer)', 'Đuôi -er ở giống đực', 'die Lehrers', 'die Lehrere', 'die Lehrer', 'C', 'Giống đực/trung đuôi -er, -el, -en thường không đổi ở số nhiều.'),
('b2-nomen-numerus', 4, 'FILL_BLANK', 'Ich spiele mit den ___. (die Kinder, Dativ Plural)', 'Dativ số nhiều thêm gì?', NULL, NULL, NULL, 'Kindern', 'Dativ số nhiều phải thêm -n nếu chưa có: den Kindern.'),
('b2-nomen-numerus', 5, 'MULTIPLE_CHOICE', 'Welches Wort gibt es NUR im Plural?', NULL, 'die Milch', 'die Leute', 'das Obst', 'B', 'die Leute chỉ có số nhiều; muốn chỉ một người thì dùng eine Person.'),

-- ===== Nomen - Kasus =====
('b2-nomen-kasus', 0, 'MULTIPLE_CHOICE', 'Mit welcher Frage findet man den Dativ?', NULL, 'Wen?', 'Wem?', 'Wessen?', 'B', 'Dativ trả lời câu hỏi Wem? (cho ai).'),
('b2-nomen-kasus', 1, 'FILL_BLANK', 'Ich helfe ___ Mann. (der)', 'helfen đòi cách nào?', NULL, NULL, NULL, 'dem', 'helfen luôn đi với Dativ: dem Mann.'),
('b2-nomen-kasus', 2, 'FILL_BLANK', 'Ich warte auf ___ Bus. (der)', 'Giới từ auf quyết định cách', NULL, NULL, NULL, 'den', 'warten auf + Akkusativ; giới từ thắng vai trò trong câu.'),
('b2-nomen-kasus', 3, 'MULTIPLE_CHOICE', 'Welches Verb verlangt den DATIV?', NULL, 'sehen', 'kaufen', 'gehören', 'C', 'gehören thuộc nhóm động từ đòi Dativ, cùng helfen, danken, gefallen.'),
('b2-nomen-kasus', 4, 'WORD_ORDER', 'dem Kind / gebe / einen Apfel / Ich', 'Dativ trước Akkusativ khi cả hai là danh từ', NULL, NULL, NULL, 'Ich gebe dem Kind einen Apfel', 'Hai danh từ thì người nhận (Dativ) đứng trước vật (Akkusativ).'),
('b2-nomen-kasus', 5, 'MULTIPLE_CHOICE', 'Was bedeutet "Kongruenz"?', NULL, 'Mạo từ, tính từ và danh từ phải cùng giống, số, cách.', 'Danh từ luôn viết hoa.', 'Động từ đứng ở vị trí thứ hai.', 'A', 'Kongruenz là sự hoà hợp trong cụm danh từ.'),

-- ===== n-Deklination =====
('b2-n-deklination', 0, 'FILL_BLANK', 'Ich kenne den ___. (der Student)', NULL, NULL, NULL, NULL, 'Studenten', 'n-Deklination: Akkusativ số ít thêm -en.'),
('b2-n-deklination', 1, 'FILL_BLANK', 'Ich schreibe ___ Müller. (Herr, Dativ)', 'der Herr có dạng riêng', NULL, NULL, NULL, 'Herrn', 'der Herr ở số ít các cách khác Nominativ chỉ thêm -n.'),
('b2-n-deklination', 2, 'FILL_BLANK', 'Was ist der Genitiv von "der Name"? — des ___', 'Nhóm hỗn hợp', NULL, NULL, NULL, 'Namens', 'Nhóm hỗn hợp có Genitiv -ns: des Namens.'),
('b2-n-deklination', 3, 'MULTIPLE_CHOICE', 'Welches Nomen der Mischgruppe ist NEUTRAL?', 'Nhóm hỗn hợp toàn giống đực, trừ một từ', 'der Gedanke', 'das Herz', 'der Wille', 'B', 'das Herz là danh từ giống trung duy nhất trong nhóm hỗn hợp.'),
('b2-n-deklination', 4, 'MULTIPLE_CHOICE', 'Welches Nomen gehört NICHT zur n-Deklination?', 'Nhóm này toàn giống đực', 'der Junge', 'der Polizist', 'der Lehrer', 'C', 'der Lehrer không thuộc n-Deklination; Junge và Polizist thì có.'),
('b2-n-deklination', 5, 'MULTIPLE_CHOICE', 'Welcher Satz ist richtig?', NULL, 'Sehr geehrter Herrn Müller', 'Sehr geehrter Herr Müller', 'Sehr geehrter Herren Müller', 'B', 'Lời chào thư dùng Nominativ nên là Herr, không thêm -n.'),

-- ===== Wortstellung =====
('b2-wortstellung', 0, 'WORD_ORDER', 'nach Berlin / mit dem Zug / Ich fahre / heute', 'TE-KA-MO-LO: thời gian trước, nơi chốn cuối', NULL, NULL, NULL, 'Ich fahre heute mit dem Zug nach Berlin', 'Thứ tự TE (heute) → MO (mit dem Zug) → LO (nach Berlin).'),
('b2-wortstellung', 1, 'MULTIPLE_CHOICE', 'Welche Reihenfolge ist richtig? (zwei Pronomen)', 'Cả hai đều là đại từ', 'Ich gebe ihm es.', 'Ich gebe es ihm.', 'Ich gebe es ihn.', 'B', 'Hai đại từ thì Akkusativ đứng trước Dativ: es ihm.'),
('b2-wortstellung', 2, 'MULTIPLE_CHOICE', 'Wo steht das Präpositionalobjekt?', 'Tân ngữ giới từ đứng đâu?', 'ganz am Anfang', 'direkt nach dem Verb', 'am Ende, vor dem zweiten Verb', 'C', 'Tân ngữ giới từ đứng sau mọi bổ ngữ, ngay trước động từ cuối câu.'),
('b2-wortstellung', 3, 'WORD_ORDER', 'auf dich / Ich habe / gewartet / lange / gestern', 'Tân ngữ giới từ gần cuối', NULL, NULL, NULL, 'Ich habe gestern lange auf dich gewartet', 'gestern (TE) → lange (MO) → auf dich (tân ngữ giới từ) → gewartet.'),
('b2-wortstellung', 4, 'MULTIPLE_CHOICE', 'Wie viele Satzglieder dürfen auf Position 1 stehen?', 'Quy tắc V2', 'nur eins', 'zwei', 'beliebig viele', 'A', 'Chỉ một thành phần ở vị trí 1, để động từ giữ được vị trí 2.'),
('b2-wortstellung', 5, 'MULTIPLE_CHOICE', 'Welcher Satz ist richtig?', 'Một danh từ, một đại từ', 'Ich gebe das Buch ihm.', 'Ich gebe ihm das Buch.', 'Ich gebe das Buch ihn.', 'B', 'Đại từ luôn được ưu tiên ra trước danh từ.'),

-- ===== Präpositionen =====
('b2-praeposition-kasus', 0, 'FILL_BLANK', 'Wir sprechen über ___ Projekt. (das)', 'über + Akkusativ khi nói VỀ chủ đề', NULL, NULL, NULL, 'das', 'über nghĩa "về" đi với Akkusativ; das Buch giống trung không đổi.'),
('b2-praeposition-kasus', 1, 'FILL_BLANK', 'Die Lampe hängt über ___ Tisch. (der)', 'über + Dativ khi chỉ vị trí phía trên', NULL, NULL, NULL, 'dem', 'über nghĩa "phía trên" (Wo?) đi với Dativ.'),
('b2-praeposition-kasus', 2, 'MULTIPLE_CHOICE', 'Ich hänge das Bild ___ Wand.', 'Treo LÊN — có di chuyển', 'an der', 'an die', 'an dem', 'B', 'Wohin? → Akkusativ: an die Wand.'),
('b2-praeposition-kasus', 3, 'FILL_BLANK', '___ des Regens bleiben wir zu Hause.', 'Giới từ + Genitiv', NULL, NULL, NULL, 'Wegen', 'wegen + Genitiv là dạng chuẩn mực.'),
('b2-praeposition-kasus', 4, 'MULTIPLE_CHOICE', 'Welche Präposition steht mit verschiedenem Kasus?', 'Nhóm đổi cách theo nghĩa', 'für', 'über', 'mit', 'B', 'über đi Akkusativ khi nghĩa "về", Dativ khi nghĩa "phía trên".'),
('b2-praeposition-kasus', 5, 'MULTIPLE_CHOICE', 'Welche Form ist in der Prüfung korrekt?', 'Chuẩn mực văn viết', 'trotz dem Regen', 'trotz des Regens', 'trotz der Regen', 'B', 'trotz + Genitiv là chuẩn mực; Dativ phổ biến khi nói nhưng không dùng trong bài thi.'),

-- ===== Modale Nebensätze =====
('b2-nebensatz-modal', 0, 'FILL_BLANK', 'Man lernt eine Sprache, ___ man sie täglich spricht.', 'Bằng cách nào', NULL, NULL, NULL, 'indem', 'indem trả lời câu hỏi Wie? — chỉ phương tiện đạt mục đích.'),
('b2-nebensatz-modal', 1, 'MULTIPLE_CHOICE', 'Ich lerne Deutsch, ___ ich Filme schaue. (xem phim là CÁCH học)', 'Phân biệt indem với während', 'während', 'indem', 'obwohl', 'B', 'indem chỉ phương tiện; während chỉ hai việc cùng lúc, không có quan hệ phương tiện.'),
('b2-nebensatz-modal', 2, 'MULTIPLE_CHOICE', 'Er ging, ___ ich es merkte. (mà tôi không nhận ra)', 'Hai vế KHÁC chủ ngữ', 'ohne zu', 'ohne dass', 'ohne', 'B', 'Khác chủ ngữ (er / ich) thì phải dùng ohne dass + mệnh đề.'),
('b2-nebensatz-modal', 3, 'FILL_BLANK', 'Er ging, ohne etwas ___ sagen.', 'Cùng chủ ngữ', NULL, NULL, NULL, 'zu', 'Cùng chủ ngữ thì dùng ohne ... zu + nguyên thể.'),
('b2-nebensatz-modal', 4, 'WORD_ORDER', 'indem / spricht / man / sie täglich', 'Động từ xuống cuối', NULL, NULL, NULL, 'indem man sie täglich spricht', 'indem đẩy động từ chia xuống cuối mệnh đề.'),
('b2-nebensatz-modal', 5, 'MULTIPLE_CHOICE', 'Was bedeutet "anstatt zu arbeiten, schläft er"?', NULL, 'Anh ta vừa làm vừa ngủ.', 'Anh ta ngủ thay vì làm việc.', 'Anh ta ngủ sau khi làm việc.', 'B', 'anstatt ... zu = thay vì.'),

-- ===== Konsekutive Nebensätze =====
('b2-nebensatz-konsekutiv', 0, 'FILL_BLANK', 'Es regnete stark, ___ wir zu Hause blieben.', 'Đến nỗi mà', NULL, NULL, NULL, 'sodass/so dass', 'sodass (hoặc so dass) chỉ hệ quả.'),
('b2-nebensatz-konsekutiv', 1, 'MULTIPLE_CHOICE', 'Welcher Satz betont den GRAD (mức độ)?', 'so tách ra trước tính từ', 'Es regnete stark, sodass wir blieben.', 'Es regnete so stark, dass wir blieben.', 'Es regnete stark. Deshalb blieben wir.', 'B', 'Tách so ra đặt trước tính từ là để nhấn vào mức độ.'),
('b2-nebensatz-konsekutiv', 2, 'MULTIPLE_CHOICE', 'Es ist zu kalt, ___ wir schwimmen könnten.', 'Quá ... đến mức không thể', 'sodass', 'als dass', 'damit', 'B', 'zu ... als dass mang nghĩa phủ định, thường đi với Konjunktiv II.'),
('b2-nebensatz-konsekutiv', 3, 'FILL_BLANK', 'Es ist zu kalt, ___ zu schwimmen. (gọn hơn, cùng chủ ngữ)', 'Dạng gọn của "zu ... als dass"', NULL, NULL, NULL, 'um', 'zu ... um ... zu là dạng gọn khi hai vế cùng chủ ngữ.'),
('b2-nebensatz-konsekutiv', 4, 'MULTIPLE_CHOICE', 'Welcher Satz ist richtig?', 'deshalb là trạng từ, sodass là liên từ', 'Es regnete, sodass blieben wir zu Hause.', 'Es regnete. Deshalb blieben wir zu Hause.', 'Es regnete. Deshalb wir blieben zu Hause.', 'B', 'deshalb chiếm vị trí 1 nên động từ theo ngay sau.'),
('b2-nebensatz-konsekutiv', 5, 'WORD_ORDER', 'sodass / blieben / wir / zu Hause', 'Động từ xuống cuối', NULL, NULL, NULL, 'sodass wir zu Hause blieben', 'sodass đẩy động từ chia xuống cuối mệnh đề.'),

-- ===== Adversative Nebensätze =====
('b2-nebensatz-adversativ', 0, 'MULTIPLE_CHOICE', 'Welche Bedeutung hat "während" hier: "Während ich gern lese, sieht er fern."?', 'Hai vế nói về hai điều trái ngược', 'zeitlich (trong lúc)', 'adversativ (trong khi thì)', 'kausal (bởi vì)', 'B', 'Hai vế so sánh hai người, không nói về thời gian → nghĩa đối lập.'),
('b2-nebensatz-adversativ', 1, 'FILL_BLANK', 'Ich arbeite gern im Team, ___ mein Kollege lieber allein arbeitet.', 'Liên từ CHỈ mang nghĩa đối lập', NULL, NULL, NULL, 'wohingegen', 'wohingegen chỉ có nghĩa đối lập, không đa nghĩa như während.'),
('b2-nebensatz-adversativ', 2, 'MULTIPLE_CHOICE', 'Welches Wort ist ein ADVERB (kein Konnektor)?', 'Loại từ nào chiếm vị trí 1?', 'während', 'wohingegen', 'dagegen', 'C', 'dagegen là trạng từ nên chiếm vị trí 1 và động từ theo ngay sau.'),
('b2-nebensatz-adversativ', 3, 'MULTIPLE_CHOICE', 'Welcher Satz drückt einen WIDERSPRUCH aus (nicht nur Vergleich)?', 'Phân biệt obwohl với während', 'Während ich Tee trinke, trinkt er Kaffee.', 'Obwohl ich müde bin, lese ich weiter.', 'Während ich koche, hört er Musik.', 'B', 'obwohl là nghịch lý (làm dù có trở ngại); während chỉ so sánh hai bên.'),
('b2-nebensatz-adversativ', 4, 'WORD_ORDER', 'wohingegen / arbeitet / mein Kollege / lieber allein', 'Động từ xuống cuối', NULL, NULL, NULL, 'wohingegen mein Kollege lieber allein arbeitet', 'wohingegen là liên từ phụ nên đẩy động từ xuống cuối.'),
('b2-nebensatz-adversativ', 5, 'FILL_BLANK', '___ Gegensatz zu mir trinkt er Kaffee.', 'Cụm giới từ chỉ đối lập', NULL, NULL, NULL, 'Im', 'im Gegensatz zu + Dativ là cách nói đối lập bằng giới từ.'),

-- ===== Konditionale Nebensätze =====
('b2-nebensatz-konditional', 0, 'MULTIPLE_CHOICE', 'Welche Konjunktion betont die UNSICHERHEIT?', 'Phòng khi — chưa chắc xảy ra', 'wenn', 'falls', 'als', 'B', 'falls nhấn vào tính không chắc chắn; wenn trung tính hơn.'),
('b2-nebensatz-konditional', 1, 'WORD_ORDER', 'Hätte / Zeit / ich / würde ich kommen', 'Điều kiện không liên từ: động từ lên đầu', NULL, NULL, NULL, 'Hätte ich Zeit würde ich kommen', 'Bỏ wenn thì động từ nhảy lên vị trí đầu tiên.'),
('b2-nebensatz-konditional', 2, 'MULTIPLE_CHOICE', 'Wie lautet "Wenn Sie Fragen haben, rufen Sie an" ohne Konjunktion?', 'Dạng đảo', 'Sie haben Fragen, rufen Sie an.', 'Haben Sie Fragen, rufen Sie an.', 'Fragen haben Sie, rufen Sie an.', 'B', 'Bỏ wenn, đưa động từ haben lên đầu.'),
('b2-nebensatz-konditional', 3, 'MULTIPLE_CHOICE', 'Wie drückt man die IRREALE Bedingung in der Vergangenheit aus?', NULL, 'Wenn ich Zeit hätte, würde ich kommen.', 'Wenn ich Zeit gehabt hätte, wäre ich gekommen.', 'Wenn ich Zeit habe, komme ich.', 'B', 'Quá khứ giả định: hätte/wäre + Partizip II ở cả hai vế, không dùng würde.'),
('b2-nebensatz-konditional', 4, 'FILL_BLANK', 'Ich komme, es sei ___, ich werde krank. (trừ phi)', NULL, NULL, NULL, NULL, 'denn', 'es sei denn = trừ phi; sau đó trật tự từ giữ nguyên V2.'),
('b2-nebensatz-konditional', 5, 'MULTIPLE_CHOICE', 'Welche Konjunktion hat NUR konditionale Bedeutung?', 'Từ nào không đa nghĩa?', 'wenn', 'falls', 'während', 'B', 'wenn còn mang nghĩa thời gian; falls chỉ mang nghĩa điều kiện.'),

-- ===== Subjekt- und Objektsätze =====
('b2-subjekt-objektsatz', 0, 'FILL_BLANK', '___ freut mich, dass du kommst.', 'Chủ ngữ giả giữ chỗ', NULL, NULL, NULL, 'Es', 'es giữ chỗ chủ ngữ, mệnh đề dass bị đẩy ra cuối câu.'),
('b2-subjekt-objektsatz', 1, 'MULTIPLE_CHOICE', 'Welcher Satz klingt natürlicher?', 'Mệnh đề dài ở vị trí 1 nghe nặng đầu', 'Dass du kommst, freut mich.', 'Es freut mich, dass du kommst.', 'Mich freut dass du kommst.', 'B', 'Dùng es giữ chỗ rồi đẩy mệnh đề ra sau là dạng tự nhiên nhất.'),
('b2-subjekt-objektsatz', 2, 'FILL_BLANK', 'Er fragt, ___ ich Zeit habe.', 'Câu hỏi Có/Không', NULL, NULL, NULL, 'ob', 'Câu hỏi Có/Không chuyển gián tiếp dùng ob.'),
('b2-subjekt-objektsatz', 3, 'MULTIPLE_CHOICE', 'Was passiert, wenn man "dass" weglässt?', NULL, 'Das Verb bleibt am Ende.', 'Das Verb geht auf Position 2.', 'Der Satz wird falsch.', 'B', 'Bỏ dass thì trật tự từ trở lại bình thường: động từ ở vị trí 2.'),
('b2-subjekt-objektsatz', 4, 'MULTIPLE_CHOICE', 'Wie kann man "Ich hoffe, dass ich dich sehe" verkürzen?', 'Hai vế cùng chủ ngữ', 'Ich hoffe, dich zu sehen.', 'Ich hoffe, dich sehen.', 'Ich hoffe dich sehen zu.', 'A', 'Cùng chủ ngữ thì thay mệnh đề dass bằng zu + nguyên thể.'),
('b2-subjekt-objektsatz', 5, 'WORD_ORDER', 'wichtig / Es ist / dass / wir / sind / pünktlich', 'Mẫu Es ist + tính từ + dass', NULL, NULL, NULL, 'Es ist wichtig dass wir pünktlich sind', 'Mẫu Es ist + tính từ + dass..., động từ mệnh đề phụ xuống cuối.'),

-- ===== Infinitivsatz mit zu =====
('b2-infinitivsatz', 0, 'MULTIPLE_CHOICE', 'Wann kann man "dass" durch "zu + Infinitiv" ersetzen?', NULL, 'immer', 'wenn beide Sätze dasselbe Subjekt haben', 'nur bei Modalverben', 'B', 'Chỉ thay được khi chủ ngữ hai vế trùng nhau (hoặc mệnh đề chính vô nhân xưng).'),
('b2-infinitivsatz', 1, 'FILL_BLANK', 'Ich habe vergessen, dich ___. (anrufen)', 'Động từ tách được', NULL, NULL, NULL, 'anzurufen', 'Tách được thì zu chui vào giữa: anzurufen.'),
('b2-infinitivsatz', 2, 'MULTIPLE_CHOICE', 'Welches Verb braucht KEIN "zu"?', NULL, 'hoffen', 'versuchen', 'lassen', 'C', 'lassen, modal, động từ chuyển động, sehen/hören đều không dùng zu.'),
('b2-infinitivsatz', 3, 'FILL_BLANK', 'Ich freue mich, die Prüfung bestanden ___ haben.', 'Nguyên thể ở quá khứ', NULL, NULL, NULL, 'zu', 'Partizip II + zu haben diễn tả việc đã hoàn tất.'),
('b2-infinitivsatz', 4, 'MULTIPLE_CHOICE', 'Was bedeutet "Er scheint geschlafen zu haben"?', 'So sánh với "scheint zu schlafen"', 'Anh ấy đang ngủ.', 'Anh ấy có vẻ đã ngủ rồi.', 'Anh ấy muốn ngủ.', 'B', 'Nguyên thể quá khứ (Partizip II + zu haben) chỉ việc đã xong.'),
('b2-infinitivsatz', 5, 'MULTIPLE_CHOICE', 'Welche Konjunktion braucht man, wenn die Subjekte VERSCHIEDEN sind? ("um ... zu")', NULL, 'damit', 'indem', 'sodass', 'A', 'um ... zu đòi cùng chủ ngữ; khác chủ ngữ thì dùng damit.')

) AS v(slug, order_index, exercise_type, prompt_de, hint_vi, option_a, option_b, option_c, correct_answer, explanation_vi)
JOIN grammar_topics t ON t.slug = v.slug
WHERE NOT EXISTS (SELECT 1 FROM grammar_exercises e WHERE e.topic_id = t.id);
