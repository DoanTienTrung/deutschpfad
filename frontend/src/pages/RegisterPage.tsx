import { useState, type FormEvent } from 'react'
import { Button, ButtonLink, Field, Input, Note, TextLink } from '@kit'
import { apiFetch, ApiError } from '../api/client'
import AuthCard from '../components/auth/AuthCard'
import ResendVerification from '../components/auth/ResendVerification'

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
  // Máy chủ không gửi email (MAIL_ENABLED=false) thì tài khoản được xác thực luôn: mời đăng nhập ngay,
  // đừng bảo người dùng chờ một lá thư không bao giờ tới.
  const [verifiedAlready, setVerifiedAlready] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp')
      return
    }
    setSubmitting(true)
    try {
      const res = await apiFetch<{ emailVerified?: boolean }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName }),
      })
      setVerifiedAlready(res.emailVerified === true)
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

  if (registeredEmail && verifiedAlready) {
    return (
      <AuthCard title="Tạo tài khoản thành công">
        <p className="mb-4 text-sm text-radiert">Tài khoản của bạn đã sẵn sàng:</p>
        <p className="mb-4 rounded-karte border border-linie bg-karteikarte-innen px-3 py-2.5 text-center font-medium break-all text-bleistift">
          {registeredEmail}
        </p>
        <ButtonLink to="/login" className="w-full">
          Đăng nhập ngay
        </ButtonLink>
      </AuthCard>
    )
  }

  if (registeredEmail) {
    return (
      <AuthCard
        title="Kiểm tra hộp thư của bạn"
        footer={
          <div>
            Đã xác thực xong?{' '}
            <TextLink to="/login">Đăng nhập</TextLink>
          </div>
        }
      >
        <p className="mb-4 text-sm text-radiert">
          Tạo tài khoản thành công. Chúng mình vừa gửi một email xác thực tới:
        </p>
        {/* Hiện lại đúng địa chỉ vừa nhập: gõ nhầm email là lỗi phổ biến nhất ở bước này, và đây
            là khoảnh khắc duy nhất người dùng còn nhìn thấy nó để phát hiện ra. */}
        <p className="mb-4 rounded-karte border border-linie bg-karteikarte-innen px-3 py-2.5 text-center font-medium break-all text-bleistift">
          {registeredEmail}
        </p>
        <p className="mb-4 text-sm text-radiert">
          Mở thư và bấm vào link trong đó để kích hoạt tài khoản. Link có hiệu lực trong 24 giờ.
          Không thấy thư thì ngó thêm mục <strong className="text-bleistift">Spam</strong> nhé.
        </p>

        <ResendVerification
          email={registeredEmail}
          successMessage={`Đã gửi lại email xác thực tới ${registeredEmail}.`}
        />

        <Button variant="ghost" size="sm" onClick={() => setRegisteredEmail(null)} className="mt-2 w-full font-normal text-radiert">
          Gõ nhầm địa chỉ? Đăng ký lại bằng email khác
        </Button>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Đăng ký"
      footer={
        <div>
          Đã có tài khoản?{' '}
          <TextLink to="/login">Đăng nhập</TextLink>
        </div>
      }
    >
      {error && <Note tone="bad" className="mb-4">{error}</Note>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Họ tên">
          <Input
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </Field>
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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Field label="Nhập lại mật khẩu">
          <Input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Field>
        <Button type="submit" loading={submitting} className="w-full">
          {submitting ? 'Đang đăng ký...' : 'Đăng ký'}
        </Button>
      </form>
    </AuthCard>
  )
}
