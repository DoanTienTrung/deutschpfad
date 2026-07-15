import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type Props = {
  children: ReactNode
  requiredRole?: 'USER' | 'ADMIN'
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Đang tải...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    const fallback = user.role === 'ADMIN' ? '/admin/vocabulary' : '/app'
    return <Navigate to={fallback} replace />
  }

  return <>{children}</>
}
