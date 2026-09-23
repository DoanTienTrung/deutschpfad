-- Nội dung bảng tra cứu nhanh cho Phase 5 Đợt 3.
-- Đây là dữ kiện ngôn ngữ thuần (bảng chia động từ, biến cách, giới từ đi với cách nào) — không
-- sao chép diễn đạt của nguồn nào, nên seed thẳng bằng migration thay vì bắt admin gõ lại tay ở
-- mỗi lần triển khai. Dùng dollar-quoting ($md$) để khỏi phải escape dấu nháy trong nội dung.

INSERT INTO grammar_reference_tables (slug, title_vi, category, level, order_index, content_md) VALUES

('artikel-bestimmt', 'Mạo từ xác định (der/die/das) theo 4 cách', 'Mạo từ', 'A1', 1, $md$
Bảng cần thuộc lòng trước tiên — gần như mọi câu tiếng Đức đều dùng tới.

| Cách | Giống đực | Giống cái | Giống trung | Số nhiều |
| --- | --- | --- | --- | --- |
| **Nominativ** (cách 1 — chủ ngữ) | der | die | das | die |
| **Akkusativ** (cách 4 — tân ngữ trực tiếp) | **den** | die | das | die |
| **Dativ** (cách 3 — tân ngữ gián tiếp) | **dem** | **der** | **dem** | **den** + danh từ thêm **-n** |
| **Genitiv** (cách 2 — sở hữu) | **des** + **-(e)s** | **der** | **des** + **-(e)s** | **der** |

**Mẹo nhớ:** chỉ giống đực đổi ở Akkusativ (`der` → `den`). Ba giống còn lại giữ nguyên như
Nominativ. Đây là lỗi bị trừ điểm nhiều nhất ở trình A1.

*Ví dụ:* Der Mann liest. → Ich sehe **den** Mann. → Ich helfe **dem** Mann.
$md$),

('artikel-unbestimmt', 'Mạo từ không xác định (ein/eine) + phủ định kein', 'Mạo từ', 'A1', 2, $md$
`ein` dùng khi nhắc tới lần đầu hoặc chưa xác định. `kein` là dạng phủ định, biến cách y hệt `ein`.

| Cách | Giống đực | Giống cái | Giống trung | Số nhiều (chỉ `kein`) |
| --- | --- | --- | --- | --- |
| **Nominativ** | ein | eine | ein | keine |
| **Akkusativ** | **einen** | eine | ein | keine |
| **Dativ** | **einem** | **einer** | **einem** | **keinen** |
| **Genitiv** | **eines** | **einer** | **eines** | **keiner** |

**Lưu ý:** `ein` không có số nhiều (một cái thì không thể nhiều), nhưng `kein` thì có.

**Mạo từ sở hữu** (`mein`, `dein`, `sein`, `ihr`, `unser`, `euer`, `Ihr`) biến cách **giống hệt
bảng trên**: mein → meinen → meinem → meines.
$md$),

('personalpronomen', 'Đại từ nhân xưng theo 4 cách', 'Đại từ', 'A1', 1, $md$
| Nominativ | Akkusativ | Dativ | Nghĩa |
| --- | --- | --- | --- |
| ich | mich | mir | tôi |
| du | dich | dir | bạn (thân mật) |
| er | ihn | ihm | anh ấy / nó (giống đực) |
| sie | sie | ihr | cô ấy / nó (giống cái) |
| es | es | ihm | nó (giống trung) |
| wir | uns | uns | chúng tôi |
| ihr | euch | euch | các bạn |
| sie | sie | ihnen | họ |
| **Sie** | **Sie** | **Ihnen** | ông/bà (lịch sự, luôn viết hoa) |

**Ba chữ `sie` phân biệt bằng động từ:** `sie ist` (cô ấy) · `sie sind` (họ) · `Sie sind` (ông/bà,
viết hoa cả giữa câu).
$md$),

('verb-praesens', 'Chia động từ ở thì hiện tại (Präsens)', 'Động từ', 'A1', 1, $md$
Bỏ đuôi `-en` lấy thân từ, rồi ghép đuôi:

| Ngôi | Đuôi | `lernen` | `arbeiten` (thân kết thúc -t) | `heißen` (thân kết thúc âm xuýt) |
| --- | --- | --- | --- | --- |
| ich | -e | lerne | arbeite | heiße |
| du | -st | lernst | **arbeitest** | **heißt** |
| er/sie/es | -t | lernt | **arbeitet** | heißt |
| wir | -en | lernen | arbeiten | heißen |
| ihr | -t | lernt | **arbeitet** | heißt |
| sie/Sie | -en | lernen | arbeiten | heißen |

**Hai ngoại lệ chính tả:**
- Thân từ kết thúc bằng **-t / -d** (hoặc phụ âm + m/n): chèn thêm **-e-** → `du arbeitest`,
  `du redest`, `du öffnest`
- Thân từ kết thúc bằng **-s / -ß / -x / -z**: ngôi `du` chỉ thêm **-t** → `du heißt`, `du tanzt`

## Ba động từ bất quy tắc phải thuộc lòng

| Ngôi | sein (là, thì, ở) | haben (có) | werden (trở thành) |
| --- | --- | --- | --- |
| ich | bin | habe | werde |
| du | bist | **hast** | **wirst** |
| er/sie/es | ist | **hat** | **wird** |
| wir | sind | haben | werden |
| ihr | seid | habt | werdet |
| sie/Sie | sind | haben | werden |
$md$),

