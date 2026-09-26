import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch, ApiError } from '../api/client'
import AuthCard from '../components/auth/AuthCard'
import ResendVerification from '../components/auth/ResendVerification'
import Field from '../components/ui/Field'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  // Đăng ký xong KHÔNG điều hướng đi đâu cả: việc tiếp theo của người dùng nằm trong hộp thư, nên
  // màn hình phải nói rõ điều đó và hiện đúng địa chỉ vừa nhập. Trước đây đẩy thẳng sang /login
  // im lặng — gõ nhầm email thì không có cách nào biết, thư bay vào hư không.
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)

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
      setRegisteredEmail(email)
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

  if (registeredEmail) {
    return (
      <AuthCard
        title="Kiểm tra hộp thư của bạn"
        footer={
          <div>
            Đã xác thực xong?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-deep">
              Đăng nhập
            </Link>
          </div>
        }
      >
        <p className="mb-4 text-sm text-muted">
          Tạo tài khoản thành công. Chúng mình vừa gửi một email xác thực tới:
        </p>
        {/* Hiện lại đúng địa chỉ vừa nhập: gõ nhầm email là lỗi phổ biến nhất ở bước này, và đây
            là khoảnh khắc duy nhất người dùng còn nhìn thấy nó để phát hiện ra. */}
        <p className="mb-4 rounded-sm bg-canvas px-3 py-2.5 text-center font-medium break-all text-ink">
          {registeredEmail}
        </p>
        <p className="mb-4 text-sm text-muted">
          Mở thư và bấm vào link trong đó để kích hoạt tài khoản. Link có hiệu lực trong 24 giờ.
          Không thấy thư thì ngó thêm mục <strong className="text-ink">Spam</strong> nhé.
        </p>

        <ResendVerification
          email={registeredEmail}
          successMessage={`Đã gửi lại email xác thực tới ${registeredEmail}.`}
        />

        <button
          type="button"
          onClick={() => setRegisteredEmail(null)}
          className="mt-2 w-full px-4 py-2 text-sm text-muted transition-colors hover:text-ink"
        >
          Gõ nhầm địa chỉ? Đăng ký lại bằng email khác
        </button>
      </AuthCard>
    )
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
