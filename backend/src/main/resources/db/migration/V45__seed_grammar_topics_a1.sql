-- 24 chủ điểm ngữ pháp A1 (Lektion 1-8).
-- Danh sách và thứ tự chủ điểm bám theo mục lục giáo trình (dữ kiện, không phải nội dung sáng
-- tạo); toàn bộ phần lý thuyết bên dưới viết mới bằng tiếng Việt, không sao chép nguồn nào —
-- xem docs/phase-5-grammar.md, mục quyết định nguồn.
-- ON CONFLICT DO NOTHING: seed không ghi đè chủ điểm admin đã sửa tay trên môi trường đang chạy.

INSERT INTO grammar_topics (slug, title_de, title_vi, level, group_label, order_index, summary_vi, theory_md) VALUES

('a1-verb-konjugation', 'Verb - Konjugation', 'Chia động từ ở thì hiện tại', 'A1', 'Lektion 1', 1,
'Động từ tiếng Đức đổi đuôi theo chủ ngữ. Nắm 6 đuôi cơ bản là nói được câu đầu tiên.', $md$
## Động từ đổi đuôi theo chủ ngữ

Trong tiếng Việt động từ **không đổi**: "tôi học", "bạn học", "chúng tôi học". Tiếng Đức thì khác —
động từ đổi đuôi theo từng chủ ngữ.

Bỏ đuôi `-en` của động từ nguyên thể để lấy **thân từ**, rồi gắn đuôi tương ứng.

> `lernen` → bỏ `-en` → thân từ `lern-`

| Chủ ngữ | Đuôi | Ví dụ với `lernen` |
| --- | --- | --- |
| ich | -e | ich lerne |
| du | -st | du lernst |
| er/sie/es | -t | er lernt |
| wir | -en | wir lernen |
| ihr | -t | ihr lernt |
| sie/Sie | -en | sie lernen |

### Hai chỗ người Việt hay sai

1. **Quên đổi đuôi.** Nói `ich lernen` là lỗi phổ biến nhất vì tiếng Việt không có khái niệm này.
2. **Thân từ kết thúc bằng `-t` hoặc `-d`**: phải thêm `-e-` cho dễ đọc → `arbeiten` → `du arbeitest`
   (không phải `du arbeitst`). Thân từ kết thúc bằng `-s/-ß/-x/-z` thì ngôi `du` chỉ thêm `-t`:
   `heißen` → `du heißt`.

### Ngoại lệ phải thuộc lòng

| Chủ ngữ | sein (là, thì, ở) | haben (có) |
| --- | --- | --- |
| ich | bin | habe |
| du | bist | hast |
| er/sie/es | ist | hat |
| wir | sind | haben |
| ihr | seid | habt |
| sie/Sie | sind | haben |
$md$),

('a1-personalpronomen-nominativ', 'Personalpronomen - Nominativ', 'Đại từ nhân xưng ở cách 1', 'A1', 'Lektion 1', 2,
'ich, du, er, sie, es, wir, ihr, sie/Sie — bộ đại từ làm chủ ngữ, học một lần dùng cả đời.', $md$
## Ai đang làm hành động?

Đại từ nhân xưng ở **Nominativ** đứng làm chủ ngữ — trả lời câu hỏi *Wer?* (Ai?).

| Tiếng Đức | Tiếng Việt |
| --- | --- |
| ich | tôi |
| du | bạn (thân mật) |
| er | anh ấy / nó (giống đực) |
| sie | cô ấy / nó (giống cái) |
| es | nó (giống trung) |
| wir | chúng tôi |
| ihr | các bạn |
| sie | họ |
| Sie | ông/bà (lịch sự) |

### Ba chữ `sie` khác nhau — phân biệt thế nào?

Đây là chỗ rối nhất với người mới. Nhìn **đuôi động từ** là ra ngay:

- `sie ist` → **cô ấy** (động từ số ít)
- `sie sind` → **họ** (động từ số nhiều)
- `Sie sind` → **ông/bà** (viết hoa chữ S, kể cả giữa câu)

### Lưu ý văn hoá

Người Đức dùng `Sie` với người lạ, đồng nghiệp mới, người lớn tuổi. Dùng `du` quá sớm bị coi là
suồng sã — khác hẳn thói quen xưng hô tiếng Việt, nên phải để ý.
$md$),

('a1-wortstellung-hauptsatz', 'Wortstellung - Hauptsatz / Fragesatz', 'Trật tự từ trong câu kể và câu hỏi', 'A1', 'Lektion 1', 3,
'Quy tắc V2: động từ chia luôn nằm ở vị trí thứ hai trong câu kể. Câu hỏi thì đảo lên đầu.', $md$
## Quy tắc V2 — xương sống của câu tiếng Đức

Trong câu kể, **động từ đã chia luôn đứng ở vị trí thứ hai**. Không phải từ thứ hai, mà là *thành
phần* thứ hai.

| Vị trí 1 | Vị trí 2 (động từ) | Phần còn lại |
| --- | --- | --- |
| Ich | lerne | heute Deutsch. |
| Heute | lerne | ich Deutsch. |
| Deutsch | lerne | ich heute. |

Để ý: đưa `heute` lên đầu thì `ich` bị đẩy ra sau động từ. Động từ **không bao giờ nhúc nhích**
khỏi vị trí 2.

> Người Việt hay viết `Heute ich lerne Deutsch` vì bê nguyên trật tự tiếng Việt sang. Đây là lỗi
> bị trừ điểm nhiều nhất ở phần Viết A1.

## Câu hỏi

**Câu hỏi Có/Không — động từ nhảy lên đầu:**
- `Lernst du Deutsch?` (Bạn học tiếng Đức à?)
- `Ist er Student?` (Anh ấy là sinh viên à?)

**Câu hỏi có từ để hỏi — từ để hỏi đứng đầu, động từ vẫn vị trí 2:**
- `Was lernst du?` (Bạn học gì?)
- `Wo wohnst du?` (Bạn sống ở đâu?)

Từ để hỏi hay dùng: `wer` (ai), `was` (gì), `wo` (ở đâu), `wann` (khi nào), `wie` (thế nào),
`warum` (tại sao).
$md$),

