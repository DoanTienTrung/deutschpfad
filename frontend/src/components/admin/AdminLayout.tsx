import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../api/client'

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' })
    } finally {
      logout()
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-hairline bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="font-display text-lg font-bold text-ink">DeutschPfad Admin</h1>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/admin/vocabulary" className="text-primary hover:text-primary-deep">
              Từ vựng
            </Link>
            <Link to="/admin/topics" className="text-primary hover:text-primary-deep">
              Chủ đề
            </Link>
            <Link to="/admin/lessons" className="text-primary hover:text-primary-deep">
              Bài học
            </Link>
            <Link to="/admin/listening" className="text-primary hover:text-primary-deep">
              Bài nghe
            </Link>
            <Link to="/admin/speaking" className="text-primary hover:text-primary-deep">
              Đề nói
            </Link>
            <Link to="/admin/reading" className="text-primary hover:text-primary-deep">
              Bài đọc
            </Link>
            <button onClick={handleLogout} className="text-muted hover:text-ink">
              Đăng xuất
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-6">
        <Outlet />
      </main>
    </div>
  )
}
