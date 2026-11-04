import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Button, buttonClass } from '@kit'
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
    <div className="min-h-screen">
      <header className="border-b border-kartenrand bg-karteikarte px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-seite flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h1 className="font-display text-lg font-bold text-bleistift">DeutschPfad Admin</h1>
          <nav aria-label="Quản trị" className="flex flex-wrap items-center gap-1 text-sm">
            <NavLink to="/admin/vocabulary" className={({ isActive }) => buttonClass('ghost', 'sm', isActive ? 'bg-bleistift/10 text-bleistift-tief' : 'font-medium text-radiert')}>Từ vựng</NavLink>
            <NavLink to="/admin/topics" className={({ isActive }) => buttonClass('ghost', 'sm', isActive ? 'bg-bleistift/10 text-bleistift-tief' : 'font-medium text-radiert')}>Chủ đề</NavLink>
            <NavLink to="/admin/lessons" className={({ isActive }) => buttonClass('ghost', 'sm', isActive ? 'bg-bleistift/10 text-bleistift-tief' : 'font-medium text-radiert')}>Bài học</NavLink>
            <NavLink to="/admin/listening" className={({ isActive }) => buttonClass('ghost', 'sm', isActive ? 'bg-bleistift/10 text-bleistift-tief' : 'font-medium text-radiert')}>Bài nghe</NavLink>
            <NavLink to="/admin/speaking" className={({ isActive }) => buttonClass('ghost', 'sm', isActive ? 'bg-bleistift/10 text-bleistift-tief' : 'font-medium text-radiert')}>Đề nói</NavLink>
            <NavLink to="/admin/reading" className={({ isActive }) => buttonClass('ghost', 'sm', isActive ? 'bg-bleistift/10 text-bleistift-tief' : 'font-medium text-radiert')}>Bài đọc</NavLink>
            <NavLink to="/admin/grammar" className={({ isActive }) => buttonClass('ghost', 'sm', isActive ? 'bg-bleistift/10 text-bleistift-tief' : 'font-medium text-radiert')}>Ngữ pháp</NavLink>
            <NavLink to="/admin/translation" className={({ isActive }) => buttonClass('ghost', 'sm', isActive ? 'bg-bleistift/10 text-bleistift-tief' : 'font-medium text-radiert')}>Luyện dịch</NavLink>
            <NavLink to="/admin/tutor-knowledge" className={({ isActive }) => buttonClass('ghost', 'sm', isActive ? 'bg-bleistift/10 text-bleistift-tief' : 'font-medium text-radiert')}>Kiến thức Gia sư</NavLink>
            <Button variant="ghost" size="sm" className="font-medium text-rotstift" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-seite p-6">
        <Outlet />
      </main>
    </div>
  )
}