('verb-starke-praesens', 'Động từ mạnh đổi nguyên âm ở ngôi du / er', 'Động từ', 'A2', 2, $md$
Động từ mạnh chỉ đổi nguyên âm thân từ ở **hai ngôi `du` và `er/sie/es`** — các ngôi khác vẫn
chia bình thường.

| Kiểu đổi | Nguyên thể | du | er/sie/es |
| --- | --- | --- | --- |
| a → ä | fahren | fährst | fährt |
| a → ä | schlafen | schläfst | schläft |
| e → i | sprechen | sprichst | spricht |
| e → i | essen | isst | isst |
| e → i | geben | gibst | gibt |
| e → ie | sehen | siehst | sieht |
| e → ie | lesen | liest | liest |
| au → äu | laufen | läufst | läuft |
| o → ö | stoßen | stößt | stößt |

**Mẹo:** nếu đã thuộc `du` thì `er` chỉ việc đổi `-st` thành `-t`.
$md$),

('verb-perfekt', 'Thì quá khứ Perfekt — haben hay sein?', 'Động từ', 'A2', 3, $md$
Cấu trúc: **haben/sein (chia) + Partizip II (cuối câu)**

> Ich **habe** gestern Deutsch **gelernt**. — Er **ist** nach Berlin **gefahren**.

## Chọn haben hay sein?

| Dùng **sein** khi | Dùng **haben** cho phần còn lại |
| --- | --- |
| Động từ chỉ **sự di chuyển** (gehen, fahren, fliegen, kommen, laufen) | Hầu hết động từ khác |
| Động từ chỉ **thay đổi trạng thái** (aufstehen, einschlafen, sterben, werden) | Mọi động từ có tân ngữ trực tiếp |
| Ba ngoại lệ: **sein, bleiben, passieren** | Động từ phản thân (sich waschen...) |

## Cách tạo Partizip II

| Loại | Quy tắc | Ví dụ |
| --- | --- | --- |
| Động từ yếu | **ge-** + thân + **-t** | machen → **ge**mach**t** |
| Động từ mạnh | **ge-** + thân (có thể đổi nguyên âm) + **-en** | sprechen → **ge**sproch**en** |
| Tách được | tiền tố + **ge** + phần còn lại | aufstehen → auf**ge**standen |
| Không tách được (be-, ent-, er-, ge-, ver-, zer-) | **không có ge-** | besuchen → besucht |
| Kết thúc -ieren | **không có ge-** | studieren → studiert |
$md$),

('praeposition-akkusativ', 'Giới từ luôn đi với Akkusativ', 'Giới từ', 'A1', 1, $md$
| Giới từ | Nghĩa | Ví dụ |
| --- | --- | --- |
| **durch** | xuyên qua | Wir gehen durch **den** Park. |
| **für** | cho, dành cho | Das ist für **den** Chef. |
| **gegen** | chống lại, khoảng (giờ) | Ich bin gegen **die** Idee. |
| **ohne** | không có | Ich komme ohne **meinen** Bruder. |
| **um** | quanh, vào lúc | Wir sitzen um **den** Tisch. |
| **bis** | cho đến | Der Zug fährt bis **den** nächsten Halt. |
| **entlang** | dọc theo (đứng SAU danh từ) | Wir gehen **die** Straße entlang. |

**Mẹo nhớ:** ghép thành chuỗi **DOG FUB** — *durch, ohne, gegen, für, um, bis*.
$md$),

