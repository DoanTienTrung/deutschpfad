-- 16 chủ điểm ngữ pháp A2.
-- Cùng nguyên tắc nguồn với V45: danh sách/thứ tự bám mục lục giáo trình (dữ kiện), lý thuyết
-- viết mới bằng tiếng Việt. A2 không chia Lektion nên group_label để NULL.

INSERT INTO grammar_topics (slug, title_de, title_vi, level, group_label, order_index, summary_vi, theory_md) VALUES

('a2-steigerung', 'Vergleichsformen - Steigerung', 'So sánh hơn và so sánh nhất', 'A2', NULL, 1,
'Tính từ thêm -er để so sánh hơn, am ...-sten để so sánh nhất. Vài từ đổi nguyên âm.', $md$
## Ba bậc so sánh

| Bậc | Cách tạo | Ví dụ với `schnell` |
| --- | --- | --- |
| Nguyên cấp | giữ nguyên | schnell |
| **So sánh hơn** | + **-er** | schnell**er** |
| **So sánh nhất** | **am** + ... + **-sten** | **am** schnell**sten** |

> Das Auto ist schnell. Der Zug ist **schneller**. Das Flugzeug ist **am schnellsten**.

## Câu so sánh

**Bằng nhau — `so ... wie`:**
> Anna ist **so groß wie** Tom. (Anna cao bằng Tom.)

**Hơn kém — `...-er als`:**
> Anna ist **größer als** Tom. (Anna cao hơn Tom.)

> Lỗi hay gặp: dùng `wie` thay cho `als` ở so sánh hơn. Nhớ: **wie = bằng**, **als = hơn**.

## Tính từ đổi nguyên âm

Nhiều tính từ một âm tiết thêm Umlaut khi so sánh:

| Nguyên cấp | So sánh hơn | So sánh nhất |
| --- | --- | --- |
| alt | **ä**lter | am ältesten |
| jung | j**ü**nger | am jüngsten |
| groß | gr**ö**ßer | am größten |
| lang | l**ä**nger | am längsten |
| kurz | k**ü**rzer | am kürzesten |
| warm | w**ä**rmer | am wärmsten |

## Bất quy tắc — phải thuộc lòng

| Nguyên cấp | So sánh hơn | So sánh nhất |
| --- | --- | --- |
| gut | **besser** | am besten |
| viel | **mehr** | am meisten |
| gern | **lieber** | am liebsten |
| hoch | **höher** | am höchsten |
| nah | **näher** | am nächsten |

> Ich trinke **gern** Tee, aber **lieber** Kaffee, und **am liebsten** Wasser.
$md$),

('a2-verben-dativ-akkusativ', 'Verben mit Dativ- und Akkusativobjekt', 'Động từ có hai tân ngữ', 'A2', NULL, 2,
'geben, schenken, zeigen... đi kèm cả người nhận (Dativ) lẫn vật (Akkusativ).', $md$
## Động từ cần hai tân ngữ

Một số động từ đòi cả **người nhận** (Dativ) và **vật** (Akkusativ):

> Ich gebe **dem Kind** *einen Apfel*. (Tôi đưa đứa bé một quả táo.)

| Động từ | Nghĩa |
| --- | --- |
| geben | đưa, cho |
| schenken | tặng |
| zeigen | chỉ, cho xem |
| schicken | gửi |
| erklären | giải thích |
| empfehlen | giới thiệu, khuyên dùng |
| bringen | mang tới |
| kaufen | mua (cho ai) |

## Thứ tự hai tân ngữ — ba quy tắc

**1. Hai danh từ: Dativ trước Akkusativ**
> Ich schenke **meiner Mutter** *Blumen*.

**2. Một đại từ + một danh từ: đại từ luôn đứng trước**
> Ich schenke **ihr** *Blumen*. *(đại từ Dativ trước)*
> Ich schenke **sie** *meiner Mutter*. *(đại từ Akkusativ cũng ra trước)*

**3. Hai đại từ: Akkusativ trước Dativ** — đảo ngược quy tắc 1
> Ich schenke **sie** *ihr*. (Tôi tặng nó cho cô ấy.)

Cách nhớ gọn: **đại từ luôn được ưu tiên ra trước**; khi cả hai cùng là đại từ thì vật đi trước người.

## Động từ chỉ đi với Dativ

Nhóm này chỉ có một tân ngữ và nó ở Dativ — trái với trực giác của người học:

`helfen`, `danken`, `gratulieren`, `antworten`, `gehören`, `gefallen`, `passen`, `schmecken`

> Ich **helfe dir**. (không phải *ich helfe dich*)
> Das Essen **schmeckt mir**. (Món ăn hợp khẩu vị tôi.)
$md$),

