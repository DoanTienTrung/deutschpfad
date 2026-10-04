// Nội dung mục "Bảng chữ cái & phát âm" — soạn mới cho người Việt (cách đọc gần đúng so với âm tiếng
// Việt, chỗ hay nhầm). Dữ liệu tĩnh, không cần backend.
//
// Về âm thanh: app dùng giọng đọc của trình duyệt. Giọng này đọc MỘT chữ cái đứng riêng không ổn định
// (có máy đọc "J" kiểu tiếng Anh), nên mỗi chữ có `speak` là tên chữ đã viết ra ("Jott", "Ypsilon") —
// thứ giọng đọc chắc chắn đọc đúng. Âm ghép thì cho đọc từ ví dụ.

export type Example = { word: string; meaning: string }

export type Letter = {
  upper: string
  lower: string
  /** Tên chữ khi đánh vần, viết theo cách đọc */
  name: string
  /** Chuỗi đưa cho giọng đọc để đọc tên chữ */
  speak: string
  ipa: string
  /** Cách đọc chữ này TRONG TỪ, so với âm tiếng Việt */
  sound: string
  tip?: string
  examples: Example[]
  /** Đọc khác tiếng Việt / tiếng Anh — người Việt hay sai */
  tricky?: boolean
}

export const LETTERS: Letter[] = [
  { upper: 'A', lower: 'a', name: 'a', speak: 'A', ipa: 'aː',
    sound: 'Như "a" tiếng Việt. Kéo dài khi đứng trước một phụ âm hoặc chữ h (Vater, Bahn), đọc ngắn khi đứng trước hai phụ âm (Mann).',
    examples: [{ word: 'Apfel', meaning: 'quả táo' }, { word: 'Vater', meaning: 'bố' }] },
  { upper: 'B', lower: 'b', name: 'be', speak: 'Be', ipa: 'beː',
    sound: 'Như "b" tiếng Việt.',
    tip: 'Ở cuối từ đọc thành "p": ab → "ap", gelb → "gelp".',
    examples: [{ word: 'Buch', meaning: 'quyển sách' }, { word: 'Brot', meaning: 'bánh mì' }] },
  { upper: 'C', lower: 'c', name: 'tse', speak: 'Ze', ipa: 'tseː',
    sound: 'Đứng một mình rất hiếm, chủ yếu trong từ mượn: đọc "k" (Café, Computer) hoặc "ts" (Celsius).',
    tip: 'Thường gặp trong cụm ch, ck, sch - xem phần "Âm ghép & quy tắc".',
    examples: [{ word: 'Café', meaning: 'quán cà phê' }, { word: 'Computer', meaning: 'máy tính' }] },
  { upper: 'D', lower: 'd', name: 'de', speak: 'De', ipa: 'deː',
    sound: 'Như "đ" tiếng Việt nhưng nhẹ hơn, đầu lưỡi chạm sau răng trên.',
    tip: 'Ở cuối từ đọc thành "t": Hund → "hunt", Geld → "gelt".',
    examples: [{ word: 'danke', meaning: 'cảm ơn' }, { word: 'Hund', meaning: 'con chó' }] },
  { upper: 'E', lower: 'e', name: 'e', speak: 'E', ipa: 'eː',
    sound: 'E dài như "ê" (Tee, See); e ngắn như "e" (Bett). Chữ e không nhấn ở cuối từ đọc nhẹ như "ơ" (bitte → "bi-tơ").',
    examples: [{ word: 'Tee', meaning: 'trà' }, { word: 'bitte', meaning: 'làm ơn' }] },
  { upper: 'F', lower: 'f', name: 'eff', speak: 'Eff', ipa: 'ɛf',
    sound: 'Như "ph" tiếng Việt.',
    examples: [{ word: 'Fisch', meaning: 'con cá' }, { word: 'Freund', meaning: 'bạn' }] },
  { upper: 'G', lower: 'g', name: 'ge', speak: 'Ge', ipa: 'ɡeː',
    sound: 'Luôn đọc "g" cứng như trong "ga", không bao giờ đọc "gi" (gern, Gitarre).',
    tip: 'Ở cuối từ đọc thành "k": Tag → "tak". Đuôi -ig đọc như "ich": billig.',
    examples: [{ word: 'gut', meaning: 'tốt' }, { word: 'Tag', meaning: 'ngày' }] },
  { upper: 'H', lower: 'h', name: 'ha', speak: 'Ha', ipa: 'haː',
    sound: 'Đầu âm tiết đọc "h" như tiếng Việt (Haus).',
    tip: 'Đứng sau nguyên âm thì câm, chỉ làm nguyên âm đó dài ra: gehen → "gê-ơn", Sohn → "zôn".',
    examples: [{ word: 'Haus', meaning: 'ngôi nhà' }, { word: 'gehen', meaning: 'đi' }] },
  { upper: 'I', lower: 'i', name: 'i', speak: 'I', ipa: 'iː',
    sound: 'Như "i" tiếng Việt. Cụm ie đọc "i" kéo dài (Liebe).',
    examples: [{ word: 'ich', meaning: 'tôi' }, { word: 'Kind', meaning: 'đứa trẻ' }] },
  { upper: 'J', lower: 'j', name: 'jott', speak: 'Jott', ipa: 'jɔt', tricky: true,
    sound: 'Đọc như "d" giọng miền Nam hay "y" trong "yêu": ja → "ya".',
    tip: 'Không đọc như "j" tiếng Anh. Tên chữ là "jott", không phải "jây".',
    examples: [{ word: 'ja', meaning: 'vâng, có' }, { word: 'Jahr', meaning: 'năm' }] },
  { upper: 'K', lower: 'k', name: 'ka', speak: 'Ka', ipa: 'kaː',
    sound: 'Như "k" nhưng bật hơi mạnh, nghe hơi giống "kh" nhẹ.',
    examples: [{ word: 'Kaffee', meaning: 'cà phê' }, { word: 'Kind', meaning: 'đứa trẻ' }] },
  { upper: 'L', lower: 'l', name: 'ell', speak: 'Ell', ipa: 'ɛl',
    sound: 'Như "l" tiếng Việt.',
    examples: [{ word: 'Liebe', meaning: 'tình yêu' }, { word: 'Lampe', meaning: 'cái đèn' }] },
  { upper: 'M', lower: 'm', name: 'emm', speak: 'Emm', ipa: 'ɛm',
    sound: 'Như "m" tiếng Việt.',
    examples: [{ word: 'Mutter', meaning: 'mẹ' }, { word: 'Milch', meaning: 'sữa' }] },
  { upper: 'N', lower: 'n', name: 'enn', speak: 'Enn', ipa: 'ɛn',
    sound: 'Như "n" tiếng Việt.',
    examples: [{ word: 'Name', meaning: 'tên' }, { word: 'neu', meaning: 'mới' }] },
  { upper: 'O', lower: 'o', name: 'o', speak: 'O', ipa: 'oː',
    sound: 'O dài như "ô" (Brot); o ngắn như "o" (Sonne).',
    examples: [{ word: 'Brot', meaning: 'bánh mì' }, { word: 'Sonne', meaning: 'mặt trời' }] },
  { upper: 'P', lower: 'p', name: 'pe', speak: 'Pe', ipa: 'peː',
    sound: 'Như "p" nhưng bật hơi mạnh hơn tiếng Việt.',
    examples: [{ word: 'Papa', meaning: 'bố' }, { word: 'Post', meaning: 'bưu điện' }] },
  { upper: 'Q', lower: 'q', name: 'ku', speak: 'Ku', ipa: 'kuː',
    sound: 'Luôn đi với u. Cụm qu đọc "kv": Qualität → "kva-li-tết".',
    examples: [{ word: 'Quittung', meaning: 'biên lai' }, { word: 'bequem', meaning: 'thoải mái' }] },
  { upper: 'R', lower: 'r', name: 'err', speak: 'Err', ipa: 'ɛʁ', tricky: true,
    sound: 'Đầu từ: rung nhẹ ở cuống họng, như khi súc miệng - gần "gr" nhẹ (rot). Không uốn lưỡi như "r" tiếng Việt.',
    tip: 'Sau nguyên âm dài và trong đuôi -er, r gần như biến thành "ơ" rất nhẹ: Bier → "bi-ơ", Vater → "pha-tơ".',
    examples: [{ word: 'rot', meaning: 'màu đỏ' }, { word: 'Bier', meaning: 'bia' }] },
  { upper: 'S', lower: 's', name: 'ess', speak: 'Ess', ipa: 'ɛs', tricky: true,
    sound: 'Trước nguyên âm đọc như "z" tiếng Anh, có rung (Sonne → "zo-nơ"). Cuối từ hoặc cuối âm tiết đọc như "x" (Haus).',
    tip: 'Đầu từ, sp và st đọc "shp", "sht": Sport, Straße.',
    examples: [{ word: 'Sonne', meaning: 'mặt trời' }, { word: 'Haus', meaning: 'ngôi nhà' }] },
  { upper: 'T', lower: 't', name: 'te', speak: 'Te', ipa: 'teː',
    sound: 'Như "th" tiếng Việt (bật hơi).',
    examples: [{ word: 'Tee', meaning: 'trà' }, { word: 'Tisch', meaning: 'cái bàn' }] },
  { upper: 'U', lower: 'u', name: 'u', speak: 'U', ipa: 'uː',
    sound: 'Như "u" tiếng Việt.',
    examples: [{ word: 'Uhr', meaning: 'đồng hồ' }, { word: 'und', meaning: 'và' }] },
  { upper: 'V', lower: 'v', name: 'fau', speak: 'Fau', ipa: 'faʊ', tricky: true,
    sound: 'Trong từ tiếng Đức gốc đọc như "ph": Vater → "pha-tơ", viel → "phil".',
    tip: 'Từ mượn thì đọc "v": Vase, Video. Tên chữ là "fau".',
    examples: [{ word: 'Vater', meaning: 'bố' }, { word: 'Vase', meaning: 'bình hoa' }] },
  { upper: 'W', lower: 'w', name: 've', speak: 'We', ipa: 'veː', tricky: true,
    sound: 'Đọc như "v" tiếng Việt: Wasser → "va-xơ", Wein → "vain".',
    tip: 'Không đọc như "w" tiếng Anh.',
    examples: [{ word: 'Wasser', meaning: 'nước' }, { word: 'Wein', meaning: 'rượu vang' }] },
  { upper: 'X', lower: 'x', name: 'ix', speak: 'Ix', ipa: 'ɪks',
    sound: 'Đọc "ks", như "x" trong tiếng Anh.',
    examples: [{ word: 'Taxi', meaning: 'xe taxi' }, { word: 'Text', meaning: 'văn bản' }] },
  { upper: 'Y', lower: 'y', name: 'ypsilon', speak: 'Ypsilon', ipa: 'ˈʏpsilɔn', tricky: true,
    sound: 'Hiếm. Trong từ gốc Hy Lạp đọc như "ü" (Typ); trong từ mượn tiếng Anh đọc "i" (Handy).',
    examples: [{ word: 'Typ', meaning: 'kiểu, loại' }, { word: 'Handy', meaning: 'điện thoại di động' }] },
  { upper: 'Z', lower: 'z', name: 'tsett', speak: 'Zett', ipa: 'tsɛt', tricky: true,
    sound: 'Luôn đọc "ts": Zeit → "tsait", Zug → "tsuk".',
    tip: 'Không đọc như "z" tiếng Việt hay tiếng Anh.',
    examples: [{ word: 'Zeit', meaning: 'thời gian' }, { word: 'Zug', meaning: 'tàu hỏa' }] },
  { upper: 'Ä', lower: 'ä', name: 'ä', speak: 'Ä', ipa: 'ɛː', tricky: true,
    sound: 'Như "e" tiếng Việt (miệng mở hơn "ê"): Käse → "ke-zơ".',
    tip: 'Gõ thiếu dấu là thành từ khác. Không có phím ä thì viết "ae".',
    examples: [{ word: 'Käse', meaning: 'phô mai' }, { word: 'Mädchen', meaning: 'cô gái' }] },
  { upper: 'Ö', lower: 'ö', name: 'ö', speak: 'Ö', ipa: 'øː', tricky: true,
    sound: 'Không có trong tiếng Việt: đặt lưỡi như khi nói "ê", rồi chu tròn môi như nói "ô" - nghe gần "ơ" tròn môi.',
    tip: 'schön (đẹp) và schon (đã) là hai từ khác nhau.',
    examples: [{ word: 'schön', meaning: 'đẹp' }, { word: 'Öl', meaning: 'dầu' }] },
  { upper: 'Ü', lower: 'ü', name: 'ü', speak: 'Ü', ipa: 'yː', tricky: true,
    sound: 'Không có trong tiếng Việt: đặt lưỡi như khi nói "i", rồi chu môi như nói "u". Giữ nguyên lưỡi, chỉ đổi môi.',
    tip: 'Mutter (mẹ) và Mütter (các bà mẹ) là hai từ khác nhau.',
    examples: [{ word: 'über', meaning: 'phía trên' }, { word: 'Tür', meaning: 'cái cửa' }] },
  { upper: 'ẞ', lower: 'ß', name: 'eszett', speak: 'Eszett', ipa: 'ɛsˈtsɛt', tricky: true,
    sound: 'Đọc "x" (giống ss), không rung. Chỉ đứng sau nguyên âm dài hoặc nguyên âm đôi: Straße, heißen.',
    tip: 'Không phải chữ B. Không gõ được thì viết "ss". Gần như không bao giờ đứng đầu từ.',
    examples: [{ word: 'Straße', meaning: 'con đường' }, { word: 'groß', meaning: 'to, lớn' }] },
]

