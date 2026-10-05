import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDueCards, getVocabularyStats } from '../api/vocabularyApi'
import type { VocabularyItem } from '../api/types'
import LessonFlashcardExercise from '../components/practice/LessonFlashcardExercise'

// Một phiên ôn chỉ lấy tối đa N thẻ (backend: app.vocabulary.review-session-size), thẻ quá hạn
// lâu nhất trước. Số thẻ đến hạn THẬT lấy từ thống kê, để người học biết còn bao nhiêu — thiếu dòng
// này họ sẽ tưởng 30 thẻ là hết, trong khi còn cả trăm thẻ đang chờ.
function fetchSession() {
  return Promise.all([getDueCards(), getVocabularyStats()])
}

export default function ReviewPage() {
  const [items, setItems] = useState<VocabularyItem[] | null>(null)
  const [totalDue, setTotalDue] = useState(0)
  const [sessionDone, setSessionDone] = useState(false)
  const [sessionKey, setSessionKey] = useState(0)

  useEffect(() => {
    fetchSession()
      .then(([cards, stats]) => {
        setItems(cards)
        setTotalDue(stats.dueForReview)
      })
      .catch(() => setItems([]))
  }, [])

  function startNextSession() {
    setItems(null)
    setSessionDone(false)
    setSessionKey((k) => k + 1)
    fetchSession()
      .then(([cards, stats]) => {
        setItems(cards)
        setTotalDue(stats.dueForReview)
      })
      .catch(() => setItems([]))
  }

  const remainingAfter = items ? Math.max(0, totalDue - items.length) : 0

  return (
    <div className="mx-auto max-w-xl">
      <nav className="mb-6 text-sm text-muted">
        <Link to="/app" className="text-primary hover:underline">
          Trang chủ
        </Link>
        {' / '}
        Ôn tập
      </nav>

      {items === null && (
        <div className="space-y-5">
          <div className="h-6 animate-pulse rounded-full bg-surface" />
          <div className="h-80 animate-pulse rounded-xl bg-surface" />
        </div>
      )}

      {items !== null && items.length === 0 && (
        <div className="rounded-xl bg-surface p-10 text-center">
          <p className="text-4xl">🎉</p>
          <p className="mt-3 font-display text-lg font-semibold text-ink">Không có từ nào cần ôn tập lúc này!</p>
          <p className="mt-1 text-sm text-muted">Quay lại sau hoặc học thêm từ mới nhé.</p>
          <Link
            to="/app/vocabulary"
            className="mt-6 inline-block rounded-md bg-primary px-6 py-3 text-center font-medium text-canvas transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary-deep hover:shadow-lifted"
          >
            Học từ vựng
          </Link>
        </div>
      )}

      {items !== null && items.length > 0 && (
        <>
          {remainingAfter > 0 && !sessionDone && (
            <p className="mb-4 text-center text-xs text-muted">
              Phiên này {items.length} thẻ quá hạn lâu nhất. Còn {remainingAfter} thẻ đến hạn, ôn tiếp sau phiên này.
            </p>
          )}

          <LessonFlashcardExercise
            key={`review-${sessionKey}`}
            items={items}
            onComplete={() => setSessionDone(true)}
          />

          {sessionDone && (
            <div className={`mt-4 grid gap-2 ${remainingAfter > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <Link
                to="/app"
                className="rounded-md border border-hairline bg-canvas px-4 py-3 text-center font-semibold text-ink transition-colors hover:bg-surface"
              >
                Về trang chủ
              </Link>
              {remainingAfter > 0 && (
                <button
                  onClick={startNextSession}
                  className="rounded-md bg-primary px-4 py-3 font-semibold text-canvas transition-[background,transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-primary-deep hover:shadow-lifted"
                >
                  Ôn tiếp {remainingAfter} thẻ
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
