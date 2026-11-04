import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Card, focusRing, cn } from '@kit'

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
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <Link to="/" className={cn('rounded-karte font-display text-xl font-bold text-bleistift hover:opacity-80', focusRing)}>
            Deutsch<span className="text-reiter-tief">Pfad</span>
          </Link>
          <p className="mt-1 text-xs text-radiert">Học tiếng Đức &amp; luyện thi chứng chỉ</p>
        </div>

        <h1 className="mb-6 text-center font-display text-2xl font-semibold text-balance text-bleistift">
          {title}
        </h1>
        {children}
        {footer && <div className="mt-6 space-y-1 text-center text-sm">{footer}</div>}
      </Card>

      <p className="mt-6 max-w-sm text-center text-xs text-radiert">
        Tài khoản DeutschPfad chỉ dùng cho trang này. Chúng mình không bao giờ hỏi mật khẩu của bạn
        qua email hay tin nhắn.
      </p>
    </div>
  )
}
