-- Bài tập cho 18 chủ điểm B1. Soạn tay, bám đúng lý thuyết ở V53.
-- Đáp án trắc nghiệm rải sẵn A/B/C ngay khi soạn (V49 chỉ cân bằng cho bài A1/A2, không chạm tới
-- file này vì nó chạy trước).

INSERT INTO grammar_exercises
  (topic_id, order_index, exercise_type, prompt_de, hint_vi, option_a, option_b, option_c, correct_answer, explanation_vi, generated_by, reviewed)
SELECT t.id, v.order_index, v.exercise_type, v.prompt_de, v.hint_vi, v.option_a, v.option_b, v.option_c, v.correct_answer, v.explanation_vi, 'MANUAL', true
FROM (VALUES

-- ===== Verben - Vergangenheit =====
('b1-verben-vergangenheit', 0, 'FILL_BLANK', 'Nachdem ich gegessen ___, ging ich spazieren. (haben)', 'Plusquamperfekt: trợ động từ ở Präteritum', NULL, NULL, NULL, 'hatte', 'nachdem đòi Plusquamperfekt: hatte + Partizip II.'),
('b1-verben-vergangenheit', 1, 'FILL_BLANK', 'Nachdem er angekommen ___, rief er an. (sein)', 'ankommen là động từ chỉ di chuyển', NULL, NULL, NULL, 'war', 'Động từ di chuyển dùng sein, ở Plusquamperfekt thành war.'),
('b1-verben-vergangenheit', 2, 'MULTIPLE_CHOICE', 'Welcher Satz zeigt, dass das Essen ZUERST passierte?', 'Việc nào xảy ra trước?', 'Ich aß und ging spazieren.', 'Nachdem ich gegessen hatte, ging ich spazieren.', 'Ich ging spazieren und aß.', 'B', 'Plusquamperfekt (hatte gegessen) đánh dấu rõ việc xảy ra trước.'),
('b1-verben-vergangenheit', 3, 'MULTIPLE_CHOICE', 'Welche Zeitform benutzt man im Gespräch?', NULL, 'Perfekt', 'Präteritum', 'Plusquamperfekt', 'A', 'Perfekt là thì kể chuyện quá khứ khi nói; Präteritum dành cho văn viết.'),
('b1-verben-vergangenheit', 4, 'FILL_BLANK', 'Gestern ___ ich keine Zeit. (haben, dạng dùng khi nói)', 'haben là ngoại lệ — dùng Präteritum cả khi nói', NULL, NULL, NULL, 'hatte', 'sein/haben/modal dùng Präteritum kể cả trong hội thoại.'),
('b1-verben-vergangenheit', 5, 'WORD_ORDER', 'Nachdem / hatte / er / die Prüfung / bestanden', 'Động từ chia xuống cuối mệnh đề', NULL, NULL, NULL, 'Nachdem er die Prüfung bestanden hatte', 'hatte (động từ chia) đứng sau cùng, sau cả Partizip II.'),

-- ===== Kausale Konnektoren =====
('b1-kausale-konnektoren', 0, 'WORD_ORDER', 'weil / bin / ich / krank', 'weil đẩy động từ xuống cuối', NULL, NULL, NULL, 'weil ich krank bin', 'Trong mệnh đề weil, động từ chia đứng cuối.'),
('b1-kausale-konnektoren', 1, 'MULTIPLE_CHOICE', 'Welcher Satz ist richtig?', 'deshalb là trạng từ, chiếm vị trí 1', 'Ich bin krank, deshalb ich bleibe zu Hause.', 'Ich bin krank, deshalb bleibe ich zu Hause.', 'Ich bin krank, deshalb zu Hause bleibe ich.', 'B', 'deshalb chiếm vị trí 1 nên động từ theo ngay sau, chủ ngữ lùi xuống.'),
('b1-kausale-konnektoren', 2, 'FILL_BLANK', '___ des Regens bleibe ich zu Hause.', 'Giới từ chỉ nguyên nhân, đi với Genitiv', NULL, NULL, NULL, 'Wegen', 'wegen là giới từ + Genitiv: wegen des Regens.'),
('b1-kausale-konnektoren', 3, 'FILL_BLANK', 'Ich bleibe zu Hause, ___ ich bin krank.', 'Liên từ giữ nguyên trật tự V2', NULL, NULL, NULL, 'denn', 'denn không đổi trật tự từ: bin vẫn ở vị trí 2.'),
('b1-kausale-konnektoren', 4, 'MULTIPLE_CHOICE', 'Welches Wort steht vor der FOLGE (nicht vor dem Grund)?', 'Từ nào đứng trước kết quả?', 'weil', 'wegen', 'deshalb', 'C', 'weil/denn/wegen đứng trước nguyên nhân; deshalb đứng trước kết quả.'),
('b1-kausale-konnektoren', 5, 'MULTIPLE_CHOICE', 'Welcher Satz ist grammatisch richtig?', NULL, 'Wegen dem Regen bleibe ich.', 'Wegen des Regens bleibe ich.', 'Wegen der Regen bleibe ich.', 'B', 'wegen + Genitiv: des Regens. Dativ (dem Regen) phổ biến khi nói nhưng không chuẩn.'),

-- ===== Nebensätze - Fragesätze =====
('b1-nebensatz-fragesatz', 0, 'WORD_ORDER', 'wo / wohnst / du', 'Chuyển thành câu hỏi gián tiếp sau "Ich weiß nicht,"', NULL, NULL, NULL, 'wo du wohnst', 'Câu hỏi gián tiếp: động từ xuống cuối.'),
('b1-nebensatz-fragesatz', 1, 'FILL_BLANK', 'Ich weiß nicht, ___ er heute kommt.', 'Câu hỏi Có/Không, không có từ để hỏi', NULL, NULL, NULL, 'ob', 'Câu hỏi Có/Không chuyển gián tiếp phải thêm ob.'),
('b1-nebensatz-fragesatz', 2, 'MULTIPLE_CHOICE', 'Wie lautet die indirekte Frage zu "Hast du Zeit?"', NULL, 'Er fragt, hast du Zeit.', 'Er fragt, ob du Zeit hast.', 'Er fragt, ob hast du Zeit.', 'B', 'Thêm ob và đẩy động từ hast xuống cuối.'),
('b1-nebensatz-fragesatz', 3, 'MULTIPLE_CHOICE', 'Welche Frage ist am höflichsten?', 'Hỏi người lạ ngoài đường', 'Wo ist der Bahnhof?', 'Sag mir den Bahnhof!', 'Können Sie mir sagen, wo der Bahnhof ist?', 'C', 'Câu hỏi gián tiếp lịch sự hơn hẳn câu hỏi thẳng.'),
('b1-nebensatz-fragesatz', 4, 'FILL_BLANK', 'Weißt du, ___ der Zug kommt? (khi nào)', 'Từ để hỏi về thời gian', NULL, NULL, NULL, 'wann', 'Câu hỏi có từ để hỏi thì giữ nguyên từ đó: wann.'),

-- ===== Präpositionen - lokal =====
('b1-praeposition-lokal', 0, 'FILL_BLANK', 'Ich fliege morgen ___ Deutschland.', 'Địa danh không có mạo từ', NULL, NULL, NULL, 'nach', 'nach dùng với địa danh không mạo từ.'),
('b1-praeposition-lokal', 1, 'FILL_BLANK', 'Ich gehe ___ Arzt. (zu + dem)', 'Tới một người', NULL, NULL, NULL, 'zum', 'zu dùng với người/địa điểm cụ thể; zu + dem = zum.'),
('b1-praeposition-lokal', 2, 'MULTIPLE_CHOICE', 'Ich fahre ___ Schweiz.', 'Quốc gia có mạo từ', 'nach der', 'in die', 'zu der', 'B', 'Quốc gia có mạo từ (die Schweiz) dùng in + Akkusativ, không dùng nach.'),
('b1-praeposition-lokal', 3, 'FILL_BLANK', 'Ich komme ___ Vietnam. (quê quán)', 'Từ đâu tới', NULL, NULL, NULL, 'aus', 'aus chỉ quê quán hoặc từ bên trong ra.'),
('b1-praeposition-lokal', 4, 'MULTIPLE_CHOICE', 'Wie sagt man "ở nhà"?', 'Ba dạng cố định với Hause', 'nach Hause', 'zu Hause', 'von Hause', 'B', 'zu Hause = ở nhà (Wo?); nach Hause = về nhà (Wohin?).'),
('b1-praeposition-lokal', 5, 'FILL_BLANK', 'Ich gehe jetzt ___ Hause. (về nhà)', 'Wohin?', NULL, NULL, NULL, 'nach', 'nach Hause = về nhà, chỉ hướng di chuyển.'),

-- ===== Präpositionen - temporal =====
('b1-praeposition-temporal', 0, 'FILL_BLANK', 'Ich habe ___ Montag einen Termin.', 'Ngày trong tuần', NULL, NULL, NULL, 'am', 'Ngày và thứ dùng am: am Montag.'),
('b1-praeposition-temporal', 1, 'FILL_BLANK', 'Ich fahre ___ Sommer nach Italien.', 'Mùa', NULL, NULL, NULL, 'im', 'Tháng, mùa, năm dùng im: im Sommer.'),
('b1-praeposition-temporal', 2, 'MULTIPLE_CHOICE', 'Ich lerne ___ zwei Jahren Deutsch. (vẫn đang học)', 'Từ quá khứ đến nay và còn tiếp tục', 'vor', 'seit', 'in', 'B', 'seit chỉ khoảng thời gian từ quá khứ tới nay và vẫn tiếp diễn.'),
('b1-praeposition-temporal', 3, 'MULTIPLE_CHOICE', 'Ich habe ___ zwei Jahren angefangen.', 'Cách đây hai năm — một thời điểm', 'vor', 'seit', 'ab', 'A', 'vor + Dativ = cách đây, chỉ một thời điểm trong quá khứ.'),
('b1-praeposition-temporal', 4, 'FILL_BLANK', 'Der Kurs beginnt ___ 9 Uhr.', 'Giờ chính xác', NULL, NULL, NULL, 'um', 'um dùng cho giờ chính xác; gegen là giờ áng chừng.'),
('b1-praeposition-temporal', 5, 'MULTIPLE_CHOICE', 'Welcher Satz ist richtig?', 'Năm trần có cần giới từ không?', 'In 2020 war ein schweres Jahr.', '2020 war ein schweres Jahr.', 'Am 2020 war ein schweres Jahr.', 'B', 'Năm trần không đi với giới từ. "In 2020" là lối tiếng Anh.'),

-- ===== Nebensätze - temporal =====
('b1-nebensatz-temporal', 0, 'FILL_BLANK', '___ ich 18 war, zog ich nach Berlin.', 'Quá khứ, xảy ra một lần', NULL, NULL, NULL, 'Als', 'Quá khứ + một lần → als.'),
('b1-nebensatz-temporal', 1, 'FILL_BLANK', 'Immer ___ ich Zeit habe, lese ich.', 'Việc lặp lại', NULL, NULL, NULL, 'wenn', 'Việc lặp lại hoặc hiện tại/tương lai → wenn.'),
('b1-nebensatz-temporal', 2, 'MULTIPLE_CHOICE', 'Welcher Satz ist richtig?', 'Phối thì với nachdem', 'Nachdem ich gegessen habe, ging ich schlafen.', 'Nachdem ich gegessen hatte, ging ich schlafen.', 'Nachdem ich esse, ging ich schlafen.', 'B', 'nachdem + Plusquamperfekt → mệnh đề chính Präteritum.'),
('b1-nebensatz-temporal', 3, 'FILL_BLANK', '___ ich koche, hört er Musik. (trong lúc)', 'Hai việc song song', NULL, NULL, NULL, 'Während', 'während chỉ hai việc diễn ra cùng lúc.'),
('b1-nebensatz-temporal', 4, 'MULTIPLE_CHOICE', 'Was kommt nach "während" in "Während des Essens..."?', 'Ở đây während là loại từ gì?', 'ein Nebensatz', 'ein Nomen im Genitiv', 'ein Infinitiv', 'B', 'Theo sau là danh từ nên während ở đây là giới từ + Genitiv, không phải liên từ.'),
('b1-nebensatz-temporal', 5, 'FILL_BLANK', '___ du gehst, räum bitte auf. (trước khi)', 'Liên từ chỉ việc xảy ra trước', NULL, NULL, NULL, 'Bevor', 'bevor = trước khi, đẩy động từ xuống cuối mệnh đề.'),

-- ===== Nebensätze - konzessiv =====
('b1-nebensatz-konzessiv', 0, 'WORD_ORDER', 'obwohl / regnet / es', 'Động từ xuống cuối', NULL, NULL, NULL, 'obwohl es regnet', 'obwohl đẩy động từ chia xuống cuối mệnh đề.'),
('b1-nebensatz-konzessiv', 1, 'MULTIPLE_CHOICE', 'Welcher Satz ist richtig?', 'trotzdem là trạng từ', 'Es regnet. Trotzdem ich gehe spazieren.', 'Es regnet. Trotzdem gehe ich spazieren.', 'Es regnet. Ich trotzdem gehe spazieren.', 'B', 'trotzdem chiếm vị trí 1, động từ theo ngay sau.'),
('b1-nebensatz-konzessiv', 2, 'FILL_BLANK', '___ des Regens gehe ich spazieren.', 'Giới từ + Genitiv', NULL, NULL, NULL, 'Trotz', 'trotz là giới từ đi với Genitiv.'),
('b1-nebensatz-konzessiv', 3, 'MULTIPLE_CHOICE', 'Welcher Satz ergibt Sinn?', 'obwohl đứng trước điều bất lợi', 'Obwohl es regnet, bleibe ich zu Hause.', 'Obwohl es regnet, gehe ich spazieren.', 'Obwohl die Sonne scheint, gehe ich spazieren.', 'B', 'obwohl diễn tả nghịch lý: trời mưa nhưng vẫn đi. Câu A và C không có nghịch lý nào.'),
('b1-nebensatz-konzessiv', 4, 'FILL_BLANK', '___ ich müde bin, lerne ich weiter.', 'Mặc dù', NULL, NULL, NULL, 'Obwohl', 'obwohl = mặc dù, đẩy động từ xuống cuối.'),

-- ===== Genitiv (B1) =====
('b1-genitiv', 0, 'FILL_BLANK', 'das Auto ___ Nachbarn', 'Genitiv giống đực', NULL, NULL, NULL, 'des', 'Genitiv giống đực là des.'),
('b1-genitiv', 1, 'FILL_BLANK', 'die Meinung ___ Leute', 'Genitiv số nhiều', NULL, NULL, NULL, 'der', 'Genitiv số nhiều là der.'),
('b1-genitiv', 2, 'MULTIPLE_CHOICE', 'Welche Form ist richtig?', 'Từ một âm tiết ở Genitiv', 'des Mann', 'des Manns', 'des Mannes', 'C', 'Danh từ giống đực một âm tiết thêm -es: des Mannes.'),
('b1-genitiv', 3, 'FILL_BLANK', 'Das ist ___ Buch. (Anna)', 'Tên riêng', NULL, NULL, NULL, 'Annas', 'Tên riêng thêm -s trực tiếp, không dấu nháy.'),
('b1-genitiv', 4, 'MULTIPLE_CHOICE', 'Wie sagt man das im Gespräch?', 'Văn nói thay Genitiv bằng gì?', 'das Auto des Nachbarn', 'das Auto vom Nachbarn', 'das Auto der Nachbar', 'B', 'Khi nói, von + Dativ phổ biến hơn Genitiv.'),
('b1-genitiv', 5, 'FILL_BLANK', '___ einer Woche bin ich zurück. (trong vòng)', 'Giới từ + Genitiv', NULL, NULL, NULL, 'Innerhalb', 'innerhalb là giới từ đi với Genitiv.'),

-- ===== Präpositionen mit Genitiv =====
('b1-praeposition-genitiv', 0, 'FILL_BLANK', '___ des Streiks fahren keine Züge. (vì)', NULL, NULL, NULL, NULL, 'Wegen', 'wegen + Genitiv = vì, do.'),
('b1-praeposition-genitiv', 1, 'FILL_BLANK', '___ der Sitzung bitte nicht stören. (trong suốt)', NULL, NULL, NULL, NULL, 'Während', 'während + Genitiv = trong suốt.'),
('b1-praeposition-genitiv', 2, 'FILL_BLANK', '___ des Busses nehme ich das Rad. (thay vì)', NULL, NULL, NULL, NULL, 'Statt/Anstatt', 'statt (hoặc anstatt) + Genitiv = thay vì.'),
('b1-praeposition-genitiv', 3, 'MULTIPLE_CHOICE', 'Welche Präposition steht NICHT mit Genitiv?', NULL, 'trotz', 'mit', 'außerhalb', 'B', 'mit luôn đi với Dativ; trotz và außerhalb đi với Genitiv.'),
('b1-praeposition-genitiv', 4, 'MULTIPLE_CHOICE', 'Wo liest man solche Sätze am häufigsten?', 'Nhóm giới từ này xuất hiện ở đâu?', 'in SMS an Freunde', 'in Behördenschreiben und Nachrichten', 'in Kinderbüchern', 'B', 'Nhóm này dày đặc trong thông báo hành chính, báo chí, hợp đồng.'),
('b1-praeposition-genitiv', 5, 'FILL_BLANK', '___ der Öffnungszeiten ist geschlossen. (ngoài)', NULL, NULL, NULL, NULL, 'Außerhalb', 'außerhalb + Genitiv = ngoài phạm vi.'),

-- ===== Nebensätze - final / um ... zu =====
('b1-nebensatz-final', 0, 'MULTIPLE_CHOICE', 'Ich lerne Deutsch, ___ in Deutschland zu arbeiten.', 'Hai vế cùng chủ ngữ', 'damit', 'um', 'ohne', 'B', 'Cùng chủ ngữ thì dùng um ... zu.'),
('b1-nebensatz-final', 1, 'FILL_BLANK', 'Ich erkläre es, ___ du es verstehst.', 'Hai vế KHÁC chủ ngữ', NULL, NULL, NULL, 'damit', 'Khác chủ ngữ (ich / du) thì phải dùng damit.'),
('b1-nebensatz-final', 2, 'FILL_BLANK', 'Ich stehe früh auf, um pünktlich ___ sein.', 'um ... zu cần từ gì trước nguyên thể?', NULL, NULL, NULL, 'zu', 'Cấu trúc um ... zu + nguyên thể.'),
('b1-nebensatz-final', 3, 'MULTIPLE_CHOICE', 'Wie lautet "aufstehen" mit zu?', 'Động từ tách được', 'zu aufstehen', 'aufzustehen', 'auf zu stehen', 'B', 'Động từ tách được thì zu chui vào giữa: aufzustehen.'),
('b1-nebensatz-final', 4, 'WORD_ORDER', 'um / zu / die Prüfung / bestehen / Ich lerne', 'zu + nguyên thể ở cuối', NULL, NULL, NULL, 'Ich lerne um die Prüfung zu bestehen', 'um đứng đầu mệnh đề, zu + nguyên thể ở cuối.'),
('b1-nebensatz-final', 5, 'MULTIPLE_CHOICE', 'Er ging, ___ etwas zu sagen. (mà không)', NULL, 'um', 'statt', 'ohne', 'C', 'ohne ... zu = mà không.'),

-- ===== Adjektive (B1) =====
('b1-adjektive', 0, 'FILL_BLANK', 'Ich kaufe den ___ Laptop. (billig, so sánh hơn)', 'So sánh hơn + biến cách Akkusativ giống đực', NULL, NULL, NULL, 'billigeren', 'billig → billiger (so sánh hơn) + đuôi -en (Akk. đực sau mạo từ xác định).'),
('b1-adjektive', 1, 'FILL_BLANK', 'das ___ Kind (schlafen, Partizip I)', 'Đang ngủ — chủ động', NULL, NULL, NULL, 'schlafende', 'Partizip I: nguyên thể + -d + đuôi biến cách → schlafende.'),
('b1-adjektive', 2, 'FILL_BLANK', 'das ___ Essen (kochen, Partizip II)', 'Đã được nấu — bị động', NULL, NULL, NULL, 'gekochte', 'Partizip II gekocht + đuôi -e → gekochte.'),
('b1-adjektive', 3, 'FILL_BLANK', 'Ich bin stolz ___ dich.', 'Tính từ đi với giới từ cố định', NULL, NULL, NULL, 'auf', 'stolz auf + Akkusativ.'),
('b1-adjektive', 4, 'MULTIPLE_CHOICE', 'Er ist zufrieden ___ der Arbeit.', NULL, 'für', 'mit', 'auf', 'B', 'zufrieden mit + Dativ.'),
('b1-adjektive', 5, 'MULTIPLE_CHOICE', 'Was bedeutet "der lachende Mann"?', 'Partizip I hay II?', 'người đàn ông bị cười', 'người đàn ông đang cười', 'người đàn ông đã cười', 'B', 'Partizip I mang nghĩa chủ động, đang diễn ra.'),

-- ===== Passiv =====
('b1-passiv', 0, 'FILL_BLANK', 'Das Auto ___ repariert. (Präsens Passiv)', 'werden + Partizip II', NULL, NULL, NULL, 'wird', 'Bị động hiện tại: wird + Partizip II.'),
('b1-passiv', 1, 'FILL_BLANK', 'Das Haus ___ 1990 gebaut. (Präteritum Passiv)', 'Quá khứ của werden', NULL, NULL, NULL, 'wurde', 'Bị động quá khứ: wurde + Partizip II.'),
('b1-passiv', 2, 'MULTIPLE_CHOICE', 'Wie lautet das Perfekt Passiv?', 'Dạng đặc biệt của werden ở Perfekt', 'Das Haus ist gebaut geworden.', 'Das Haus ist gebaut worden.', 'Das Haus hat gebaut worden.', 'B', 'Perfekt bị động dùng worden (không phải geworden) và trợ động từ sein.'),
('b1-passiv', 3, 'WORD_ORDER', 'muss / Das Formular / werden / ausgefüllt', 'Modal + Partizip II + werden', NULL, NULL, NULL, 'Das Formular muss ausgefüllt werden', 'Bị động với modal: modal ở vị trí 2, Partizip II + werden ở cuối.'),
('b1-passiv', 4, 'MULTIPLE_CHOICE', 'Das Auto wird ___ dem Mechaniker repariert.', 'Nêu NGƯỜI thực hiện', 'durch', 'von', 'mit', 'B', 'von + Dativ dùng cho người; durch + Akk cho phương tiện/nguyên nhân.'),
('b1-passiv', 5, 'MULTIPLE_CHOICE', 'Wie sagt man "Das Formular wird ausgefüllt" aktiv?', 'Cách thay bị động khi nói', 'Man füllt das Formular aus.', 'Das Formular füllt aus.', 'Es wird das Formular aus.', 'A', 'man + động từ chủ động là cách thay bị động rất thông dụng khi nói.'),

-- ===== Konjunktiv II werden =====
('b1-konjunktiv-2-werden', 0, 'FILL_BLANK', 'Ich ___ gern nach Deutschland fahren. (werden)', 'würde + nguyên thể', NULL, NULL, NULL, 'würde', 'Động từ thường dùng würde + nguyên thể.'),
('b1-konjunktiv-2-werden', 1, 'FILL_BLANK', 'Wenn ich Zeit ___, würde ich kommen. (haben)', 'haben có dạng riêng, không dùng würde', NULL, NULL, NULL, 'hätte', 'haben → hätte; không nói "haben würde".'),
('b1-konjunktiv-2-werden', 2, 'MULTIPLE_CHOICE', 'Welcher Satz ist besser?', 'sein có dạng riêng không?', 'Wenn ich reich sein würde...', 'Wenn ich reich wäre...', 'Wenn ich reich würde sein...', 'B', 'sein có dạng riêng wäre, dùng würde với nó nghe vụng.'),
('b1-konjunktiv-2-werden', 3, 'MULTIPLE_CHOICE', 'Wie sagt man die IRREALE Bedingung in der VERGANGENHEIT?', 'Quá khứ giả định', 'Wenn ich Zeit hätte, würde ich kommen.', 'Wenn ich Zeit gehabt hätte, wäre ich gekommen.', 'Wenn ich Zeit habe, komme ich.', 'B', 'Quá khứ giả định: hätte/wäre + Partizip II ở cả hai vế, không có würde.'),
('b1-konjunktiv-2-werden', 4, 'FILL_BLANK', '___ Sie mir bitte helfen? (können, lịch sự)', 'Konjunktiv II của können', NULL, NULL, NULL, 'Könnten', 'können → könnten, dùng cho câu đề nghị lịch sự.'),
('b1-konjunktiv-2-werden', 5, 'WORD_ORDER', 'An deiner Stelle / ich / sprechen / würde / mit dem Chef', 'Cấu trúc khuyên nhủ', NULL, NULL, NULL, 'An deiner Stelle würde ich mit dem Chef sprechen', 'An deiner Stelle chiếm vị trí 1, würde ở vị trí 2, nguyên thể cuối câu.'),

-- ===== Verben mit Präpositionalobjekt (B1) =====
('b1-verben-praepositionalobjekt', 0, 'FILL_BLANK', 'Ich bewerbe mich ___ die Stelle.', 'Nộp đơn xin việc', NULL, NULL, NULL, 'um', 'sich bewerben um + Akkusativ.'),
('b1-verben-praepositionalobjekt', 1, 'FILL_BLANK', 'Ich ärgere mich ___ den Lärm.', 'Bực mình vì', NULL, NULL, NULL, 'über', 'sich ärgern über + Akkusativ.'),
('b1-verben-praepositionalobjekt', 2, 'FILL_BLANK', 'Ich nehme ___ dem Kurs teil.', 'teilnehmen + ?', NULL, NULL, NULL, 'an', 'teilnehmen an + Dativ.'),
('b1-verben-praepositionalobjekt', 3, 'MULTIPLE_CHOICE', '___ wartest du? — Auf den Bus.', 'Hỏi về VẬT', 'Auf wen', 'Worauf', 'Wofür', 'B', 'Hỏi về vật dùng wo(r)- + giới từ: worauf.'),
('b1-verben-praepositionalobjekt', 4, 'MULTIPLE_CHOICE', 'Wartest du auf Anna? — Ja, ich warte ___.', 'Đối tượng là NGƯỜI', 'darauf', 'auf sie', 'worauf', 'B', 'Với người thì dùng giới từ + đại từ, không dùng da(r)-.'),
('b1-verben-praepositionalobjekt', 5, 'FILL_BLANK', 'Ich muss mich ___ das Wetter gewöhnen.', 'Quen với', NULL, NULL, NULL, 'an', 'sich gewöhnen an + Akkusativ.'),

-- ===== Pronominaladverbien =====
('b1-pronominaladverbien', 0, 'FILL_BLANK', 'Wartest du auf den Bus? — Ja, ich warte ___.', 'Thay cho "auf den Bus"', NULL, NULL, NULL, 'darauf', 'da + r + auf = darauf, thay cho cụm giới từ + vật.'),
('b1-pronominaladverbien', 1, 'FILL_BLANK', 'Denkst du an die Prüfung? — Ja, ich denke ___.', NULL, NULL, NULL, NULL, 'daran', 'da + r + an = daran.'),
('b1-pronominaladverbien', 2, 'MULTIPLE_CHOICE', 'Welche Form ist richtig?', 'Giới từ mit có cần -r- không?', 'darmit', 'damit', 'dawomit', 'B', 'Chỉ chèn -r- khi giới từ bắt đầu bằng nguyên âm. mit → damit.'),
('b1-pronominaladverbien', 3, 'MULTIPLE_CHOICE', 'Denkst du an Anna? — Ja, ich denke ___.', 'Đối tượng là người', 'daran', 'an sie', 'woran', 'B', 'da(r)- chỉ dùng cho vật/việc, không dùng cho người.'),
('b1-pronominaladverbien', 4, 'FILL_BLANK', 'Ich freue mich ___, dass du kommst.', 'sich freuen auf + mệnh đề dass', NULL, NULL, NULL, 'darauf', 'da(r)- mở đường cho mệnh đề dass phía sau.'),
('b1-pronominaladverbien', 5, 'FILL_BLANK', '___ sprecht ihr? — Über den Film.', 'Hỏi về việc đang nói tới', NULL, NULL, NULL, 'Worüber', 'wo + r + über = worüber.'),

-- ===== brauchen / lassen =====
('b1-brauchen-lassen', 0, 'FILL_BLANK', 'Du brauchst nicht ___ kommen.', 'brauchen cần từ gì trước nguyên thể?', NULL, NULL, NULL, 'zu', 'nicht brauchen ZU + nguyên thể — khác modal.'),
('b1-brauchen-lassen', 1, 'MULTIPLE_CHOICE', 'Was bedeutet "Ich lasse mein Auto reparieren"?', 'lassen + nguyên thể', 'Tôi tự sửa xe.', 'Tôi mang xe đi cho thợ sửa.', 'Tôi để xe lại đó.', 'B', 'lassen + nguyên thể = nhờ/thuê người khác làm.'),
('b1-brauchen-lassen', 2, 'MULTIPLE_CHOICE', 'Welcher Satz ist richtig?', 'brauchen chỉ dùng ở dạng phủ định', 'Du brauchst zu kommen.', 'Du brauchst nicht zu kommen.', 'Du brauchst kommen zu.', 'B', 'brauchen chỉ dùng phủ định; khẳng định thì dùng müssen.'),
('b1-brauchen-lassen', 3, 'FILL_BLANK', 'Ich ___ die Haare schneiden. (lassen, ngôi ich)', 'Đi cắt tóc — thợ cắt', NULL, NULL, NULL, 'lasse', 'lassen ngôi ich: lasse. Nghĩa là nhờ thợ cắt.'),
('b1-brauchen-lassen', 4, 'MULTIPLE_CHOICE', 'Wie lautet das Perfekt von "Ich lasse mein Auto reparieren"?', 'Dạng Perfekt đặc biệt của lassen', 'Ich habe mein Auto reparieren gelassen.', 'Ich habe mein Auto reparieren lassen.', 'Ich bin mein Auto reparieren lassen.', 'B', 'Khi đi với động từ khác, Perfekt của lassen là lassen chứ không phải gelassen.'),

-- ===== Modalverben (B1) =====
('b1-modalverben', 0, 'MULTIPLE_CHOICE', 'Was bedeutet "Er muss krank sein"?', 'Nghĩa chủ quan', 'Anh ấy bắt buộc phải ốm.', 'Chắc chắn anh ấy ốm.', 'Anh ấy muốn ốm.', 'B', 'müssen mang nghĩa chủ quan = suy đoán gần như chắc chắn.'),
('b1-modalverben', 1, 'MULTIPLE_CHOICE', 'Was bedeutet "Er soll sehr reich sein"?', 'sollen thuật lại lời người khác', 'Anh ta nên giàu lên.', 'Anh ta tự nhận là giàu.', 'Nghe nói anh ta rất giàu.', 'C', 'sollen dùng để thuật lại điều nghe được, người nói không tự khẳng định.'),
('b1-modalverben', 2, 'MULTIPLE_CHOICE', 'Was bedeutet "Er will reich sein"?', 'wollen ở nghĩa chủ quan', 'Anh ta tự nhận mình giàu.', 'Nghe nói anh ta giàu.', 'Anh ta muốn trở nên giàu.', 'A', 'wollen ở nghĩa chủ quan = tự nhận, hàm ý người nói nghi ngờ.'),
('b1-modalverben', 3, 'FILL_BLANK', 'Das ___ stimmen. (dürfen — có lẽ đúng)', 'Konjunktiv II của dürfen, nghĩa dè dặt', NULL, NULL, NULL, 'dürfte', 'dürfte diễn đạt phỏng đoán dè dặt: có lẽ.'),
('b1-modalverben', 4, 'MULTIPLE_CHOICE', 'Welcher Satz drückt die GRÖSSTE Sicherheit aus?', 'Thang độ chắc chắn', 'Er kann krank sein.', 'Er muss krank sein.', 'Er soll krank sein.', 'B', 'müssen ~95%, dürfte ~75%, können ~50%, sollen chỉ là nghe nói.'),
('b1-modalverben', 5, 'MULTIPLE_CHOICE', 'Wie sagt man "Chắc chắn hồi đó anh ấy ốm"?', 'Nghĩa chủ quan ở quá khứ', 'Er musste krank sein.', 'Er muss krank gewesen sein.', 'Er hat krank sein müssen.', 'B', 'Nghĩa chủ quan ở quá khứ: modal + Partizip II + sein/haben.'),

-- ===== Infinitivkonstruktionen =====
('b1-infinitivkonstruktionen', 0, 'FILL_BLANK', 'Ich habe vergessen, dich ___. (anrufen, với zu)', 'Động từ tách được', NULL, NULL, NULL, 'anzurufen', 'Động từ tách được thì zu chui vào giữa: anzurufen.'),
('b1-infinitivkonstruktionen', 1, 'FILL_BLANK', 'Es ist wichtig, jeden Tag ___ lernen.', 'Cần từ gì trước nguyên thể?', NULL, NULL, NULL, 'zu', 'Sau "Es ist wichtig" phải dùng zu + nguyên thể.'),
('b1-infinitivkonstruktionen', 2, 'MULTIPLE_CHOICE', 'Welcher Satz braucht KEIN "zu"?', 'Nhóm nào không dùng zu?', 'Ich hoffe, dich ... sehen.', 'Ich muss ... gehen.', 'Es ist schwer, Deutsch ... lernen.', 'B', 'Động từ khiếm khuyết không bao giờ đi với zu.'),
('b1-infinitivkonstruktionen', 3, 'MULTIPLE_CHOICE', 'Wie lautet "einkaufen" mit zu?', NULL, 'zu einkaufen', 'ein zu kaufen', 'einzukaufen', 'C', 'Tách được thì zu vào giữa tiền tố và thân từ: einzukaufen.'),
('b1-infinitivkonstruktionen', 4, 'FILL_BLANK', 'Ich habe keine Lust, heute ___. (ausgehen, với zu)', NULL, NULL, NULL, NULL, 'auszugehen', 'ausgehen tách được → auszugehen.'),
('b1-infinitivkonstruktionen', 5, 'MULTIPLE_CHOICE', 'Welcher Satz ist richtig?', 'sehen có dùng zu không?', 'Ich höre ihn zu singen.', 'Ich höre ihn singen.', 'Ich höre zu ihn singen.', 'B', 'sehen và hören đi với nguyên thể trần, không có zu.')

) AS v(slug, order_index, exercise_type, prompt_de, hint_vi, option_a, option_b, option_c, correct_answer, explanation_vi)
JOIN grammar_topics t ON t.slug = v.slug
WHERE NOT EXISTS (SELECT 1 FROM grammar_exercises e WHERE e.topic_id = t.id);