('praeposition-dativ', 'Giới từ luôn đi với Dativ', 'Giới từ', 'A1', 2, $md$
| Giới từ | Nghĩa | Ví dụ |
| --- | --- | --- |
| **aus** | từ (bên trong ra), làm bằng | Ich komme aus **dem** Haus. |
| **bei** | ở chỗ, tại (nơi làm việc) | Er arbeitet bei **der** Firma. |
| **mit** | với, bằng (phương tiện) | Ich fahre mit **dem** Bus. |
| **nach** | sau, đi tới (địa danh) | Nach **dem** Essen gehe ich. |
| **seit** | từ (mốc thời gian tới nay) | Seit **einem** Jahr lerne ich Deutsch. |
| **von** | của, từ | Das ist das Auto von **meinem** Vater. |
| **zu** | đến (người/nơi cụ thể) | Ich gehe zu **dem** Arzt. |
| **gegenüber** | đối diện | Gegenüber **dem** Bahnhof. |

**Dạng rút gọn hay gặp:** `zu dem` → **zum** · `zu der` → **zur** · `bei dem` → **beim** ·
`von dem` → **vom**
$md$),

('wechselpraeposition', 'Giới từ 2 cách (Wechselpräpositionen)', 'Giới từ', 'A2', 3, $md$
Chín giới từ này đi với **Akkusativ hoặc Dativ** tuỳ ý nghĩa của câu:

| Câu hỏi | Cách dùng | Ý nghĩa |
| --- | --- | --- |
| **Wohin?** (đi đâu) | **Akkusativ** | có sự di chuyển tới đích |
| **Wo?** (ở đâu) | **Dativ** | đứng yên một chỗ |

| Giới từ | Nghĩa |
| --- | --- |
| an | sát cạnh, trên (bề mặt dọc) |
| auf | trên (bề mặt ngang) |
| hinter | phía sau |
| in | trong |
| neben | bên cạnh |
| über | phía trên |
| unter | phía dưới |
| vor | phía trước |
| zwischen | ở giữa |

**So sánh trực tiếp:**

> Ich gehe **in die** Schule. *(Wohin? → Akkusativ, đang đi tới trường)*
> Ich bin **in der** Schule. *(Wo? → Dativ, đang ở trong trường)*

**Mẹo:** động từ chỉ chuyển động (gehen, fahren, stellen, legen) → Akkusativ. Động từ chỉ đứng yên
(sein, bleiben, stehen, liegen) → Dativ.
$md$),

('adjektiv-deklination', 'Biến cách tính từ đứng trước danh từ', 'Tính từ', 'B1', 1, $md$
Tính từ chỉ đổi đuôi khi **đứng trước danh từ**. Đứng sau động từ thì giữ nguyên
(*Das Auto ist neu.*).

## Sau mạo từ xác định (der/die/das) — đuôi yếu

| Cách | Đực | Cái | Trung | Số nhiều |
| --- | --- | --- | --- | --- |
| Nominativ | der neu**e** | die neu**e** | das neu**e** | die neu**en** |
| Akkusativ | den neu**en** | die neu**e** | das neu**e** | die neu**en** |
| Dativ | dem neu**en** | der neu**en** | dem neu**en** | den neu**en** |
| Genitiv | des neu**en** | der neu**en** | des neu**en** | der neu**en** |

**Mẹo:** chỉ có 5 ô là `-e`, tất cả phần còn lại đều `-en`.

## Sau mạo từ không xác định (ein/kein/mein) — đuôi hỗn hợp

| Cách | Đực | Cái | Trung |
| --- | --- | --- | --- |
| Nominativ | ein neu**er** | eine neu**e** | ein neu**es** |
| Akkusativ | einen neu**en** | eine neu**e** | ein neu**es** |
| Dativ | einem neu**en** | einer neu**en** | einem neu**en** |
| Genitiv | eines neu**en** | einer neu**en** | eines neu**en** |

**Lý do 3 ô khác biệt:** `ein` không cho biết giống, nên tính từ phải gánh phần thông tin đó
(`-er` đực, `-es` trung).
$md$),

('n-deklination', 'n-Deklination — danh từ thêm -n ở mọi cách trừ Nominativ', 'Danh từ', 'B1', 1, $md$
Một nhóm **danh từ giống đực** thêm đuôi **-n / -en** ở tất cả các cách trừ Nominativ số ít.

| Cách | Số ít | Số nhiều |
| --- | --- | --- |
| Nominativ | der Student | die Student**en** |
| Akkusativ | den Student**en** | die Student**en** |
| Dativ | dem Student**en** | den Student**en** |
| Genitiv | des Student**en** | der Student**en** |

## Nhận biết nhóm này

| Dấu hiệu | Ví dụ |
| --- | --- |
| Giống đực kết thúc bằng **-e** | der Junge, der Kunde, der Kollege, der Name |
| Kết thúc **-ent, -ant, -ist, -ent, -oge, -at** | der Student, der Praktikant, der Polizist, der Biologe |
| Chỉ người/động vật giống đực | der Mensch, der Herr, der Nachbar, der Bauer |

**Lỗi hay gặp:** viết *Ich sehe den Student* — đúng phải là *Ich sehe den Student**en***.
$md$),