export type Sound = {
  id: string
  label: string
  ipa: string
  /** Đọc như thế nào, so với tiếng Việt */
  sound: string
  tip?: string
  examples: Example[]
}

export const SOUNDS: Sound[] = [
  { id: 'ei', label: 'ei · ai', ipa: 'aɪ',
    sound: 'Đọc "ai": Wein → "vain", mein → "main".',
    tip: 'Hay nhầm với ie. Mẹo: đọc tên tiếng Anh của chữ cái thứ hai - ei → tên chữ "i" trong tiếng Anh ("ai"); ie → tên chữ "e" trong tiếng Anh ("i").',
    examples: [{ word: 'Wein', meaning: 'rượu vang' }, { word: 'drei', meaning: 'số ba' }] },
  { id: 'ie', label: 'ie', ipa: 'iː',
    sound: 'Đọc "i" kéo dài: Liebe → "li-bơ", vier → "phi-ơ".',
    tip: 'Không đọc tách "i-e".',
    examples: [{ word: 'Liebe', meaning: 'tình yêu' }, { word: 'vier', meaning: 'số bốn' }] },
  { id: 'eu', label: 'eu · äu', ipa: 'ɔʏ',
    sound: 'Cả hai đều đọc "oi": heute → "hoi-tơ", Häuser → "hoi-zơ".',
    examples: [{ word: 'heute', meaning: 'hôm nay' }, { word: 'Häuser', meaning: 'những ngôi nhà' }] },
  { id: 'au', label: 'au', ipa: 'aʊ',
    sound: 'Đọc "ao": Haus → "hao-x", Frau → "phrao".',
    examples: [{ word: 'Haus', meaning: 'ngôi nhà' }, { word: 'Frau', meaning: 'phụ nữ' }] },
  { id: 'sch', label: 'sch', ipa: 'ʃ',
    sound: 'Như "sh" tiếng Anh, chu tròn môi: Schule → "shu-lơ".',
    tip: 'Ba chữ cái nhưng chỉ là một âm.',
    examples: [{ word: 'Schule', meaning: 'trường học' }, { word: 'Tisch', meaning: 'cái bàn' }] },
  { id: 'ch-ich', label: 'ch (sau e, i, ä, ö, ü, ei, eu)', ipa: 'ç',
    sound: 'Âm "ich": hơi gió xì nhẹ giữa mặt lưỡi và vòm miệng - gần "h" trong "hi" nhưng xì mạnh hơn, mềm hơn "kh".',
    tip: 'Mẹo: nói "hi" rồi thổi hơi mạnh ở chữ h. Cũng dùng sau l, n, r (Milch) và ở đầu một số từ (Chemie).',
    examples: [{ word: 'ich', meaning: 'tôi' }, { word: 'nicht', meaning: 'không' }] },
  { id: 'ch-ach', label: 'ch (sau a, o, u, au)', ipa: 'x',
    sound: 'Âm "ach": như "kh" tiếng Việt, khàn ở cuống họng: Buch → "bukh", acht → "akht".',
    examples: [{ word: 'Buch', meaning: 'quyển sách' }, { word: 'auch', meaning: 'cũng' }] },
  { id: 'chs', label: 'chs', ipa: 'ks',
    sound: 'Đọc "ks": sechs → "zeks".',
    examples: [{ word: 'sechs', meaning: 'số sáu' }, { word: 'wachsen', meaning: 'lớn lên' }] },
  { id: 'sp-st', label: 'sp · st (đầu từ)', ipa: 'ʃp · ʃt',
    sound: 'Ở đầu từ đọc "shp", "sht": Sport → "shport", Straße → "shtra-xơ".',
    tip: 'Ở giữa hoặc cuối từ thì đọc bình thường "xp", "xt": Fenster, ist.',
    examples: [{ word: 'sprechen', meaning: 'nói' }, { word: 'Stadt', meaning: 'thành phố' }] },
  { id: 's-ss', label: 's · ss · ß', ipa: 'z · s',
    sound: 's trước nguyên âm đọc như "z" có rung (Sonne). ss và ß đọc "x", không rung (Wasser, Straße).',
    tip: 'ss đứng sau nguyên âm ngắn (Wasser), ß sau nguyên âm dài (Straße).',
    examples: [{ word: 'Sonne', meaning: 'mặt trời' }, { word: 'Wasser', meaning: 'nước' }] },
  { id: 'z', label: 'z · tz', ipa: 'ts',
    sound: 'Đọc "ts": Zeit → "tsait", Katze → "ka-tsơ".',
    examples: [{ word: 'Zug', meaning: 'tàu hỏa' }, { word: 'Platz', meaning: 'chỗ, quảng trường' }] },
  { id: 'pf', label: 'pf', ipa: 'pf',
    sound: 'Mím môi như "p" rồi bật ra thành "ph" liền một hơi: Apfel → "ap-phơl".',
    examples: [{ word: 'Apfel', meaning: 'quả táo' }, { word: 'Pferd', meaning: 'con ngựa' }] },
  { id: 'qu', label: 'qu', ipa: 'kv',
    sound: 'Đọc "kv": bequem → "bơ-kvêm".',
    examples: [{ word: 'Qualität', meaning: 'chất lượng' }, { word: 'bequem', meaning: 'thoải mái' }] },
  { id: 'ck', label: 'ck', ipa: 'k',
    sound: 'Đọc "k". Nguyên âm đứng trước luôn ngắn: Zucker → "tsu-kơ".',
    examples: [{ word: 'Zucker', meaning: 'đường' }, { word: 'backen', meaning: 'nướng bánh' }] },
  { id: 'ng', label: 'ng', ipa: 'ŋ',
    sound: 'Như "ng" tiếng Việt, không bật thêm âm "g": singen → "zing-ơn".',
    examples: [{ word: 'lang', meaning: 'dài' }, { word: 'Zeitung', meaning: 'tờ báo' }] },
  { id: 'er', label: '-er (cuối từ)', ipa: 'ɐ',
    sound: 'Đọc như "ơ" pha chút "a", rất nhẹ, không uốn r: Vater → "pha-tơ", Lehrer → "lê-rơ".',
    examples: [{ word: 'Vater', meaning: 'bố' }, { word: 'Lehrer', meaning: 'giáo viên' }] },
  { id: 'ig', label: '-ig (cuối từ)', ipa: 'ɪç',
    sound: 'Đọc như "ich": billig → "bi-lich", zwanzig → "tsvan-tsich".',
    examples: [{ word: 'billig', meaning: 'rẻ' }, { word: 'zwanzig', meaning: 'hai mươi' }] },
  { id: 'final', label: 'b · d · g (cuối từ)', ipa: 'p · t · k',
    sound: 'Ở cuối từ hoặc cuối âm tiết, b d g đọc thành p t k: ab → "ap", Hund → "hunt", Tag → "tak".',
    tip: 'Khi thêm đuôi, chúng đọc lại bình thường: Hunde → "hun-đơ", Tage → "ta-gơ".',
    examples: [{ word: 'Hund', meaning: 'con chó' }, { word: 'Tag', meaning: 'ngày' }] },
  { id: 'long-short', label: 'Nguyên âm dài & ngắn', ipa: 'aː · a',
    sound: 'Nguyên âm dài khi: đứng trước h (Sohn), viết đôi (Boot, See), hoặc trước MỘT phụ âm (Tag). Ngắn khi đứng trước hai phụ âm (Bett, Mutter, kommen).',
    tip: 'Dài hay ngắn có thể đổi nghĩa: Ofen (cái lò) – offen (mở).',
    examples: [{ word: 'Ofen', meaning: 'cái lò' }, { word: 'offen', meaning: 'mở' }] },
]

