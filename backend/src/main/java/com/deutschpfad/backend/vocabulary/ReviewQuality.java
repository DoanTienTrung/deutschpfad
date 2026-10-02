package com.deutschpfad.backend.vocabulary;

/**
 * Ba nút tự chấm của flashcard, quy đổi sang thang chất lượng 0–5 của SM-2.
 *
 * <p><b>Vì sao "Nhớ" là 4, không phải 3:</b> trong SM-2, hệ số dễ đổi theo
 * {@code 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)}. Với q = 3 là <b>-0,14 mỗi lần bấm</b>; với q = 4
 * là đúng 0. Nút "Nhớ" là nút người học bấm nhiều nhất cho một từ họ nhớ được bình thường — quy ra
 * 3 thì càng nhớ đều, hệ số càng tụt về sàn 1,30, khoảng cách ôn càng ngắn lại ("ease hell").
 * Chạy thử chính {@link Sm2Calculator} với 10 lần bấm "Nhớ": q = 3 cho khoảng cách
 * 1, 6, 13, 27, 52, 94… ngày (hệ số chạm sàn), q = 4 cho 1, 6, 15, 38, 95, 238… (hệ số giữ 2,50)
 * — tức trước đây phải ôn dày gần gấp đôi cho một từ đã nhớ.
 *
 * <p>q = 3 trong SM-2 nghĩa là "nhớ ra nhưng rất vất vả" — ứng với nút "Khó" của các app 4 nút,
 * không phải "Nhớ". Không cần migration: lúc sửa, production chỉ có 3 thẻ SM-2 và không thẻ nào
 * chạm sàn.
 */
public enum ReviewQuality {
    FORGOT(0),
    REMEMBERED(4),
    EASY(5);

    private final int quality;

    ReviewQuality(int quality) {
        this.quality = quality;
    }

    public int getQuality() {
        return quality;
    }
}