('satzstruktur', 'Trật tự từ — quy tắc V2 và khung câu', 'Trật tự từ', 'A1', 1, $md$
## Câu kể: động từ chia luôn ở vị trí thứ 2

| Vị trí 1 | Vị trí 2 (động từ) | Phần còn lại |
| --- | --- | --- |
| Ich | lerne | heute Deutsch. |
| Heute | lerne | ich Deutsch. |
| Deutsch | lerne | ich heute. |

Đưa gì lên vị trí 1 cũng được, nhưng động từ **không nhúc nhích** khỏi vị trí 2 — chủ ngữ bị đẩy
ra sau. *Heute **ich lerne** Deutsch* là sai.

## Câu hỏi

| Loại | Vị trí động từ | Ví dụ |
| --- | --- | --- |
| Có/Không | **đầu câu** | **Lernst** du Deutsch? |
| Có từ để hỏi | vị trí 2 | Was **lernst** du? |

Từ để hỏi: `wer` (ai) · `was` (gì) · `wo` (ở đâu) · `wohin` (đi đâu) · `wann` (khi nào) ·
`wie` (thế nào) · `warum` (tại sao) · `wie viel` (bao nhiêu)

## Khung câu (Satzklammer)

Khi có động từ thứ hai, nó bị đẩy xuống **cuối câu**, tạo thành cái khung:

> Ich **will** heute Abend ins Kino **gehen**. *(modal + nguyên thể)*
> Ich **habe** gestern viel **gelernt**. *(Perfekt)*
> Ich **stehe** jeden Tag um 6 Uhr **auf**. *(động từ tách được)*

## Thứ tự bổ ngữ giữa câu: TE-KA-MO-LO

**TE**mporal (khi nào) → **KA**usal (tại sao) → **MO**dal (thế nào) → **LO**kal (ở đâu)

> Ich fahre **heute** (TE) **wegen der Arbeit** (KA) **mit dem Zug** (MO) **nach Berlin** (LO).
$md$),

('nebensatz', 'Mệnh đề phụ — động từ nhảy xuống cuối', 'Trật tự từ', 'A2', 2, $md$
Trong mệnh đề phụ, **động từ chia đứng cuối cùng**.

> Ich bleibe zu Hause, **weil** ich krank **bin**.

## Các liên từ đẩy động từ xuống cuối

| Liên từ | Nghĩa |
| --- | --- |
| **weil** | bởi vì |
| **dass** | rằng |
| **wenn** | khi, nếu |
| **als** | khi (một lần trong quá khứ) |
| **obwohl** | mặc dù |
| **damit** | để mà |
| **bevor / nachdem** | trước khi / sau khi |
| **während** | trong khi |
| **ob** | liệu có |

## Liên từ KHÔNG đổi trật tự từ

`und` · `aber` · `oder` · `denn` · `sondern` — sau các từ này câu vẫn giữ nguyên quy tắc V2.

> Ich bleibe zu Hause, **denn** ich **bin** krank. *(denn: động từ vẫn ở vị trí 2)*
> Ich bleibe zu Hause, **weil** ich krank **bin**. *(weil: động từ xuống cuối)*

**So sánh:** hai câu trên nghĩa y hệt nhau, chỉ khác trật tự từ — đây là cặp hay bị nhầm nhất.
$md$),

('modalverben', 'Động từ khiếm khuyết (Modalverben)', 'Động từ', 'A1', 4, $md$
| Ngôi | können (có thể) | müssen (phải) | wollen (muốn) | dürfen (được phép) | sollen (nên) | mögen (thích) |
| --- | --- | --- | --- | --- | --- | --- |
| ich | kann | muss | will | darf | soll | mag |
| du | kannst | musst | willst | darfst | sollst | magst |
| er/sie/es | kann | muss | will | darf | soll | mag |
| wir | können | müssen | wollen | dürfen | sollen | mögen |
| ihr | könnt | müsst | wollt | dürft | sollt | mögt |
| sie/Sie | können | müssen | wollen | dürfen | sollen | mögen |

**Hai điểm khác mọi động từ khác:**
1. Ngôi `ich` và `er/sie/es` **giống hệt nhau** và **không có đuôi**
2. Số ít đổi nguyên âm, số nhiều trở về như nguyên thể

**Trật tự câu:** modal chia ở vị trí 2, động từ chính về **cuối câu** ở dạng nguyên thể.

> Ich **muss** heute Abend Deutsch **lernen**.

**`möchten`** (muốn — lịch sự hơn `wollen`) là dạng riêng: ich möchte, du möchtest, er möchte,
wir möchten, ihr möchtet, sie möchten.
$md$);
