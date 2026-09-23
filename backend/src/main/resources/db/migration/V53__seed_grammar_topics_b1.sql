-- 18 chủ điểm ngữ pháp B1.
--
-- Nguồn danh sách chủ điểm: mục lục B1 — lưu ý đây KHÔNG phải "Aber Hallo" như A1/A2/B2 mà là bản
-- của Jürgen Alexandre (deutschlernmaterialien.blogspot.com), trang đầu ghi rõ "tài liệu KHÔNG
-- dùng cho mục đích kiếm tiền". Cách làm hybrid vẫn giữ nguyên như A1/A2: chỉ lấy danh sách và
-- thứ tự chủ điểm (dữ kiện), toàn bộ lý thuyết viết mới bằng tiếng Việt.
--
-- Năm chủ điểm trùng tên với A2 (Genitiv, Konjunktiv II, Modalverben, Verben mit
-- Präpositionalobjekt, Adjektive) được tạo thành chủ điểm B1 RIÊNG với slug tiền tố "b1-" thay vì
-- viết thêm vào chủ điểm A2 — quyết định chốt với user 2026-09-23: người học A2 không bị ném vào
-- nội dung quá tầm, và thanh tiến độ mỗi level không bị pha nội dung level khác.

INSERT INTO grammar_topics (slug, title_de, title_vi, level, group_label, order_index, summary_vi, theory_md) VALUES

('b1-verben-vergangenheit', 'Verben - Vergangenheit', 'Ba thì quá khứ — dùng cái nào khi nào', 'B1', NULL, 1,
'Perfekt để nói, Präteritum để viết, Plusquamperfekt cho việc xảy ra trước một việc quá khứ khác.', $md$
## Ba thì quá khứ, ba chỗ dùng

| Thì | Cấu trúc | Dùng ở đâu |
| --- | --- | --- |
| **Perfekt** | haben/sein + Partizip II | nói chuyện hằng ngày |
| **Präteritum** | dạng riêng của động từ | văn viết; và sein/haben/modal kể cả khi nói |
| **Plusquamperfekt** | hatte/war + Partizip II | việc xảy ra **trước** một việc quá khứ khác |

## Plusquamperfekt — điểm mới của B1

Dùng khi cần nói rõ **việc nào xảy ra trước**:

> **Nachdem** ich gegessen **hatte**, ging ich spazieren.
> (Sau khi tôi đã ăn xong, tôi đi dạo.)

Việc "ăn" xảy ra trước việc "đi dạo". Nếu cả hai cùng ở Präteritum thì mất thông tin thứ tự này.

Cách tạo: lấy Perfekt rồi **đổi trợ động từ sang Präteritum**:

| Perfekt | Plusquamperfekt |
| --- | --- |
| ich **habe** gegessen | ich **hatte** gegessen |
| er **ist** gefahren | er **war** gefahren |
| wir **haben** gelernt | wir **hatten** gelernt |

## Cặp `nachdem` + `als`

Plusquamperfekt hầu như luôn đi với `nachdem`:

> **Nachdem** er die Prüfung bestanden **hatte**, *feierte* er. (Präteritum ở mệnh đề chính)

Quy tắc phối thì: `nachdem` + Plusquamperfekt → mệnh đề chính Präteritum/Perfekt.

## Điểm người Việt hay vướng

Tiếng Việt chỉ cần "đã" là đủ cho mọi tầng quá khứ, nên ta dễ dùng một thì cho tất cả. Tiếng Đức
phân tầng rõ: muốn nói "đã làm xong rồi *mới* làm việc kia" thì bắt buộc dùng Plusquamperfekt,
nếu không người nghe hiểu là hai việc song song.
$md$),

('b1-kausale-konnektoren', 'Kausale Konnektoren', 'Diễn đạt nguyên nhân — bốn cách khác nhau', 'B1', NULL, 2,
'weil, denn, deshalb, wegen — cùng nói về nguyên nhân nhưng trật tự từ khác hẳn nhau.', $md$
## Bốn cách nói "bởi vì", khác nhau ở trật tự từ

| Từ | Loại | Động từ đứng đâu | Ví dụ |
| --- | --- | --- | --- |
| **weil** | liên từ phụ | **cuối mệnh đề** | Ich bleibe, weil ich krank **bin**. |
| **denn** | liên từ chính | vị trí 2 (bình thường) | Ich bleibe, denn ich **bin** krank. |
| **deshalb** | trạng từ | ngay sau nó (vì nó chiếm vị trí 1) | Ich bin krank, deshalb **bleibe** ich. |
| **wegen** | giới từ | — (đi với danh từ) | **Wegen** der Krankheit bleibe ich. |

Đây là bài kiểm tra kinh điển ở trình B1: cùng một ý, viết được bằng cả bốn cách.

## `deshalb` và họ hàng

`deshalb`, `deswegen`, `darum`, `daher`, `also` — đều nghĩa "vì vậy, cho nên", đều là **trạng từ**
nên chiếm vị trí 1 và đẩy chủ ngữ ra sau động từ:

> Es regnet. **Deshalb** *bleibe* **ich** zu Hause.

Sai kinh điển: *Deshalb ich bleibe zu Hause* — quên mất quy tắc V2.

## `wegen` + Genitiv

`wegen` là giới từ, đi với **Genitiv**:

> **wegen des** Regens · **wegen der** Arbeit · **wegen des** Wetters

Khi nói, nhiều người Đức dùng Dativ (*wegen dem Regen*) — không chuẩn mực nhưng cực phổ biến. Bài
thi thì cứ dùng Genitiv cho chắc.

## Chú ý chiều nhân quả

`weil`/`denn`/`wegen` đứng trước **nguyên nhân**; `deshalb` đứng trước **kết quả**. Đảo nhầm là đổi
hẳn nghĩa câu:

> Ich bin krank, **deshalb** bleibe ich zu Hause. ✓ (ốm → ở nhà)
> Ich bleibe zu Hause, **weil** ich krank bin. ✓ (ở nhà ← ốm)
$md$),