('a1-starke-verben', 'Starke Verben', 'Động từ mạnh đổi nguyên âm', 'A1', 'Lektion 2', 4,
'Một nhóm động từ đổi nguyên âm thân từ, nhưng chỉ ở hai ngôi du và er/sie/es.', $md$
## Chỉ hai ngôi bị đổi

Động từ mạnh (starke Verben) chia y như động từ thường, **trừ hai ngôi `du` và `er/sie/es`** thì
nguyên âm trong thân từ bị đổi.

| Kiểu đổi | Nguyên thể | ich | du | er/sie/es | wir |
| --- | --- | --- | --- | --- | --- |
| a → ä | fahren | fahre | **fährst** | **fährt** | fahren |
| a → ä | schlafen | schlafe | **schläfst** | **schläft** | schlafen |
| e → i | sprechen | spreche | **sprichst** | **spricht** | sprechen |
| e → i | essen | esse | **isst** | **isst** | essen |
| e → i | geben | gebe | **gibst** | **gibt** | geben |
| e → ie | sehen | sehe | **siehst** | **sieht** | sehen |
| e → ie | lesen | lese | **liest** | **liest** | lesen |
| au → äu | laufen | laufe | **läufst** | **läuft** | laufen |

### Cách học cho nhẹ

- Nguyên âm chỉ đổi ở **số ít ngôi 2 và 3**. `ich`, `wir`, `ihr`, `sie` luôn giữ nguyên âm gốc.
- Thuộc dạng `du` là suy ra được dạng `er`: chỉ việc đổi `-st` thành `-t`.
- Không có quy tắc nào đoán được động từ nào là mạnh — phải học thuộc từng từ khi gặp.
$md$),

('a1-nomen-artikel-nominativ', 'Nomen und Artikel - Nominativ', 'Danh từ và mạo từ ở cách 1', 'A1', 'Lektion 2', 5,
'Mọi danh từ tiếng Đức đều mang một trong ba giống der/die/das, học từ nào phải học kèm mạo từ.', $md$
## Danh từ luôn đi kèm mạo từ

Tiếng Việt không phân giống danh từ; tiếng Đức thì mỗi danh từ thuộc một trong ba giống:

| Giống | Mạo từ xác định | Mạo từ không xác định | Ví dụ |
| --- | --- | --- | --- |
| Đực (maskulin) | **der** | ein | der Tisch (cái bàn) |
| Cái (feminin) | **die** | eine | die Lampe (cái đèn) |
| Trung (neutral) | **das** | ein | das Buch (quyển sách) |
| Số nhiều | **die** | — | die Bücher |

### Quy tắc vàng khi học từ vựng

**Không bao giờ học danh từ trần.** Học `der Tisch` chứ không học `Tisch`. Giống của danh từ phần
lớn không suy ra được từ nghĩa — `das Mädchen` (cô bé) là giống *trung*, không phải giống cái.

### der / die / das khác ein / eine ở chỗ nào?

- **der/die/das** = "cái đó", thứ người nghe đã biết
- **ein/eine** = "một cái nào đó", nhắc lần đầu

> **Ein** Mann steht dort. **Der** Mann ist mein Lehrer.
> (Có một người đàn ông đứng đó. Người đàn ông đó là thầy tôi.)

Ở số nhiều không có mạo từ không xác định: *Ich sehe Bücher* (tôi thấy mấy quyển sách).
$md$),

('a1-anrede', 'Anrede', 'Cách xưng hô du / ihr / Sie', 'A1', 'Lektion 2', 6,
'Chọn sai du hay Sie là lỗi giao tiếp chứ không chỉ là lỗi ngữ pháp — cần biết dùng lúc nào.', $md$
## Ba cách gọi "bạn"

| Đại từ | Dùng với | Ví dụ |
| --- | --- | --- |
| **du** | 1 người thân quen | Woher kommst **du**? |
| **ihr** | nhiều người thân quen | Woher kommt **ihr**? |
| **Sie** | 1 hoặc nhiều người lạ/trang trọng | Woher kommen **Sie**? |

`Sie` lịch sự **luôn viết hoa**, kể cả khi đứng giữa câu — đó là cách phân biệt với `sie` (họ).

## Khi nào dùng cái nào?

**Dùng `Sie`:** người lạ, nhân viên hành chính, bác sĩ, thầy cô, đồng nghiệp mới, người lớn tuổi,
thư từ công việc.

**Dùng `du`:** bạn bè, người thân, trẻ em, sinh viên với sinh viên, đồng nghiệp đã thân.

### Điểm người Việt hay vướng

Tiếng Việt có cả chục cách xưng hô theo tuổi tác và quan hệ nên ta quen đoán theo cảm tính. Tiếng
Đức chỉ có hai mức, nhưng **ranh giới cứng hơn**: dùng `du` với người chưa cho phép bị coi là
thiếu tôn trọng. Nguyên tắc an toàn: **mặc định `Sie`**, đổi sang `du` khi người kia mời
("Wir können uns duzen").

| Trang trọng | Thân mật |
| --- | --- |
| Guten Tag / Guten Morgen | Hallo |
| Auf Wiedersehen | Tschüss |
$md$),

