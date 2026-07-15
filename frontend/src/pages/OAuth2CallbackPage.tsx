import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function OAuth2CallbackPage() {
  const { refetchUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    refetchUser().then((me) => navigate(me?.role === 'ADMIN' ? '/admin/vocabulary' : '/app'))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount to consume the OAuth2 redirect
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <p className="flex items-center gap-2 text-sm text-muted">
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        Đang hoàn tất đăng nhập...
      </p>
    </div>
  )
}
