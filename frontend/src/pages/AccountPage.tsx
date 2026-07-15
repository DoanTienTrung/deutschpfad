import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api/client'
import Button from '../components/ui/Button'

export default function AccountPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await apiFetch('/auth/logout', { method: 'POST' })
    } finally {
      logout()
      navigate('/login')
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

      <div className="rounded-lg bg-surface p-8 shadow-lifted">
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
