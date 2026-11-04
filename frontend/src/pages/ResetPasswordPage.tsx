import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Field, Input, Note, TextLink } from '@kit'
import { apiFetch, ApiError } from '../api/client'
import AuthCard from '../components/auth/AuthCard'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      })
      navigate('/login')
    } catch (err) {
      if (err instanceof ApiError) {
        setError((err.data as { message?: string })?.message ?? 'Có lỗi xảy ra')
      } else {
        setError('Có lỗi xảy ra, vui lòng thử lại')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <AuthCard title="Link không hợp lệ">
        <p className="mb-4 text-center text-sm text-radiert">Link đặt lại mật khẩu này thiếu token hoặc đã hết hạn.</p>
        <p className="text-center">
          <TextLink to="/forgot-password">Yêu cầu link mới</TextLink>
        </p>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Đặt lại mật khẩu">
      {error && <Note tone="bad" className="mb-4">{error}</Note>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Mật khẩu mới">
          <Input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Field>
        <Button type="submit" loading={submitting} className="w-full">
          {submitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
        </Button>
      </form>
    </AuthCard>
  )
}
