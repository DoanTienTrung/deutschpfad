-- 12 chủ điểm ngữ pháp B2.
--
-- Nguồn: mục lục "Aber Hallo" B2 (cùng bộ với A1/A2). Cách làm hybrid như các level trước: chỉ lấy
-- danh sách chủ điểm (dữ kiện), lý thuyết viết mới bằng tiếng Việt.
--
-- Vì sao 12 chứ không phải 30 như mục lục: sách in phải tự chứa đủ nên nhắc lại gần hết nội dung
-- A1-B1 (Kasus, giới từ + Akkusativ/Dativ/Genitiv, mệnh đề kausal/konzessiv/temporal/final,
-- dass/ob/Fragewort...). App có cả 5 level trong một danh sách nên tạo bản sao chỉ làm rối người
-- học. Ở đây chỉ giữ những mục THẬT SỰ mới ở B2 (Numerus, mệnh đề modal/konsekutiv/adversativ,
-- Subjektsatz) hoặc sâu hơn hẳn (Genus có hệ thống đuôi từ đầy đủ, trật tự từ 4 tầng, giới từ
-- phân theo 5 nhóm cách).

INSERT INTO grammar_topics (slug, title_de, title_vi, level, group_label, order_index, summary_vi, theory_md) VALUES

('b2-nomen-genus', 'Nomen - Genus', 'Giống danh từ — hệ thống quy tắc đầy đủ', 'B2', 'Danh từ', 1,
'Toàn bộ quy tắc đoán giống theo nghĩa và theo đuôi từ, kèm các ngoại lệ hay bị hỏi.', $md$
## Ba nguồn quyết định giống

| Nguồn | Ví dụ |
| --- | --- |
| **Giống tự nhiên** (người, động vật) | der Herr — die Dame · der Lehrer — die Lehrerin |
| **Nhóm nghĩa** | der Montag, der Januar (ngày/tháng) |
| **Đuôi từ** | die Prüf**ung**, das Zentr**um** |

Khi ba nguồn mâu thuẫn thì **đuôi từ thắng**: `das Mädchen` là giống trung vì đuôi `-chen`, dù chỉ
người nữ.

## Giống đực (maskulin)

**Nhóm nghĩa:** mùa, tháng, ngày, buổi (`der Herbst`, `der Mittwoch` — nhưng **die Nacht**) ·
thời tiết (`der Schnee`, `der Nebel` — nhưng **die Brise**) · đồ uống có cồn (`der Wein` — nhưng
**das Bier**)

**Đuôi:** `-ich` (der Rettich) · `-ig` (der Essig) · `-ling` (der Frühling) · `-ismus` (der
Tourismus) · `-ant` (der Diamant) · `-or` (der Motor) · phần lớn `-en` (der Wagen)

## Giống cái (feminin)

**Nhóm nghĩa:** nhiều loài cây và hoa (`die Tanne`, `die Tulpe`) · số đếm danh từ hoá (`die Fünf`)

**Đuôi:** `-ung` · `-heit` · `-keit` · `-schaft` · `-tät` · `-ion` · `-ie` · `-ik` · `-ur` ·
`-age` · `-anz/-enz` · `-ei`

Phần lớn danh từ kết thúc `-e` cũng là giống cái (`die Tasche`) — **trừ nhóm n-Deklination**
(`der Junge`, `der Affe`).

## Giống trung (neutral)

**Nhóm nghĩa:** động từ và tính từ danh từ hoá (`das Essen`, `das Blau`, `das Deutsch`) · tên ngôn
ngữ, màu sắc · nhiều con vật non (`das Lamm`, `das Kamel`)

**Đuôi:** `-um` (das Zentrum) · `-ma` (das Thema) · `-ment` (das Argument — nhưng **der Zement**,
**der Moment**) · `-ett` (das Ballett) · `-chen` / `-lein` (das Häuschen)

## Ngoại lệ hay ra đề

| Từ | Giống | Vì sao dễ nhầm |
| --- | --- | --- |
| das Mädchen | trung | chỉ người nữ nhưng đuôi -chen thắng |
| die Nacht | cái | các buổi khác đều giống đực |
| das Bier | trung | đồ uống có cồn khác đều giống đực |
| der Moment | đực | đuôi -ment thường là giống trung |
| das Laufen | trung | đuôi -en thường là giống đực, nhưng động từ danh từ hoá luôn là trung |
$md$),

