-- Bổ sung 7 chủ điểm còn thiếu sau khi rà lại độ phủ ngữ pháp A1-B2 (2026-09-25).
--
-- Vì sao thiếu: các migration trước bám theo mục lục giáo trình "Aber Hallo", mà mục lục đó không
-- tách riêng một số chủ điểm quan trọng — rõ nhất là Relativsätze, thứ mọi giáo trình khác đều dạy
-- ở A2/B1 và xuất hiện dày đặc trong cả bốn kỹ năng thi.
--
-- Wortbildung (tiền tố/hậu tố) KHÔNG nằm ở đây vì đúng tầm C1, mà C1 tạm hoãn.

INSERT INTO grammar_topics (slug, title_de, title_vi, level, group_label, order_index, summary_vi, theory_md) VALUES

('a2-negation', 'Negation', 'Phủ định — nicht hay kein, đặt ở đâu', 'A2', NULL, 17,
'Chọn giữa nicht và kein, và quy tắc vị trí của nicht trong câu.', $md$
## `nicht` hay `kein`?

| Dùng **kein** | Dùng **nicht** |
| --- | --- |
| Danh từ có `ein` | Động từ |
| Danh từ **không có mạo từ** | Tính từ, trạng từ |
| | Danh từ có **mạo từ xác định** |
| | Danh từ có mạo từ sở hữu |

> Ich habe **ein** Auto. → Ich habe **kein** Auto.
> Ich trinke Kaffee. → Ich trinke **keinen** Kaffee. *(không mạo từ)*
> Ich habe **das** Auto. → Ich habe **das** Auto **nicht**. *(mạo từ xác định)*
> Das ist **mein** Buch. → Das ist **nicht mein** Buch.

`kein` biến cách y hệt `ein`, và có cả số nhiều: `keine Bücher`.

## `nicht` đặt ở đâu

**Phủ định cả câu — `nicht` đứng gần cuối:**

> Ich komme heute **nicht**.

Nhưng phải đứng **trước** những thành phần này:

| Đứng trước | Ví dụ |
| --- | --- |
| Động từ thứ hai (nguyên thể / Partizip II) | Ich kann heute **nicht** *kommen*. |
| Tiền tố tách được | Ich stehe **nicht** *auf*. |
| Tân ngữ giới từ | Ich warte **nicht** *auf dich*. |
| Bổ ngữ nơi chốn | Ich fahre **nicht** *nach Berlin*. |
| Tính từ sau `sein`/`werden` | Das ist **nicht** *teuer*. |

**Phủ định một thành phần — `nicht` đứng ngay trước nó:**

> **Nicht ich** habe das gesagt, sondern er.
> Ich fahre **nicht heute**, sondern morgen.

Dạng này hầu như luôn đi kèm `sondern` để nói lại cho đúng.

## Phủ định bằng từ khác

| Khẳng định | Phủ định |
| --- | --- |
| etwas (cái gì đó) | **nichts** (không gì cả) |
| jemand (ai đó) | **niemand** (không ai) |
| immer / oft | **nie / niemals** |
| schon (rồi) | **noch nicht** (chưa) |
| noch (vẫn còn) | **nicht mehr** (không còn nữa) |
| irgendwo | **nirgendwo** |

Hai cặp cuối hay nhầm:
> Bist du **schon** fertig? — Nein, **noch nicht**. *(chưa xong)*
> Arbeitest du **noch** hier? — Nein, **nicht mehr**. *(không còn làm nữa)*

## Trả lời câu hỏi phủ định: `doch`

Đây là điểm tiếng Việt không có. Khi câu hỏi mang tính phủ định mà bạn muốn **phản bác**, dùng
`doch` chứ không dùng `ja`:

> Hast du **keine** Zeit? — **Doch!** (Có chứ, tôi có thời gian.)
> Hast du **keine** Zeit? — **Nein.** (Đúng, tôi không có.)
$md$),

