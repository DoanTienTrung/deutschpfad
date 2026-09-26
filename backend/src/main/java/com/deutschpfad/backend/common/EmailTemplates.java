package com.deutschpfad.backend.common;

/**
 * Khung HTML dùng chung cho các email gửi tới người học.
 *
 * <p><b>Vì sao cần:</b> thư chỉ có văn bản thuần kèm một URL trần dài ngoằng trỏ tới tên miền lạ
 * là đúng khuôn mẫu thư lừa đảo — vừa bị bộ lọc trừ điểm, vừa khiến người nhận ngại bấm. Thư này
 * gửi kèm cả hai phần (text + HTML) nên client nào cũng đọc được, còn phần HTML thì có nút bấm
 * đàng hoàng và nói rõ vì sao người nhận lại nhận được nó.
 *
 * <p><b>Ràng buộc khi sửa:</b> client email (nhất là Gmail và Outlook) cắt bỏ thẻ {@code <style>},
 * không hỗ trợ flexbox/grid và bỏ qua phần lớn CSS hiện đại. Nên bố cục bằng {@code <table>} và
 * CSS viết thẳng vào thuộc tính {@code style} — trông cổ lỗ nhưng đó là thứ duy nhất chạy ổn.
 * Không dùng ảnh: ảnh mặc định bị chặn, thư sẽ trống hoác.
 */
public final class EmailTemplates {

    private EmailTemplates() {
    }

    // Lấy từ DESIGN.md: Ink (chữ), Ember Amber (điểm nhấn), nền trắng ngả ấm.
    private static final String INK = "#211D1B";
    private static final String MUTED = "#6B625C";
    private static final String CANVAS = "#FBF8F5";
    private static final String HAIRLINE = "#E8E0D8";

    /**
     * Thư có một hành động chính (xác thực email, đặt lại mật khẩu).
     *
     * @param preheader dòng tóm tắt hiện cạnh tiêu đề trong danh sách thư — không viết thì client
     *                  tự lấy đoạn text đầu tiên, thường ra một mẩu cụt lủn khó hiểu.
     */
    public static String actionEmail(
        String greetingName,
        String preheader,
        String bodyHtml,
        String buttonLabel,
        String buttonUrl,
        String footerNote
    ) {
        return """
            <!DOCTYPE html>
            <html lang="vi">
            <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
            <body style="margin:0;padding:0;background-color:%s;">
              <div style="display:none;max-height:0;overflow:hidden;opacity:0;">%s</div>
              <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background-color:%s;padding:24px 12px;">
                <tr><td align="center">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#FFFFFF;border:1px solid %s;border-radius:12px;">
                    <tr><td style="padding:28px 28px 0 28px;">
                      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:bold;color:%s;">
                        Deutsch<span style="color:#C8791A;">Pfad</span>
                      </p>
                    </td></tr>
                    <tr><td style="padding:20px 28px 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:%s;">
                      <p style="margin:0 0 14px 0;">Chào %s,</p>
                      %s
                    </td></tr>
                    <tr><td style="padding:24px 28px 0 28px;" align="center">
                      <a href="%s" style="display:inline-block;background-color:%s;color:#FFFFFF;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;padding:13px 28px;border-radius:8px;">%s</a>
                    </td></tr>
                    <tr><td style="padding:20px 28px 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:%s;">
                      <p style="margin:0 0 6px 0;">Nút không bấm được? Sao chép địa chỉ này vào trình duyệt:</p>
                      <p style="margin:0;word-break:break-all;"><a href="%s" style="color:%s;">%s</a></p>
                    </td></tr>
                    <tr><td style="padding:20px 28px 28px 28px;">
                      <div style="border-top:1px solid %s;padding-top:16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:%s;">
                        %s
                      </div>
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(
            CANVAS, escape(preheader), CANVAS, HAIRLINE, INK, INK,
            escape(greetingName), bodyHtml,
            buttonUrl, INK, escape(buttonLabel),
            MUTED, buttonUrl, MUTED, buttonUrl,
            HAIRLINE, MUTED, footerNote
        );
    }

    /**
     * Thoát các ký tự HTML trong dữ liệu do người dùng nhập (tên đầy đủ). Không có bước này thì
     * người đặt tên là {@code <script>} chèn được thẻ vào thư gửi cho chính họ — vô hại hơn XSS
     * trên web, nhưng vẫn làm hỏng bố cục thư.
     */
    private static String escape(String raw) {
        return raw == null ? "" : raw
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;");
    }
}