('b2-nomen-numerus', 'Nomen - Numerus', 'Số nhiều của danh từ', 'B2', 'Danh từ', 2,
'Năm kiểu tạo số nhiều và cách đoán kiểu nào theo giống và đuôi từ.', $md$
## Năm kiểu tạo số nhiều

| Kiểu | Ví dụ |
| --- | --- |
| **-e** (có thể kèm Umlaut) | der Tisch → die Tisch**e** · der Stuhl → die St**ü**hl**e** |
| **-(e)n** | die Frau → die Frau**en** · die Lampe → die Lampe**n** |
| **-er** (thường kèm Umlaut) | das Kind → die Kind**er** · das Haus → die H**ä**us**er** |
| **-s** | das Auto → die Auto**s** · das Hotel → die Hotel**s** |
| **không đổi** (có thể kèm Umlaut) | der Lehrer → die Lehrer · der Vater → die V**ä**ter |

**Mọi danh từ số nhiều đều dùng mạo từ `die`** ở Nominativ, bất kể giống ở số ít.

## Đoán theo giống và đuôi

| Nhóm | Số nhiều | Ví dụ |
| --- | --- | --- |
| Giống cái (đa số) | **-(e)n** | die Prüfung → Prüfung**en** |
| Giống cái đơn âm tiết | **-e** + Umlaut | die Hand → H**ä**nd**e** |
| Giống đực/trung đuôi `-er`, `-el`, `-en` | **không đổi** | der Lehrer, der Löffel, der Wagen |
| Giống trung đơn âm tiết | thường **-er** + Umlaut | das Buch → B**ü**ch**er** |
| Từ mượn kết thúc nguyên âm | **-s** | das Auto, das Sofa, das Baby |
| Đuôi `-in` (nghề nữ) | **-nen** | die Lehrerin → Lehrerin**nen** |

## Dativ số nhiều thêm -n

Quy tắc dễ quên: ở **Dativ số nhiều**, danh từ phải có đuôi `-n` (nếu chưa có):

> die Kinder → mit **den Kindern**
> die Bücher → in **den Büchern**

Ngoại lệ: số nhiều kết thúc bằng `-s` thì không thêm (`mit den Autos`).

## Danh từ chỉ có một số

| Chỉ số ít | Chỉ số nhiều |
| --- | --- |
| die Milch, das Obst, das Gemüse | die Eltern, die Leute, die Ferien |
| die Liebe, der Hunger | die Kosten, die Möbel |

`die Leute` luôn số nhiều — nói *ein Leute* là sai; muốn chỉ một người thì dùng `eine Person`.
$md$),

('b2-nomen-kasus', 'Nomen - Kasus', 'Bốn cách và sự hoà hợp trong cụm danh từ', 'B2', 'Danh từ', 3,
'Tổng hợp bốn cách, nguyên tắc Kongruenz, và cách nhận diện cách nào qua câu hỏi.', $md$
## Bốn cách và câu hỏi nhận diện

| Cách | Câu hỏi | Vai trò | Ví dụ |
| --- | --- | --- | --- |
| **Nominativ** | Wer? Was? | chủ ngữ | **Der Mann** liest. |
| **Akkusativ** | Wen? Was? | tân ngữ trực tiếp | Ich sehe **den Mann**. |
| **Dativ** | Wem? | tân ngữ gián tiếp | Ich helfe **dem Mann**. |
| **Genitiv** | Wessen? | sở hữu | das Auto **des Mannes** |

## Kongruenz — cả cụm phải hoà hợp

Mạo từ, tính từ và danh từ trong cùng một cụm phải **cùng giống, cùng số, cùng cách**:

> Ich sehe **den neuen Wagen**.
> ↳ den (đực, Akk) · neuen (đuôi Akk đực) · Wagen (đực)

Đổi một thành phần là phải đổi cả cụm:
> Ich sehe **die neue Wohnung**. *(cái)*
> Ich sehe **das neue Haus**. *(trung)*

## Ba thứ quyết định cách

| Nguồn | Ví dụ |
| --- | --- |
| **Vai trò trong câu** | chủ ngữ → Nominativ, tân ngữ → Akkusativ |
| **Động từ đòi cách** | helfen + Dativ · sehen + Akkusativ |
| **Giới từ đòi cách** | für + Akk · mit + Dativ · wegen + Genitiv |

Giới từ **luôn thắng** vai trò: trong `Ich warte auf den Bus`, `den Bus` ở Akkusativ vì `auf` chứ
không phải vì nó là tân ngữ.

## Động từ đòi Dativ — danh sách cần thuộc

`helfen` · `danken` · `gefallen` · `gehören` · `passen` · `schmecken` · `antworten` · `folgen` ·
`begegnen` · `vertrauen` · `gratulieren`

> Ich **helfe dir**. *(không phải "helfe dich")*

## Động từ đòi hai tân ngữ

`geben`, `schenken`, `zeigen`, `erklären`, `schicken`, `empfehlen` — người nhận ở **Dativ**, vật ở
**Akkusativ**:

> Ich gebe **dem Kind** *einen Apfel*.
$md$),

