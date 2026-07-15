import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch, ApiError } from '../api/client'
import AuthCard from '../components/auth/AuthCard'
import Field from '../components/ui/Field'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp')
      return
    }
    setSubmitting(true)
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName }),
      })
      navigate('/login', { state: { justRegistered: true } })
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as { message?: string; errors?: Record<string, string> }
        setError(data.message ?? Object.values(data.errors ?? {})[0] ?? 'Đăng ký thất bại')
      } else {
        setError('Có lỗi xảy ra, vui lòng thử lại')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Đăng ký"
      footer={
        <div>
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary-deep">
            Đăng nhập
          </Link>
        </div>
      }
    >
      {error && <Alert tone="danger">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          id="fullName"
          label="Họ tên"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          id="password"
          label="Mật khẩu"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Field
          id="confirmPassword"
          label="Nhập lại mật khẩu"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button type="submit" loading={submitting}>
          {submitting ? 'Đang đăng ký...' : 'Đăng ký'}
        </Button>
      </form>
    </AuthCard>
  )
}