('b1-nebensatz-fragesatz', 'Nebensätze - Fragesätze', 'Câu hỏi gián tiếp', 'B1', NULL, 3,
'Chuyển câu hỏi thành mệnh đề phụ: động từ xuống cuối, dùng ob nếu không có từ để hỏi.', $md$
## Câu hỏi lồng trong câu khác

> Wo wohnst du? → Ich weiß nicht, **wo** du **wohnst**.
> Kommst du? → Ich weiß nicht, **ob** du **kommst**.

Hai thay đổi khi chuyển:
1. **Động từ xuống cuối** mệnh đề
2. Câu hỏi Có/Không phải thêm **`ob`** (câu hỏi có từ để hỏi thì giữ nguyên từ đó)

## Bảng chuyển

| Câu hỏi trực tiếp | Câu hỏi gián tiếp |
| --- | --- |
| Was machst du? | Er fragt, **was** ich **mache**. |
| Wann kommt der Zug? | Weißt du, **wann** der Zug **kommt**? |
| Warum lernst du Deutsch? | Sie fragt, **warum** ich Deutsch **lerne**. |
| Hast du Zeit? | Er fragt, **ob** ich Zeit **habe**. |
| Ist das richtig? | Ich weiß nicht, **ob** das richtig **ist**. |

## Mở đầu thường gặp

`Ich weiß nicht, ...` · `Können Sie mir sagen, ...` · `Er fragt, ...` · `Ich möchte wissen, ...`

## Vì sao đáng học kỹ

Câu hỏi gián tiếp **lịch sự hơn hẳn** câu hỏi thẳng. So sánh:

> **Wo ist** der Bahnhof? (cộc)
> **Können Sie mir sagen, wo** der Bahnhof **ist**? (lịch sự — dùng khi hỏi người lạ)

Đây là mẫu câu dùng liên tục khi đi hỏi đường, hỏi thủ tục ở Amt, gọi điện hẹn lịch.

## Bẫy: `ob` không phải `wenn`

Cả hai dịch sang tiếng Việt đều có thể thành "nếu", nhưng:

> Ich weiß nicht, **ob** er kommt. (liệu anh ấy có đến không — không biết)
> Ich freue mich, **wenn** er kommt. (nếu/khi anh ấy đến — điều kiện)
$md$),

('b1-praeposition-lokal', 'Präpositionen - lokal', 'Giới từ chỉ nơi chốn', 'B1', NULL, 4,
'Wo? Wohin? Woher? — ba câu hỏi, ba nhóm giới từ và cách đi kèm.', $md$
## Ba câu hỏi về nơi chốn

| Câu hỏi | Ý | Giới từ tiêu biểu |
| --- | --- | --- |
| **Wo?** | ở đâu (đứng yên) | in, an, auf, bei, neben, zwischen + **Dativ** |
| **Wohin?** | đi đâu (tới) | in, an, auf, nach, zu + Akk/Dativ tuỳ từ |
| **Woher?** | từ đâu (rời khỏi) | aus, von + **Dativ** |

## Wohin? — `nach`, `zu`, `in` khác nhau thế nào

Đây là chỗ sai nhiều nhất:

| Giới từ | Dùng với | Ví dụ |
| --- | --- | --- |
| **nach** | địa danh **không mạo từ**, hướng | nach Berlin, nach Deutschland, nach Hause, nach links |
| **zu** | **người**, địa điểm cụ thể | zum Arzt, zur Schule, zu Anna, zur Post |
| **in** | đi **vào bên trong** | ins Kino, in die Stadt, in die Schweiz |

> Ngoại lệ hay gặp: quốc gia **có mạo từ** thì dùng `in`, không dùng `nach`:
> `in **die** Schweiz`, `in **die** Türkei`, `in **die** USA` — chứ không phải *nach der Schweiz*.

## Woher? — `aus` và `von`

| Giới từ | Nghĩa | Ví dụ |
| --- | --- | --- |
| **aus** | từ bên trong ra; quê quán | Ich komme **aus** Vietnam / **aus** dem Haus. |
| **von** | từ một điểm, từ một người | Ich komme **von** der Arbeit / **von** Anna. |

## Cặp "nhà"

Ba dạng cố định, không theo quy tắc nào — học thuộc:

| Câu hỏi | Dạng |
| --- | --- |
| Wo? | **zu Hause** (ở nhà) |
| Wohin? | **nach Hause** (về nhà) |
| Woher? | **von zu Hause** (từ nhà) |
$md$),

