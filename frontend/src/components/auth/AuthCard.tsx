import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

/**
 * Khung dùng chung cho các trang đăng nhập / đăng ký / đặt lại mật khẩu.
 *
 * <p><b>Vì sao có phần thương hiệu ở đầu thẻ:</b> trước đây thẻ này chỉ có mỗi tiêu đề ("Đăng
 * nhập") rồi tới ô email và mật khẩu — không tên trang, không logo, không đường về trang chủ.
 * Một biểu mẫu thu thập mật khẩu mà không hề xưng danh chính là hình dạng của trang giả mạo, và
 * Google Search Console đã xếp site vào nhóm <i>"Possible Phishing Detected on User Login"</i>
 * (2026-09-26) — không kèm URL mẫu nào, tức là vấn đề nằm ở chính hình dạng trang đăng nhập chứ
 * không phải có trang độc hại nào trên máy chủ.
 *
 * <p>Tên thương hiệu bấm được và trỏ về trang chủ: vừa để người dùng biết mình đang ở đâu và
 * thoát ra được, vừa là thứ tối thiểu mà một trang đăng nhập thật phải có.
 */
export default function AuthCard({
  title,
  children,
  footer,
}: {
  title: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-sm rounded-lg bg-surface p-8 shadow-lifted">
        <div className="mb-6 text-center">
          <Link
            to="/"
            className="font-display text-xl font-bold text-ink transition-opacity hover:opacity-80"
          >
            Deutsch<span className="text-accent-deep">Pfad</span>
          </Link>
          <p className="mt-1 text-xs text-muted">Học tiếng Đức &amp; luyện thi chứng chỉ</p>
        </div>

        <h1 className="mb-6 text-center font-display text-2xl font-semibold text-ink text-balance">
          {title}
        </h1>
        {children}
        {footer && <div className="mt-6 space-y-1 text-center text-sm">{footer}</div>}
      </div>

      <p className="mt-6 max-w-sm text-center text-xs text-muted">
        Tài khoản DeutschPfad chỉ dùng cho trang này. Chúng mình không bao giờ hỏi mật khẩu của bạn
        qua email hay tin nhắn.
      </p>
    </div>
  )
}