('a1-nomen-genusregeln', 'Nomen - Genusregeln', 'Quy tắc đoán giống danh từ', 'A1', 'Lektion 3', 7,
'Giống danh từ phần lớn phải học thuộc, nhưng có một số đuôi từ cho biết chắc chắn.', $md$
## Có quy tắc, nhưng chỉ một phần

Đa số danh từ phải học thuộc giống. Tuy nhiên **đuôi từ** cho biết chắc chắn trong khá nhiều
trường hợp — thuộc bảng này là đỡ được một mảng lớn.

### Chắc chắn là `die` (giống cái)

| Đuôi | Ví dụ |
| --- | --- |
| **-ung** | die Wohnung, die Zeitung |
| **-heit / -keit** | die Freiheit, die Möglichkeit |
| **-schaft** | die Freundschaft |
| **-tion / -sion** | die Situation, die Diskussion |
| **-ei** | die Bäckerei |
| **-ie** | die Familie |

### Chắc chắn là `das` (giống trung)

| Đuôi | Ví dụ |
| --- | --- |
| **-chen / -lein** | das Mädchen, das Fräulein |
| **-ment** | das Dokument |
| **-um** | das Zentrum, das Museum |
| Động từ dùng làm danh từ | das Essen, das Lernen |

### Thường là `der` (giống đực)

| Nhóm | Ví dụ |
| --- | --- |
| **-er** chỉ người/nghề | der Lehrer, der Computer |
| **-ling / -ismus** | der Frühling, der Tourismus |
| Ngày, tháng, mùa | der Montag, der Januar, der Sommer |
| Thời tiết | der Regen, der Wind, der Schnee |

### Bẫy kinh điển

`das Mädchen` (cô bé) là giống **trung**, không phải giống cái — vì đuôi `-chen` luôn thắng nghĩa
của từ. Quy tắc đuôi từ mạnh hơn trực giác về nghĩa.
$md$),

('a1-nomen-komposita', 'Nomen - Komposita', 'Từ ghép — danh từ dính liền nhau', 'A1', 'Lektion 3', 8,
'Tiếng Đức ghép nhiều danh từ thành một từ dài. Giống của từ ghép lấy theo từ cuối cùng.', $md$
## Ghép từ: đọc từ phải sang trái

Tiếng Đức ghép các danh từ thành **một từ viết liền**, không gạch nối, không cách:

> `die Hand` (bàn tay) + `der Schuh` (giày) → **der Handschuh** (găng tay)

### Hai quy tắc quyết định

1. **Giống lấy theo từ CUỐI CÙNG.** `der Handschuh` là giống đực vì `der Schuh` giống đực, dù
   `die Hand` là giống cái.
2. **Nghĩa chính nằm ở từ cuối**, các từ trước chỉ bổ nghĩa. Đọc từ phải sang trái để hiểu:
   `Handschuh` = "giày (cho) tay".

| Từ ghép | Phân tích | Nghĩa |
| --- | --- | --- |
| das Wörterbuch | Wörter (từ) + **das Buch** | từ điển |
| die Haustür | Haus (nhà) + **die Tür** | cửa nhà |
| der Bahnhof | Bahn (đường ray) + **der Hof** | nhà ga |
| die Krankenschwester | kranken (bệnh) + **die Schwester** | y tá |

### Chữ nối

Nhiều từ ghép chèn thêm `-s-` hoặc `-n-` cho dễ đọc: `die Arbeit` + `der Platz` →
`der Arbeit**s**platz` (nơi làm việc). Không có quy tắc tuyệt đối, học theo từng từ.

### Vì sao điều này có lợi cho bạn

Nhìn thấy `Krankenhausverwaltung` đừng hoảng. Tách ra: `Kranken|haus|verwaltung` = "quản lý bệnh
viện". Từ dài trong tiếng Đức thường **dễ đoán hơn** từ ngắn, vì chúng được ghép từ những từ bạn
đã biết.
$md$),

('a1-adjektiv', 'Adjektiv', 'Tính từ đứng sau động từ', 'A1', 'Lektion 3', 9,
'Ở trình A1 tính từ chủ yếu đứng sau sein/werden và giữ nguyên dạng — chưa phải biến cách.', $md$
## Tin tốt cho người mới

Khi tính từ **đứng sau động từ** `sein`, `werden`, `bleiben`, nó **không đổi gì cả**:

| Câu | Tính từ |
| --- | --- |
| Das Auto ist **neu**. | neu (không đuôi) |
| Die Wohnung ist **neu**. | neu (không đuôi) |
| Die Bücher sind **neu**. | neu (không đuôi) |

Dù danh từ là giống gì, số ít hay số nhiều — tính từ vẫn y nguyên. Đây là cách dùng dễ nhất và
cũng là cách A1 dùng nhiều nhất.

> Khi tính từ **đứng trước danh từ** thì mới phải đổi đuôi (`ein **neues** Auto`) — chuyện đó để
> trình B1, xem chủ điểm "Biến cách tính từ".

## Cặp tính từ A1 cần thuộc

| Tính từ | Nghĩa | Trái nghĩa |
| --- | --- | --- |
| groß | to | klein (nhỏ) |
| alt | cũ, già | neu (mới) / jung (trẻ) |
| gut | tốt | schlecht (tệ) |
| teuer | đắt | billig (rẻ) |
| lang | dài | kurz (ngắn) |
| schnell | nhanh | langsam (chậm) |
| leicht | dễ, nhẹ | schwer (khó, nặng) |

## Tăng cường mức độ

- `sehr` (rất): Das ist **sehr** gut.
- `zu` (quá — mang nghĩa tiêu cực): Das ist **zu** teuer. (đắt quá, không mua nổi)
- `ziemlich` (khá): Das ist **ziemlich** groß.

Phân biệt `sehr` và `zu` rất quan trọng: *sehr teuer* là "rất đắt" (vẫn có thể mua), còn
*zu teuer* là "đắt quá mức" (không chấp nhận được).
$md$),