('a2-praeteritum-modalverben', 'Präteritum - Modalverben', 'Quá khứ của động từ khiếm khuyết', 'A2', NULL, 3,
'Modal ở quá khứ dùng Präteritum chứ không dùng Perfekt — và mất hết Umlaut.', $md$
## Quy tắc: bỏ Umlaut, thêm `-te`

Động từ khiếm khuyết ở quá khứ **mất hết dấu Umlaut** rồi chia như động từ yếu:

| Nguyên thể | Präteritum (ich) |
| --- | --- |
| können | **konnte** |
| müssen | **musste** |
| wollen | **wollte** |
| dürfen | **durfte** |
| sollen | **sollte** |
| mögen | **mochte** |

Chia đầy đủ (lấy `können` làm mẫu):

| Ngôi | Dạng |
| --- | --- |
| ich | konnte |
| du | konnte**st** |
| er/sie/es | konnte |
| wir | konnte**n** |
| ihr | konnte**t** |
| sie/Sie | konnte**n** |

Như mọi động từ ở Präteritum: `ich` và `er/sie/es` giống nhau, không đuôi.

## Dùng thế nào

> Gestern **konnte** ich nicht kommen. (Hôm qua tôi đã không đến được.)
> Ich **musste** arbeiten. (Tôi đã phải làm việc.)
> Als Kind **wollte** ich Arzt werden. (Hồi bé tôi đã muốn làm bác sĩ.)

## Vì sao không dùng Perfekt?

Về lý thuyết có dạng `ich habe kommen können`, nhưng nó rườm rà và hiếm gặp. Trong nói lẫn viết,
người Đức **gần như luôn dùng Präteritum** cho modal — giống như với `sein` và `haben`.

Cứ nhớ: ba nhóm này (sein, haben, modal) dùng Präteritum; phần còn lại dùng Perfekt khi nói.
$md$),

('a2-nebensatz-kausal', 'Nebensätze - kausal', 'Mệnh đề chỉ nguyên nhân (weil, da)', 'A2', NULL, 4,
'weil đẩy động từ xuống cuối mệnh đề — khác hẳn denn.', $md$
## `weil` đẩy động từ xuống cuối

> Ich bleibe zu Hause, **weil** ich krank **bin**.

So với `denn` (giữ trật tự bình thường):

> Ich bleibe zu Hause, **denn** ich **bin** krank.

Hai câu nghĩa y hệt. Khác biệt duy nhất là vị trí động từ — và đây là chỗ sai nhiều nhất khi
chuyển từ A1 lên A2.

## Khi mệnh đề phụ đứng trước

Cả mệnh đề phụ tính là **một thành phần**, nên động từ của mệnh đề chính vẫn phải ở vị trí 2:

> **Weil ich krank bin**, *bleibe* ich zu Hause.

Để ý hai động từ đứng sát nhau ở giữa: `bin, bleibe`. Nhìn lạ nhưng đúng.

## Khung câu bên trong mệnh đề phụ

Nếu mệnh đề phụ có hai động từ, **động từ chia vẫn đứng sau cùng**:

> Ich komme nicht, weil ich arbeiten **muss**. *(modal ở cuối, sau nguyên thể)*
> Ich bin müde, weil ich viel gearbeitet **habe**. *(haben ở cuối, sau Partizip II)*

## Trả lời câu hỏi `Warum?`

| Cách trả lời | Ví dụ |
| --- | --- |
| Cả câu với `weil` | **Weil** ich krank **bin**. |
| Chỉ mệnh đề `weil` (nói chuyện) | Warum kommst du nicht? — **Weil ich keine Zeit habe.** |
| `deshalb` (vì vậy — chỉ kết quả) | Ich bin krank, **deshalb** *bleibe* ich zu Hause. |

`deshalb` là trạng từ, nó **chiếm vị trí 1** nên động từ theo sau ngay — đừng nhầm với `weil`.
$md$),