('b1-relativsatz', 'Relativsätze', 'Mệnh đề quan hệ', 'B1', NULL, 19,
'der, die, das làm đại từ quan hệ — giống theo danh từ đứng trước, cách theo vai trò trong mệnh đề.', $md$
## Quy tắc cốt lõi

Đại từ quan hệ lấy:
- **Giống và số** theo danh từ đứng trước nó (Bezugswort)
- **Cách** theo vai trò của nó **trong chính mệnh đề quan hệ**

> Das ist der Mann, **der** mir geholfen hat.
> ↳ `der`: giống đực (theo *Mann*), Nominativ (vì là chủ ngữ của "geholfen hat")

> Das ist der Mann, **den** ich gesehen habe.
> ↳ `den`: giống đực (theo *Mann*), Akkusativ (vì là tân ngữ của "gesehen habe")

Hai câu cùng một danh từ nhưng khác cách — đây là chỗ phải nghĩ kỹ.

## Bảng đại từ quan hệ

| Cách | Đực | Cái | Trung | Số nhiều |
| --- | --- | --- | --- | --- |
| Nominativ | der | die | das | die |
| Akkusativ | **den** | die | das | die |
| Dativ | **dem** | **der** | **dem** | **denen** |
| Genitiv | **dessen** | **deren** | **dessen** | **deren** |

Gần y hệt mạo từ xác định, **trừ ba ô**: `denen` (Dativ số nhiều) và `dessen`/`deren` (Genitiv).

## Động từ luôn xuống cuối

Mệnh đề quan hệ là mệnh đề phụ:

> Die Frau, die in Berlin **wohnt**, ist meine Schwester.
> Der Film, den wir gestern gesehen **haben**, war gut.

Và luôn có **dấu phẩy** ngăn hai bên.

## Với giới từ — giới từ đứng TRƯỚC đại từ

> Die Frau, **mit der** ich gesprochen habe, ist Ärztin.
> Der Stuhl, **auf dem** ich sitze, ist alt.

Giới từ quyết định cách: `mit` → Dativ → `der` (giống cái).

Không được tách giới từ ra sau như tiếng Anh: *the woman I spoke **with*** là lối Anh, tiếng Đức
bắt buộc `mit der` đi liền nhau ở đầu mệnh đề.

## Genitiv: `dessen` / `deren`

Dùng khi muốn nói "mà ... của người/vật đó":

> Das ist der Mann, **dessen** Auto gestohlen wurde.
> (Đó là người đàn ông mà xe của ông ấy bị trộm.)

> Die Frau, **deren** Sohn hier arbeitet, wohnt nebenan.

Lưu ý: `dessen`/`deren` chọn theo **danh từ đứng trước**, còn danh từ theo sau nó **không có mạo từ**.

## `was` và `wo`

| Dùng `was` khi Bezugswort là | Ví dụ |
| --- | --- |
| `das`, `alles`, `nichts`, `etwas`, `vieles` | Alles, **was** du sagst, ist richtig. |
| cả một mệnh đề trước đó | Er kam zu spät, **was** mich ärgerte. |

| Dùng `wo` khi | Ví dụ |
| --- | --- |
| Bezugswort là nơi chốn | Die Stadt, **wo** ich wohne, ist klein. |

Với nơi chốn có thể dùng cả hai: *die Stadt, **in der** ich wohne* = *die Stadt, **wo** ich wohne*.
$md$),

