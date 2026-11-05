import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MousePointerClick } from 'lucide-react'
import { Button, useToast, type ButtonVariant } from '@kit'
import { ApiError } from '../../api/client'
import { useAuth } from '../../context/AuthContext'

/**
 * "Dùng thử không cần đăng ký": tạo một tài khoản khách riêng (tự xoá sau 24 giờ) và vào thẳng app.
 * Dành cho người chỉ muốn xem qua, như nhà tuyển dụng, để không phải đăng ký hay dùng chung mật khẩu.
 */
export default function GuestTryButton({ variant = 'secondary', className }: { variant?: ButtonVariant; className?: string }) {
  const { user, loginAsGuest } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [starting, setStarting] = useState(false)

  async function start() {
    if (user) {
      navigate(user.role === 'ADMIN' ? '/admin/vocabulary' : '/app')
      return
    }
    setStarting(true)
    try {
      await loginAsGuest()
      navigate('/app')
    } catch (err) {
      const message = err instanceof ApiError ? (err.data as { message?: string } | null)?.message : undefined
      toast({ tone: 'bad', message: message ?? 'Chưa vào được chế độ dùng thử, vui lòng thử lại' })
      setStarting(false)
    }
  }

  return (
    <Button variant={variant} className={className} loading={starting} icon={<MousePointerClick className="size-4" aria-hidden="true" />} onClick={start}>
      Dùng thử không cần đăng ký
    </Button>
  )
}