('a2-nebensatz-konditional', 'Nebensätze - konditional', 'Mệnh đề điều kiện (wenn)', 'A2', NULL, 5,
'wenn dùng cho cả "nếu" lẫn "khi" — ngữ cảnh quyết định nghĩa.', $md$
## `wenn` = nếu, và cũng = khi

> **Wenn** ich Zeit **habe**, *komme* ich. (Nếu tôi có thời gian, tôi sẽ đến.)
> **Wenn** ich nach Hause **komme**, *esse* ich. (Khi tôi về nhà, tôi ăn cơm.)

Động từ xuống cuối mệnh đề `wenn`, và nếu mệnh đề `wenn` đứng trước thì mệnh đề chính bắt đầu ngay
bằng động từ.

## `wenn` hay `als`?

Đây là cặp người Việt nhầm nhiều nhất, vì tiếng Việt chỉ có một chữ "khi":

| Từ | Dùng khi | Ví dụ |
| --- | --- | --- |
| **als** | một sự việc **một lần trong quá khứ** | **Als** ich 10 war, zog ich nach Hanoi. |
| **wenn** | hiện tại/tương lai, hoặc việc **lặp lại** trong quá khứ | **Wenn** ich Zeit habe, lese ich. |

> **Als** ich in Berlin **war**, besuchte ich das Museum. *(một lần duy nhất)*
> **Immer wenn** ich in Berlin war, besuchte ich das Museum. *(nhiều lần)*

Quy tắc bỏ túi: quá khứ + một lần → **als**. Mọi trường hợp khác → **wenn**.

## `wenn` và `ob`

`ob` = "liệu có... hay không", dùng cho câu hỏi gián tiếp, không phải điều kiện:

> Ich weiß nicht, **ob** er **kommt**. (Tôi không biết liệu anh ấy có đến không.)
> Ich komme, **wenn** er **kommt**. (Tôi sẽ đến nếu anh ấy đến.)

## Câu điều kiện không có thật

Dùng Konjunktiv II — xem chủ điểm riêng:
> **Wenn** ich Zeit **hätte**, *würde* ich kommen. (Nếu tôi có thời gian thì tôi đã đến — nhưng không có.)
$md$),

('a2-nebensatz-dass', 'Nebensätze - dass-Sätze', 'Mệnh đề với dass', 'A2', NULL, 6,
'dass giới thiệu nội dung của điều được nói, nghĩ, biết — động từ xuống cuối.', $md$
## `dass` = "rằng"

> Ich weiß, **dass** du Deutsch **lernst**. (Tôi biết rằng bạn học tiếng Đức.)

Động từ chia của mệnh đề `dass` luôn đứng **cuối cùng**.

## Động từ thường đi với `dass`

| Nhóm | Động từ |
| --- | --- |
| Biết / nghĩ | wissen, denken, glauben, meinen, finden |
| Nói | sagen, erzählen, antworten |
| Hy vọng / sợ | hoffen, fürchten |
| Cảm nhận | sich freuen, es tut mir leid |

> Ich **glaube**, **dass** er recht **hat**.
> Es **tut mir leid**, **dass** ich zu spät **komme**.
> Ich **hoffe**, **dass** du bald **kommst**.

## Dấu phẩy là bắt buộc

Tiếng Đức **luôn đặt dấu phẩy** trước mệnh đề phụ, khác tiếng Anh và tiếng Việt:

> Ich denke**,** dass das gut ist.

## Khi nào bỏ được `dass`?

Sau `denken`, `glauben`, `meinen`, `sagen` có thể bỏ `dass` — nhưng khi đó **trật tự từ trở lại
bình thường**:

> Ich glaube, **dass** er recht **hat**. *(có dass → động từ cuối)*
> Ich glaube, er **hat** recht. *(bỏ dass → động từ vị trí 2)*

Cả hai đều đúng. Bỏ `dass` nghe tự nhiên hơn khi nói chuyện.

## Câu hỏi gián tiếp dùng `ob`, không dùng `dass`

> Er fragt, **ob** ich Zeit **habe**. (Anh ấy hỏi liệu tôi có thời gian không.)
$md$),

