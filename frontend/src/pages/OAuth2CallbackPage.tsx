import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '@kit'
import { useAuth } from '../context/AuthContext'

export default function OAuth2CallbackPage() {
  const { refetchUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    refetchUser().then((me) => navigate(me?.role === 'ADMIN' ? '/admin/vocabulary' : '/app'))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount to consume the OAuth2 redirect
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="flex items-center gap-2 text-sm text-radiert">
        <Spinner />
        Đang hoàn tất đăng nhập...
      </p>
    </div>
  )
}
