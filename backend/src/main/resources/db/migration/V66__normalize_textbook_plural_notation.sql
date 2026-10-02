-- Chuẩn hoá dữ liệu từ vựng giáo trình (source = TEXTBOOK, Menschen A1).


-- ---------------------------------------------------------------------------------------------
-- 1. Ký hiệu số nhiều có Umlaut: "=" → "¨"
--
-- Cùng một quy tắc "thêm Umlaut" mà dữ liệu dùng HAI cách viết:
--   der Hals, =e   ·  der Baum, =e   ·  das Wort, =er   ·  der Vater, =     (113 mục)
--   die Herkunft, ¨e  ·  der Vorhang, ¨e  ·  der Schwager, ¨                  ( 23 mục)
-- "¨" là ký hiệu chuẩn trong từ điển và giáo trình tiếng Đức; "=" không phải, người học đọc vào
-- không hiểu là gì.
--
-- Dùng đúng ký tự "¨" (U+00A8) mà 23 mục sẵn có đang dùng. Biểu thức chỉ khớp "=" đứng ngay sau
-- dấu phẩy — tức đúng vị trí ký hiệu số nhiều — nên không đụng tới chỗ nào khác.
-- ---------------------------------------------------------------------------------------------

UPDATE vocabulary_items
   SET german_word = regexp_replace(german_word, ',\s*=', ', ¨', 'g')
 WHERE german_word ~ ',\s*=';


-- ---------------------------------------------------------------------------------------------
-- 2. Sai giống: "der/die Fremdsprache"
--
-- Dạng "der/die" chỉ đúng với tính từ / phân từ danh từ hoá (der/die Angestellte, der/die
-- Deutsche…). "Fremdsprache" chỉ có giống cái. Trong 12 mục dạng này của dữ liệu giáo trình, đây
-- là mục duy nhất sai — "der/das Joghurt" và "der/das Ketchup" là đúng, tiếng Đức chấp nhận cả
-- hai giống cho hai từ này.
-- ---------------------------------------------------------------------------------------------

UPDATE vocabulary_items
   SET german_word = 'die Fremdsprache, -n'
 WHERE german_word = 'der/die Fremdsprache, -n';