('a2-wechselpraeposition', 'Präpositionen mit Dativ und Akkusativ', 'Giới từ hai cách', 'A2', NULL, 7,
'Chín giới từ đổi cách theo nghĩa: có di chuyển thì Akkusativ, đứng yên thì Dativ.', $md$
## Wohin? hay Wo?

| Câu hỏi | Cách | Ý nghĩa |
| --- | --- | --- |
| **Wohin?** (đi đâu) | **Akkusativ** | có di chuyển tới đích |
| **Wo?** (ở đâu) | **Dativ** | đứng yên một chỗ |

## Chín giới từ

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

## So sánh trực tiếp

> Ich gehe **in die** Schule. *(Wohin? → Akkusativ)*
> Ich bin **in der** Schule. *(Wo? → Dativ)*

> Ich hänge das Bild **an die** Wand. *(treo lên — có di chuyển)*
> Das Bild hängt **an der** Wand. *(đang treo — đứng yên)*

## Nhận biết qua động từ

| Thường đi với Akkusativ | Thường đi với Dativ |
| --- | --- |
| gehen, fahren, kommen | sein, bleiben |
| stellen, legen, hängen, setzen (đặt vào) | stehen, liegen, hängen, sitzen (đang ở) |

Chú ý cặp động từ: `stellen/stehen`, `legen/liegen`, `setzen/sitzen` — cái đầu là hành động đặt
(Akkusativ), cái sau là trạng thái (Dativ).

## Dạng rút gọn

`in dem` → **im** · `in das` → **ins** · `an dem` → **am** · `an das` → **ans**

> Ich gehe **ins** Kino. · Ich bin **im** Kino.
$md$),

('a2-konjunktiv-2', 'Konjunktiv II', 'Thức giả định (würde, hätte, wäre)', 'A2', NULL, 8,
'Dùng để nói điều không có thật, và để đề nghị cho lịch sự.', $md$
## Hai công dụng chính

**1. Điều không có thật / giả định:**
> **Wenn** ich Zeit **hätte**, **würde** ich kommen. (Nếu tôi có thời gian thì tôi đã đến — nhưng không.)

**2. Nói cho lịch sự** — đây là cách dùng gặp hằng ngày:
> **Könnten** Sie mir helfen? (Ông/bà giúp tôi được không ạ?)
> Ich **hätte** gern einen Kaffee. (Cho tôi một ly cà phê.)

## Ba dạng phải thuộc

| Ngôi | sein → **wäre** | haben → **hätte** | werden → **würde** |
| --- | --- | --- | --- |
| ich | wäre | hätte | würde |
| du | wärst | hättest | würdest |
| er/sie/es | wäre | hätte | würde |
| wir | wären | hätten | würden |
| ihr | wärt | hättet | würdet |
| sie/Sie | wären | hätten | würden |

## Động từ khiếm khuyết

Lấy dạng Präteritum rồi **thêm lại Umlaut**:

| Präteritum | Konjunktiv II |
| --- | --- |
| konnte | **könnte** |
| musste | **müsste** |
| durfte | **dürfte** |
| sollte | sollte *(không đổi)* |
| wollte | wollte *(không đổi)* |

## Các động từ còn lại: dùng `würde` + nguyên thể

Thay vì nhớ dạng riêng của từng động từ, cứ ghép:

> Ich **würde** gern nach Deutschland **fahren**. (Tôi muốn đi Đức.)
> Was **würdest** du **machen**? (Bạn sẽ làm gì?)

Đây là cách dùng phổ biến nhất và cũng dễ nhất — trừ `sein`, `haben` và modal thì dùng dạng riêng
ở trên, còn lại đều `würde + Infinitiv`.

## Câu lịch sự nên thuộc lòng

> **Könnten** Sie das bitte wiederholen? — Ông/bà nhắc lại giúp được không?
> Ich **hätte** eine Frage. — Tôi có một câu hỏi.
> **Wäre** das möglich? — Như vậy có được không?
$md$),

