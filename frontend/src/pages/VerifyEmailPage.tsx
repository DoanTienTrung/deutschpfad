import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiFetch, ApiError } from '../api/client'
import AuthCard from '../components/auth/AuthCard'
import Alert from '../components/ui/Alert'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    token ? 'loading' : 'error'
  )
  const [message, setMessage] = useState(token ? '' : 'Link không hợp lệ (thiếu token)')

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
        setMessage(
          err instanceof ApiError
            ? ((err.data as { message?: string })?.message ?? 'Xác thực thất bại')
            : 'Có lỗi xảy ra'
        )
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

      {status === 'error' && <Alert tone="danger">{message}</Alert>}
    </AuthCard>
  )
}