('b1-praeposition-temporal', 'Präpositionen - temporal', 'Giới từ chỉ thời gian', 'B1', NULL, 5,
'am, im, um, seit, vor, bis, während — mỗi mốc thời gian đi với một giới từ riêng.', $md$
## Bảng giới từ theo loại mốc thời gian

| Giới từ | Cách | Dùng cho | Ví dụ |
| --- | --- | --- | --- |
| **am** | Dativ | ngày, thứ, buổi | **am** Montag, **am** 3. Mai, **am** Abend |
| **im** | Dativ | tháng, mùa, năm có "Jahr" | **im** Januar, **im** Sommer, **im** Jahr 2020 |
| **um** | Akk | giờ chính xác | **um** 8 Uhr |
| **gegen** | Akk | giờ áng chừng | **gegen** 8 Uhr |
| **seit** | Dativ | từ quá khứ đến nay | **seit** zwei Jahren |
| **vor** | Dativ | cách đây | **vor** drei Tagen |
| **in** | Dativ | sau bao lâu nữa | **in** zwei Wochen |
| **bis** | Akk | cho đến | **bis** Freitag |
| **ab** | Dativ | bắt đầu từ | **ab** Montag |
| **während** | Genitiv | trong suốt | **während** der Ferien |

## Ba cặp hay nhầm

**`seit` và `vor`** — cùng chỉ về quá khứ nhưng khác hẳn:
> Ich lerne Deutsch **seit** zwei Jahren. (hai năm nay, **vẫn đang học**)
> Ich habe **vor** zwei Jahren angefangen. (bắt đầu cách đây hai năm, một thời điểm)

**`in` và `nach`** khi nói về tương lai:
> **In** zwei Wochen fahre ich. (hai tuần nữa — tính từ bây giờ)
> **Nach** zwei Wochen kam er zurück. (sau hai tuần — tính từ một mốc khác)

**Không dùng giới từ** với năm trần và các từ chỉ thời gian:
> **2020** war ein schweres Jahr. *(không phải "in 2020" — đó là lối tiếng Anh)*
> **Letzte Woche** war ich krank. · **Jeden Tag** lerne ich.

## Mẹo cho `am` và `im`

`am` = an dem → dùng cho **ngày**. `im` = in dem → dùng cho **khoảng dài hơn ngày** (tháng, mùa,
năm). Ngoại lệ duy nhất đáng nhớ: **in der Nacht** (ban đêm), không phải *am Nacht*.
$md$),

('b1-nebensatz-temporal', 'Nebensätze - temporal', 'Mệnh đề chỉ thời gian', 'B1', NULL, 6,
'wenn, als, nachdem, bevor, während, seitdem, bis — nối hai sự việc theo thời gian.', $md$
## Bảy liên từ thời gian

| Liên từ | Nghĩa | Lưu ý |
| --- | --- | --- |
| **wenn** | khi (lặp lại / tương lai) | |
| **als** | khi (một lần, quá khứ) | |
| **nachdem** | sau khi | đi với Plusquamperfekt |
| **bevor / ehe** | trước khi | |
| **während** | trong lúc | hai việc song song |
| **seitdem** | từ khi | |
| **bis** | cho đến khi | |

Tất cả đều đẩy **động từ chia xuống cuối** mệnh đề.

## `wenn` hay `als` — quy tắc bỏ túi

| | Một lần | Nhiều lần |
| --- | --- | --- |
| **Quá khứ** | **als** | wenn |
| **Hiện tại / tương lai** | wenn | wenn |

Nói gọn: **quá khứ + một lần → `als`**, mọi trường hợp khác → `wenn`.

> **Als** ich 18 war, zog ich nach Berlin. *(một lần)*
> **Immer wenn** ich nach Berlin fuhr, besuchte ich sie. *(nhiều lần)*

## Phối thì với `nachdem`

Đây là quy tắc cứng, hay ra trong đề thi:

| Mệnh đề `nachdem` | Mệnh đề chính |
| --- | --- |
| Plusquamperfekt (hatte/war + P II) | Präteritum hoặc Perfekt |
| Perfekt | Präsens |

> **Nachdem** ich gegessen **hatte**, *ging* ich schlafen.
> **Nachdem** ich gegessen **habe**, *gehe* ich schlafen.

## `während` — hai nghĩa, hai loại từ

| Loại | Đi với | Ví dụ |
| --- | --- | --- |
| Liên từ | mệnh đề | **Während** ich koche, *hört* er Musik. |
| Giới từ | danh từ (Genitiv) | **Während** des Essens sprachen wir nicht. |

Cùng một chữ, nhưng một bên theo sau là cả mệnh đề, một bên chỉ là danh từ.
$md$),

('b1-nebensatz-konzessiv', 'Nebensätze - konzessiv', 'Mệnh đề nhượng bộ', 'B1', NULL, 7,
'obwohl, trotzdem, trotz — diễn đạt "mặc dù" bằng ba loại từ khác nhau.', $md$
## "Mặc dù" — ba cách

| Từ | Loại | Trật tự từ | Ví dụ |
| --- | --- | --- | --- |
| **obwohl** | liên từ phụ | động từ **cuối mệnh đề** | Ich gehe, **obwohl** es **regnet**. |
| **trotzdem** | trạng từ | chiếm vị trí 1, động từ theo ngay sau | Es regnet. **Trotzdem** *gehe* ich. |
| **trotz** | giới từ | đi với danh từ (Genitiv) | **Trotz** des Regens gehe ich. |

Giống hệt bộ ba nhân quả `weil / deshalb / wegen`, chỉ đổi ý nghĩa từ "bởi vì" sang "mặc dù".

## Đối chiếu trực tiếp

Cùng một ý, ba cách viết:

> **Obwohl** es regnet, gehe ich spazieren.
>
> Es regnet. **Trotzdem** gehe ich spazieren.
>
> **Trotz** des Regens gehe ich spazieren.

## `obwohl` đứng trước cái gì?

`obwohl` đứng trước **điều bất lợi**, mệnh đề chính là **điều vẫn xảy ra**:

> **Obwohl** ich müde bin, lerne ich weiter.
> (Mặc dù mệt — vẫn học tiếp.)

Đảo ngược là sai nghĩa: *Obwohl ich weiter lerne, bin ich müde* nghĩa hoàn toàn khác.

## Phân biệt với `weil`

Hai liên từ này **ngược nhau hoàn toàn**, nhưng cùng đẩy động từ xuống cuối nên dễ lẫn khi làm bài
nhanh:

> Ich bleibe zu Hause, **weil** es regnet. *(mưa → ở nhà: hợp lý)*
> Ich gehe spazieren, **obwohl** es regnet. *(mưa → vẫn đi: nghịch lý)*

Đọc kỹ nghĩa hai vế trước khi chọn.
$md$),