('a2-futur-1', 'Das Futur I', 'Thì tương lai', 'A2', NULL, 9,
'werden + nguyên thể. Nhưng tiếng Đức thường dùng thì hiện tại để nói tương lai.', $md$
## Cấu trúc

**werden (chia) + động từ nguyên thể (cuối câu)**

| Ngôi | werden |
| --- | --- |
| ich | werde |
| du | **wirst** |
| er/sie/es | **wird** |
| wir | werden |
| ihr | werdet |
| sie/Sie | werden |

> Ich **werde** morgen nach Berlin **fahren**.

## Nhưng thường thì không cần dùng

Đây là điểm quan trọng nhất của chủ điểm này: khi đã có **từ chỉ thời gian**, người Đức dùng luôn
**thì hiện tại** để nói tương lai:

> **Morgen fahre ich** nach Berlin. *(tự nhiên hơn)*
> Morgen **werde** ich nach Berlin **fahren**. *(đúng nhưng nặng nề)*

> Nächste Woche **habe** ich Urlaub. (Tuần sau tôi nghỉ phép.)

Giống hệt tiếng Việt: "Mai tôi đi Berlin" — không cần từ "sẽ".

## Khi nào thật sự dùng Futur I?

| Trường hợp | Ví dụ |
| --- | --- |
| **Dự đoán** | Es **wird** morgen regnen. (Mai chắc mưa.) |
| **Hứa hẹn / quyết tâm** | Ich **werde** dir helfen. (Tôi sẽ giúp bạn.) |
| **Phỏng đoán hiện tại** | Er **wird** wohl krank sein. (Chắc anh ấy ốm.) |

Để ý trường hợp thứ ba: `werden` + `wohl` nói về **hiện tại**, không phải tương lai.

## Đừng nhầm hai nghĩa của `werden`

| Vai trò | Ví dụ |
| --- | --- |
| Trợ động từ tương lai | Ich **werde** lernen. (Tôi sẽ học.) |
| Động từ chính: "trở thành" | Ich **werde** Arzt. (Tôi sẽ trở thành bác sĩ.) |
| Động từ chính: "trở nên" | Es **wird** kalt. (Trời trở lạnh.) |
$md$),

('a2-genitiv', 'Genitiv', 'Cách 2 — sở hữu', 'A2', NULL, 10,
'des/der + danh từ giống đực/trung thêm -s. Khi nói thường thay bằng von + Dativ.', $md$
## Cách 2 chỉ quan hệ sở hữu

> das Auto **des Mannes** (xe của người đàn ông)

| Cách | Đực | Cái | Trung | Số nhiều |
| --- | --- | --- | --- | --- |
| **Genitiv** | **des** + **-(e)s** | **der** | **des** + **-(e)s** | **der** |

Điểm khác biệt lớn: giống đực và giống trung còn phải **thêm đuôi vào chính danh từ**:

- Từ một âm tiết: thêm **-es** → des Mann**es**, des Kind**es**
- Từ nhiều âm tiết: thêm **-s** → des Lehrer**s**, des Vater**s**
- Giống cái và số nhiều: **không** đổi danh từ → der Frau, der Kinder

## Khi nói, người Đức thay bằng `von` + Dativ

Đây là điều nên biết sớm để khỏi mất công:

> das Auto **des Mannes** *(trang trọng, văn viết)*
> das Auto **von dem Mann** = **vom Mann** *(nói chuyện hằng ngày)*

Trong hội thoại, `von` + Dativ phổ biến hơn hẳn. Genitiv chủ yếu gặp trong văn viết, báo chí, văn
bản hành chính — nhưng vì thi cử có nên vẫn phải nhận ra.

## Tên riêng thì thêm `-s` trực tiếp

> **Annas** Auto (xe của Anna) · **Toms** Buch

Không có dấu nháy như tiếng Anh: viết `Annas` chứ không phải *Anna's*.

## Giới từ đi với Genitiv

| Giới từ | Nghĩa |
| --- | --- |
| **wegen** | vì, do |
| **während** | trong lúc |
| **trotz** | mặc dù |
| **statt** | thay vì |

> **Wegen des** Regens bleibe ich zu Hause. (Vì mưa nên tôi ở nhà.)

Khi nói, các giới từ này cũng hay bị dùng với Dativ: *wegen dem Regen* — không chuẩn mực nhưng
rất phổ biến.
$md$),

