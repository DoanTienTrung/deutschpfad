import { useState, type FormEvent } from 'react'
import { Button, Field, Input, Note, TextLink } from '@kit'
import { apiFetch, ApiError } from '../api/client'
import AuthCard from '../components/auth/AuthCard'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setSubmitting(true)
    try {
      const res = await apiFetch<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setMessage(res.message)
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

  return (
    <AuthCard
      title="Quên mật khẩu"
      footer={
        <TextLink to="/login">Quay lại đăng nhập</TextLink>
      }
    >
      {message && <Note tone="ok" className="mb-4">{message}</Note>}
      {error && <Note tone="bad" className="mb-4">{error}</Note>}

      {!message && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email">
            <Input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Button type="submit" loading={submitting} className="w-full">
            {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </Button>
        </form>
      )}
    </AuthCard>
  )
}