('b1-adjektivdeklination-ohne-artikel', 'Adjektivdeklination ohne Artikel', 'Biến cách tính từ khi không có mạo từ', 'B1', NULL, 20,
'Bảng đuôi mạnh — khi cụm danh từ không có mạo từ thì tính từ phải mang toàn bộ thông tin.', $md$
## Ba bảng, đây là bảng thứ ba

| Trước tính từ có gì | Kiểu đuôi | Đã học ở |
| --- | --- | --- |
| Mạo từ xác định (der/die/das) | đuôi **yếu** | A2 |
| Mạo từ không xác định (ein/kein/mein) | đuôi **hỗn hợp** | A2 |
| **Không có gì** | đuôi **mạnh** | chủ điểm này |

## Bảng đuôi mạnh

Khi không có mạo từ, tính từ phải gánh toàn bộ thông tin về giống và cách — nên đuôi của nó
**giống hệt mạo từ xác định**:

| Cách | Đực | Cái | Trung | Số nhiều |
| --- | --- | --- | --- | --- |
| Nominativ | gut**er** Wein | gut**e** Milch | gut**es** Bier | gut**e** Weine |
| Akkusativ | gut**en** Wein | gut**e** Milch | gut**es** Bier | gut**e** Weine |
| Dativ | gut**em** Wein | gut**er** Milch | gut**em** Bier | gut**en** Weinen |
| Genitiv | gut**en** Weines | gut**er** Milch | gut**en** Bieres | gut**er** Weine |

**Mẹo nhớ:** so với mạo từ xác định (`der`, `die`, `das`, `dem`...), đuôi tính từ chính là phần
cuối của mạo từ đó — `d**er**` → `gut**er**`, `d**as**` → `gut**es**`, `d**em**` → `gut**em**`.
Chỉ Genitiv số ít đực/trung là ngoại lệ (`-en` chứ không phải `-es`).

## Khi nào gặp trường hợp không mạo từ

| Trường hợp | Ví dụ |
| --- | --- |
| Danh từ không đếm được | Ich trinke **kaltes** Wasser. |
| Số nhiều chung chung | Sie hat **nette** Freunde. |
| Chất liệu, món ăn | Ich esse gern **frisches** Brot. |
| Sau số đếm | Ich habe **zwei** neu**e** Bücher. |
| Trên biển hiệu, thực đơn, quảng cáo | **Frisches** Obst · **Deutsches** Bier |

## Sau `viele`, `wenige`, `einige`, `mehrere`

Những từ này **không** tính là mạo từ, nên tính từ theo sau vẫn dùng đuôi mạnh:

> **viele** gut**e** Bücher · **einige** neu**e** Ideen · **mehrere** wichtig**e** Punkte

Nhưng sau `alle`, `beide`, `diese` thì lại dùng đuôi yếu (vì chúng biến cách như mạo từ xác định):

> **alle** gut**en** Bücher · **diese** neu**en** Ideen

## Nguyên tắc chung cho cả ba bảng

Trong mỗi cụm danh từ, **phải có đúng một từ mang dấu hiệu rõ của giống và cách**. Mạo từ mang rồi
thì tính từ chỉ cần đuôi yếu; mạo từ không mang (hoặc không có mạo từ) thì tính từ phải mang thay.
$md$),

