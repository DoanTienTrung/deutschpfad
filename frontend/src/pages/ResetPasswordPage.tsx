import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { apiFetch, ApiError } from '../api/client'
import AuthCard from '../components/auth/AuthCard'
import Field from '../components/ui/Field'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      })
      navigate('/login')
    } catch (err) {
      if (err instanceof ApiError) {
        setError((err.data as { message?: string })?.message ?? 'Có lỗi xảy ra')
      } else {
        setError('Có lỗi xảy ra, vui lòng thử lại')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <AuthCard title="Link không hợp lệ">
        <p className="mb-4 text-center text-sm text-muted">Link đặt lại mật khẩu này thiếu token hoặc đã hết hạn.</p>
        <Link
          to="/forgot-password"
          className="block text-center font-medium text-primary hover:text-primary-deep"
        >
          Yêu cầu link mới
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Đặt lại mật khẩu">
      {error && <Alert tone="danger">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          id="newPassword"
          label="Mật khẩu mới"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Button type="submit" loading={submitting}>
          {submitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
        </Button>
      </form>
    </AuthCard>
  )
}
