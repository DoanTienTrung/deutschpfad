-- Bài tập cho 16 chủ điểm A2. Cùng nguyên tắc với V47: soạn mới, bám đúng lý thuyết ở V46.

INSERT INTO grammar_exercises
  (topic_id, order_index, exercise_type, prompt_de, hint_vi, option_a, option_b, option_c, correct_answer, explanation_vi, generated_by, reviewed)
SELECT t.id, v.order_index, v.exercise_type, v.prompt_de, v.hint_vi, v.option_a, v.option_b, v.option_c, v.correct_answer, v.explanation_vi, 'MANUAL', true
FROM (VALUES

-- ===== Steigerung =====
('a2-steigerung', 0, 'FILL_BLANK', 'Der Zug ist ___ als das Auto. (schnell)', 'So sánh hơn: thêm -er', NULL, NULL, NULL, 'schneller', 'So sánh hơn thêm -er: schneller.'),
('a2-steigerung', 1, 'FILL_BLANK', 'Anna ist ___ als Tom. (alt)', 'Tính từ một âm tiết thường thêm Umlaut', NULL, NULL, NULL, 'älter', 'alt → älter (thêm Umlaut).'),
('a2-steigerung', 2, 'FILL_BLANK', 'Dieses Buch ist ___ als das andere. (gut)', 'Bất quy tắc', NULL, NULL, NULL, 'besser', 'gut → besser → am besten (bất quy tắc, phải thuộc).'),
('a2-steigerung', 3, 'FILL_BLANK', 'Anna ist so groß ___ Tom. (bằng nhau)', 'Từ nối cho so sánh BẰNG', NULL, NULL, NULL, 'wie', 'so ... wie = bằng nhau; als dùng cho so sánh hơn.'),
('a2-steigerung', 4, 'MULTIPLE_CHOICE', 'Welcher Satz ist richtig?', 'wie hay als?', 'Er ist größer wie ich.', 'Er ist größer als ich.', 'Er ist größer so ich.', 'B', 'So sánh hơn dùng als. Dùng wie ở đây là lỗi rất phổ biến.'),
('a2-steigerung', 5, 'MULTIPLE_CHOICE', 'Ich trinke gern Tee, aber ___ Kaffee.', 'So sánh hơn của gern', 'gerner', 'lieber', 'mehr', 'B', 'gern → lieber → am liebsten (bất quy tắc).'),

-- ===== Verben mit Dativ- und Akkusativobjekt =====
('a2-verben-dativ-akkusativ', 0, 'WORD_ORDER', 'Blumen / meiner Mutter / ich / schenke', 'Hai danh từ: Dativ trước Akkusativ', NULL, NULL, NULL, 'Ich schenke meiner Mutter Blumen', 'Hai tân ngữ là danh từ thì Dativ (người) đứng trước Akkusativ (vật).'),
('a2-verben-dativ-akkusativ', 1, 'MULTIPLE_CHOICE', 'Welche Reihenfolge ist richtig?', 'Cả hai tân ngữ đều là đại từ', 'Ich gebe dir es.', 'Ich gebe es dir.', 'Ich gebe dir das.', 'B', 'Khi CẢ HAI là đại từ thì Akkusativ đứng trước Dativ: Ich gebe es dir.'),
('a2-verben-dativ-akkusativ', 2, 'FILL_BLANK', 'Ich helfe ___ Bruder. (mein)', 'helfen chỉ đi với Dativ', NULL, NULL, NULL, 'meinem', 'helfen đòi Dativ; mein ở Dativ giống đực thành meinem.'),
('a2-verben-dativ-akkusativ', 3, 'FILL_BLANK', 'Das Essen schmeckt ___. (ich)', 'schmecken đi với Dativ', NULL, NULL, NULL, 'mir', 'schmecken đòi Dativ: Das Essen schmeckt mir.'),
('a2-verben-dativ-akkusativ', 4, 'MULTIPLE_CHOICE', 'Welcher Satz ist richtig?', 'danken đi với cách nào?', 'Ich danke dich.', 'Ich danke dir.', 'Ich danke du.', 'B', 'danken thuộc nhóm động từ chỉ đi với Dativ: Ich danke dir.'),

-- ===== Präteritum - Modalverben =====
('a2-praeteritum-modalverben', 0, 'FILL_BLANK', 'Gestern ___ ich nicht kommen. (können)', 'Bỏ Umlaut, thêm -te', NULL, NULL, NULL, 'konnte', 'können → konnte (mất Umlaut).'),
('a2-praeteritum-modalverben', 1, 'FILL_BLANK', 'Ich ___ gestern arbeiten. (müssen)', NULL, NULL, NULL, NULL, 'musste', 'müssen → musste.'),
('a2-praeteritum-modalverben', 2, 'FILL_BLANK', 'Als Kind ___ ich Arzt werden. (wollen)', 'wollen không có Umlaut để bỏ', NULL, NULL, NULL, 'wollte', 'wollen → wollte.'),
('a2-praeteritum-modalverben', 3, 'FILL_BLANK', 'Wir ___ nicht ins Kino gehen. (dürfen)', 'Ngôi wir', NULL, NULL, NULL, 'durften', 'dürfen → durfte-; ngôi wir thêm -n: durften.'),
('a2-praeteritum-modalverben', 4, 'MULTIPLE_CHOICE', 'Welche Form ist richtig?', 'Modal ở quá khứ có giữ Umlaut không?', 'ich könnte kommen (quá khứ)', 'ich konnte kommen', 'ich kannte kommen', 'B', 'Präteritum bỏ Umlaut: konnte. Dạng könnte là Konjunktiv II, nghĩa khác hẳn.'),

-- ===== Nebensätze - kausal =====
('a2-nebensatz-kausal', 0, 'WORD_ORDER', 'weil / bin / ich / krank', 'Động từ xuống cuối mệnh đề weil', NULL, NULL, NULL, 'weil ich krank bin', 'Trong mệnh đề weil, động từ chia đứng cuối cùng.'),
('a2-nebensatz-kausal', 1, 'MULTIPLE_CHOICE', 'Welcher Satz ist richtig?', 'weil đẩy động từ xuống cuối', 'Ich bleibe zu Hause, weil ich bin krank.', 'Ich bleibe zu Hause, weil ich krank bin.', 'Ich bleibe zu Hause, weil bin ich krank.', 'B', 'weil đẩy động từ chia (bin) xuống cuối mệnh đề.'),
('a2-nebensatz-kausal', 2, 'FILL_BLANK', 'Ich komme nicht, ___ ich keine Zeit habe.', 'Liên từ đẩy động từ xuống cuối', NULL, NULL, NULL, 'weil', 'Động từ habe đứng cuối nên liên từ phải là weil (không phải denn).'),
('a2-nebensatz-kausal', 3, 'MULTIPLE_CHOICE', 'Welcher Satz ist richtig?', 'Mệnh đề phụ đứng trước thì mệnh đề chính bắt đầu bằng gì?', 'Weil ich krank bin, ich bleibe zu Hause.', 'Weil ich krank bin, bleibe ich zu Hause.', 'Weil bin ich krank, bleibe ich zu Hause.', 'B', 'Cả mệnh đề phụ tính là vị trí 1, nên mệnh đề chính bắt đầu ngay bằng động từ.'),
('a2-nebensatz-kausal', 4, 'MULTIPLE_CHOICE', 'Welcher Satz ist richtig? (mệnh đề phụ có modal)', 'Động từ chia vẫn ở cuối cùng', 'Ich komme nicht, weil ich muss arbeiten.', 'Ich komme nicht, weil ich arbeiten muss.', 'Ich komme nicht, weil muss ich arbeiten.', 'B', 'Modal (động từ chia) đứng sau cùng, sau cả nguyên thể arbeiten.'),

-- ===== Nebensätze - konditional =====
('a2-nebensatz-konditional', 0, 'WORD_ORDER', 'wenn / habe / ich / Zeit', 'Động từ xuống cuối', NULL, NULL, NULL, 'wenn ich Zeit habe', 'Mệnh đề wenn đẩy động từ chia xuống cuối.'),
('a2-nebensatz-konditional', 1, 'FILL_BLANK', '___ ich 10 Jahre alt war, zog ich nach Hanoi.', 'Một sự việc một lần trong quá khứ', NULL, NULL, NULL, 'Als', 'Quá khứ + xảy ra một lần → als.'),
('a2-nebensatz-konditional', 2, 'FILL_BLANK', '___ ich Zeit habe, lese ich ein Buch.', 'Việc lặp lại / hiện tại', NULL, NULL, NULL, 'Wenn', 'Hiện tại hoặc việc lặp lại → wenn.'),
('a2-nebensatz-konditional', 3, 'MULTIPLE_CHOICE', 'Ich weiß nicht, ___ er heute kommt.', '"liệu có ... hay không"', 'wenn', 'ob', 'als', 'B', 'ob = liệu có... hay không, dùng cho câu hỏi gián tiếp.'),
('a2-nebensatz-konditional', 4, 'MULTIPLE_CHOICE', 'Welcher Satz ist richtig?', 'Quá khứ, một lần duy nhất', 'Wenn ich in Berlin war, besuchte ich das Museum.', 'Als ich in Berlin war, besuchte ich das Museum.', 'Ob ich in Berlin war, besuchte ich das Museum.', 'B', 'Một lần trong quá khứ dùng als. Câu A chỉ đúng nếu ý là "mỗi lần".'),

-- ===== Nebensätze - dass =====
('a2-nebensatz-dass', 0, 'WORD_ORDER', 'dass / lernst / du / Deutsch', 'Động từ xuống cuối', NULL, NULL, NULL, 'dass du Deutsch lernst', 'Mệnh đề dass đẩy động từ chia xuống cuối.'),
('a2-nebensatz-dass', 1, 'MULTIPLE_CHOICE', 'Welcher Satz ist richtig?', 'Có dass thì động từ ở đâu?', 'Ich glaube, dass er hat recht.', 'Ich glaube, dass er recht hat.', 'Ich glaube, dass hat er recht.', 'B', 'dass đẩy động từ hat xuống cuối mệnh đề.'),
('a2-nebensatz-dass', 2, 'MULTIPLE_CHOICE', 'Wenn man "dass" weglässt, was passiert?', 'Bỏ dass thì trật tự từ ra sao?', 'Ich glaube, er recht hat.', 'Ich glaube, er hat recht.', 'Ich glaube, hat er recht.', 'B', 'Bỏ dass thì trật tự trở lại bình thường: động từ ở vị trí 2.'),
('a2-nebensatz-dass', 3, 'FILL_BLANK', 'Er fragt, ___ ich Zeit habe.', 'Câu hỏi gián tiếp dùng từ nào?', NULL, NULL, NULL, 'ob', 'Câu hỏi gián tiếp Có/Không dùng ob, không dùng dass.'),
('a2-nebensatz-dass', 4, 'FILL_BLANK', 'Es tut mir leid, ___ ich zu spät komme.', 'Nghĩa "rằng"', NULL, NULL, NULL, 'dass', 'dass giới thiệu nội dung của điều được nói/cảm nhận.'),

-- ===== Wechselpräpositionen =====
('a2-wechselpraeposition', 0, 'FILL_BLANK', 'Ich gehe in ___ Schule. (Wohin?)', 'Có di chuyển tới đích → Akkusativ', NULL, NULL, NULL, 'die', 'Wohin? → Akkusativ; die Schule giữ nguyên die ở Akkusativ.'),
('a2-wechselpraeposition', 1, 'FILL_BLANK', 'Ich bin in ___ Schule. (Wo?)', 'Đứng yên → Dativ', NULL, NULL, NULL, 'der', 'Wo? → Dativ; die Schule ở Dativ thành der Schule.'),
('a2-wechselpraeposition', 2, 'FILL_BLANK', 'Das Bild hängt an ___ Wand. (Wo?)', 'Đang treo — đứng yên', NULL, NULL, NULL, 'der', 'hängen (trạng thái) → Wo? → Dativ: an der Wand.'),
('a2-wechselpraeposition', 3, 'MULTIPLE_CHOICE', 'Ich hänge das Bild ___ Wand.', 'Hành động treo lên — có di chuyển', 'an der', 'an die', 'an dem', 'B', 'Treo LÊN tường là có di chuyển → Wohin? → Akkusativ: an die Wand.'),
('a2-wechselpraeposition', 4, 'MULTIPLE_CHOICE', 'Welches Verb verlangt normalerweise Dativ?', 'Động từ chỉ trạng thái hay chuyển động?', 'stellen', 'legen', 'liegen', 'C', 'liegen là trạng thái (đang nằm) → Dativ. stellen/legen là hành động đặt → Akkusativ.'),
('a2-wechselpraeposition', 5, 'FILL_BLANK', 'Ich gehe ___ Kino. (in + das)', 'Dạng rút gọn', NULL, NULL, NULL, 'ins', 'in + das = ins.'),

-- ===== Konjunktiv II =====
('a2-konjunktiv-2', 0, 'FILL_BLANK', 'Wenn ich Zeit ___, würde ich kommen. (haben)', 'Konjunktiv II của haben', NULL, NULL, NULL, 'hätte', 'haben → hätte ở Konjunktiv II.'),
('a2-konjunktiv-2', 1, 'FILL_BLANK', 'Wenn ich reich ___, würde ich reisen. (sein)', 'Konjunktiv II của sein', NULL, NULL, NULL, 'wäre', 'sein → wäre.'),
('a2-konjunktiv-2', 2, 'FILL_BLANK', '___ Sie mir bitte helfen? (können, lịch sự)', 'Konjunktiv II của können', NULL, NULL, NULL, 'Könnten', 'können → könnten (thêm lại Umlaut vào dạng Präteritum).'),
('a2-konjunktiv-2', 3, 'FILL_BLANK', 'Ich ___ gern einen Kaffee. (haben, lịch sự)', 'Câu gọi món lịch sự', NULL, NULL, NULL, 'hätte', 'Ich hätte gern... là cách gọi món lịch sự chuẩn.'),
('a2-konjunktiv-2', 4, 'MULTIPLE_CHOICE', 'Wie sagt man höflich?', 'Chọn cách lịch sự nhất', 'Helfen Sie mir!', 'Könnten Sie mir helfen?', 'Sie müssen mir helfen.', 'B', 'Konjunktiv II làm câu đề nghị mềm và lịch sự hơn hẳn.'),
('a2-konjunktiv-2', 5, 'MULTIPLE_CHOICE', 'Welche Form ist richtig für "fahren" im Konjunktiv II?', 'Động từ thường dùng cách nào?', 'ich führe', 'ich würde fahren', 'ich fahrte', 'B', 'Trừ sein/haben/modal, các động từ khác dùng würde + nguyên thể.'),

-- ===== Futur I =====
('a2-futur-1', 0, 'FILL_BLANK', 'Ich ___ morgen nach Berlin fahren. (werden)', 'Ngôi ich của werden', NULL, NULL, NULL, 'werde', 'werden ngôi ich: werde.'),
('a2-futur-1', 1, 'FILL_BLANK', 'Du ___ das schaffen. (werden)', 'Ngôi du bất quy tắc', NULL, NULL, NULL, 'wirst', 'werden ngôi du: wirst.'),
('a2-futur-1', 2, 'FILL_BLANK', 'Es ___ morgen regnen. (werden)', 'Ngôi es — dự đoán thời tiết', NULL, NULL, NULL, 'wird', 'werden ngôi er/sie/es: wird.'),
('a2-futur-1', 3, 'MULTIPLE_CHOICE', 'Wie sagt man normalerweise?', 'Đã có từ chỉ thời gian thì cần Futur không?', 'Morgen werde ich nach Berlin fahren.', 'Morgen fahre ich nach Berlin.', 'Morgen ich fahre nach Berlin.', 'B', 'Đã có "morgen" thì dùng luôn thì hiện tại, tự nhiên hơn. Câu A đúng nhưng nặng nề.'),
('a2-futur-1', 4, 'MULTIPLE_CHOICE', 'Was bedeutet "Ich werde Arzt"?', 'werden ở đây là trợ động từ hay động từ chính?', 'Tôi sẽ đi khám bác sĩ.', 'Tôi sẽ trở thành bác sĩ.', 'Tôi sẽ gọi bác sĩ.', 'B', 'Không có động từ nguyên thể đi kèm nên werden là động từ chính: "trở thành".'),

-- ===== Genitiv =====
('a2-genitiv', 0, 'FILL_BLANK', 'das Auto ___ Mannes', 'Genitiv giống đực', NULL, NULL, NULL, 'des', 'Genitiv giống đực: des + danh từ thêm -es.'),
('a2-genitiv', 1, 'FILL_BLANK', 'das Buch ___ Frau', 'Genitiv giống cái', NULL, NULL, NULL, 'der', 'Genitiv giống cái là der, và danh từ KHÔNG đổi.'),
('a2-genitiv', 2, 'FILL_BLANK', 'Das ist ___ Auto. (Anna)', 'Tên riêng thì thêm gì?', NULL, NULL, NULL, 'Annas', 'Tên riêng thêm -s trực tiếp, không có dấu nháy như tiếng Anh.'),
('a2-genitiv', 3, 'MULTIPLE_CHOICE', 'Wie sagt man das im Gespräch?', 'Khi nói, người Đức thay Genitiv bằng gì?', 'das Auto des Mannes', 'das Auto vom Mann', 'das Auto der Mann', 'B', 'Khi nói, von + Dativ phổ biến hơn hẳn Genitiv.'),
('a2-genitiv', 4, 'MULTIPLE_CHOICE', 'Welche Präposition steht mit Genitiv?', NULL, 'mit', 'wegen', 'für', 'B', 'wegen, während, trotz, statt đi với Genitiv.'),

-- ===== Pronomen und Artikel =====
('a2-pronomen-artikel', 0, 'FILL_BLANK', '___ Buch ist sehr gut. (dieser, Nominativ)', 'Buch là giống trung', NULL, NULL, NULL, 'Dieses', 'dieser biến cách như der/die/das: giống trung Nominativ là dieses.'),
('a2-pronomen-artikel', 1, 'FILL_BLANK', 'Ich kaufe ___ Tisch. (dieser, Akkusativ)', 'Tisch giống đực, cách 4', NULL, NULL, NULL, 'diesen', 'Giống đực ở Akkusativ: diesen.'),
('a2-pronomen-artikel', 2, 'FILL_BLANK', 'Hier ___ man nicht rauchen. (dürfen)', 'man chia như ngôi nào?', NULL, NULL, NULL, 'darf', 'man luôn chia như ngôi 3 số ít: man darf.'),
('a2-pronomen-artikel', 3, 'MULTIPLE_CHOICE', 'Ich habe ___ Auto. (tôi không có xe nào)', 'Phủ định danh từ không xác định', 'nicht', 'kein', 'nicht ein', 'B', 'Phủ định danh từ có ein hoặc không mạo từ thì dùng kein.'),
('a2-pronomen-artikel', 4, 'MULTIPLE_CHOICE', 'Ich habe das Auto ___. (không có CHIẾC xe đó)', 'Danh từ có mạo từ xác định', 'kein', 'nicht', 'keine', 'B', 'Danh từ đã có mạo từ xác định thì phủ định bằng nicht.'),

-- ===== Reflexive Verben =====
('a2-reflexive-verben', 0, 'FILL_BLANK', 'Ich wasche ___. (sich waschen)', 'Ngôi ich, Akkusativ', NULL, NULL, NULL, 'mich', 'Đại từ phản thân đổi theo chủ ngữ: ich → mich.'),
('a2-reflexive-verben', 1, 'FILL_BLANK', 'Wie fühlst du ___?', 'Ngôi du', NULL, NULL, NULL, 'dich', 'du → dich.'),
('a2-reflexive-verben', 2, 'FILL_BLANK', 'Er freut ___ auf das Wochenende.', 'Ngôi er', NULL, NULL, NULL, 'sich', 'Ngôi 3 (er/sie/es và sie/Sie) đều dùng sich.'),
('a2-reflexive-verben', 3, 'MULTIPLE_CHOICE', 'Ich wasche ___ die Hände.', 'Trong câu đã có tân ngữ Akkusativ "die Hände"', 'mich', 'mir', 'sich', 'B', 'Đã có tân ngữ Akkusativ khác nên đại từ phản thân chuyển sang Dativ: mir.'),
('a2-reflexive-verben', 4, 'MULTIPLE_CHOICE', 'Welcher Satz ist richtig?', 'Đại từ phản thân đứng ở đâu?', 'Ich mich freue.', 'Ich freue mich.', 'Mich ich freue.', 'B', 'Đại từ phản thân đứng ngay sau động từ chia.'),

-- ===== Adjektivdeklination =====
('a2-adjektivdeklination', 0, 'FILL_BLANK', 'Das ___ Auto ist teuer. (neu)', 'Sau das, Nominativ', NULL, NULL, NULL, 'neue', 'Sau mạo từ xác định ở Nominativ số ít: đuôi -e.'),
('a2-adjektivdeklination', 1, 'FILL_BLANK', 'Ich kaufe den ___ Tisch. (klein)', 'Sau den, giống đực Akkusativ', NULL, NULL, NULL, 'kleinen', 'Sau mạo từ xác định, Akkusativ giống đực: đuôi -en.'),
('a2-adjektivdeklination', 2, 'FILL_BLANK', 'Das ist ein ___ Auto. (neu)', 'Sau ein, giống trung Nominativ', NULL, NULL, NULL, 'neues', 'ein không cho biết giống nên tính từ phải mang: giống trung → -es.'),
('a2-adjektivdeklination', 3, 'FILL_BLANK', 'Das ist ein ___ Tisch. (alt)', 'Sau ein, giống đực Nominativ', NULL, NULL, NULL, 'alter', 'Giống đực Nominativ sau ein: đuôi -er.'),
('a2-adjektivdeklination', 4, 'MULTIPLE_CHOICE', 'Das Auto ist ___. (neu)', 'Tính từ đứng SAU động từ', 'neue', 'neues', 'neu', 'C', 'Đứng sau sein thì tính từ không đổi đuôi.'),
('a2-adjektivdeklination', 5, 'MULTIPLE_CHOICE', 'Ich helfe dem ___ Mann. (alt)', 'Dativ giống đực sau mạo từ xác định', 'alte', 'alten', 'alter', 'B', 'Sau mạo từ xác định, mọi ô Dativ đều là -en.'),

-- ===== n-Deklination =====
('a2-n-deklination', 0, 'FILL_BLANK', 'Ich sehe den ___. (der Student)', 'Akkusativ của danh từ n-Deklination', NULL, NULL, NULL, 'Studenten', 'Student thuộc n-Deklination: thêm -en ở mọi cách trừ Nominativ số ít.'),
('a2-n-deklination', 1, 'FILL_BLANK', 'Ich helfe dem ___. (der Kollege)', 'Dativ', NULL, NULL, NULL, 'Kollegen', 'Kollege kết thúc bằng -e nên thuộc n-Deklination: dem Kollegen.'),
('a2-n-deklination', 2, 'FILL_BLANK', 'Ich schreibe ___ Müller. (Herr)', 'Dativ của Herr', NULL, NULL, NULL, 'Herrn', 'Herr ở số ít các cách khác Nominativ chỉ thêm -n: Herrn.'),
('a2-n-deklination', 3, 'MULTIPLE_CHOICE', 'Welcher Satz ist richtig?', NULL, 'Ich kenne den Student.', 'Ich kenne den Studenten.', 'Ich kenne der Student.', 'B', 'n-Deklination: Akkusativ số ít phải thêm -en.'),
('a2-n-deklination', 4, 'MULTIPLE_CHOICE', 'Welches Nomen gehört NICHT zur n-Deklination?', 'Nhóm này toàn danh từ giống đực', 'der Junge', 'der Polizist', 'das Buch', 'C', 'n-Deklination chỉ gồm danh từ giống đực; das Buch là giống trung.'),

-- ===== Verben mit Präpositionalobjekt =====
('a2-verben-praepositionalobjekt', 0, 'FILL_BLANK', 'Ich warte ___ den Bus.', 'warten đi với giới từ nào?', NULL, NULL, NULL, 'auf', 'warten auf + Akkusativ.'),
('a2-verben-praepositionalobjekt', 1, 'FILL_BLANK', 'Ich interessiere mich ___ Musik.', 'sich interessieren + ?', NULL, NULL, NULL, 'für', 'sich interessieren für + Akkusativ.'),
('a2-verben-praepositionalobjekt', 2, 'FILL_BLANK', 'Ich freue mich ___ das Wochenende. (việc sắp tới)', 'Mong chờ việc sắp tới', NULL, NULL, NULL, 'auf', 'sich freuen auf = mong chờ việc sắp tới; sich freuen über = vui vì việc đã có.'),
('a2-verben-praepositionalobjekt', 3, 'FILL_BLANK', 'Ich habe Angst ___ Hunden.', 'Angst haben + ?', NULL, NULL, NULL, 'vor', 'Angst haben vor + Dativ.'),
('a2-verben-praepositionalobjekt', 4, 'MULTIPLE_CHOICE', '___ wartest du? — Auf den Bus.', 'Hỏi về VẬT, không phải người', 'Auf wen', 'Worauf', 'Wofür', 'B', 'Hỏi về vật dùng wo(r)- + giới từ: worauf.'),
('a2-verben-praepositionalobjekt', 5, 'MULTIPLE_CHOICE', 'Wartest du auf den Bus? — Ja, ich warte ___.', 'Nhắc lại vật đã nói', 'darauf', 'auf ihn', 'worauf', 'A', 'Nhắc lại vật đã nói dùng da(r)- + giới từ: darauf.'),

-- ===== Präteritum =====
('a2-praeteritum', 0, 'FILL_BLANK', 'Ich ___ jeden Tag Deutsch. (lernen, Präteritum)', 'Động từ yếu: thân + -te', NULL, NULL, NULL, 'lernte', 'Động từ yếu ở Präteritum: lern + te = lernte.'),
('a2-praeteritum', 1, 'FILL_BLANK', 'Er ___ nach Hause. (gehen, Präteritum)', 'Động từ mạnh đổi nguyên âm, không có -te', NULL, NULL, NULL, 'ging', 'gehen → ging; ngôi ich và er không có đuôi.'),
('a2-praeteritum', 2, 'FILL_BLANK', 'Wir ___ Kaffee. (trinken, Präteritum)', 'Ngôi wir', NULL, NULL, NULL, 'tranken', 'trinken → trank; ngôi wir thêm -en: tranken.'),
('a2-praeteritum', 3, 'FILL_BLANK', 'Ich ___ an dich. (denken, Präteritum)', 'Nhóm hỗn hợp: vừa đổi nguyên âm vừa có -te', NULL, NULL, NULL, 'dachte', 'denken → dachte (nhóm hỗn hợp).'),
('a2-praeteritum', 4, 'MULTIPLE_CHOICE', 'Wo benutzt man das Präteritum vor allem?', NULL, 'im Gespräch', 'in Büchern und Zeitungen', 'nur in Fragen', 'B', 'Präteritum là thì của văn viết; khi nói người Đức dùng Perfekt.'),
('a2-praeteritum', 5, 'MULTIPLE_CHOICE', 'Welche Form ist richtig? (fahren, Präteritum, ich)', NULL, 'ich fahrte', 'ich fuhr', 'ich fahrte', 'B', 'fahren là động từ mạnh: ich fuhr, không thêm -te.')

) AS v(slug, order_index, exercise_type, prompt_de, hint_vi, option_a, option_b, option_c, correct_answer, explanation_vi)
JOIN grammar_topics t ON t.slug = v.slug
WHERE NOT EXISTS (SELECT 1 FROM grammar_exercises e WHERE e.topic_id = t.id);