('b1-genitiv', 'Genitiv', 'Cách 2 ở trình B1', 'B1', NULL, 8,
'Ôn lại biến cách Genitiv và mở rộng sang bốn giới từ đi kèm.', $md$
## Nhắc lại bảng

| Cách | Đực | Cái | Trung | Số nhiều |
| --- | --- | --- | --- | --- |
| **Genitiv** | **des** + **-(e)s** | **der** | **des** + **-(e)s** | **der** |

Giống đực và trung phải đổi cả đuôi danh từ: từ một âm tiết thêm **-es** (des Mann**es**), từ nhiều
âm tiết thêm **-s** (des Lehrer**s**).

## Genitiv dùng làm gì ở B1

**1. Sở hữu** — cách dùng cơ bản đã học ở A2:
> das Auto **des** Nachbarn · die Meinung **der** Leute

**2. Sau giới từ** — phần mới của B1:

| Giới từ | Nghĩa | Ví dụ |
| --- | --- | --- |
| **wegen** | vì, do | **wegen des** schlechten Wetters |
| **trotz** | mặc dù | **trotz der** Probleme |
| **während** | trong suốt | **während der** Ferien |
| **statt / anstatt** | thay vì | **statt eines** Autos |
| **innerhalb** | trong vòng | **innerhalb einer** Woche |
| **außerhalb** | ngoài phạm vi | **außerhalb der** Stadt |

**3. Trong cụm cố định của văn viết:**
> eines Tages (một ngày nọ) · meines Erachtens (theo tôi)

## Văn nói thì thay bằng gì

Trong hội thoại, người Đức chuộng hai lối thay thế:

> das Auto **des Nachbarn** → das Auto **vom Nachbarn** *(von + Dativ)*
> **wegen des** Regens → **wegen dem** Regen *(Dativ — không chuẩn nhưng rất phổ biến)*

Bài thi viết thì luôn dùng Genitiv. Nghe người bản xứ nói Dativ thì đừng tưởng mình học sai.

## Tên riêng

> **Annas** Buch · **Toms** Auto · Goethe**s** Werke

Thêm `-s` trực tiếp, không dấu nháy. Tên kết thúc bằng s/ß/x/z thì dùng dấu nháy đơn: `Hans'` Buch.
$md$),

('b1-praeposition-genitiv', 'Präpositionen mit Genitiv', 'Giới từ đi với cách 2', 'B1', NULL, 9,
'wegen, trotz, während, statt, innerhalb, außerhalb — nhóm giới từ của văn viết.', $md$
## Danh sách cần thuộc

| Giới từ | Nghĩa | Ví dụ |
| --- | --- | --- |
| **wegen** | vì, do | **Wegen des** Streiks fahren keine Züge. |
| **trotz** | mặc dù | **Trotz des** Regens spielen wir. |
| **während** | trong suốt | **Während der** Sitzung bitte nicht stören. |
| **statt / anstatt** | thay vì | **Statt des** Busses nehme ich das Rad. |
| **innerhalb** | trong vòng | **Innerhalb einer** Stunde bin ich da. |
| **außerhalb** | ngoài | **Außerhalb der** Öffnungszeiten geschlossen. |
| **aufgrund** | dựa trên, do | **Aufgrund der** Daten entscheiden wir. |
| **anlässlich** | nhân dịp | **Anlässlich des** Jubiläums gibt es ein Fest. |

## Vì sao đáng học dù văn nói ít dùng

Những giới từ này xuất hiện dày đặc ở:
- **Thông báo hành chính**: *Wegen Umbau geschlossen*
- **Bản tin, báo chí**: *Aufgrund der Wetterlage...*
- **Hợp đồng, quy định**: *Innerhalb von 14 Tagen...*

Tức là đúng những văn bản bạn phải đọc khi sống ở Đức — và đúng phần Lesen của đề thi B1.

## Ba điểm kỹ thuật

**Danh từ trần không mạo từ thì dùng Dativ:**
> wegen **Umbau** geschlossen · trotz **Regen**

**`innerhalb` + `von` + Dativ** cũng đúng và phổ biến hơn khi nói:
> innerhalb **einer Woche** = innerhalb **von einer Woche**

**`während` vừa là giới từ vừa là liên từ** — phân biệt bằng cái theo sau:
> **Während der** Pause... *(giới từ + danh từ)*
> **Während** ich arbeite,... *(liên từ + mệnh đề)*
$md$),