('b2-konjunktiv-1', 'Konjunktiv I', 'Thức giả định I — lời dẫn gián tiếp', 'B2', 'Động từ', 13,
'Dạng động từ dùng khi thuật lại lời người khác mà không tự khẳng định — gặp liên tục trên báo.', $md$
## Dùng để làm gì

Khi thuật lại lời người khác trong **văn viết trang trọng** (báo chí, biên bản, bài luận),
tiếng Đức đổi động từ sang Konjunktiv I để tỏ rõ: *đây là lời họ nói, tôi không tự khẳng định*.

> Trực tiếp: Der Minister sagt: "Ich **habe** keine Zeit."
> Gián tiếp: Der Minister sagt, er **habe** keine Zeit.

Chính vì vậy đọc báo Đức là gặp ngay từ dòng đầu.

## Cách tạo: thân từ nguyên thể + đuôi

| Ngôi | Đuôi | `haben` | `kommen` | `sein` (bất quy tắc) |
| --- | --- | --- | --- | --- |
| ich | -e | habe | komme | **sei** |
| du | -est | habest | kommest | **seist** |
| er/sie/es | **-e** | **habe** | **komme** | **sei** |
| wir | -en | haben | kommen | **seien** |
| ihr | -et | habet | kommet | **seiet** |
| sie/Sie | -en | haben | kommen | **seien** |

Ngôi `er/sie/es` là dạng hay dùng nhất và cũng dễ nhận nhất: **`habe`, `komme`, `sei`** — khác hẳn
dạng thường `hat`, `kommt`, `ist`.

`sein` là động từ duy nhất bất quy tắc, nhưng lại xuất hiện nhiều nhất — học thuộc `sei`/`seien`.

## Khi trùng với dạng thường thì chuyển sang Konjunktiv II

Nhiều ngôi có Konjunktiv I trùng hệt Präsens (`wir haben` / `wir haben`), lúc đó người nghe không
phân biệt được. Quy tắc: **trùng thì dùng Konjunktiv II thay**.

> Sie sagen, sie **hätten** keine Zeit. *(không dùng "haben" vì trùng dạng thường)*
> Er sagt, sie **kämen** morgen. *(thay cho "kommen")*

Trong thực tế, báo chí Đức dùng lẫn cả Konjunktiv I và II — thấy `hätte`/`wäre` trong lời dẫn là
chuyện bình thường.

## Quá khứ trong lời dẫn gián tiếp

Mọi thì quá khứ (Perfekt, Präteritum, Plusquamperfekt) đều gộp thành **một dạng duy nhất**:
`habe`/`sei` + Partizip II

> "Ich **war** krank." → Er sagte, er **sei** krank **gewesen**.
> "Ich **habe** gearbeitet." → Er sagte, er **habe** gearbeitet.

## Những gì phải đổi khi chuyển sang gián tiếp

| Loại | Đổi |
| --- | --- |
| Ngôi | ich → er/sie · mein → sein/ihr |
| Thời gian | heute → an jenem Tag · morgen → am nächsten Tag |
| Nơi chốn | hier → dort |

> "**Ich** komme **morgen hierher**." → Er sagte, **er** komme **am nächsten Tag dorthin**.

## Đọc hiểu — dấu hiệu nhận biết

Thấy `sei`, `habe`, `werde`, `könne`, `müsse` ở ngôi thứ ba trong một bài báo, hiểu ngay đó là
**lời của người được phỏng vấn**, không phải khẳng định của toà soạn.
$md$),

('b2-passiv-erweitert', 'Passiv - erweiterte Formen', 'Bị động mở rộng và các dạng thay thế', 'B2', 'Động từ', 14,
'Zustandspassiv với sein, bị động có modal, và bốn cách diễn đạt ý bị động mà không dùng werden.', $md$
## Hai loại bị động

| Loại | Cấu trúc | Diễn tả | Ví dụ |
| --- | --- | --- | --- |
| **Vorgangspassiv** | **werden** + P II | hành động đang diễn ra | Die Tür **wird** geöffnet. *(cửa đang được mở)* |
| **Zustandspassiv** | **sein** + P II | trạng thái kết quả | Die Tür **ist** geöffnet. *(cửa đang ở trạng thái mở)* |

Đây là cặp phân biệt quan trọng nhất của chủ điểm:

> Das Fenster **wird** repariert. *(thợ đang sửa)*
> Das Fenster **ist** repariert. *(đã sửa xong, giờ nó lành)*

## Bị động ở mọi thì

| Thì | Cấu trúc |
| --- | --- |
| Präsens | Das Haus **wird** gebaut. |
| Präteritum | Das Haus **wurde** gebaut. |
| Perfekt | Das Haus **ist** gebaut **worden**. |
| Plusquamperfekt | Das Haus **war** gebaut **worden**. |
| Futur I | Das Haus **wird** gebaut **werden**. |
| Với modal | Das Haus **muss** gebaut **werden**. |

Nhớ: Perfekt bị động dùng **`worden`**, không phải `geworden`.

## Bị động không có chủ ngữ

Khi hành động quan trọng còn ai làm thì không:

> **Es wird** hier viel **gearbeitet**. (Ở đây người ta làm việc nhiều.)
> Hier **wird** nicht **geraucht**. (Ở đây không hút thuốc.)

Nếu có thành phần khác ở vị trí 1 thì bỏ `es`:
> Hier **wird** viel gearbeitet.

Rất hay gặp trên biển báo và nội quy.

## Bốn cách thay thế bị động (Passiv-Ersatzformen)

Phần đặc trưng B2 — cùng một ý nhưng diễn đạt khác:

| Cách | Ví dụ | Nghĩa |
| --- | --- | --- |
| **man** | **Man** kann das Problem lösen. | có thể giải quyết |
| **sich lassen** | Das Problem **lässt sich** lösen. | có thể giải quyết |
| **tính từ -bar** | Das Problem ist lös**bar**. | giải quyết được |
| **sein ... zu** | Das Problem **ist zu** lösen. | cần/có thể giải quyết |

Cả bốn câu trên tương đương với: *Das Problem **kann gelöst werden**.*

**`man`** là dạng đời thường nhất, dùng khi nói.
**`sich lassen`** và **`-bar`** hay gặp trong hướng dẫn kỹ thuật.
**`sein ... zu`** mang sắc thái bắt buộc, thường thấy trong văn bản hành chính:
> Das Formular **ist** bis Freitag **auszufüllen**. (Phải điền đơn trước thứ Sáu.)

## Động từ không có bị động

Không phải động từ nào cũng chuyển được. Những động từ **không có tân ngữ Akkusativ** thì không:

`sein`, `werden`, `bleiben`, `haben`, `bekommen`, `kennen`, `wissen`, và các động từ chỉ Dativ như
`gefallen`, `gehören`.

> *Das Buch wird mir gehört* — sai hoàn toàn.
$md$),