export type MinimalPair = { a: Example; b: Example; focus: string }

/** Cặp từ chỉ khác một âm — dùng cho bài "Nghe & chọn từ". */
export const MINIMAL_PAIRS: MinimalPair[] = [
  { a: { word: 'schon', meaning: 'đã, rồi' }, b: { word: 'schön', meaning: 'đẹp' }, focus: 'o – ö' },
  { a: { word: 'Bar', meaning: 'quán bar' }, b: { word: 'Bär', meaning: 'con gấu' }, focus: 'a – ä' },
  { a: { word: 'Mutter', meaning: 'mẹ' }, b: { word: 'Mütter', meaning: 'các bà mẹ' }, focus: 'u – ü' },
  { a: { word: 'Kuchen', meaning: 'bánh ngọt' }, b: { word: 'Küchen', meaning: 'các nhà bếp' }, focus: 'u – ü' },
  { a: { word: 'Lieder', meaning: 'các bài hát' }, b: { word: 'leider', meaning: 'tiếc là' }, focus: 'ie – ei' },
  { a: { word: 'Miete', meaning: 'tiền thuê nhà' }, b: { word: 'Mitte', meaning: 'ở giữa' }, focus: 'i dài – i ngắn' },
  { a: { word: 'Staat', meaning: 'nhà nước' }, b: { word: 'Stadt', meaning: 'thành phố' }, focus: 'a dài – a ngắn' },
  { a: { word: 'Ofen', meaning: 'cái lò' }, b: { word: 'offen', meaning: 'mở' }, focus: 'o dài – o ngắn' },
  { a: { word: 'fühlen', meaning: 'cảm thấy' }, b: { word: 'füllen', meaning: 'đổ đầy' }, focus: 'ü dài – ü ngắn' },
  { a: { word: 'Zahl', meaning: 'con số' }, b: { word: 'Saal', meaning: 'hội trường' }, focus: 'z – s' },
  { a: { word: 'Tasche', meaning: 'cái túi' }, b: { word: 'Tasse', meaning: 'cái tách' }, focus: 'sch – ss' },
  { a: { word: 'Kirche', meaning: 'nhà thờ' }, b: { word: 'Kirsche', meaning: 'quả anh đào' }, focus: 'ch – sch' },
]