('b2-n-deklination', 'n-Deklination', 'n-Deklination — đầy đủ và ngoại lệ', 'B2', 'Danh từ', 4,
'Nhóm danh từ giống đực thêm -n/-en, kèm nhóm hỗn hợp có Genitiv -ns.', $md$
## Bảng cơ bản

| Cách | Số ít | Số nhiều |
| --- | --- | --- |
| Nominativ | der Student | die Student**en** |
| Akkusativ | den Student**en** | die Student**en** |
| Dativ | dem Student**en** | den Student**en** |
| Genitiv | des Student**en** | der Student**en** |

Chỉ Nominativ số ít là dạng gốc; tất cả ô còn lại đều `-en`.

## Ba nhóm thuộc n-Deklination

| Nhóm | Ví dụ |
| --- | --- |
| Giống đực kết thúc `-e` | der Junge, der Kunde, der Kollege, der Neffe, der Affe |
| Đuôi `-ent, -ant, -ist, -oge, -at, -nom` | der Student, der Praktikant, der Polizist, der Biologe, der Soldat, der Astronom |
| Người/động vật giống đực (nhóm lẻ) | der Mensch, der Herr, der Nachbar, der Bauer, der Bär, der Held |

Toàn bộ đều **giống đực** — không có danh từ giống cái hay trung nào.

## Nhóm hỗn hợp: Genitiv `-ns`

Một nhóm nhỏ thêm `-n` ở Akkusativ/Dativ nhưng `-ns` ở Genitiv:

| Nominativ | Akkusativ/Dativ | Genitiv |
| --- | --- | --- |
| der Name | den/dem Name**n** | des Name**ns** |
| der Gedanke | den/dem Gedanke**n** | des Gedanke**ns** |
| der Wille | den/dem Wille**n** | des Wille**ns** |
| das Herz | das Herz / dem Herz**en** | des Herz**ens** |

`das Herz` là danh từ **giống trung** duy nhất trong nhóm này — hay ra đề vì thế.

## `der Herr` — dạng riêng

| | Số ít | Số nhiều |
| --- | --- | --- |
| Nominativ | der Herr | die Herr**en** |
| Các cách khác | den/dem/des Herr**n** | den/der Herr**en** |

Số ít chỉ thêm `-n`, số nhiều thêm `-en`.

> Sehr geehrter **Herr** Müller, *(Nominativ — không đuôi)*
> Ich schreibe **Herrn** Müller. *(Dativ — thêm -n)*

## Lỗi hay gặp

> Sai: *Ich kenne den Student.* / *Ich helfe dem Kollege.*
> Đúng: Ich kenne **den Studenten**. / Ich helfe **dem Kollegen**.
$md$),