('a1-trennbare-verben', 'Nicht trennbare und trennbare Verben', 'Động từ tách được và không tách được', 'A1', 'Lektion 4', 10,
'Một số động từ bị tách đôi khi chia: tiền tố nhảy xuống cuối câu.', $md$
## Động từ tự tách làm đôi

`aufstehen` (thức dậy) gồm tiền tố `auf-` và động từ `stehen`. Khi chia, **tiền tố tách ra và nhảy
xuống cuối câu**:

> Ich **stehe** um 6 Uhr **auf**. (Tôi dậy lúc 6 giờ.)

Đây là điều tiếng Việt hoàn toàn không có, nên rất dễ quên mất cái đuôi ở cuối.

### Tiền tố TÁCH ĐƯỢC (có trọng âm)

| Tiền tố | Ví dụ | Chia |
| --- | --- | --- |
| **auf-** | aufstehen | ich stehe ... auf |
| **an-** | anrufen (gọi điện) | ich rufe ... an |
| **ein-** | einkaufen (đi chợ) | ich kaufe ... ein |
| **aus-** | aussehen (trông như) | er sieht ... aus |
| **mit-** | mitkommen (đi cùng) | ich komme ... mit |
| **ab-** | abfahren (khởi hành) | der Zug fährt ... ab |
| **zurück-** | zurückkommen | ich komme ... zurück |

### Tiền tố KHÔNG tách (không có trọng âm)

`be-`, `emp-`, `ent-`, `er-`, `ge-`, `ver-`, `zer-`

| Động từ | Chia |
| --- | --- |
| **be**suchen (thăm) | ich **besuche** dich |
| **ver**stehen (hiểu) | ich **verstehe** das |
| **er**klären (giải thích) | er **erklärt** es |
| **be**zahlen (trả tiền) | ich **bezahle** |

### Mẹo phân biệt

Nghe **trọng âm**: tách được thì trọng âm rơi vào tiền tố (**AUF**stehen), không tách thì rơi vào
thân từ (be**SU**chen). Bảy tiền tố không tách ở trên nên học thuộc — chúng cố định.

> Ngoại lệ: `durch-`, `über-`, `um-`, `unter-` lúc tách lúc không, tuỳ nghĩa. Gặp thì tra từ điển.
$md$),

('a1-nomen-artikel-akkusativ', 'Nomen und Artikel - Akkusativ', 'Danh từ và mạo từ ở cách 4', 'A1', 'Lektion 4', 11,
'Cách 4 dùng cho tân ngữ trực tiếp. Chỉ giống đực đổi mạo từ — ba giống còn lại giữ nguyên.', $md$
## Akkusativ dùng khi nào?

Khi danh từ là **đối tượng trực tiếp nhận hành động** — trả lời câu hỏi *Wen?* (ai) / *Was?* (cái gì).

> Ich sehe **den Mann**. (Tôi thấy người đàn ông đó.)

| Cách | Đực | Cái | Trung | Số nhiều |
| --- | --- | --- | --- | --- |
| Nominativ | der / ein | die / eine | das / ein | die |
| **Akkusativ** | **den / einen** | die / eine | das / ein | die |

### Điểm mấu chốt

**Chỉ giống đực đổi** (`der` → `den`, `ein` → `einen`). Ba giống còn lại y hệt Nominativ. Nhớ được
một dòng này là xong 80% Akkusativ.

> Der Tisch ist neu. → Ich kaufe **den** Tisch.
> Die Lampe ist neu. → Ich kaufe **die** Lampe. *(không đổi)*
> Das Buch ist neu. → Ich kaufe **das** Buch. *(không đổi)*

### Động từ hay đi với Akkusativ

`haben`, `kaufen`, `sehen`, `essen`, `trinken`, `lesen`, `brauchen`, `suchen`, `nehmen`, `machen`

### Giới từ luôn đi với Akkusativ

`durch` (xuyên qua), `für` (cho), `gegen` (chống lại), `ohne` (không có), `um` (quanh)

> Ich kaufe ein Geschenk **für den** Lehrer.

Mẹo nhớ: **DOG FU** — *durch, ohne, gegen, für, um*.
$md$),

('a1-personalpronomen-akkusativ', 'Personalpronomen - Akkusativ', 'Đại từ nhân xưng ở cách 4', 'A1', 'Lektion 4', 12,
'mich, dich, ihn, sie, es, uns, euch, sie — dạng đại từ khi làm tân ngữ.', $md$
## Khi đại từ là đối tượng nhận hành động

| Nominativ (chủ ngữ) | Akkusativ (tân ngữ) | Ví dụ |
| --- | --- | --- |
| ich | **mich** | Er sieht mich. |
| du | **dich** | Ich sehe dich. |
| er | **ihn** | Ich sehe ihn. |
| sie | **sie** | Ich sehe sie. |
| es | **es** | Ich sehe es. |
| wir | **uns** | Er sieht uns. |
| ihr | **euch** | Ich sehe euch. |
| sie (họ) | **sie** | Ich sehe sie. |
| Sie (lịch sự) | **Sie** | Ich sehe Sie. |

### Chỉ có 4 dạng thật sự phải nhớ

`mich`, `dich`, `ihn`, `uns`, `euch` — còn `sie`, `es`, `Sie` giữ nguyên như Nominativ. Nhẹ hơn
nhiều so với cảm giác ban đầu.

### Đại từ thay cho đồ vật

Tiếng Việt dùng "nó" cho mọi thứ. Tiếng Đức phải chọn đại từ **theo giống của danh từ**:

> Wo ist **der Schlüssel**? — Ich habe **ihn**. *(der → ihn)*
> Wo ist **die Tasche**? — Ich habe **sie**. *(die → sie)*
> Wo ist **das Buch**? — Ich habe **es**. *(das → es)*

Đây là lý do phải học danh từ kèm mạo từ ngay từ đầu — không biết giống thì không thay đại từ đúng.
$md$),

('a1-possessivartikel', 'Possessivartikel', 'Mạo từ sở hữu (mein, dein, sein...)', 'A1', 'Lektion 5', 13,
'mein, dein, sein, ihr, unser, euer, Ihr — biến cách y hệt ein/kein.', $md$
## Của ai?

| Chủ sở hữu | Mạo từ sở hữu | Ví dụ |
| --- | --- | --- |
| ich | **mein** | mein Vater (bố tôi) |
| du | **dein** | dein Buch |
| er / es | **sein** | sein Auto (xe của anh ấy) |
| sie (cô ấy) | **ihr** | ihr Auto (xe của cô ấy) |
| wir | **unser** | unsere Wohnung |
| ihr | **euer** | euer Haus |
| sie (họ) | **ihr** | ihre Kinder |
| Sie (lịch sự) | **Ihr** | Ihr Name (viết hoa) |

### Biến cách: giống hệt `ein`

Mạo từ sở hữu đổi đuôi theo đúng bảng của `ein`/`kein`:

| Cách | Đực | Cái | Trung | Số nhiều |
| --- | --- | --- | --- | --- |
| Nominativ | mein | mein**e** | mein | mein**e** |
| Akkusativ | mein**en** | mein**e** | mein | mein**e** |
| Dativ | mein**em** | mein**er** | mein**em** | mein**en** |

> Das ist **mein** Vater. → Ich besuche **meinen** Vater. → Ich helfe **meinem** Vater.

### Bẫy lớn nhất: `sein` hay `ihr`?

Đuôi đi theo **danh từ đứng sau**, còn gốc từ đi theo **người sở hữu**:

> **Anna** sucht **ihren** Bruder. *(Anna → ihr; Bruder giống đực Akkusativ → -en)*
> **Tom** sucht **seine** Schwester. *(Tom → sein; Schwester giống cái → -e)*

Người Việt hay nhầm vì tiếng Việt chỉ có "của anh ấy / của cô ấy" đặt sau, không đổi hình.
$md$),