('b2-nominalisierung', 'Nominalisierung', 'Danh từ hoá — chuyển mệnh đề thành cụm danh từ', 'B2', 'Phong cách', 15,
'Chuyển qua lại giữa lối viết động từ và lối viết danh từ — kỹ năng cốt lõi của phần Viết B2.', $md$
## Hai lối viết cùng một ý

| Lối động từ (Verbalstil) | Lối danh từ (Nominalstil) |
| --- | --- |
| **Weil** es **regnete**, blieben wir zu Hause. | **Wegen des Regens** blieben wir zu Hause. |
| **Nachdem** er **angekommen war**, rief er an. | **Nach seiner Ankunft** rief er an. |
| **Obwohl** es **teuer war**, kaufte ich es. | **Trotz des hohen Preises** kaufte ich es. |

Lối danh từ ngắn gọn và trang trọng hơn — đặc trưng của **văn bản hành chính, báo chí, bài luận
học thuật**. Phần Viết B2 thường yêu cầu chuyển qua lại hai lối này.

## Bảng chuyển đổi liên từ ↔ giới từ

| Quan hệ | Liên từ (mệnh đề) | Giới từ (cụm danh từ) |
| --- | --- | --- |
| Nguyên nhân | weil, da | **wegen** + Gen · **aufgrund** + Gen |
| Nhượng bộ | obwohl | **trotz** + Gen |
| Thời gian (sau) | nachdem | **nach** + Dativ |
| Thời gian (trước) | bevor | **vor** + Dativ |
| Thời gian (trong lúc) | während | **während** + Gen · **bei** + Dativ |
| Điều kiện | wenn, falls | **bei** + Dativ · **im Falle** + Gen |
| Mục đích | damit, um ... zu | **zu** + Dativ · **für** + Akk |
| Đối lập | während | **im Gegensatz zu** + Dativ |

## Cách biến động từ thành danh từ

| Cách | Ví dụ |
| --- | --- |
| Nguyên thể viết hoa | lesen → **das Lesen** · essen → **das Essen** |
| Thêm `-ung` | prüfen → **die Prüfung** · lösen → **die Lösung** |
| Thân từ trần | beginnen → **der Beginn** · kaufen → **der Kauf** |
| Thêm `-e` | fragen → **die Frage** · helfen → **die Hilfe** |
| Thêm `-nis` | erlauben → **die Erlaubnis** |

Tính từ cũng danh từ hoá được:
> schön → **die Schönheit** · möglich → **die Möglichkeit** · frei → **die Freiheit**

## Ví dụ chuyển đầy đủ

> **Weil der Zug Verspätung hatte**, kam ich zu spät.
> → **Wegen der Verspätung des Zuges** kam ich zu spät.

> **Nachdem die Prüfung beendet war**, gingen alle nach Hause.
> → **Nach Beendigung der Prüfung** gingen alle nach Hause.

## Khi nào nên dùng lối nào

| Lối động từ | Lối danh từ |
| --- | --- |
| Nói chuyện, email thân mật | Văn bản hành chính, hợp đồng |
| Dễ đọc, dễ hiểu | Ngắn gọn, trang trọng |
| Nên dùng khi giải thích | Nên dùng khi tóm tắt |

Viết bài thi B2 nên **pha cả hai**: dùng lối danh từ để câu gọn, nhưng lạm dụng thì bài khô cứng và
khó đọc — người Đức cũng phê phán lối "Beamtendeutsch" (tiếng Đức công chức) vì lý do đó.
$md$),

