import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Button, Card, Field, Input, NativeSelect, Note, PageHeader, SettingRow, Switch } from '@kit'
import { getDisplayPref, setDisplayPref, type DisplayPref } from '../lib/displayPrefs'
import { useAuth } from '../context/AuthContext'
import { apiFetch, ApiError } from '../api/client'

const GOAL_OPTIONS = ['Du học', 'Làm việc', 'Khác']
const CERTIFICATE_OPTIONS = ['Goethe-Zertifikat', 'telc', 'TestDaF']
const LEVEL_OPTIONS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']


function DisplaySettings() {
  const [prefs, setPrefs] = useState(() => ({
    reduceMotion: getDisplayPref('reduceMotion'),
    highContrast: getDisplayPref('highContrast'),
  }))
  function toggle(pref: DisplayPref, on: boolean) {
    setDisplayPref(pref, on)
    setPrefs((p) => ({ ...p, [pref]: on }))
  }
  return (
    <Card title="Hiển thị" className="mt-6">
      <SettingRow label="Giảm chuyển động" description="Tắt hiệu ứng lật thẻ, trượt và nảy.">
        <Switch label={<span className="sr-only">Giảm chuyển động</span>} checked={prefs.reduceMotion} onChange={(on) => toggle('reduceMotion', on)} />
      </SettingRow>
      <SettingRow label="Tương phản cao" description="Chữ phụ và đường kẻ đậm như chữ chính." className="border-t border-linie">
        <Switch label={<span className="sr-only">Tương phản cao</span>} checked={prefs.highContrast} onChange={(on) => toggle('highContrast', on)} />
      </SettingRow>
    </Card>
  )
}

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

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 flex items-center gap-4">
        <Avatar name={user.fullName ?? '?'} className="size-14 text-xl" />
        <PageHeader title={user.fullName} description="Hồ sơ cá nhân" className="mb-0" />
      </div>

      <Card className="p-8">
        <dl className="space-y-4">
          <div className="flex items-center justify-between border-b border-linie pb-4">
            <dt className="text-sm text-radiert">Họ tên</dt>
            <dd className="font-medium text-bleistift">{user.fullName}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-linie pb-4">
            <dt className="text-sm text-radiert">Email</dt>
            <dd className="font-medium text-bleistift">{user.guest ? 'Tài khoản dùng thử (tự xoá sau 24 giờ)' : user.email}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-linie pb-4">
            <dt className="text-sm text-radiert">Mục tiêu</dt>
            <dd className="font-medium text-bleistift">{user.goal || <span className="text-radiert">Chưa đặt</span>}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-linie pb-4">
            <dt className="text-sm text-radiert">Chứng chỉ mục tiêu</dt>
            <dd className="font-medium text-bleistift">
              {user.targetCertificate || <span className="text-radiert">Chưa đặt</span>}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-radiert">Trình độ hiện tại</dt>
            <dd className="font-medium text-bleistift">
              {user.currentLevel || <span className="text-radiert">Chưa đặt</span>}
            </dd>
          </div>
        </dl>

        <div className="mt-8 border-t border-linie pt-6">
          <Button variant="secondary" size="sm" onClick={toggleProfileForm}>
            {showProfileForm ? 'Đóng' : 'Sửa hồ sơ'}
          </Button>

          {showProfileForm && (
            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              {profileError && <Note tone="bad" className="mb-4">{profileError}</Note>}
              {profileSuccess && <Note tone="ok" className="mb-4">Cập nhật hồ sơ thành công</Note>}
              <Field label="Họ tên">
                <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </Field>
              <Field label="Mục tiêu">
                <NativeSelect value={goal} onChange={(e) => setGoal(e.target.value)}>
                  <option value="">Chưa đặt</option>
                  {GOAL_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </NativeSelect>
              </Field>
              <Field label="Chứng chỉ mục tiêu">
                <NativeSelect
                  value={targetCertificate}
                  onChange={(e) => setTargetCertificate(e.target.value)}
                >
                  <option value="">Chưa đặt</option>
                  {CERTIFICATE_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </NativeSelect>
              </Field>
              <Field label="Trình độ hiện tại">
                <NativeSelect
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(e.target.value)}
                >
                  <option value="">Chưa đặt</option>
                  {LEVEL_OPTIONS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </NativeSelect>
              </Field>
              <Button type="submit" loading={savingProfile}>
                {savingProfile ? 'Đang lưu...' : 'Lưu hồ sơ'}
              </Button>
            </form>
          )}
        </div>

        {!user.guest && <div className="mt-6 border-t border-linie pt-6">
          <Button variant="secondary" size="sm" onClick={() => { setShowPasswordForm((v) => !v); setPasswordError(null); setPasswordSuccess(false) }}>
            {showPasswordForm ? 'Đóng' : 'Đổi mật khẩu'}
          </Button>

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
              {passwordError && <Note tone="bad" className="mb-4">{passwordError}</Note>}
              {passwordSuccess && <Note tone="ok" className="mb-4">Đổi mật khẩu thành công</Note>}
              <Field label="Mật khẩu hiện tại">
                <Input type="password" autoComplete="current-password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </Field>
              <Field label="Mật khẩu mới">
                <Input type="password" autoComplete="new-password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </Field>
              <Button type="submit" loading={changingPassword}>
                {changingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
              </Button>
            </form>
          )}
        </div>}

        <Button
          variant="secondary"
          onClick={handleLogout}
          loading={loggingOut}
          className="mt-8 text-rotstift hover:bg-rotstift-soft"
        >
          {loggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
        </Button>
      </Card>

      <DisplaySettings />
    </div>
  )
}