/**
 * Bảng đánh vần truyền thống ("A wie Anton…") — vẫn là cách người Đức dùng nhiều nhất khi đánh vần
 * qua điện thoại. (Bản DIN 5009 năm 2022 đổi sang tên thành phố, nhưng ít người dùng.)
 */
export const SPELLING_WORDS: Record<string, string> = {
  A: 'Anton', Ä: 'Ärger', B: 'Berta', C: 'Cäsar', D: 'Dora', E: 'Emil', F: 'Friedrich', G: 'Gustav',
  H: 'Heinrich', I: 'Ida', J: 'Julius', K: 'Kaufmann', L: 'Ludwig', M: 'Martha', N: 'Nordpol',
  O: 'Otto', Ö: 'Ökonom', P: 'Paula', Q: 'Quelle', R: 'Richard', S: 'Samuel', ß: 'Eszett',
  T: 'Theodor', U: 'Ulrich', Ü: 'Übermut', V: 'Viktor', W: 'Wilhelm', X: 'Xanthippe', Y: 'Ypsilon',
  Z: 'Zacharias',
}

/** Từ cho bài "Nghe đánh vần, gõ lại" — ngắn, hay gặp, có chữ dễ nhầm (W, V, Z, J, ß, Umlaut). */
export const SPELLING_DRILL_WORDS: Example[] = [
  { word: 'Wasser', meaning: 'nước' },
  { word: 'Vater', meaning: 'bố' },
  { word: 'Zug', meaning: 'tàu hỏa' },
  { word: 'Jahr', meaning: 'năm' },
  { word: 'Straße', meaning: 'con đường' },
  { word: 'schön', meaning: 'đẹp' },
  { word: 'Tür', meaning: 'cái cửa' },
  { word: 'Käse', meaning: 'phô mai' },
  { word: 'Berlin', meaning: 'Berlin' },
  { word: 'Müller', meaning: 'họ Müller' },
  { word: 'Quittung', meaning: 'biên lai' },
  { word: 'Handy', meaning: 'điện thoại di động' },
  { word: 'Taxi', meaning: 'xe taxi' },
  { word: 'Zeit', meaning: 'thời gian' },
  { word: 'Euro', meaning: 'đồng euro' },
]