('b2-wortstellung', 'Wortstellung im Hauptsatz', 'Trật tự từ trong câu chính — hệ thống đầy đủ', 'B2', 'Trật tự từ', 5,
'Bốn tầng quy tắc: chủ ngữ-vị ngữ, hai tân ngữ, bổ ngữ TE-KA-MO-LO, và tân ngữ giới từ.', $md$
## Tầng 1 — Chủ ngữ và vị ngữ

Động từ chia luôn ở **vị trí 2**; nếu có động từ thứ hai, nó xuống **cuối câu** tạo khung câu:

> Ich **habe** gestern viel **gearbeitet**.
> Ich **will** morgen nach Berlin **fahren**.

## Tầng 2 — Hai tân ngữ

| Tình huống | Thứ tự | Ví dụ |
| --- | --- | --- |
| Hai danh từ | **Dativ → Akkusativ** | Ich gebe **dem Kind** *das Buch*. |
| Một đại từ, một danh từ | **đại từ trước** | Ich gebe **es** *dem Kind*. |
| Hai đại từ | **Akkusativ → Dativ** | Ich gebe **es** *ihm*. |

Nguyên tắc chung: **đại từ luôn được ưu tiên ra trước**; khi cả hai cùng là đại từ thì vật đi trước
người.

## Tầng 3 — Bổ ngữ: TE-KA-MO-LO

| Viết tắt | Loại | Ví dụ |
| --- | --- | --- |
| **TE**mporal | khi nào | heute, um 8 Uhr, letzte Woche |
| **KA**usal | tại sao | wegen der Arbeit, aus Angst |
| **MO**dal | thế nào | mit dem Zug, schnell, gern |
| **LO**kal | ở đâu | nach Berlin, in der Stadt |

> Ich fahre **heute** **wegen der Arbeit** **mit dem Zug** **nach Berlin**.

## Tầng 4 — Tân ngữ giới từ đứng gần cuối

Tân ngữ giới từ (`warten auf`, `sich freuen über`...) đứng **sau mọi bổ ngữ**, ngay trước động từ
cuối câu:

> Ich habe gestern lange **auf dich** *gewartet*.
> Wir sprechen morgen im Büro **über das Projekt**.

## Vị trí của `nicht`

| Phủ định | Vị trí `nicht` |
| --- | --- |
| Cả câu | gần cuối, trước động từ thứ hai và trước tân ngữ giới từ |
| Một thành phần | ngay trước thành phần đó |

> Ich kann heute **nicht** kommen.
> Ich warte **nicht** auf dich, sondern auf Anna.

## Điều gì được đưa lên vị trí 1?

Gần như bất cứ thành phần nào — để **nhấn mạnh** hoặc **nối ý với câu trước**:

> **Gestern** habe ich gearbeitet. · **In Berlin** wohnt meine Schwester.
> **Das Buch** habe ich schon gelesen.

Nhưng chỉ **một** thành phần, và động từ vẫn giữ nguyên vị trí 2.
$md$),

('b2-praeposition-kasus', 'Präpositionen', 'Giới từ phân theo cách — toàn bộ hệ thống', 'B2', 'Giới từ', 6,
'Năm nhóm: luôn Akkusativ, luôn Dativ, hai cách, Genitiv, và nhóm đổi cách theo nghĩa.', $md$
## Nhóm 1 — Luôn Akkusativ

`durch` · `für` · `gegen` · `ohne` · `um` · `bis` · `entlang` (đứng sau danh từ)

Mẹo nhớ: **DOG FU** — durch, ohne, gegen, für, um.

## Nhóm 2 — Luôn Dativ

`aus` · `bei` · `mit` · `nach` · `seit` · `von` · `zu` · `gegenüber` · `ab` · `außer`

Rút gọn bắt buộc quen: `zu dem` → **zum** · `zu der` → **zur** · `bei dem` → **beim** ·
`von dem` → **vom**

## Nhóm 3 — Hai cách (Wechselpräpositionen)

`an` · `auf` · `hinter` · `in` · `neben` · `über` · `unter` · `vor` · `zwischen`

| Câu hỏi | Cách | Động từ đi kèm |
| --- | --- | --- |
| **Wohin?** (có di chuyển) | Akkusativ | gehen, fahren, stellen, legen, setzen, hängen (treo lên) |
| **Wo?** (đứng yên) | Dativ | sein, bleiben, stehen, liegen, sitzen, hängen (đang treo) |

> Ich hänge das Bild **an die** Wand. *(Wohin? → Akk)*
> Das Bild hängt **an der** Wand. *(Wo? → Dativ)*

## Nhóm 4 — Genitiv

`wegen` · `trotz` · `während` · `statt/anstatt` · `innerhalb` · `außerhalb` · `aufgrund` ·
`anlässlich` · `infolge` · `angesichts`

Đây là nhóm của **văn viết**: thông báo hành chính, báo chí, hợp đồng.

## Nhóm 5 — Đổi cách theo nghĩa

Phần mới của B2: cùng một giới từ nhưng cách khác nhau tuỳ nghĩa.

| Giới từ | + Akkusativ | + Dativ |
| --- | --- | --- |
| **über** | về (chủ đề): sprechen **über das** Thema | phía trên: **über dem** Tisch |
| **vor** | — | trước (thời gian/vị trí): **vor dem** Haus, **vor** zwei Jahren |
| **um** | quanh, lúc: **um den** Tisch | — |

| Giới từ | + Dativ | + Genitiv |
| --- | --- | --- |
| **wegen** | văn nói: wegen **dem** Regen | chuẩn mực: wegen **des** Regens |
| **trotz** | văn nói: trotz **dem** Regen | chuẩn mực: trotz **des** Regens |
| **dank** | dank **dem** Zufall | dank **des** Zufalls |

Bài thi thì luôn chọn Genitiv cho `wegen`/`trotz`/`während`.
$md$),