('b1-nebensatz-final', 'Nebensätze - final / Sätze mit "um ... zu"', 'Mệnh đề chỉ mục đích', 'B1', NULL, 10,
'damit và um ... zu — cùng nghĩa "để mà", chọn cái nào tuỳ chủ ngữ hai vế có trùng nhau không.', $md$
## Quy tắc quyết định

| Chủ ngữ hai vế | Dùng | Ví dụ |
| --- | --- | --- |
| **Giống nhau** | `um ... zu` + nguyên thể | Ich lerne Deutsch, **um** in Deutschland zu **arbeiten**. |
| **Khác nhau** | `damit` + mệnh đề | Ich erkläre es, **damit** du es **verstehst**. |

Khi chủ ngữ giống nhau thì `damit` vẫn đúng ngữ pháp, nhưng `um ... zu` gọn và tự nhiên hơn nhiều —
người Đức gần như luôn chọn nó.

## Cấu trúc `um ... zu`

`um` đứng đầu mệnh đề, `zu` + **nguyên thể** đứng cuối:

> Ich fahre nach Berlin, **um** meine Familie **zu besuchen**.

Không có chủ ngữ riêng — nó mượn chủ ngữ của mệnh đề chính. Đó là lý do hai vế phải cùng chủ ngữ.

**Động từ tách được thì `zu` chui vào giữa:**
> ..., um früh **aufzustehen**. *(aufstehen → aufzustehen)*
> ..., um **einzukaufen**. *(einkaufen → einzukaufen)*

## Cấu trúc `damit`

Là mệnh đề đầy đủ, có chủ ngữ riêng, **động từ xuống cuối**:

> Ich spreche langsam, **damit** alle mich **verstehen**.
> Die Mutter arbeitet viel, **damit** ihre Kinder studieren **können**.

## So sánh trực tiếp

> Ich lerne, **um** die Prüfung **zu bestehen**. *(tôi học — tôi thi: cùng chủ ngữ)*
> Ich helfe dir, **damit** **du** die Prüfung bestehst. *(tôi giúp — bạn thi: khác chủ ngữ)*

## Hai cấu trúc `zu` cùng họ

| Cấu trúc | Nghĩa | Ví dụ |
| --- | --- | --- |
| **ohne ... zu** | mà không | Er ging, **ohne** etwas **zu sagen**. |
| **statt ... zu** | thay vì | **Statt zu** arbeiten, schläft er. |

Cả hai cũng đòi hai vế cùng chủ ngữ, y như `um ... zu`.
$md$),

('b1-adjektive', 'Adjektive', 'Tính từ ở trình B1', 'B1', NULL, 11,
'So sánh có biến cách, phân từ dùng làm tính từ, và tính từ đi với giới từ cố định.', $md$
## 1. So sánh hơn/nhất khi đứng trước danh từ

Ở A2 bạn học `schneller`, `am schnellsten` đứng sau động từ. Khi đứng **trước danh từ**, chúng phải
biến cách như mọi tính từ khác:

| Dạng | Ví dụ |
| --- | --- |
| Nguyên cấp | das **schnelle** Auto |
| So sánh hơn | das **schnellere** Auto |
| So sánh nhất | das **schnellste** Auto |

> Ich kaufe **den billigeren** Laptop. *(đực, Akkusativ, sau mạo từ xác định → -en)*

Để ý: đuôi so sánh (`-er`) và đuôi biến cách chồng lên nhau thành `-ere`, `-eren`...

## 2. Phân từ dùng làm tính từ

Đây là phần đặc trưng B1 — biến động từ thành tính từ:

| Loại | Cách tạo | Nghĩa | Ví dụ |
| --- | --- | --- | --- |
| **Partizip I** | nguyên thể + **-d** | đang làm (chủ động) | das **schlafende** Kind (đứa bé đang ngủ) |
| **Partizip II** | như Perfekt | đã bị/được (bị động) | das **gekochte** Essen (món đã nấu) |

> der **lachende** Mann (người đàn ông đang cười)
> das **geschriebene** Buch (quyển sách đã được viết)

Cả hai vẫn phải thêm đuôi biến cách bình thường.

## 3. Tính từ đi với giới từ cố định

| Cụm | Nghĩa | Ví dụ |
| --- | --- | --- |
| stolz **auf** + Akk | tự hào về | Ich bin stolz **auf** dich. |
| zufrieden **mit** + Dativ | hài lòng với | Er ist zufrieden **mit** der Arbeit. |
| interessiert **an** + Dativ | quan tâm tới | Sie ist interessiert **an** Musik. |
| abhängig **von** + Dativ | phụ thuộc vào | Das ist abhängig **vom** Wetter. |
| verantwortlich **für** + Akk | chịu trách nhiệm | Wer ist verantwortlich **für** das Projekt? |
| bereit **zu** + Dativ | sẵn sàng cho | Ich bin bereit **zum** Start. |

Giới từ đi kèm **không suy ra được từ nghĩa** — phải học thuộc cả cụm, giống nhóm động từ +
giới từ.
$md$),