('a1-praeteritum-haben-sein', 'Präteritum - haben / sein', 'Quá khứ của haben và sein', 'A1', 'Lektion 5', 14,
'Hai động từ này dùng dạng quá khứ đơn thay vì Perfekt — phải thuộc lòng.', $md$
## Ngoại lệ quan trọng

Tiếng Đức nói chuyện thường dùng thì **Perfekt** để kể quá khứ. Nhưng riêng `haben` và `sein`
(cùng các động từ khiếm khuyết) thì dùng **Präteritum** — kể cả khi nói.

| Ngôi | sein → **war** | haben → **hatte** |
| --- | --- | --- |
| ich | war | hatte |
| du | war**st** | hatte**st** |
| er/sie/es | war | hatte |
| wir | war**en** | hatte**n** |
| ihr | war**t** | hatte**t** |
| sie/Sie | war**en** | hatte**n** |

Để ý: `ich` và `er/sie/es` **giống hệt nhau và không có đuôi** — đặc điểm chung của mọi động từ ở
Präteritum.

### Dùng thế nào

> Gestern **war** ich krank. (Hôm qua tôi bị ốm.)
> Ich **hatte** keine Zeit. (Tôi đã không có thời gian.)
> Wo **warst** du? (Bạn đã ở đâu?)

### Đừng nói thế này

Người học hay tạo ra *ich habe gewesen* hoặc *ich habe gehabt* theo mẫu Perfekt. Về ngữ pháp thì
`ich bin gewesen` / `ich habe gehabt` tồn tại, nhưng trong hội thoại **người Đức gần như luôn dùng
`war` và `hatte`**. Cứ dùng hai dạng này cho tự nhiên.
$md$),

('a1-zeitadverbien', 'Zeitadverbien', 'Trạng ngữ chỉ thời gian', 'A1', 'Lektion 5', 15,
'heute, morgen, gestern, immer, oft... — và vị trí của chúng trong câu.', $md$
## Từ chỉ thời gian hay dùng

| Mốc | Từ |
| --- | --- |
| Hôm qua / hôm nay / ngày mai | gestern · heute · morgen |
| Buổi | am Morgen · am Nachmittag · am Abend · in der Nacht |
| Sáng nay / tối nay | heute Morgen · heute Abend |
| Tuần | letzte Woche · diese Woche · nächste Woche |

### Tần suất (xếp từ nhiều tới ít)

| Từ | Nghĩa | Khoảng |
| --- | --- | --- |
| immer | luôn luôn | 100% |
| meistens | thường thì | ~80% |
| oft | thường | ~70% |
| manchmal | thỉnh thoảng | ~40% |
| selten | hiếm khi | ~10% |
| nie | không bao giờ | 0% |

## Đặt ở đâu trong câu?

Trạng ngữ thời gian có thể đứng **đầu câu** hoặc **ngay sau động từ**:

> **Heute** lerne ich Deutsch. *(đầu câu → chủ ngữ lùi ra sau động từ)*
> Ich lerne **heute** Deutsch. *(sau động từ)*

Cả hai đều đúng. Đưa lên đầu để nhấn mạnh thời gian.

> Nhớ quy tắc V2: `Heute **lerne** ich...` chứ không phải *Heute ich lerne...*

### Khi có nhiều bổ ngữ: thời gian đứng trước nơi chốn

> Ich fahre **morgen** (thời gian) **nach Berlin** (nơi chốn).

Tiếng Anh làm ngược lại ("I go to Berlin tomorrow"), nên người học từ tiếng Anh sang hay đảo nhầm.
$md$),

('a1-nomen-artikel-dativ', 'Nomen und Artikel - Dativ', 'Danh từ và mạo từ ở cách 3', 'A1', 'Lektion 6', 16,
'Cách 3 dùng cho tân ngữ gián tiếp — người nhận. Cả bốn dạng mạo từ đều đổi.', $md$
## Dativ dùng khi nào?

Khi danh từ là **người nhận** hành động — trả lời câu hỏi *Wem?* (cho ai).

> Ich gebe **dem Mann** das Buch. (Tôi đưa quyển sách **cho người đàn ông**.)

| Cách | Đực | Cái | Trung | Số nhiều |
| --- | --- | --- | --- | --- |
| Nominativ | der | die | das | die |
| Akkusativ | den | die | das | die |
| **Dativ** | **dem** | **der** | **dem** | **den** + danh từ thêm **-n** |

Với mạo từ không xác định: **einem** (đực/trung), **einer** (cái).

### Ba điểm phải để ý

1. **Cả bốn cột đều đổi** — khác Akkusativ chỉ đổi giống đực.
2. Giống cái ở Dativ là `der` — trùng hình với `der` giống đực ở Nominativ. Đây là bẫy kinh điển:
   *Ich helfe **der** Frau* (der ở đây là giống **cái**, cách 3).
3. **Số nhiều thêm `-n` vào danh từ**: `die Kinder` → `mit **den Kindern**`.

### Động từ luôn đi với Dativ

`helfen` (giúp), `danken` (cảm ơn), `gehören` (thuộc về), `gefallen` (làm hài lòng),
`antworten` (trả lời), `passen` (vừa vặn)

> Ich **helfe** meinem Bruder. (không phải *meinen Bruder*)

### Giới từ luôn đi với Dativ

`aus`, `bei`, `mit`, `nach`, `seit`, `von`, `zu`, `gegenüber`

> Ich fahre **mit dem** Bus. · Ich komme **aus der** Schule.

Dạng rút gọn hay gặp: `zu dem` → **zum**, `zu der` → **zur**, `bei dem` → **beim**, `von dem` → **vom**.
$md$),

