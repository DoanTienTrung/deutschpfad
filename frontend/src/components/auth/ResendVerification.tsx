import { useState } from 'react'
import { apiFetch, ApiError } from '../../api/client'
import Alert from '../ui/Alert'

/**
 * Nút gửi lại email xác thực.
 *
 * <p>Đây là đường cứu duy nhất cho tài khoản chưa xác thực: link trong thư chỉ sống 24 giờ, mà
 * người chưa xác thực thì không đăng nhập được, cũng không đăng ký lại được (báo "Email đã được
 * sử dụng"). Không có nút này thì gõ nhầm email một lần là tài khoản chết hẳn.
 *
 * <p>Dùng ở 3 chỗ người học có thể mắc kẹt: sau khi đăng ký, trang xác thực báo lỗi, và trang
 * đăng nhập khi bị từ chối vì chưa xác thực.
 */
export default function ResendVerification({
  email,
  successMessage,
}: {
  email: string
  /**
   * Câu báo thành công thay cho câu của server. Server cố tình trả lời mập mờ ("Nếu email này
   * đã đăng ký...") để không lộ địa chỉ nào tồn tại — đúng ở trang đăng nhập, nhưng ngay sau khi
   * người dùng vừa bấm Đăng ký thì nghe rất lấn cấn, vì chỗ đó ta đã biết chắc tài khoản có.
   */
  successMessage?: string
}) {
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleResend() {
    setError(null)
    setMessage(null)
    setSending(true)
    try {
      const res = await apiFetch<{ message: string }>('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setMessage(successMessage ?? res.message)
    } catch (err) {
      // 429 (gửi quá nhiều) trả message riêng — hiện nguyên văn để người dùng biết cần chờ.
      setError(
        err instanceof ApiError
          ? ((err.data as { message?: string })?.message ?? 'Không gửi lại được, thử lại sau nhé')
          : 'Không gửi lại được, thử lại sau nhé'
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      {message && <Alert tone="success">{message}</Alert>}
      {error && <Alert tone="danger">{error}</Alert>}
      <button
        type="button"
        onClick={handleResend}
        disabled={sending || !email}
        className="w-full rounded-sm border border-hairline bg-canvas px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:border-primary/40 hover:bg-surface disabled:opacity-50"
      >
        {sending ? 'Đang gửi...' : 'Gửi lại email xác thực'}
      </button>
    </div>
  )
}