('b2-nebensatz-modal', 'Modale Nebensätze', 'Mệnh đề chỉ cách thức', 'B2', 'Mệnh đề phụ', 7,
'indem, dadurch dass, ohne dass, anstatt dass — diễn đạt "bằng cách nào" và "mà không".', $md$
## `indem` — bằng cách

Trả lời câu hỏi *Wie?* (bằng cách nào), diễn tả **phương tiện để đạt mục đích**:

> Man lernt eine Sprache, **indem** man sie täglich **spricht**.
> (Học một ngôn ngữ bằng cách nói nó hằng ngày.)

> Er verbesserte seine Noten, **indem** er mehr **lernte**.

`dadurch, dass` nghĩa gần như y hệt, chỉ trang trọng hơn:
> Man lernt eine Sprache **dadurch, dass** man sie täglich spricht.

## `ohne dass` / `ohne ... zu` — mà không

| Chủ ngữ hai vế | Dùng |
| --- | --- |
| **Khác nhau** | `ohne dass` + mệnh đề |
| **Giống nhau** | `ohne ... zu` + nguyên thể |

> Er ging, **ohne dass** ich es **merkte**. *(anh ấy đi — tôi nhận ra: khác chủ ngữ)*
> Er ging, **ohne** etwas **zu sagen**. *(anh ấy đi — anh ấy nói: cùng chủ ngữ)*

## `anstatt dass` / `anstatt ... zu` — thay vì

Cùng quy tắc chủ ngữ như trên:

> **Anstatt dass** er arbeitet, **schläft** er. *(khác chủ ngữ — ít dùng)*
> **Anstatt zu** arbeiten, schläft er. *(cùng chủ ngữ — tự nhiên hơn)*

## Phân biệt `indem` với `während`

Cả hai đều nói về hai việc cùng lúc, nhưng khác hẳn quan hệ:

> Ich lerne Deutsch, **indem** ich Filme schaue. *(xem phim là CÁCH để học)*
> Ich lerne Deutsch, **während** ich Musik höre. *(nghe nhạc chỉ diễn ra CÙNG LÚC)*

Nhầm hai từ này là lỗi nghĩa, không phải lỗi ngữ pháp — nên bài thi rất hay khai thác.

## Nhắc lại trật tự từ

Mọi liên từ ở đây đều đẩy **động từ chia xuống cuối** mệnh đề:

> ..., indem man sie täglich **spricht**.
> ..., ohne dass ich es **merkte**.
$md$),