('a1-pronomen-dativ', 'Pronomen - Dativ', 'Đại từ nhân xưng ở cách 3', 'A1', 'Lektion 6', 17,
'mir, dir, ihm, ihr, uns, euch, ihnen — dạng đại từ khi là người nhận.', $md$
## Bảng đầy đủ ba cách

| Nominativ | Akkusativ | **Dativ** |
| --- | --- | --- |
| ich | mich | **mir** |
| du | dich | **dir** |
| er | ihn | **ihm** |
| sie | sie | **ihr** |
| es | es | **ihm** |
| wir | uns | **uns** |
| ihr | euch | **euch** |
| sie (họ) | sie | **ihnen** |
| Sie (lịch sự) | Sie | **Ihnen** |

`uns` và `euch` giống nhau ở cả hai cách — đỡ phải nhớ thêm.

### Câu giao tiếp dùng Dativ hằng ngày

> Wie geht es **dir**? — Bạn khoẻ không? *(nghĩa đen: "nó đi thế nào đối với bạn")*
> Wie geht es **Ihnen**? — Ông/bà khoẻ không? *(lịch sự)*
> Das gefällt **mir**. — Tôi thích cái đó.
> Kannst du **mir** helfen? — Bạn giúp tôi được không?
> Es tut **mir** leid. — Tôi xin lỗi.

Những câu này dùng cực nhiều, học thuộc cả cụm là nói được ngay mà chưa cần hiểu hết ngữ pháp.

### Thứ tự khi câu có cả hai tân ngữ

**Dativ (người) đứng trước Akkusativ (vật):**

> Ich gebe **dir** *das Buch*. (Tôi đưa bạn quyển sách.)

Nhưng nếu **cả hai đều là đại từ** thì đảo lại, Akkusativ lên trước:

> Ich gebe **es** *dir*. (Tôi đưa nó cho bạn.)
$md$),

('a1-imperativ', 'Imperativ', 'Câu mệnh lệnh', 'A1', 'Lektion 6', 18,
'Ba dạng ra lệnh/đề nghị tương ứng với du, ihr và Sie.', $md$
## Ba dạng theo ba cách xưng hô

| Với | Cách tạo | Ví dụ (`kommen`) |
| --- | --- | --- |
| **du** | thân từ, **bỏ hết đuôi**, bỏ luôn chủ ngữ | **Komm!** |
| **ihr** | như chia thường ngôi ihr, bỏ chủ ngữ | **Kommt!** |
| **Sie** | nguyên thể + **Sie** (giữ chủ ngữ) | **Kommen Sie!** |

> **Lern** Deutsch! / **Lernt** Deutsch! / **Lernen Sie** Deutsch!

### Vài lưu ý về dạng `du`

- Thân từ kết thúc bằng `-t`, `-d`, hoặc phụ âm + `n`: thêm `-e` → **Arbeite!**, **Öffne!**
- Động từ mạnh đổi `e → i` thì giữ nguyên âm đã đổi và **không** thêm `-e`:
  `sprechen` → **Sprich!** · `lesen` → **Lies!** · `geben` → **Gib!**
- Động từ mạnh đổi `a → ä` thì **không** đổi ở Imperativ: `fahren` → **Fahr!** (không phải *Fähr!*)
- Động từ tách được: tiền tố vẫn xuống cuối → **Steh** bitte **auf!**

### Dạng bất quy tắc

`sein` → **Sei** ruhig! · **Seid** ruhig! · **Seien Sie** ruhig!

### Cho lịch sự hơn

Câu mệnh lệnh trần nghe khá cộc. Thêm **`bitte`** là đủ mềm:

> **Komm bitte** her! · **Können Sie** mir bitte helfen? *(câu hỏi — lịch sự nhất)*

Người Việt quen nói giảm bằng "ạ", "nhé"; trong tiếng Đức vai trò đó do `bitte` và dạng câu hỏi
đảm nhiệm.
$md$),

('a1-satzstrukturen', 'Satzstrukturen', 'Khung câu và thứ tự bổ ngữ', 'A1', 'Lektion 7', 19,
'Khi câu có hai động từ, cái thứ hai bị đẩy xuống cuối tạo thành khung câu.', $md$
## Khung câu (Satzklammer)

Khi câu có động từ thứ hai, nó bị đẩy xuống **cuối câu**. Hai động từ kẹp lấy phần giữa như một
cái khung — đây là đặc trưng riêng của tiếng Đức.

| Vị trí 2 | ...phần giữa... | Cuối câu |
| --- | --- | --- |
| Ich **will** | heute Abend ins Kino | **gehen**. |
| Ich **habe** | gestern viel | **gelernt**. |
| Ich **stehe** | jeden Tag um 6 Uhr | **auf**. |

Ba trường hợp tạo khung: **động từ khiếm khuyết** + nguyên thể, **thì Perfekt**, và **động từ tách
được**.

> Người Việt nói hết ý rồi dừng, nên hay quên mất động từ cuối. Tập thói quen: nghĩ xong cả câu
> rồi mới nói, đừng nói tới đâu nghĩ tới đó.

## Thứ tự bổ ngữ giữa câu: TE-KA-MO-LO

| Viết tắt | Nghĩa | Ví dụ |
| --- | --- | --- |
| **TE**mporal | khi nào | heute, um 8 Uhr |
| **KA**usal | tại sao | wegen der Arbeit |
| **MO**dal | thế nào | mit dem Zug |
| **LO**kal | ở đâu | nach Berlin |

> Ich fahre **heute** **wegen der Arbeit** **mit dem Zug** **nach Berlin**.

Ít khi có đủ cả bốn trong một câu, nhưng nhớ **thời gian trước nơi chốn** là đủ dùng cho A1 —
ngược với tiếng Anh.

## Phủ định `nicht` đặt ở đâu?

- Phủ định cả câu: `nicht` đứng **gần cuối**, trước động từ thứ hai nếu có
  > Ich kann heute **nicht** kommen.
- Phủ định một từ cụ thể: `nicht` đứng **ngay trước từ đó**
  > Ich fahre **nicht** nach Berlin, sondern nach Hamburg.
- Phủ định danh từ có mạo từ không xác định: dùng **`kein`** chứ không dùng `nicht`
  > Ich habe **kein** Auto. *(không phải nicht ein Auto)*
$md$),

