import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Check, ChevronDown } from 'lucide-react'
import { BottomSheet, Button, Card, Note, PageHeader, RowButton, Skeleton } from '@kit'
import { getLessonVocabularyItems, getLessonById } from '../api/lessonApi'
import { getLessonProgress, markLessonModeComplete, markLessonComplete, type PracticeMode } from '../api/progressApi'
import type { VocabularyItem, LessonSummary } from '../api/types'
import FlashcardBrowseList from '../components/practice/FlashcardBrowseList'
import LessonFlashcardExercise from '../components/practice/LessonFlashcardExercise'
import MultipleChoiceExercise from '../components/practice/MultipleChoiceExercise'
import MatchingExercise from '../components/practice/MatchingExercise'
import ListenChooseExercise from '../components/practice/ListenChooseExercise'
import TypeWordExercise from '../components/practice/TypeWordExercise'
import DictationExercise from '../components/practice/DictationExercise'
import { recordPracticeResult } from '../lib/practiceResult'

const MODES: { value: PracticeMode; label: string }[] = [
  { value: 'FLASHCARD', label: 'Flashcard' },
  { value: 'MULTIPLE_CHOICE', label: 'Trắc nghiệm từ vựng' },
  { value: 'MATCH', label: 'Chọn cặp từ' },
  { value: 'LISTEN', label: 'Nghe chọn đáp án' },
  { value: 'TYPE', label: 'Điền từ' },
  { value: 'DICTATION', label: 'Nghe chính tả' },
]

function LessonSidebarContent({
  lesson,
  completed,
  mode,
  markingComplete,
  onSelectMode,
  onMarkLessonComplete,
}: {
  lesson: LessonSummary | null
  completed: Set<PracticeMode>
  mode: PracticeMode
  markingComplete: boolean
  onSelectMode: (mode: PracticeMode) => void
  onMarkLessonComplete: () => void
}) {
  return (
    <>
      {lesson && (
        <div className="mb-4 border-b border-linie pb-4">
          <p className="font-display font-semibold text-bleistift">{lesson.title}</p>
          <p className="text-xs text-radiert">{lesson.wordCount} từ</p>
        </div>
      )}

      <div className="mb-4">
        {completed.has('LESSON_COMPLETE') ? (
          <Note tone="ok">Đã hoàn thành bài học</Note>
        ) : (
          <Button variant="secondary" size="sm" onClick={onMarkLessonComplete} loading={markingComplete} className="w-full">
            {markingComplete ? 'Đang lưu...' : 'Đánh dấu đã hoàn thành bài học'}
          </Button>
        )}
      </div>

      <nav aria-label="Chế độ luyện" className="space-y-0.5">
        {MODES.map((m) => (
          <RowButton key={m.value} title={m.label} selected={mode === m.value} onClick={() => onSelectMode(m.value)} className="min-h-11 py-2"
            trailing={completed.has(m.value) ? <Check className="size-4 text-aufstieg" aria-label="Đã luyện xong" /> : <span />} />
        ))}
      </nav>
    </>
  )
}

export default function PracticePage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const id = Number(lessonId)

  const [lesson, setLesson] = useState<LessonSummary | null>(null)
  const [items, setItems] = useState<VocabularyItem[]>([])
  const [completed, setCompleted] = useState<Set<PracticeMode>>(new Set())
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<PracticeMode>('FLASHCARD')
  const [flashcardPracticing, setFlashcardPracticing] = useState(false)
  const [markingComplete, setMarkingComplete] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  function handleSelectMode(newMode: PracticeMode) {
    setMode(newMode)
    setFlashcardPracticing(false)
  }

  useEffect(() => {
    Promise.all([getLessonById(id), getLessonVocabularyItems(id), getLessonProgress(id)])
      .then(([l, i, p]) => {
        setLesson(l)
        setItems(i)
        setCompleted(new Set(p))
      })
      .finally(() => setLoading(false))
  }, [id])

  function handleComplete() {
    markLessonModeComplete(id, mode).then((modes) => setCompleted(new Set(modes)))
  }

  function handleMarkLessonComplete() {
    setMarkingComplete(true)
    markLessonComplete(id)
      .then((modes) => setCompleted(new Set(modes)))
      .finally(() => setMarkingComplete(false))
  }

  const currentModeLabel = MODES.find((m) => m.value === mode)?.label

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row">
      {/* Mobile: compact bar showing the current mode, opens a drawer instead of pushing content
          down like the desktop sidebar does. */}
      <Button variant="secondary" onClick={() => setMobileMenuOpen(true)} className="justify-between md:hidden">
        <span>{currentModeLabel}</span>
        <span className="inline-flex items-center gap-1 font-normal text-radiert">Đổi chế độ <ChevronDown className="size-4" aria-hidden="true" /></span>
      </Button>

      <BottomSheet open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} title="Chế độ luyện" className="md:hidden">
        <LessonSidebarContent
              lesson={lesson}
              completed={completed}
              mode={mode}
              markingComplete={markingComplete}
              onSelectMode={(m) => {
                handleSelectMode(m)
                setMobileMenuOpen(false)
              }}
              onMarkLessonComplete={handleMarkLessonComplete}
            />
      </BottomSheet>

      <Card className="hidden shrink-0 self-start p-4 md:block md:w-60">
        <LessonSidebarContent
          lesson={lesson}
          completed={completed}
          mode={mode}
          markingComplete={markingComplete}
          onSelectMode={handleSelectMode}
          onMarkLessonComplete={handleMarkLessonComplete}
        />
      </Card>

      <div className="min-w-0 flex-1">
        <PageHeader title={lesson?.title ?? '...'} back={{ to: '/app/vocabulary', label: 'Từ vựng' }} className="mb-4" />

        {loading && <Skeleton className="h-56" />}

        {!loading && items.length === 0 && <p className="text-radiert">Bài học này chưa có từ vựng.</p>}

        {!loading && items.length > 0 && (
          <>
            {mode === 'FLASHCARD' && !flashcardPracticing && (
              <FlashcardBrowseList
                key={`flashcard-browse-${id}`}
                items={items}
                onStartPractice={() => setFlashcardPracticing(true)}
              />
            )}
            {mode === 'FLASHCARD' && flashcardPracticing && (
              <LessonFlashcardExercise key={`flashcard-${id}`} items={items} onComplete={handleComplete} />
            )}
            {mode === 'MULTIPLE_CHOICE' && (
              <MultipleChoiceExercise key={`mc-${id}`} items={items} onComplete={handleComplete} onResult={recordPracticeResult} />
            )}
            {/* Cố ý KHÔNG truyền onResult cho nối từ — xem ghi chú đầu MatchingExercise. */}
            {mode === 'MATCH' && (
              <MatchingExercise key={`match-${id}`} items={items} onComplete={handleComplete} />
            )}
            {mode === 'LISTEN' && (
              <ListenChooseExercise key={`listen-${id}`} items={items} onComplete={handleComplete} onResult={recordPracticeResult} />
            )}
            {mode === 'TYPE' && (
              <TypeWordExercise key={`type-${id}`} items={items} onComplete={handleComplete} onResult={recordPracticeResult} />
            )}
            {mode === 'DICTATION' && (
              <DictationExercise key={`dictation-${id}`} items={items} onComplete={handleComplete} onResult={recordPracticeResult} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