('b2-nebensatz-konsekutiv', 'Konsekutive Nebensätze', 'Mệnh đề chỉ hệ quả', 'B2', 'Mệnh đề phụ', 8,
'so dass, so ... dass, zu ... als dass — diễn đạt kết quả kéo theo.', $md$
## `sodass` / `so dass` — đến nỗi mà

Diễn tả **hệ quả** của điều vừa nói:

> Es regnete stark, **sodass** wir zu Hause **blieben**.
> (Mưa to đến nỗi chúng tôi phải ở nhà.)

Viết liền `sodass` hay tách `so dass` đều đúng theo chính tả hiện hành.

## `so + tính từ + dass` — nhấn mạnh mức độ

Tách `so` ra đặt trước tính từ để nhấn vào **mức độ**:

> Das Wetter war **so** schlecht, **dass** wir zu Hause blieben.
> Er spricht **so** schnell, **dass** ich ihn nicht verstehe.

So sánh hai cách:
> Es regnete stark, **sodass** wir blieben. *(nhấn vào hệ quả)*
> Es regnete **so** stark, **dass** wir blieben. *(nhấn vào mức độ mưa)*

## `zu ... als dass` — quá ... đến mức không thể

Cấu trúc trang trọng, luôn mang nghĩa **phủ định**, thường đi với Konjunktiv II:

> Es ist **zu** kalt, **als dass** wir schwimmen **könnten**.
> (Trời lạnh quá nên không thể bơi được.)

> Er ist **zu** müde, **als dass** er noch arbeiten **könnte**.

## `zu ... um ... zu` — cùng nghĩa, gọn hơn

Khi hai vế cùng chủ ngữ, dạng này tự nhiên hơn nhiều:

> Es ist **zu** kalt, **um zu** schwimmen.
> Er ist **zu** müde, **um** noch **zu** arbeiten.

## Đừng nhầm với `deshalb`

Cả hai nói về hệ quả nhưng khác loại từ, khác trật tự từ:

> Es regnete stark. **Deshalb** *blieben* wir zu Hause. *(trạng từ — động từ theo ngay sau)*
> Es regnete stark, **sodass** wir zu Hause **blieben**. *(liên từ — động từ xuống cuối)*
$md$),

('b2-nebensatz-adversativ', 'Adversative Nebensätze', 'Mệnh đề chỉ sự đối lập', 'B2', 'Mệnh đề phụ', 9,
'während, wohingegen — so sánh đối lập hai sự việc, khác với nghĩa thời gian.', $md$
## `während` mang hai nghĩa

Đây là điểm mấu chốt của chủ điểm này:

| Nghĩa | Ví dụ |
| --- | --- |
| **Thời gian** (trong lúc) | **Während** ich koche, hört er Musik. |
| **Đối lập** (trong khi thì) | **Während** ich gern lese, sieht er lieber fern. |

Phân biệt bằng **nội dung hai vế**: nếu hai vế nói về hai điều **trái ngược nhau** thì là nghĩa đối
lập; nếu chỉ là hai việc diễn ra cùng lúc thì là nghĩa thời gian.

> **Während** meine Schwester Medizin studiert, studiere ich Jura.
> *(không nói về thời gian — đang so sánh hai người)*

## `wohingegen` — chỉ có nghĩa đối lập

Rõ ràng hơn `während` vì không đa nghĩa, nhưng trang trọng hơn:

> Ich arbeite gern im Team, **wohingegen** mein Kollege lieber allein **arbeitet**.

## Các cách khác để nói đối lập

| Từ | Loại | Ví dụ |
| --- | --- | --- |
| **während / wohingegen** | liên từ phụ | ..., während er fernsieht. *(động từ cuối)* |
| **aber** | liên từ chính | Ich lese, **aber** er *sieht* fern. *(V2)* |
| **dagegen / hingegen** | trạng từ | Ich lese. Er **dagegen** *sieht* fern. |
| **im Gegensatz zu** | giới từ + Dativ | **Im Gegensatz zu** mir sieht er gern fern. |

Bốn cách này cùng diễn đạt một ý — đúng kiểu câu hỏi "viết lại câu" trong đề thi B2.

## Ví dụ viết lại một ý bằng bốn cách

> **Während** ich Tee trinke, trinkt er Kaffee.
>
> Ich trinke Tee, **aber** er trinkt Kaffee.
>
> Ich trinke Tee. Er **dagegen** trinkt Kaffee.
>
> **Im Gegensatz zu** mir trinkt er Kaffee.

## Phân biệt với `obwohl`

Hai chủ điểm dễ lẫn nhưng khác hẳn:

> **Während** ich gern lese, sieht er fern. *(so sánh hai bên — không có mâu thuẫn)*
> **Obwohl** ich müde bin, lese ich weiter. *(nghịch lý — làm dù có trở ngại)*
$md$),