const LETTER_BY_CHAR = new Map<string, Letter>()
for (const l of LETTERS) {
  LETTER_BY_CHAR.set(l.upper, l)
  LETTER_BY_CHAR.set(l.lower, l)
}
LETTER_BY_CHAR.set('ß', LETTERS.find((l) => l.lower === 'ß')!)

export function letterFor(char: string): Letter | undefined {
  return LETTER_BY_CHAR.get(char)
}

export type SpelledChar = { char: string; letter?: Letter; spellingWord?: string }

/** Chữ tiếng Việt có dấu → chữ gốc để đánh vần (ê → e, ư → u, đ → d). Umlaut đã khớp trước khi tới đây. */
function baseLetter(char: string): string {
  if (char === 'đ') return 'd'
  if (char === 'Đ') return 'D'
  return char.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/**
 * Tách một từ/tên thành từng chữ để đánh vần. Tên tiếng Việt có dấu được đánh vần theo chữ gốc —
 * giấy tờ ở Đức ghi tên không dấu ("Lê Đức" → L-E-D-U-C). Ký tự không phải chữ cái (khoảng trắng,
 * dấu gạch) giữ nguyên, không có `letter`.
 */
export function spellOut(text: string): SpelledChar[] {
  return [...text.normalize('NFC')].map((char) => {
    const letter = letterFor(char) ?? letterFor(baseLetter(char))
    const key = !letter ? '' : letter.lower === 'ß' ? 'ß' : letter.upper
    return { char, letter, spellingWord: letter ? SPELLING_WORDS[key] : undefined }
  })
}

/** Chuỗi cho giọng đọc đánh vần, các chữ cách nhau bởi dấu phẩy để có khoảng ngắt. */
export function spellingSpeech(text: string): string {
  return spellOut(text)
    .filter((c) => c.letter)
    .map((c) => c.letter!.speak)
    .join(', ')
}
