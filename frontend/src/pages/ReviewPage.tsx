import { useEffect, useState } from 'react'
import { PartyPopper } from 'lucide-react'
import { Button, ButtonLink, EmptyState, PageHeader, Skeleton, cn } from '@kit'
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
      <PageHeader title="Ôn tập" back={{ to: '/app', label: 'Trang chủ' }} />

      {items === null && (
        <div className="space-y-5">
          <Skeleton className="h-6" />
          <Skeleton className="h-80" />
        </div>
      )}

      {items !== null && items.length === 0 && (
        <EmptyState icon={<PartyPopper />} title="Không có từ nào cần ôn tập lúc này" description="Quay lại sau hoặc học thêm từ mới nhé."
          action={<ButtonLink to="/app/vocabulary">Học từ vựng</ButtonLink>} />
      )}

      {items !== null && items.length > 0 && (
        <>
          {remainingAfter > 0 && !sessionDone && (
            <p className="mb-4 text-center text-xs text-radiert">
              Phiên này {items.length} thẻ quá hạn lâu nhất. Còn {remainingAfter} thẻ đến hạn, ôn tiếp sau phiên này.
            </p>
          )}

          <LessonFlashcardExercise
            key={`review-${sessionKey}`}
            items={items}
            onComplete={() => setSessionDone(true)}
          />

          {sessionDone && (
            <div className={cn('mt-4 grid gap-2', remainingAfter > 0 ? 'grid-cols-2' : 'grid-cols-1')}>
              <ButtonLink to="/app" variant="secondary">
                Về trang chủ
              </ButtonLink>
              {remainingAfter > 0 && (
                <Button onClick={startNextSession}>
                  Ôn tiếp {remainingAfter} thẻ
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