('a1-modalverben', 'Modalverben', 'Động từ khiếm khuyết', 'A1', 'Lektion 7', 20,
'können, müssen, wollen, dürfen, sollen, mögen — chia bất quy tắc và đẩy động từ chính xuống cuối.', $md$
## Sáu động từ khiếm khuyết

| Ngôi | können | müssen | wollen | dürfen | sollen | mögen |
| --- | --- | --- | --- | --- | --- | --- |
| ich | kann | muss | will | darf | soll | mag |
| du | kannst | musst | willst | darfst | sollst | magst |
| er/sie/es | kann | muss | will | darf | soll | mag |
| wir | können | müssen | wollen | dürfen | sollen | mögen |
| ihr | könnt | müsst | wollt | dürft | sollt | mögt |
| sie/Sie | können | müssen | wollen | dürfen | sollen | mögen |

**Hai điểm khác mọi động từ khác:**
1. `ich` và `er/sie/es` **giống hệt nhau và không có đuôi**
2. Số ít đổi nguyên âm, số nhiều trở về như nguyên thể

## Nghĩa

| Động từ | Nghĩa | Ví dụ |
| --- | --- | --- |
| können | có thể, biết làm | Ich **kann** Deutsch sprechen. |
| müssen | phải (bắt buộc) | Ich **muss** arbeiten. |
| wollen | muốn (ý chí mạnh) | Ich **will** nach Deutschland gehen. |
| dürfen | được phép | Hier **darf** man nicht rauchen. |
| sollen | nên, được bảo | Du **sollst** mehr lernen. |
| mögen | thích | Ich **mag** Kaffee. |

## Trật tự câu

Modal chia ở **vị trí 2**, động từ chính về **cuối câu** ở dạng **nguyên thể**:

> Ich **muss** heute Abend Deutsch **lernen**.

## Hai chỗ dễ nhầm

**`möchten` mềm hơn `wollen`.** Khi gọi món hay đề nghị, dùng `möchten`:
> Ich **möchte** einen Kaffee. *(Tôi muốn một ly cà phê — lịch sự)*
> Ich **will** einen Kaffee. *(nghe khá cộc)*

Chia: ich möchte, du möchtest, er möchte, wir möchten, ihr möchtet, sie möchten.

**Phủ định `müssen` không có nghĩa "cấm".** `Du musst nicht kommen` = "bạn không nhất thiết phải
đến". Muốn nói "không được đến" thì dùng `Du darfst nicht kommen`.
$md$),

('a1-praeposition-dativ', 'Präpositionen mit Dativ', 'Giới từ đi với cách 3', 'A1', 'Lektion 7', 21,
'aus, bei, mit, nach, seit, von, zu — sau các giới từ này danh từ luôn ở Dativ.', $md$
## Tám giới từ luôn kéo theo Dativ

| Giới từ | Nghĩa | Ví dụ |
| --- | --- | --- |
| **aus** | từ (bên trong ra), làm bằng | Ich komme **aus** Vietnam. |
| **bei** | ở chỗ, tại (nơi làm việc) | Er arbeitet **bei** Siemens. |
| **mit** | với, bằng (phương tiện) | Ich fahre **mit dem** Bus. |
| **nach** | sau, đi tới (địa danh không mạo từ) | **Nach dem** Essen gehe ich. |
| **seit** | từ (mốc thời gian đến nay) | **Seit einem** Jahr lerne ich Deutsch. |
| **von** | của, từ | Das Auto **von meinem** Vater. |
| **zu** | đến (người / nơi cụ thể) | Ich gehe **zum** Arzt. |
| **gegenüber** | đối diện | **Gegenüber dem** Bahnhof. |

### Dạng rút gọn bắt buộc phải quen

| Đầy đủ | Rút gọn |
| --- | --- |
| zu dem | **zum** |
| zu der | **zur** |
| bei dem | **beim** |
| von dem | **vom** |

> Ich gehe **zum** Arzt. · Ich fahre **zur** Arbeit.

### Ba cặp hay nhầm

**`nach` hay `zu` khi nói "đi tới"?**
- `nach` + địa danh không có mạo từ: **nach** Berlin, **nach** Deutschland, **nach** Hause
- `zu` + người hoặc nơi có mạo từ: **zum** Arzt, **zur** Schule, **zu** Anna

**`aus` hay `von`?**
- `aus` = từ bên trong ra: Ich komme **aus** dem Haus / **aus** Vietnam (quê quán)
- `von` = từ một điểm: Ich komme **von** der Arbeit

**`seit` khác `für`.** `seit` chỉ việc bắt đầu trong quá khứ và **vẫn đang tiếp diễn**:
> Ich lerne **seit** zwei Jahren Deutsch. (Tôi học tiếng Đức được hai năm rồi — vẫn đang học.)
$md$),

