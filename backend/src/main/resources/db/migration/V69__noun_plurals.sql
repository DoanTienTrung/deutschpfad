-- Số nhiều của danh từ — hiện riêng trên thẻ ("Số nhiều: die Bilder") thay vì bắt người học tự
-- giải ký hiệu "das Bild, -er". Production: chỉ dữ liệu giáo trình có ký hiệu (832/1.768 từ); các
-- lộ trình tần suất / Goethe không có gì.
--
-- german_noun_plurals: bảng tra từ WiktionaryDE (gambolputty/german-nouns, CC-BY-SA 4.0 — cùng
-- nguồn với german_noun_genders ở V40/V41). Khoá là (từ, giống) vì cùng một chữ có thể khác giống
-- và khác số nhiều. CHỈ chứa từ có đúng một dạng số nhiều: "Mutter" (Mütter / Muttern) hay "Bank"
-- (Bänke / Banken) bị loại khi dựng file, vì không biết dòng từ vựng nào mang nghĩa nào.
-- Dữ liệu nạp ở V70 (Java), cùng lúc tính cột vocabulary_items.plural.

CREATE TABLE german_noun_plurals (
    lemma VARCHAR(255) NOT NULL,
    genus VARCHAR(1) NOT NULL,
    plural VARCHAR(255) NOT NULL,
    PRIMARY KEY (lemma, genus)
);

ALTER TABLE vocabulary_items ADD COLUMN plural VARCHAR(255);

-- Lỗi ký hiệu trong dữ liệu giáo trình, lộ ra khi đối chiếu 818 ký hiệu với Wiktionary: "-en" sau
-- danh từ tận cùng -e cho ra "Maskeen". Khoá từ (word_key) không đổi vì chỉ khác phần số nhiều.
UPDATE vocabulary_items SET german_word = 'die Maske, -n' WHERE german_word = 'die Maske, -en';
