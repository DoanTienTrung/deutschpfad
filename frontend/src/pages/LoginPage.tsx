import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Field, Input, Note, TextLink, buttonClass } from '@kit'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../api/client'
import AuthCard from '../components/auth/AuthCard'
import ResendVerification from '../components/auth/ResendVerification'
import GoogleLogo from '../components/auth/GoogleLogo'

// Rỗng/không đặt = backend cùng tên miền với giao diện (production): link tương đối /oauth2/...
const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN as string | undefined) ?? ''

// Backend từ chối đăng nhập bằng đúng câu này khi tài khoản chưa xác thực. Nhận ra nó để hiện
// thẳng nút gửi lại thư — thay vì bắt người dùng tự mò xem phải làm gì tiếp.
const UNVERIFIED_MESSAGE = 'Vui lòng xác thực email trước khi đăng nhập'

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
            <TextLink to="/register">Đăng ký</TextLink>
          </div>
          <div>
            <TextLink to="/forgot-password">Quên mật khẩu?</TextLink>
          </div>
        </>
      }
    >
      {error && <Note tone="bad" className="mb-4">{error}</Note>}

      {error === UNVERIFIED_MESSAGE && (
        <div className="mb-4">
          <p className="mb-2 text-sm text-radiert">
            Không tìm thấy thư, hoặc link cũ đã hết hạn?
          </p>
          <ResendVerification email={email} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email">
          <Input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Mật khẩu">
          <Input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Button type="submit" loading={submitting} className="w-full">
          {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>

      <a href={`${API_ORIGIN}/oauth2/authorization/google`} className={buttonClass('secondary', 'md', 'mt-4 w-full')}>
        <GoogleLogo />
        Đăng nhập bằng Google
      </a>
    </AuthCard>
  )
}