('a1-perfekt', 'Perfekt', 'Thì quá khứ Perfekt', 'A1', 'Lektion 8', 22,
'Thì kể chuyện quá khứ dùng nhiều nhất khi nói: haben/sein + Partizip II ở cuối câu.', $md$
## Cấu trúc

**haben hoặc sein (chia) + Partizip II (cuối câu)**

> Ich **habe** gestern Deutsch **gelernt**.
> Er **ist** nach Berlin **gefahren**.

Đây là thì người Đức dùng nhiều nhất để kể chuyện đã xảy ra **khi nói chuyện**.

## Chọn `haben` hay `sein`?

| Dùng **sein** khi | Dùng **haben** cho phần còn lại |
| --- | --- |
| Động từ chỉ **di chuyển**: gehen, fahren, fliegen, kommen, laufen, reisen | Hầu hết động từ khác |
| Động từ chỉ **thay đổi trạng thái**: aufstehen, einschlafen, werden, sterben | Mọi động từ có tân ngữ trực tiếp |
| Ba ngoại lệ: **sein, bleiben, passieren** | Động từ phản thân |

Khoảng 90% động từ dùng `haben`, nên cứ nhớ danh sách `sein` cho ngắn là xong.

## Tạo Partizip II thế nào?

| Loại | Quy tắc | Ví dụ |
| --- | --- | --- |
| Động từ yếu | **ge-** + thân + **-t** | machen → **ge**mach**t** |
| Động từ mạnh | **ge-** + thân (có thể đổi nguyên âm) + **-en** | sprechen → **ge**sproch**en** |
| Tách được | tiền tố + **ge** + phần còn lại | aufstehen → auf**ge**standen |
| Không tách (be-, ent-, er-, ge-, ver-, zer-) | **không có ge-** | besuchen → besucht |
| Kết thúc **-ieren** | **không có ge-** | studieren → studiert |

## Partizip II hay dùng ở A1

| Nguyên thể | Perfekt |
| --- | --- |
| machen | hat gemacht |
| lernen | hat gelernt |
| arbeiten | hat gearbeitet |
| essen | hat gegessen |
| trinken | hat getrunken |
| sprechen | hat gesprochen |
| gehen | **ist** gegangen |
| fahren | **ist** gefahren |
| kommen | **ist** gekommen |
| sein | **ist** gewesen |

> Lưu ý: dù `sein` và `haben` có dạng Perfekt, khi nói người Đức vẫn dùng `war` và `hatte`
> (xem chủ điểm Präteritum).
$md$),

('a1-hauptsatz-konjunktionen', 'Hauptsätze - Konjunktionen', 'Liên từ nối hai câu chính', 'A1', 'Lektion 8', 23,
'und, aber, oder, denn, sondern — năm liên từ KHÔNG làm đổi trật tự từ.', $md$
## Năm liên từ "hiền lành"

`und` · `aber` · `oder` · `denn` · `sondern`

Điểm chung: sau các từ này, câu **vẫn giữ nguyên quy tắc V2**, động từ vẫn ở vị trí thứ hai. Chúng
không tính là một vị trí trong câu.

| Liên từ | Nghĩa | Ví dụ |
| --- | --- | --- |
| **und** | và | Ich lerne Deutsch **und** ich arbeite. |
| **aber** | nhưng | Es ist teuer, **aber** ich kaufe es. |
| **oder** | hoặc | Kommst du **oder** bleibst du? |
| **denn** | bởi vì | Ich bleibe zu Hause, **denn** ich bin krank. |
| **sondern** | mà là (sau câu phủ định) | Ich komme nicht heute, **sondern** morgen. |

## `denn` và `weil` — cùng nghĩa, khác trật tự

Đây là cặp dễ nhầm nhất:

> Ich bleibe zu Hause, **denn** ich **bin** krank. *(động từ ở vị trí 2)*
> Ich bleibe zu Hause, **weil** ich krank **bin**. *(động từ xuống CUỐI)*

Hai câu nghĩa y hệt nhau. `denn` giữ trật tự bình thường nên dễ dùng hơn với người mới — nhưng
`weil` phổ biến hơn trong thực tế, nên phải làm quen cả hai.

## `aber` và `sondern`

`sondern` chỉ dùng khi **vế trước là phủ định** và vế sau **sửa lại** điều đó:

> Das ist **nicht** billig, **sondern** teuer. (không rẻ, mà đắt)
> Das ist teuer, **aber** ich kaufe es. (đắt, nhưng vẫn mua)

Tiếng Việt dùng "nhưng" cho cả hai nên người Việt hay dùng `aber` ở chỗ đáng lẽ phải `sondern`.
$md$),

('a1-praeposition-akkusativ', 'Präpositionen mit Akkusativ', 'Giới từ đi với cách 4', 'A1', 'Lektion 8', 24,
'durch, für, gegen, ohne, um — sau các giới từ này danh từ luôn ở Akkusativ.', $md$
## Năm giới từ luôn kéo theo Akkusativ

| Giới từ | Nghĩa | Ví dụ |
| --- | --- | --- |
| **durch** | xuyên qua | Wir gehen **durch den** Park. |
| **für** | cho, dành cho | Das ist **für den** Lehrer. |
| **gegen** | chống lại; khoảng (giờ) | Ich bin **gegen die** Idee. |
| **ohne** | không có | Ich komme **ohne meinen** Bruder. |
| **um** | quanh; vào lúc (giờ) | Wir sitzen **um den** Tisch. |

**Mẹo nhớ: DOG FU** — *durch, ohne, gegen, für, um*. Năm từ, học một lần là xong.

### Nhớ rằng chỉ giống đực mới đổi

> **für den** Mann *(đực → den)*
> **für die** Frau *(cái → không đổi)*
> **für das** Kind *(trung → không đổi)*

### Một số cách dùng thường gặp

**Chỉ giờ giấc:** `um` dùng cho giờ chính xác
> Der Kurs beginnt **um** 9 Uhr.

**`gegen` chỉ giờ áng chừng:**
> Ich komme **gegen** 8 Uhr. (khoảng 8 giờ)

**`ohne` thường bỏ luôn mạo từ:**
> Ich trinke Kaffee **ohne** Zucker. (không đường)

### So sánh với nhóm Dativ

Học xong hai nhóm này là nắm được phần lớn giới từ A1:

| Luôn Akkusativ | Luôn Dativ |
| --- | --- |
| durch, für, gegen, ohne, um | aus, bei, mit, nach, seit, von, zu |

Còn nhóm thứ ba — chín giới từ dùng **cả hai cách** tuỳ ý nghĩa (in, auf, an, unter...) — để dành
cho trình A2.
$md$)

ON CONFLICT (slug) DO NOTHING;