('b1-passiv', 'Passiv', 'Thể bị động', 'B1', NULL, 12,
'werden + Partizip II. Dùng khi hành động quan trọng hơn người thực hiện.', $md$
## Chủ động và bị động

> **Aktiv:** Der Mechaniker *repariert* das Auto. (Người thợ sửa xe.)
> **Passiv:** Das Auto **wird** *repariert*. (Xe được sửa.)

Ở thể bị động, **đối tượng nhận hành động trở thành chủ ngữ**, còn người thực hiện thường bị lược
đi vì không quan trọng.

## Cấu trúc: `werden` (chia) + Partizip II (cuối câu)

| Thì | Cấu trúc | Ví dụ |
| --- | --- | --- |
| **Präsens** | werden + P II | Das Haus **wird** gebaut. |
| **Präteritum** | wurde + P II | Das Haus **wurde** gebaut. |
| **Perfekt** | ist + P II + **worden** | Das Haus **ist** gebaut **worden**. |
| **Với modal** | modal + P II + werden | Das Haus **muss** gebaut **werden**. |

> Chú ý dạng Perfekt: dùng **worden** chứ không phải *geworden*. Đây là dấu hiệu riêng của bị động.

## Nêu người thực hiện: `von` hay `durch`

| Giới từ | Dùng cho | Ví dụ |
| --- | --- | --- |
| **von** + Dativ | người, tổ chức | Das Auto wird **von dem** Mechaniker repariert. |
| **durch** + Akk | phương tiện, nguyên nhân | Die Stadt wurde **durch das** Erdbeben zerstört. |

Nhưng phần lớn câu bị động **không nêu ai làm cả** — đó chính là lý do dùng bị động.

## Khi nào gặp thể bị động

Đây không phải ngữ pháp "để cho đẹp" — nó xuất hiện khắp nơi trong đời sống ở Đức:

- **Biển báo, thông báo**: *Hier **wird** gebaut.* · *Das Formular **muss** ausgefüllt **werden**.*
- **Quy trình hành chính**: *Ihr Antrag **wird** bearbeitet.*
- **Hướng dẫn sử dụng**: *Die Maschine **wird** eingeschaltet.*

## Thay thế bị động khi nói

Văn nói hay dùng `man` cho gọn:

> Das Formular **wird** ausgefüllt. → **Man** füllt das Formular aus.

Hai câu cùng nghĩa, nhưng `man` nghe đời thường hơn.
$md$),

('b1-konjunktiv-2-werden', 'Konjunktiv II "werden"', 'Thức giả định ở trình B1', 'B1', NULL, 13,
'würde + nguyên thể cho mọi động từ, và câu điều kiện không có thật ở quá khứ.', $md$
## `würde` — công thức dùng được cho mọi động từ

Ở A2 bạn đã biết `wäre`, `hätte`, `könnte`. Với các động từ còn lại, cứ ghép:

**würde (chia) + động từ nguyên thể (cuối câu)**

| Ngôi | würde |
| --- | --- |
| ich / er / sie / es | würde |
| du | würdest |
| wir / sie / Sie | würden |
| ihr | würdet |

> Ich **würde** gern nach Deutschland **fahren**.
> **Würdest** du mir **helfen**?

## Khi nào KHÔNG dùng würde

Bốn nhóm này có dạng riêng, dùng `würde` với chúng nghe vụng:

| Động từ | Dạng riêng |
| --- | --- |
| sein | wäre |
| haben | hätte |
| Modal | könnte, müsste, dürfte, sollte, wollte |
| werden (chính nó) | würde |

> ✓ Wenn ich Zeit **hätte**... · ✗ *Wenn ich Zeit haben würde...*

## Câu điều kiện không có thật

**Ở hiện tại** — cả hai vế đều Konjunktiv II:
> **Wenn** ich Zeit **hätte**, **würde** ich kommen.
> (Nếu có thời gian thì tôi đã đến — nhưng không có.)

**Ở quá khứ** — phần mới của B1, dùng `hätte/wäre` + Partizip II:
> **Wenn** ich Zeit **gehabt hätte**, **wäre** ich **gekommen**.
> (Nếu hồi đó có thời gian thì tôi đã đến — nhưng đã không.)

Để ý: quá khứ giả định **không có `würde`**, mà là `hätte`/`wäre` + Partizip II ở cả hai vế.

## Ba cách dùng hằng ngày

**Lịch sự** — dùng nhiều nhất:
> **Könnten** Sie mir helfen? · Ich **hätte** gern einen Kaffee.

**Ước muốn** — thêm `doch nur`:
> Wenn ich **doch nur** mehr Zeit **hätte**!

**Khuyên nhủ** — dùng `an deiner Stelle`:
> **An deiner Stelle würde** ich mit dem Chef **sprechen**.
$md$),

('b1-verben-praepositionalobjekt', 'Verben mit Präpositionalobjekt', 'Động từ đi với giới từ — mở rộng', 'B1', NULL, 14,
'Danh sách đầy đủ hơn A2, kèm cách đặt câu hỏi và thay thế bằng da(r)-.', $md$
## Vì sao phải học thuộc cả cụm

Giới từ đi kèm động từ **không suy ra được từ nghĩa**. `warten` nghĩa là "chờ" nhưng đi với `auf`;
`denken` nghĩa là "nghĩ" nhưng đi với `an`. Không có logic — chỉ có thuộc lòng.

## Nhóm đi với Akkusativ

| Cụm | Nghĩa |
| --- | --- |
| warten **auf** | chờ |
| sich freuen **auf** | mong chờ (việc sắp tới) |
| sich freuen **über** | vui vì (việc đã có) |
| sich interessieren **für** | quan tâm tới |
| sich ärgern **über** | bực mình vì |
| denken **an** | nghĩ tới |
| sich erinnern **an** | nhớ tới |
| sich gewöhnen **an** | quen với |
| sprechen **über** | nói về |
| sich bewerben **um** | nộp đơn xin |
| sich kümmern **um** | lo liệu, chăm sóc |

## Nhóm đi với Dativ

| Cụm | Nghĩa |
| --- | --- |
| sprechen **mit** | nói chuyện với |
| anfangen **mit** | bắt đầu bằng |
| sich treffen **mit** | gặp gỡ |
| helfen **bei** | giúp trong việc |
| Angst haben **vor** | sợ |
| teilnehmen **an** | tham gia |
| leiden **unter** | chịu đựng |
| gehören **zu** | thuộc về |

## Đặt câu hỏi

| Hỏi về | Cách | Ví dụ |
| --- | --- | --- |
| **Vật/việc** | wo(r) + giới từ | **Worauf** wartest du? |
| **Người** | giới từ + wen/wem | **Auf wen** wartest du? |

Chèn `-r-` khi giới từ bắt đầu bằng nguyên âm: **wor**auf, **wor**über, **wor**an — nhưng
**wo**für, **wo**mit (không cần).

## Thay thế bằng da(r)-

Khi nhắc lại vật/việc đã nói:

> Wartest du **auf den Bus**? — Ja, ich warte **darauf**.
> Denkst du **an die Prüfung**? — Ja, ich denke **daran**.

Nhưng với **người** thì dùng đại từ thường, không dùng da(r)-:
> Wartest du **auf Anna**? — Ja, ich warte **auf sie**. *(không phải darauf)*
$md$),