('b2-nebensatz-konditional', 'Konditionale Nebensätze', 'Mệnh đề điều kiện ở trình B2', 'B2', 'Mệnh đề phụ', 10,
'falls, sofern, và câu điều kiện không có liên từ — dạng đảo động từ lên đầu.', $md$
## `wenn`, `falls`, `sofern`

| Liên từ | Sắc thái |
| --- | --- |
| **wenn** | phổ thông nhất, dùng được mọi lúc |
| **falls** | nhấn vào tính **không chắc chắn** — "phòng khi" |
| **sofern** | trang trọng, mang nghĩa "miễn là, với điều kiện" |

> **Falls** es regnet, bleiben wir zu Hause. *(có thể mưa, có thể không)*
> **Sofern** Sie einverstanden sind, beginnen wir. *(văn phong công việc)*

`wenn` còn mang nghĩa thời gian; `falls` và `sofern` **chỉ** mang nghĩa điều kiện — nên khi muốn
tránh hiểu nhầm, dùng `falls` cho rõ.

## Điều kiện không có liên từ — dạng đảo

Phần mới của B2. Bỏ hẳn `wenn`, đưa **động từ lên vị trí đầu tiên**:

> **Wenn** ich Zeit **hätte**, würde ich kommen.
> = **Hätte** ich Zeit, würde ich kommen.

> **Wenn** Sie Fragen **haben**, rufen Sie an.
> = **Haben** Sie Fragen, rufen Sie an.

Dạng này trang trọng, hay gặp trong văn viết và thư từ công việc. Mệnh đề chính thường thêm `so`
hoặc `dann`:

> **Hätte** ich das gewusst, **so** wäre ich nicht gekommen.

## Ba mức độ hiện thực

| Mức | Thì | Ví dụ |
| --- | --- | --- |
| **Có thật** | Präsens | **Wenn** es regnet, bleibe ich zu Hause. |
| **Không thật, hiện tại** | Konjunktiv II | **Wenn** ich Zeit **hätte**, käme ich. |
| **Không thật, quá khứ** | Konjunktiv II quá khứ | **Wenn** ich Zeit **gehabt hätte**, **wäre** ich **gekommen**. |

Quá khứ giả định **không dùng `würde`**, mà là `hätte`/`wäre` + Partizip II ở cả hai vế.

## `es sei denn` — trừ phi

> Ich komme, **es sei denn**, ich werde krank.
> (Tôi sẽ đến, trừ phi tôi bị ốm.)

Sau `es sei denn` trật tự từ **giữ nguyên V2**, không đẩy động từ xuống cuối.
$md$),

('b2-subjekt-objektsatz', 'Subjektsätze und Objektsätze', 'Mệnh đề làm chủ ngữ và tân ngữ', 'B2', 'Mệnh đề phụ', 11,
'Mệnh đề dass/ob/Fragewort đóng vai chủ ngữ hoặc tân ngữ, và vai trò của "es" giả.', $md$
## Mệnh đề làm tân ngữ (Objektsatz)

Cách dùng quen thuộc từ A2 — mệnh đề thay cho tân ngữ:

> Ich weiß, **dass du Deutsch lernst**. *(thay cho "Ich weiß **es**")*
> Er fragt, **ob ich Zeit habe**.
> Ich weiß nicht, **wann der Zug kommt**.

Ba loại mở đầu: **`dass`** (điều khẳng định) · **`ob`** (câu hỏi Có/Không) · **từ để hỏi**
(`wann`, `wo`, `warum`...).

## Mệnh đề làm chủ ngữ (Subjektsatz) — phần mới của B2

Mệnh đề đứng ở vai **chủ ngữ** của câu:

> **Dass du kommst**, freut mich. *(Việc bạn đến làm tôi vui.)*
> **Ob er kommt**, ist noch unklar.

Cả mệnh đề tính là **một thành phần ở vị trí 1**, nên động từ chính theo ngay sau.

## `es` giả — khi mệnh đề bị đẩy ra sau

Câu trên nghe nặng đầu. Cách tự nhiên hơn là dùng **`es`** giữ chỗ chủ ngữ rồi đẩy mệnh đề ra cuối:

> **Es** freut mich, **dass du kommst**.
> **Es** ist noch unklar, **ob er kommt**.
> **Es** ist wichtig, **dass wir pünktlich sind**.

Đây là dạng dùng nhiều nhất trong thực tế. Mẫu `Es ist + tính từ + dass ...` xuất hiện liên tục:

| Mẫu | Ví dụ |
| --- | --- |
| Es ist **wichtig**, dass... | Es ist wichtig, dass du übst. |
| Es ist **möglich**, dass... | Es ist möglich, dass er kommt. |
| Es **freut/ärgert** mich, dass... | Es ärgert mich, dass er nie anruft. |
| Es **stimmt**, dass... | Es stimmt, dass Deutsch schwer ist. |

## Khi nào bỏ được `dass`

Sau `denken`, `glauben`, `meinen`, `sagen`, `hoffen` — nhưng khi bỏ thì **trật tự từ trở lại V2**:

> Ich glaube, **dass** er recht **hat**. *(động từ cuối)*
> Ich glaube, er **hat** recht. *(động từ vị trí 2)*

## Thay bằng `zu` + nguyên thể

Khi hai vế cùng chủ ngữ, dùng nguyên thể gọn hơn:

> Ich hoffe, **dass ich** dich bald sehe. → Ich hoffe, dich bald **zu sehen**.
> Es ist wichtig, **dass man** übt. → Es ist wichtig, **zu üben**.
$md$),