('a2-pronomen-artikel', 'Pronomen und Artikel', 'Đại từ chỉ định và bất định', 'A2', NULL, 11,
'dieser, jeder, welcher, alle, man — nhóm từ biến cách giống der/die/das.', $md$
## Nhóm biến cách như `der/die/das`

| Từ | Nghĩa |
| --- | --- |
| **dieser** | này, đây |
| **jeder** | mỗi, mọi (số ít) |
| **welcher** | nào (câu hỏi) |
| **alle** | tất cả (số nhiều) |
| **mancher** | một số |

Đuôi bám theo đúng bảng mạo từ xác định:

| Cách | Đực | Cái | Trung | Số nhiều |
| --- | --- | --- | --- | --- |
| Nominativ | dies**er** | dies**e** | dies**es** | dies**e** |
| Akkusativ | dies**en** | dies**e** | dies**es** | dies**e** |
| Dativ | dies**em** | dies**er** | dies**em** | dies**en** |

> **Dieses** Buch ist gut. · Ich kaufe **diesen** Tisch. · **Welche** Farbe magst du?

## `man` — chủ ngữ chung chung

`man` chỉ "người ta, mọi người", **luôn chia động từ như ngôi 3 số ít**:

> **Man** spricht hier Deutsch. (Ở đây người ta nói tiếng Đức.)
> Hier **darf man** nicht rauchen. (Ở đây không được hút thuốc.)

Đây là cách rất thông dụng để nói về quy định, thói quen — thay cho câu bị động.

> Đừng nhầm `man` (người ta) với `der Mann` (người đàn ông). Khác nhau một chữ `n` và một chữ hoa.

## `kein` và `nicht`

| Dùng | Khi nào |
| --- | --- |
| **kein** | phủ định danh từ có `ein` hoặc không mạo từ |
| **nicht** | phủ định động từ, tính từ, hoặc danh từ có mạo từ xác định |

> Ich habe **kein** Auto. *(không có xe nào)*
> Ich habe **das** Auto **nicht**. *(không có chiếc xe đó)*
$md$),

('a2-reflexive-verben', 'Reflexive Verben', 'Động từ phản thân', 'A2', NULL, 12,
'sich waschen, sich freuen... — đại từ phản thân đổi theo chủ ngữ.', $md$
## Hành động quay lại chính mình

> Ich wasche **mich**. (Tôi rửa mặt/tắm — cho chính tôi.)

Từ điển ghi kèm `sich`: `sich waschen`, `sich freuen`. Khi chia, `sich` đổi theo chủ ngữ.

| Chủ ngữ | Akkusativ | Dativ |
| --- | --- | --- |
| ich | mich | mir |
| du | dich | dir |
| er/sie/es | **sich** | **sich** |
| wir | uns | uns |
| ihr | euch | euch |
| sie/Sie | **sich** | **sich** |

Chỉ ngôi 1 và 2 số ít mới phân biệt Akkusativ/Dativ; còn lại giống nhau hết.

## Động từ phản thân hay dùng

| Động từ | Nghĩa |
| --- | --- |
| sich freuen (über/auf) | vui mừng |
| sich interessieren (für) | quan tâm tới |
| sich treffen | gặp nhau |
| sich erinnern (an) | nhớ tới |
| sich vorstellen | tự giới thiệu |
| sich setzen | ngồi xuống |
| sich fühlen | cảm thấy |
| sich anziehen | mặc quần áo |

> Ich **freue mich** auf das Wochenende. (Tôi mong đến cuối tuần.)
> Wie **fühlst du dich**? (Bạn thấy trong người thế nào?)

## Khi nào dùng dạng Dativ?

Khi trong câu **đã có một tân ngữ Akkusativ** khác:

> Ich wasche **mich**. *(Akkusativ — không có tân ngữ nào khác)*
> Ich wasche **mir** *die Hände*. *(Dativ — vì "die Hände" đã là Akkusativ)*

## Vị trí trong câu

Đại từ phản thân đứng **ngay sau động từ chia**:

> Ich **freue mich**. · **Freust du dich**? · Ich habe **mich** gefreut.
$md$),

