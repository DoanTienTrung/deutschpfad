import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiFetch, ApiError } from '../api/client'
import AuthCard from '../components/auth/AuthCard'
import ResendVerification from '../components/auth/ResendVerification'
import Field from '../components/ui/Field'
import Alert from '../components/ui/Alert'

// Thông báo từ server là dành cho lập trình viên ("Token không hợp lệ") — người học tiếng Đức
// không biết token là gì. Dịch sang thứ họ hiểu và, quan trọng hơn, nói luôn phải làm gì tiếp.
const FRIENDLY_ERRORS: Record<string, string> = {
  'Token đã hết hạn': 'Link xác thực đã hết hạn (link chỉ dùng được trong 24 giờ).',
  'Token không hợp lệ':
    'Link xác thực này không dùng được nữa — có thể bạn đã xác thực rồi, hoặc link bị đứt khi sao chép từ email.',
}

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    token ? 'loading' : 'error'
  )
  const [message, setMessage] = useState(
    token ? '' : 'Link xác thực không đầy đủ — có thể bị ngắt dòng lúc sao chép từ email.'
  )
  // Ở nhánh lỗi mới cần hỏi email: người dùng vào đây từ link trong thư nên app chưa biết họ là ai.
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (!token) return

    let cancelled = false

    apiFetch<{ message: string }>(`/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: 'POST',
    })
      .then((res) => {
        if (cancelled) return
        setStatus('success')
        setMessage(res.message)
      })
      .catch((err) => {
        if (cancelled) return
        setStatus('error')
        const raw =
          err instanceof ApiError
            ? ((err.data as { message?: string })?.message ?? 'Xác thực thất bại')
            : 'Có lỗi xảy ra'
        setMessage(FRIENDLY_ERRORS[raw] ?? raw)
      })

    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <AuthCard title="Xác thực email">
      {status === 'loading' && (
        <p className="flex items-center justify-center gap-2 text-sm text-muted">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Đang xác thực...
        </p>
      )}

      {status === 'success' && (
        <>
          <Alert tone="success">{message}</Alert>
          <Link to="/login" className="block text-center font-medium text-primary hover:text-primary-deep">
            Đăng nhập ngay
          </Link>
        </>
      )}

      {/* Trước đây nhánh lỗi chỉ có đúng một dòng đỏ và không một lối đi tiếp nào — mà đây lại
          chính là ngõ cụt: chưa xác thực thì không đăng nhập được, đăng ký lại thì báo trùng
          email. Nên phải có ngay nút gửi lại thư tại chỗ. */}
      {status === 'error' && (
        <>
          <Alert tone="danger">{message}</Alert>
          <p className="mb-3 text-sm text-muted">
            Nhập email bạn đã đăng ký, chúng mình gửi lại link xác thực mới:
          </p>
          <div className="mb-3">
            <Field
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <ResendVerification email={email} />
          <p className="mt-6 text-center text-sm">
            <Link to="/login" className="font-medium text-primary hover:text-primary-deep">
              Quay lại đăng nhập
            </Link>
          </p>
        </>
      )}
    </AuthCard>
  )
}
