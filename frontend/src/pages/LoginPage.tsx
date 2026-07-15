import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../api/client'
import AuthCard from '../components/auth/AuthCard'
import Field from '../components/ui/Field'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN as string

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const loggedInUser = await login(email, password)
      navigate(loggedInUser.role === 'ADMIN' ? '/admin/vocabulary' : '/app')
    } catch (err) {
      if (err instanceof ApiError) {
        setError((err.data as { message?: string })?.message ?? 'Đăng nhập thất bại')
      } else {
        setError('Có lỗi xảy ra, vui lòng thử lại')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Đăng nhập"
      footer={
        <>
          <div>
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-medium text-primary hover:text-primary-deep">
              Đăng ký
            </Link>
          </div>
          <div>
            <Link to="/forgot-password" className="font-medium text-primary hover:text-primary-deep">
              Quên mật khẩu?
            </Link>
          </div>
        </>
      }
    >
      {error && <Alert tone="danger">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4">
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
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" loading={submitting}>
          {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>

      <a
        href={`${API_ORIGIN}/oauth2/authorization/google`}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-hairline py-3 font-medium text-ink transition-colors duration-150 hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.28 1.48-1.13 2.73-2.4 3.58v2.98h3.87c2.27-2.09 3.55-5.17 3.55-8.8z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-2.98c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09C3.25 21.3 7.31 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.27 14.3c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3V6.61H1.28A11.96 11.96 0 000 12c0 1.94.46 3.77 1.28 5.39l3.99-3.09z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.28 6.61l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75z"
          />
        </svg>
        Đăng nhập bằng Google
      </a>
    </AuthCard>
  )
}
