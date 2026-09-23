import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { askTutor } from '../api/tutorApi'
import type { TutorHistoryTurn } from '../api/types'
import { ApiError } from '../api/client'
import { onOpenTutor } from '../lib/tutorChat'
import Alert from './ui/Alert'

export default function TutorChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<TutorHistoryTurn[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, open])

  // Các trang khác (vd. bài ngữ pháp) mở widget kèm sẵn câu hỏi. Chỉ điền vào ô nhập chứ không
  // tự gửi, để người học còn sửa lại câu hỏi cho đúng ý mình trước khi hỏi.
  useEffect(
    () =>
      onOpenTutor((question) => {
        setOpen(true)
        setInput(question)
      }),
    []
  )

  async function handleSend() {
    const question = input.trim()
    if (!question || loading) return

    setError(null)
    const history = messages
    setMessages((prev) => [...prev, { role: 'user', text: question }])
    setInput('')
    setLoading(true)

    try {
      const result = await askTutor(question, history)
      setMessages((prev) => [...prev, { role: 'assistant', text: result.answer }])
    } catch (err) {
      const serverMessage = err instanceof ApiError ? (err.data as { message?: string } | null)?.message : undefined
      setError(serverMessage || 'Không hỏi được lúc này, thử lại sau nhé.')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-30">
      {open ? (
        <div className="flex h-[32rem] w-80 flex-col overflow-hidden rounded-lg border border-hairline bg-white shadow-lifted sm:w-96">
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-canvas">
            <span className="font-display text-sm font-semibold">Gia sư tiếng Đức</span>
            <button onClick={() => setOpen(false)} aria-label="Đóng chat" className="text-canvas/80 hover:text-canvas">
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-surface p-3">
            {messages.length === 0 && (
              <p className="text-xs text-muted">
                Hỏi mình về từ vựng hay ngữ pháp tiếng Đức nhé — vd. "der/die/das của Haus là gì?"
              </p>
            )}
            <ul className="space-y-2">
              {messages.map((m, i) => (
                <li
                  key={i}
                  className={`rounded-md p-2 text-sm ${
                    m.role === 'assistant' ? 'bg-white text-ink' : 'ml-4 bg-accent/20 text-ink'
                  }`}
                >
                  <p className="mb-0.5 text-[10px] font-medium text-muted">
                    {m.role === 'assistant' ? 'Gia sư' : 'Bạn'}
                  </p>
                  {m.role === 'assistant' ? (
                    <div className="prose-chat">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  )}
                </li>
              ))}
              {loading && (
                <li className="rounded-md bg-white p-2 text-sm text-muted">Gia sư đang trả lời...</li>
              )}
            </ul>
            <div ref={bottomRef} />
          </div>

          {error && (
            <div className="px-2 pt-2">
              <Alert tone="danger">{error}</Alert>
            </div>
          )}

          <div className="flex gap-2 border-t border-hairline p-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi..."
              rows={1}
              disabled={loading}
              className="flex-1 resize-none rounded-md border border-hairline px-2 py-1.5 text-sm"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="shrink-0 rounded-md bg-primary px-3 text-sm font-medium text-canvas hover:bg-primary-deep disabled:opacity-50"
            >
              Gửi
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          aria-label="Mở chat với Gia sư"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-canvas shadow-lifted hover:bg-primary-deep"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 4h16v12H8l-4 4V4Z" />
          </svg>
        </button>
      )}
    </div>
  )
}
