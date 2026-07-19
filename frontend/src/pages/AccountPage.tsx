import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch, ApiError } from '../api/client'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import Alert from '../components/ui/Alert'

export default function AccountPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await apiFetch('/auth/logout', { method: 'POST' })
    } finally {
      logout()
      navigate('/login')
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)
    setChangingPassword(true)
    try {
      await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      if (err instanceof ApiError) {
        setPasswordError((err.data as { message?: string })?.message ?? 'Có lỗi xảy ra')
      } else {
        setPasswordError('Có lỗi xảy ra, vui lòng thử lại')
      }
    } finally {
      setChangingPassword(false)
    }
  }

  if (!user) return null

  const initial = user.fullName?.trim()?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary font-display text-xl font-semibold text-canvas">
          {initial}
        </div>
        <div>
          <p className="font-display text-2xl font-semibold text-ink text-balance">
            {user.fullName}
          </p>
          <p className="text-sm text-muted">Hồ sơ cá nhân</p>
        </div>
      </div>

      <div className="rounded-lg bg-surface p-8">
        <dl className="space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-4">
            <dt className="text-sm text-muted">Họ tên</dt>
            <dd className="font-medium text-ink">{user.fullName}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-hairline pb-4">
            <dt className="text-sm text-muted">Email</dt>
            <dd className="font-medium text-ink">{user.email}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-muted">Vai trò</dt>
            <dd className="font-medium text-ink">{user.role}</dd>
          </div>
        </dl>

        <div className="mt-8 border-t border-hairline pt-6">
          <button
            onClick={() => {
              setShowPasswordForm((v) => !v)
              setPasswordError(null)
              setPasswordSuccess(false)
            }}
            className="text-sm font-medium text-primary hover:text-primary-deep"
          >
            {showPasswordForm ? 'Đóng' : 'Đổi mật khẩu'}
          </button>

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
              {passwordError && <Alert tone="danger">{passwordError}</Alert>}
              {passwordSuccess && <Alert tone="success">Đổi mật khẩu thành công</Alert>}
              <Field
                id="currentPassword"
                label="Mật khẩu hiện tại"
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
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
              <Button type="submit" loading={changingPassword}>
                {changingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
              </Button>
            </form>
          )}
        </div>

        <Button
          variant="secondary"
          onClick={handleLogout}
          loading={loggingOut}
          className="mt-8 text-danger hover:bg-danger-bg"
        >
          {loggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
        </Button>
      </div>
    </div>
  )
}