('a2-adjektivdeklination', 'Die Deklination des Adjektivs', 'Biến cách tính từ', 'A2', NULL, 13,
'Tính từ đứng trước danh từ phải đổi đuôi theo giống, cách và loại mạo từ.', $md$
## Chỉ đổi khi đứng TRƯỚC danh từ

> Das Auto ist **neu**. *(sau động từ → không đuôi)*
> Das **neue** Auto *(trước danh từ → có đuôi)*

## Sau mạo từ xác định (der/die/das) — đuôi yếu

| Cách | Đực | Cái | Trung | Số nhiều |
| --- | --- | --- | --- | --- |
| Nominativ | der neu**e** | die neu**e** | das neu**e** | die neu**en** |
| Akkusativ | den neu**en** | die neu**e** | das neu**e** | die neu**en** |
| Dativ | dem neu**en** | der neu**en** | dem neu**en** | den neu**en** |

**Mẹo:** chỉ có **5 ô là `-e`** (ba ô Nominativ số ít + hai ô Akkusativ giống cái/trung), tất cả
phần còn lại đều `-en`. Nhớ 5 ô đó là xong cả bảng.

## Sau mạo từ không xác định (ein/kein/mein) — đuôi hỗn hợp

| Cách | Đực | Cái | Trung |
| --- | --- | --- | --- |
| Nominativ | ein neu**er** | eine neu**e** | ein neu**es** |
| Akkusativ | einen neu**en** | eine neu**e** | ein neu**es** |
| Dativ | einem neu**en** | einer neu**en** | einem neu**en** |

**Vì sao khác?** `ein` không cho biết giống (cả đực lẫn trung đều là `ein`), nên tính từ phải gánh
phần thông tin đó: `-er` báo giống đực, `-es` báo giống trung.

## Nguyên tắc chung dễ nhớ

Trong mỗi cụm danh từ, **phải có đúng một từ mang dấu hiệu của giống và cách**. Nếu mạo từ đã mang
rồi thì tính từ chỉ cần đuôi yếu (`-e`/`-en`); nếu mạo từ không mang thì tính từ phải mang thay.

> Ich kaufe **den neuen** Tisch. · Ich kaufe **einen neuen** Tisch.
$md$),

('a2-n-deklination', 'n-Deklination', 'Danh từ thêm -n ở mọi cách', 'A2', NULL, 14,
'Một nhóm danh từ giống đực thêm -n/-en ở tất cả các cách trừ Nominativ số ít.', $md$
## Nhóm danh từ đặc biệt

| Cách | Số ít | Số nhiều |
| --- | --- | --- |
| Nominativ | der Student | die Student**en** |
| Akkusativ | den Student**en** | die Student**en** |
| Dativ | dem Student**en** | den Student**en** |
| Genitiv | des Student**en** | der Student**en** |

Chỉ mỗi ô Nominativ số ít là dạng gốc; còn lại đều thêm `-en`.

## Nhận biết nhóm này

| Dấu hiệu | Ví dụ |
| --- | --- |
| Giống đực kết thúc bằng **-e** | der Junge, der Kunde, der Kollege, der Name |
| Kết thúc **-ent, -ant, -ist, -oge, -at** | der Student, der Praktikant, der Polizist, der Biologe, der Soldat |
| Chỉ người/động vật giống đực | der Mensch, der Herr, der Nachbar, der Bauer, der Bär |

Toàn bộ đều là **giống đực** — không có danh từ giống cái hay trung nào thuộc nhóm này.

## Lỗi hay gặp

> Sai: *Ich sehe den Student.*
> Đúng: Ich sehe **den Studenten**.

> Sai: *Ich helfe dem Kollege.*
> Đúng: Ich helfe **dem Kollegen**.

## Trường hợp đặc biệt: `der Herr`

- Số ít: den **Herrn**, dem **Herrn** (chỉ thêm `-n`)
- Số nhiều: die **Herren**

> Guten Tag, **Herr** Müller! *(Nominativ — không đuôi)*
> Ich schreibe **Herrn** Müller. *(Dativ — thêm -n)*

Viết thư tiếng Đức hay gặp `Sehr geehrter **Herr** Müller` (Nominativ) — đây là chỗ dùng đúng nhất.
$md$),

