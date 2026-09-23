package com.deutschpfad.backend.grammar;

/**
 * Bảng biến cách mạo từ tiếng Đức. Đây là <b>dữ kiện ngôn ngữ thuần</b> (giống bảng cửu chương),
 * không phải nội dung sáng tạo của ai — nên tự tổng hợp thoải mái, không dính bản quyền nguồn nào.
 *
 * <p>Dùng làm nguồn đáp án cho bài tập sinh deterministic: đã biết giống của danh từ (tra từ
 * {@code german_noun_genders}) thì dạng mạo từ ở mỗi cách là suy ra được chắc chắn, không cần AI
 * đoán.
 */
final class GermanDeclension {

    private GermanDeclension() {}

    enum Genus {
        MASKULIN("der"), FEMININ("die"), NEUTRUM("das");

        final String nominativDefinite;

        Genus(String nominativDefinite) {
            this.nominativDefinite = nominativDefinite;
        }

        /** Ánh xạ từ cột {@code genus} của bảng german_noun_genders ("m"/"f"/"n"). */
        static Genus fromCode(String code) {
            return switch (code) {
                case "m" -> MASKULIN;
                case "f" -> FEMININ;
                case "n" -> NEUTRUM;
                default -> null;
            };
        }
    }

    /**
     * Cố tình KHÔNG có GENITIV: cách 2 của giống đực/trung còn đòi đổi cả đuôi danh từ (-s/-es,
     * quy tắc phụ thuộc số âm tiết và âm cuối của từng từ), nên không suy ra chắc chắn 100% chỉ
     * từ giống được. Genitiv để AI soạn rồi admin duyệt.
     */
    enum Kasus {
        NOMINATIV("Nominativ", "cách 1"),
        AKKUSATIV("Akkusativ", "cách 4"),
        DATIV("Dativ", "cách 3");

        final String germanName;
        final String vietnameseName;

        Kasus(String germanName, String vietnameseName) {
            this.germanName = germanName;
            this.vietnameseName = vietnameseName;
        }
    }

    enum ArticleKind {
        DEFINITE("mạo từ xác định"), INDEFINITE("mạo từ không xác định");

        final String vietnameseName;

        ArticleKind(String vietnameseName) {
            this.vietnameseName = vietnameseName;
        }
    }

    // [Kasus][Genus] — thứ tự đúng theo thứ tự khai báo của 2 enum trên.
    private static final String[][] DEFINITE = {
        // MASKULIN, FEMININ, NEUTRUM
        {"der", "die", "das"},  // Nominativ
        {"den", "die", "das"},  // Akkusativ
        {"dem", "der", "dem"},  // Dativ
    };

    private static final String[][] INDEFINITE = {
        {"ein",   "eine",  "ein"},   // Nominativ
        {"einen", "eine",  "ein"},   // Akkusativ
        {"einem", "einer", "einem"}, // Dativ
    };

    static String article(ArticleKind kind, Kasus kasus, Genus genus) {
        String[][] table = kind == ArticleKind.DEFINITE ? DEFINITE : INDEFINITE;
        return table[kasus.ordinal()][genus.ordinal()];
    }
}