('b2-infinitivsatz', 'Infinitivsatz mit zu', 'Mệnh đề nguyên thể với zu — nâng cao', 'B2', 'Mệnh đề phụ', 12,
'Khi nào thay được mệnh đề dass bằng zu + nguyên thể, và dạng nguyên thể ở quá khứ.', $md$
## Điều kiện để thay `dass` bằng `zu`

Chỉ thay được khi **chủ ngữ hai vế trùng nhau**, hoặc mệnh đề chính đã nêu rõ đối tượng:

> Ich hoffe, **dass ich** dich bald sehe. → Ich hoffe, dich bald **zu sehen**. ✓
> Ich hoffe, **dass du** bald kommst. → *không thay được* (chủ ngữ khác)

Với mệnh đề chính vô nhân xưng (`Es ist wichtig...`) thì luôn thay được:
> Es ist wichtig, **dass man** übt. → Es ist wichtig, **zu üben**.

## Nhóm đòi `zu`

| Loại | Ví dụ |
| --- | --- |
| Động từ | vergessen, versuchen, anfangen, aufhören, hoffen, versprechen, beschließen, vorhaben, scheinen |
| Tính từ | Es ist **wichtig / schwer / möglich / schön** ... zu ... |
| Danh từ | **Zeit / Lust / Angst / die Möglichkeit** haben ... zu ... |

## Nhóm KHÔNG dùng `zu`

Động từ khiếm khuyết · `lassen` · động từ chuyển động (gehen, fahren, kommen) · `sehen`, `hören` ·
`bleiben`, `helfen` (khi nói)

> Ich **gehe** einkaufen. · Ich **höre** ihn singen. · Ich **muss** gehen.

## Động từ tách được: `zu` vào giữa

| Nguyên thể | Với zu |
| --- | --- |
| aufstehen | auf**zu**stehen |
| einkaufen | ein**zu**kaufen |
| teilnehmen | teil**zu**nehmen |

## Nguyên thể ở quá khứ — phần mới của B2

Diễn tả việc đã hoàn tất trước hành động của mệnh đề chính:

**Partizip II + `zu haben`/`zu sein`**

> Ich freue mich, die Prüfung **bestanden zu haben**.
> (Tôi vui vì đã thi đỗ.)

> Er scheint schon **gegangen zu sein**.
> (Có vẻ anh ấy đã đi rồi.)

So sánh với dạng hiện tại:
> Er scheint zu **schlafen**. *(đang ngủ)*
> Er scheint **geschlafen zu haben**. *(đã ngủ rồi)*

## Ba cấu trúc cùng họ

| Cấu trúc | Nghĩa | Nếu khác chủ ngữ thì dùng |
| --- | --- | --- |
| **um ... zu** | để mà | damit |
| **ohne ... zu** | mà không | ohne dass |
| **statt/anstatt ... zu** | thay vì | anstatt dass |
$md$)

ON CONFLICT (slug) DO NOTHING;
