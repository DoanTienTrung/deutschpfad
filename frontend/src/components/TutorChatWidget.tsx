import { useEffect, useRef, useState } from 'react'
import { MessageSquare, X } from 'lucide-react'
import { Button, IconButton, Note, Spinner, Textarea } from '@kit'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { askTutor } from '../api/tutorApi'
import type { TutorHistoryTurn } from '../api/types'
import { ApiError } from '../api/client'
import { onOpenTutor } from '../lib/tutorChat'

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
    <div className="fixed right-4 bottom-safe z-panel sm:right-6">
      {open ? (
        <div className="flex h-128 max-h-[80dvh] w-[calc(100vw-2rem)] max-w-96 flex-col overflow-hidden rounded-karte bg-karteikarte shadow-pop animate-erscheinen">
          <div className="flex items-center justify-between border-b-2 border-kopfzeile py-1.5 pr-1 pl-4">
            <span className="font-display font-semibold text-bleistift">Gia sư tiếng Đức</span>
            <IconButton label="Đóng chat" icon={<X className="size-4" aria-hidden="true" />} onClick={() => setOpen(false)} />
          </div>

          <div className="flex-1 overflow-y-auto bg-karteikarte-innen p-3">
            {messages.length === 0 && (
              <p className="text-xs text-radiert">
                Hỏi mình về từ vựng hay ngữ pháp tiếng Đức nhé - vd. "der/die/das của Haus là gì?"
              </p>
            )}
            <ul className="space-y-2">
              {messages.map((m, i) => (
                <li
                  key={i}
                  className={`rounded-karte p-2 text-sm ${
                    m.role === 'assistant' ? 'border border-linie bg-karteikarte text-bleistift' : 'ml-4 bg-tinte-soft text-bleistift'
                  }`}
                >
                  <p className="mb-0.5 text-xs font-medium text-radiert">
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
                <li className="flex items-center gap-2 rounded-karte border border-linie bg-karteikarte p-2 text-sm text-radiert"><Spinner /> Gia sư đang trả lời...</li>
              )}
            </ul>
            <div ref={bottomRef} />
          </div>

          {error && (
            <div className="px-2 pt-2">
              <Note tone="bad">{error}</Note>
            </div>
          )}

          <div className="flex gap-2 border-t border-linie p-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi..."
              rows={1}
              disabled={loading}
              className="flex-1"
            />
            <Button className="shrink-0"
              onClick={handleSend}
              disabled={loading || !input.trim()}>
              Gửi
            </Button>
          </div>
        </div>
      ) : (
        <IconButton variant="primary" label="Mở chat với Gia sư" onClick={() => setOpen(true)}
          icon={<MessageSquare className="size-6" aria-hidden="true" />} className="size-14 rounded-rund shadow-pop" />
      )}
    </div>
  )
}