('a2-verben-praepositionalobjekt', 'Verben mit Präpositionalobjekt', 'Động từ đi với giới từ cố định', 'A2', NULL, 15,
'warten auf, sich freuen über... — giới từ đi kèm phải học thuộc cùng động từ.', $md$
## Giới từ dính chặt với động từ

Nhiều động từ đòi một giới từ cố định, và giới từ đó **không suy ra được từ nghĩa** — phải học
thuộc như một cụm:

| Động từ + giới từ | Cách | Nghĩa |
| --- | --- | --- |
| warten **auf** | Akk | chờ đợi |
| sich freuen **auf** | Akk | mong chờ (việc sắp tới) |
| sich freuen **über** | Akk | vui vì (việc đã có) |
| sich interessieren **für** | Akk | quan tâm tới |
| denken **an** | Akk | nghĩ tới |
| sich erinnern **an** | Akk | nhớ tới |
| sprechen **über** | Akk | nói về |
| sprechen **mit** | Dativ | nói chuyện với |
| helfen **bei** | Dativ | giúp trong việc |
| Angst haben **vor** | Dativ | sợ |
| teilnehmen **an** | Dativ | tham gia |

> Ich **warte auf** den Bus. · Ich **freue mich auf** das Wochenende.

## Câu hỏi: `wo(r)-` cho vật, giới từ + `wen/wem` cho người

| Hỏi về | Cách hỏi | Ví dụ |
| --- | --- | --- |
| Vật/việc | **wo** + giới từ | **Worauf** wartest du? — Auf den Bus. |
| Người | giới từ + wen/wem | **Auf wen** wartest du? — Auf Anna. |

Chèn `-r-` khi giới từ bắt đầu bằng nguyên âm: `wo` + `auf` → **worauf**; `wo` + `über` →
**worüber**; nhưng `wo` + `für` → **wofür** (không cần -r-).

## Thay thế bằng `da(r)-`

Tương tự, khi nhắc lại vật đã nói:

> Wartest du auf den Bus? — Ja, ich warte **darauf**.
> Freust du dich über das Geschenk? — Ja, ich freue mich **darüber**.
$md$),

('a2-praeteritum', 'Das Präteritum', 'Thì quá khứ đơn', 'A2', NULL, 16,
'Thì quá khứ của văn viết — kể chuyện, báo chí, tiểu thuyết.', $md$
## Khi nào dùng Präteritum?

| Thì | Dùng ở đâu |
| --- | --- |
| **Perfekt** | nói chuyện hằng ngày |
| **Präteritum** | văn viết: truyện, báo, báo cáo |

Ngoại lệ: `sein`, `haben` và động từ khiếm khuyết dùng Präteritum **cả khi nói**.

## Động từ yếu: thân + `-te` + đuôi

| Ngôi | Đuôi | `lernen` → lern**te** |
| --- | --- | --- |
| ich | -te | lernte |
| du | -test | lerntest |
| er/sie/es | -te | lernte |
| wir | -ten | lernten |
| ihr | -tet | lerntet |
| sie/Sie | -ten | lernten |

`ich` và `er/sie/es` **giống hệt nhau** — đặc điểm của mọi động từ ở Präteritum.

Thân từ kết thúc `-t`/`-d` thì chèn thêm `-e-`: `arbeiten` → ich **arbeitete**.

## Động từ mạnh: đổi nguyên âm, KHÔNG có `-te`

| Nguyên thể | Präteritum (ich) | Nghĩa |
| --- | --- | --- |
| gehen | **ging** | đi |
| kommen | **kam** | đến |
| sehen | **sah** | nhìn |
| sprechen | **sprach** | nói |
| essen | **aß** | ăn |
| trinken | **trank** | uống |
| fahren | **fuhr** | lái, đi xe |
| schreiben | **schrieb** | viết |
| finden | **fand** | tìm thấy |
| nehmen | **nahm** | lấy |

Ngôi `ich` và `er` là dạng trần không đuôi; các ngôi khác thêm đuôi bình thường:
ich ging, du ging**st**, er ging, wir ging**en**, ihr ging**t**, sie ging**en**.

## Nhóm hỗn hợp

Vài động từ vừa đổi nguyên âm vừa có `-te`:

| Nguyên thể | Präteritum |
| --- | --- |
| bringen | **brachte** |
| denken | **dachte** |
| kennen | **kannte** |
| wissen | **wusste** |
$md$)

ON CONFLICT (slug) DO NOTHING;
