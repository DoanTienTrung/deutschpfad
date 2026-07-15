import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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

const MODES: { value: PracticeMode; label: string }[] = [
  { value: 'FLASHCARD', label: 'Flashcard' },
  { value: 'MULTIPLE_CHOICE', label: 'Trắc nghiệm từ vựng' },
  { value: 'MATCH', label: 'Chọn cặp từ' },
  { value: 'LISTEN', label: 'Nghe chọn đáp án' },
  { value: 'TYPE', label: 'Điền từ' },
  { value: 'DICTATION', label: 'Nghe chính tả' },
]

export default function PracticePage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const id = Number(lessonId)

  const [lesson, setLesson] = useState<LessonSummary | null>(null)
  const [items, setItems] = useState<VocabularyItem[]>([])
  const [completed, setCompleted] = useState<Set<PracticeMode>>(new Set())
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<PracticeMode>('FLASHCARD')
  const [flashcardPracticing, setFlashcardPracticing] = useState(false)
  const [markingComplete, setMarkingComplete] = useState(false)

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

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row">
      <aside className="shrink-0 rounded-md border border-hairline bg-white p-4 md:w-60">
        {lesson && (
          <div className="mb-4 border-b border-hairline pb-4">
            <p className="font-display font-semibold text-ink">{lesson.title}</p>
            <p className="text-xs text-muted">{lesson.wordCount} từ</p>
          </div>
        )}

        <div className="mb-4">
          {completed.has('LESSON_COMPLETE') ? (
            <p className="rounded-sm bg-success-bg px-3 py-2 text-center text-sm font-medium text-success">
              🎉 Đã hoàn thành bài học
            </p>
          ) : (
            <button
              onClick={handleMarkLessonComplete}
              disabled={markingComplete}
              className="w-full rounded-sm border border-primary px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5 disabled:opacity-50"
            >
              {markingComplete ? 'Đang lưu...' : ' Đánh dấu đã hoàn thành bài học'}
            </button>
          )}
        </div>

        <nav className="space-y-1">
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => handleSelectMode(m.value)}
              className={`flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-sm ${
                mode === m.value ? 'bg-primary text-canvas' : 'text-ink hover:bg-surface'
              }`}
            >
              <span>{m.label}</span>
              {completed.has(m.value) && (
                <span className={mode === m.value ? 'text-canvas' : 'text-success'}>✓</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <nav className="mb-4 text-sm text-muted">
          <button onClick={() => navigate(-1)} className="text-primary hover:underline">
            Từ vựng
          </button>
          {' / '}
          {lesson?.title ?? '...'}
        </nav>

        {loading && <p className="text-muted">Đang tải...</p>}

        {!loading && items.length === 0 && <p className="text-muted">Bài học này chưa có từ vựng.</p>}

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
              <MultipleChoiceExercise key={`mc-${id}`} items={items} onComplete={handleComplete} />
            )}
            {mode === 'MATCH' && (
              <MatchingExercise key={`match-${id}`} items={items} onComplete={handleComplete} />
            )}
            {mode === 'LISTEN' && (
              <ListenChooseExercise key={`listen-${id}`} items={items} onComplete={handleComplete} />
            )}
            {mode === 'TYPE' && (
              <TypeWordExercise key={`type-${id}`} items={items} onComplete={handleComplete} />
            )}
            {mode === 'DICTATION' && (
              <DictationExercise key={`dictation-${id}`} items={items} onComplete={handleComplete} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