('b1-pronominaladverbien', 'Pronominaladverbien', 'Trạng từ đại từ da(r)- và wo(r)-', 'B1', NULL, 15,
'darauf, darüber, worauf, worüber — thay cho cụm giới từ + vật, và mở đầu mệnh đề dass.', $md$
## Hai họ từ

| Họ | Dùng để | Ví dụ |
| --- | --- | --- |
| **da(r)-** + giới từ | nhắc lại vật/việc đã nói | darauf, damit, davon, daran, darüber |
| **wo(r)-** + giới từ | hỏi về vật/việc | worauf, womit, wovon, woran, worüber |

## Quy tắc chèn `-r-`

Giới từ bắt đầu bằng **nguyên âm** thì chèn `-r-` cho dễ đọc:

| Giới từ | da- | wo- |
| --- | --- | --- |
| auf | da**r**auf | wo**r**auf |
| an | da**r**an | wo**r**an |
| über | da**r**über | wo**r**über |
| in | da**r**in | wo**r**in |
| mit | damit | womit |
| von | davon | wovon |
| für | dafür | wofür |
| zu | dazu | wozu |

## Quy tắc quan trọng nhất: chỉ dùng cho VẬT

| Đối tượng | Cách nói |
| --- | --- |
| **Vật / việc** | Ich warte **darauf**. · **Worauf** wartest du? |
| **Người** | Ich warte **auf ihn**. · **Auf wen** wartest du? |

Dùng `darauf` cho người là lỗi sai rõ, và ngược lại.

## Công dụng thứ hai: mở đường cho mệnh đề

Đây là chỗ B1 khác A2 — `da(r)-` báo trước rằng phía sau có cả một mệnh đề:

> Ich freue mich **darauf**, **dass** du kommst.
> Ich denke **daran**, **dass** wir morgen fahren.
> Es hängt **davon** ab, **ob** es regnet.

Hoặc đi với `zu` + nguyên thể:
> Ich freue mich **darauf**, dich **zu sehen**.

Không thể bỏ `darauf` đi — *Ich freue mich, dass du kommst* nghe thiếu, vì `sich freuen` đòi giới
từ `auf`.
$md$),

('b1-brauchen-lassen', 'brauchen / nicht brauchen / lassen', 'brauchen, nicht brauchen zu, lassen', 'B1', NULL, 16,
'Ba động từ hành xử gần giống động từ khiếm khuyết nhưng có quy tắc riêng.', $md$
## `nicht brauchen zu` = không cần phải

Dạng phủ định của `müssen`, nghe nhẹ hơn:

> Du **musst** nicht kommen. = Du **brauchst** nicht **zu** kommen.
> (Bạn không nhất thiết phải đến.)

Ba điểm:
- **Chỉ dùng ở dạng phủ định.** Khẳng định thì dùng `müssen`.
- Đi kèm **`zu`** trước nguyên thể (khác hẳn modal).
- Thường đi với `nicht`, `nur`, `kein`.

> Du brauchst **nur** anzurufen. (Bạn chỉ cần gọi điện thôi.)
> Ich brauche **keine** Hilfe. (danh từ → không cần zu)

> Khi nói, nhiều người Đức bỏ luôn `zu`: *Du brauchst nicht kommen*. Bài thi thì cứ giữ `zu`.

## `lassen` — ba nghĩa

| Nghĩa | Ví dụ |
| --- | --- |
| **để ai làm gì** (nhờ, thuê) | Ich **lasse** mein Auto **reparieren**. (Tôi mang xe đi sửa.) |
| **cho phép** | Meine Eltern **lassen** mich nicht **ausgehen**. |
| **để lại, bỏ quên** | Ich habe mein Handy zu Hause **gelassen**. |

Với hai nghĩa đầu, `lassen` + nguyên thể **không có `zu`**, giống modal:

> Ich **lasse** die Haare **schneiden**. (Tôi đi cắt tóc — thợ cắt, không phải tôi tự cắt.)

Đây là cấu trúc rất Đức mà tiếng Việt không có dạng tương đương gọn: "lassen + động từ" nghĩa là
*nhờ/thuê người khác làm*, chứ không phải tự mình làm.

## So sánh nhanh

| Câu | Ai làm việc đó? |
| --- | --- |
| Ich **repariere** mein Auto. | tôi tự sửa |
| Ich **lasse** mein Auto **reparieren**. | thợ sửa, tôi mang xe tới |

## Perfekt của `lassen`

Khi đi với động từ khác, Perfekt dùng **lassen** chứ không phải *gelassen*:

> Ich habe mein Auto reparieren **lassen**. ✓
> Ich habe mein Handy zu Hause **gelassen**. ✓ *(nghĩa "để lại" thì dùng gelassen)*
$md$),

