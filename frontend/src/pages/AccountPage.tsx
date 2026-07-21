import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch, ApiError } from '../api/client'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import Alert from '../components/ui/Alert'

const GOAL_OPTIONS = ['Du học', 'Làm việc', 'Khác']
const CERTIFICATE_OPTIONS = ['Goethe-Zertifikat', 'telc', 'TestDaF']
const LEVEL_OPTIONS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const selectClass =
  'w-full rounded-sm border border-hairline bg-canvas px-3.5 py-2.5 text-ink transition-[border-color,box-shadow] duration-150 focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20'

export default function AccountPage() {
  const { user, logout, refetchUser } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const [showProfileForm, setShowProfileForm] = useState(false)
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [goal, setGoal] = useState(user?.goal ?? '')
  const [targetCertificate, setTargetCertificate] = useState(user?.targetCertificate ?? '')
  const [currentLevel, setCurrentLevel] = useState(user?.currentLevel ?? '')
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

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

  function toggleProfileForm() {
    if (!showProfileForm && user) {
      // Re-seed from the latest known user data each time the form opens, in case it was
      // edited elsewhere (unlikely today, but avoids stale values if that ever changes).
      setFullName(user.fullName)
      setGoal(user.goal ?? '')
      setTargetCertificate(user.targetCertificate ?? '')
      setCurrentLevel(user.currentLevel ?? '')
    }
    setShowProfileForm((v) => !v)
    setProfileError(null)
    setProfileSuccess(false)
  }

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault()
    setProfileError(null)
    setProfileSuccess(false)
    setSavingProfile(true)
    try {
      await apiFetch('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({
          fullName,
          goal: goal || null,
          targetCertificate: targetCertificate || null,
          currentLevel: currentLevel || null,
        }),
      })
      await refetchUser()
      setProfileSuccess(true)
    } catch (err) {
      if (err instanceof ApiError) {
        setProfileError((err.data as { message?: string })?.message ?? 'Có lỗi xảy ra')
      } else {
        setProfileError('Có lỗi xảy ra, vui lòng thử lại')
      }
    } finally {
      setSavingProfile(false)
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
          <div className="flex items-center justify-between border-b border-hairline pb-4">
            <dt className="text-sm text-muted">Mục tiêu</dt>
            <dd className="font-medium text-ink">{user.goal || <span className="text-muted">Chưa đặt</span>}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-hairline pb-4">
            <dt className="text-sm text-muted">Chứng chỉ mục tiêu</dt>
            <dd className="font-medium text-ink">
              {user.targetCertificate || <span className="text-muted">Chưa đặt</span>}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-muted">Trình độ hiện tại</dt>
            <dd className="font-medium text-ink">
              {user.currentLevel || <span className="text-muted">Chưa đặt</span>}
            </dd>
          </div>
        </dl>

        <div className="mt-8 border-t border-hairline pt-6">
          <button
            onClick={toggleProfileForm}
            className="text-sm font-medium text-primary hover:text-primary-deep"
          >
            {showProfileForm ? 'Đóng' : 'Sửa hồ sơ'}
          </button>

          {showProfileForm && (
            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              {profileError && <Alert tone="danger">{profileError}</Alert>}
              {profileSuccess && <Alert tone="success">Cập nhật hồ sơ thành công</Alert>}
              <Field
                id="fullName"
                label="Họ tên"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <div>
                <label htmlFor="goal" className="mb-1 block text-sm font-medium text-ink">
                  Mục tiêu
                </label>
                <select id="goal" className={selectClass} value={goal} onChange={(e) => setGoal(e.target.value)}>
                  <option value="">Chưa đặt</option>
                  {GOAL_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="targetCertificate" className="mb-1 block text-sm font-medium text-ink">
                  Chứng chỉ mục tiêu
                </label>
                <select
                  id="targetCertificate"
                  className={selectClass}
                  value={targetCertificate}
                  onChange={(e) => setTargetCertificate(e.target.value)}
                >
                  <option value="">Chưa đặt</option>
                  {CERTIFICATE_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="currentLevel" className="mb-1 block text-sm font-medium text-ink">
                  Trình độ hiện tại
                </label>
                <select
                  id="currentLevel"
                  className={selectClass}
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(e.target.value)}
                >
                  <option value="">Chưa đặt</option>
                  {LEVEL_OPTIONS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" loading={savingProfile}>
                {savingProfile ? 'Đang lưu...' : 'Lưu hồ sơ'}
              </Button>
            </form>
          )}
        </div>

        <div className="mt-6 border-t border-hairline pt-6">
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