('b2-modalpartikel', 'Modalpartikeln', 'Tiểu từ tình thái — doch, mal, ja, denn, eben', 'B2', 'Phong cách', 16,
'Những từ nhỏ không dịch được nhưng làm câu nói nghe đúng chất Đức.', $md$
## Chúng là gì

Modalpartikel là những từ nhỏ **không thêm thông tin** mà chỉ thêm **thái độ**: ngạc nhiên, sốt
ruột, thân mật, nhấn mạnh. Bỏ đi câu vẫn đúng ngữ pháp, nhưng nghe khô và hơi cộc.

Tiếng Việt có thứ tương đương: *nhé, đấy, mà, chứ, thế*. Đây chính là cách dễ hình dung nhất.

> Komm her! → Komm **doch mal** her! *(Lại đây đi nào — mềm hơn hẳn)*

## Các tiểu từ hay dùng

| Từ | Sắc thái | Ví dụ |
| --- | --- | --- |
| **denn** | trong câu hỏi: quan tâm, bớt cộc | Was machst du **denn** da? |
| **doch** | phản bác nhẹ; thúc giục | Das weißt du **doch**! · Komm **doch**! |
| **mal** | làm lời đề nghị nhẹ đi | Kannst du **mal** helfen? |
| **ja** | nhấn: cả hai đều biết điều này | Das ist **ja** interessant! |
| **eben / halt** | chấp nhận sự đã rồi | Das ist **eben** so. |
| **wohl** | phỏng đoán | Er ist **wohl** krank. |
| **etwa** | trong câu hỏi: lo ngại điều xấu | Bist du **etwa** krank? |
| **ruhig** | trấn an, cho phép | Frag **ruhig**! |

## So sánh có và không có

> **Was machst du?** — hỏi thẳng, có thể nghe như đang tra hỏi
> **Was machst du denn?** — nghe tò mò, thân thiện

> **Komm her.** — như ra lệnh
> **Komm doch mal her.** — mời gọi

> **Das ist teuer.** — nhận xét trung tính
> **Das ist ja teuer!** — ngạc nhiên vì đắt quá

## Vị trí trong câu

Modalpartikel đứng ở **giữa câu**, sau động từ và đại từ, trước phần thông tin mới:

> Kannst du mir **mal** helfen?
> Das ist **ja** wirklich schön!
> Ich habe **eben** keine Zeit.

Không bao giờ đứng ở vị trí 1, và không bao giờ mang trọng âm.

## Ghép nhiều tiểu từ

Người Đức hay ghép hai ba cái liền — thứ tự khá cố định:

> Komm **doch mal** her!
> Das ist **ja eben** das Problem!
> Sag **doch mal**, wie geht es dir?

## Vì sao đáng học

Đây là thứ **phân biệt người nói lưu loát với người nói đúng ngữ pháp**. Câu không có
Modalpartikel vẫn đúng hoàn toàn, nhưng nghe như sách giáo khoa. Ở phần thi Nói B2, dùng đúng vài
tiểu từ làm bài nói tự nhiên hẳn lên.

> Lời khuyên thực tế: đừng cố học thuộc định nghĩa. Nghe người bản xứ nói, để ý các từ này xuất
> hiện ở đâu, rồi bắt chước nguyên cụm.
$md$)

ON CONFLICT (slug) DO NOTHING;