('b1-modalverben', 'Modalverben', 'Động từ khiếm khuyết — nghĩa phỏng đoán', 'B1', NULL, 17,
'Ngoài nghĩa cơ bản đã học ở A1, modal còn dùng để phỏng đoán và thuật lại lời người khác.', $md$
## Nghĩa chủ quan — phần mới của B1

Cùng một động từ modal, nhưng dùng để **đánh giá mức độ chắc chắn** thay vì nói về khả năng:

| Động từ | Nghĩa khách quan (A1) | Nghĩa chủ quan (B1) |
| --- | --- | --- |
| **müssen** | phải | chắc chắn là |
| **können** | có thể làm | có khả năng |
| **dürfen** (dürfte) | được phép | có lẽ |
| **sollen** | nên | nghe nói là |
| **wollen** | muốn | tự nhận là |

## Ví dụ đối chiếu

> Er **muss** arbeiten. *(anh ấy phải làm việc)*
> Er **muss** krank sein. *(chắc chắn anh ấy ốm — mình suy ra)*

> Das **kann** stimmen. (điều đó có thể đúng)
> Das **dürfte** stimmen. (điều đó có lẽ đúng — dè dặt hơn)

## `sollen` thuật lại lời người khác

Rất hay gặp trong báo chí và chuyện phiếm:

> Er **soll** sehr reich sein. (Nghe nói anh ta rất giàu.)
> Das Restaurant **soll** gut sein. (Nghe bảo nhà hàng đó ngon.)

Người nói **không tự khẳng định**, chỉ thuật lại. Tiếng Việt diễn đạt bằng "nghe nói", "người ta bảo".

> Phân biệt với `wollen`: *Er **will** reich sein* = anh ta **tự nhận** mình giàu (hàm ý nghi ngờ).

## Thang độ chắc chắn

Xếp từ chắc nhất xuống:

| Mức | Cách nói |
| --- | --- |
| 100% | Er **ist** krank. |
| ~95% | Er **muss** krank sein. |
| ~75% | Er **dürfte** krank sein. |
| ~50% | Er **kann** krank sein. |
| nghe nói | Er **soll** krank sein. |

## Modal ở quá khứ với nghĩa chủ quan

Dùng modal + Partizip II + `haben/sein`:

> Er **muss** krank **gewesen sein**. (Chắc chắn hồi đó anh ấy ốm.)
> Sie **soll** in Berlin **gewohnt haben**. (Nghe nói cô ấy từng sống ở Berlin.)
$md$),

('b1-infinitivkonstruktionen', 'Infinitivkonstruktionen', 'Cấu trúc nguyên thể với zu', 'B1', NULL, 18,
'Khi nào cần zu, khi nào không, và vị trí của zu với động từ tách được.', $md$
## Khi nào dùng `zu` + nguyên thể

Sau nhiều động từ, tính từ và danh từ, động từ thứ hai phải có `zu` và đứng **cuối câu**:

> Ich habe vergessen, dich **anzurufen**.
> Es ist wichtig, jeden Tag **zu lernen**.

## Nhóm đòi `zu`

| Loại | Ví dụ |
| --- | --- |
| Động từ | vergessen, versuchen, anfangen, aufhören, hoffen, versprechen, beschließen, vorhaben |
| Tính từ | Es ist **wichtig/schwer/leicht/möglich/schön** ... zu ... |
| Danh từ | Ich habe **Zeit/Lust/Angst** ... zu ... |

> Ich habe **keine Lust**, heute **auszugehen**.
> Es ist **schwer**, Deutsch **zu lernen**.

## Nhóm KHÔNG dùng `zu`

| Loại | Ví dụ |
| --- | --- |
| Động từ khiếm khuyết | Ich **muss** gehen. |
| lassen | Ich **lasse** das Auto reparieren. |
| Động từ chuyển động | Ich **gehe** einkaufen. |
| sehen, hören | Ich **höre** ihn singen. |
| bleiben, helfen (khi nói) | Er **bleibt** stehen. |

## Động từ tách được: `zu` chui vào giữa

Đây là chi tiết dễ sai nhất:

| Nguyên thể | Với zu |
| --- | --- |
| aufstehen | auf**zu**stehen |
| einkaufen | ein**zu**kaufen |
| anrufen | an**zu**rufen |
| mitkommen | mit**zu**kommen |

Động từ không tách thì `zu` đứng rời phía trước: **zu** verstehen, **zu** besuchen.

## Ba cấu trúc cùng họ

| Cấu trúc | Nghĩa | Ví dụ |
| --- | --- | --- |
| **um ... zu** | để mà | Ich lerne, **um** die Prüfung **zu bestehen**. |
| **ohne ... zu** | mà không | Er ging, **ohne** etwas **zu sagen**. |
| **statt ... zu** | thay vì | **Statt zu** arbeiten, schläft er. |

Cả ba đều đòi hai vế **cùng chủ ngữ**. Khác chủ ngữ thì phải chuyển sang mệnh đề đầy đủ
(`damit`, `ohne dass`, `statt dass`).
$md$)

ON CONFLICT (slug) DO NOTHING;
