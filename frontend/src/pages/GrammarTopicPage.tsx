import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getGrammarTopic, submitGrammarAnswers } from '../api/grammarApi'
import type { GrammarSubmitResult, GrammarTopicDetail } from '../api/types'
import { shuffleForPractice, type ShuffledExercise } from '../lib/shuffleExercises'
import { ApiError } from '../api/client'
import { openTutorWithQuestion } from '../lib/tutorChat'
import GrammarMarkdown from '../components/grammar/GrammarMarkdown'
import ListeningBreadcrumb from '../components/listening/ListeningBreadcrumb'
import Alert from '../components/ui/Alert'
import { Skeleton } from '../components/ui/Skeleton'

export default function GrammarTopicPage() {
  const { slug = '' } = useParams()
  const [topic, setTopic] = useState<GrammarTopicDetail | null>(null)
  // Xáo lại mỗi lần vào trang và mỗi lần bấm "Làm lại" — xem lib/shuffleExercises.ts.
  const [exercises, setExercises] = useState<ShuffledExercise[]>([])
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [result, setResult] = useState<GrammarSubmitResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- slug changed, reset before refetch
    setLoading(true)
    setResult(null)
    setAnswers({})
    getGrammarTopic(slug)
      .then((d) => {
        setTopic(d)
        setExercises(shuffleForPractice(d.exercises))
      })
      .catch(() => setError('Không tải được chủ điểm này.'))
      .finally(() => setLoading(false))
  }, [slug])

  const resultByExercise = useMemo(() => {
    const map = new Map<number, GrammarSubmitResult['results'][number]>()
    result?.results.forEach((r) => map.set(r.exerciseId, r))
    return map
  }, [result])

  async function handleSubmit() {
    if (!topic) return
    setError(null)
    setSubmitting(true)
    try {
      // Trắc nghiệm: đổi chữ cái đang hiển thị về chữ cái gốc mà backend lưu.
      const payload = exercises.map((e) => {
        const raw = answers[e.id] ?? ''
        const answer = e.exerciseType === 'MULTIPLE_CHOICE' ? (e.letterMap[raw] ?? raw) : raw
        return { exerciseId: e.id, answer }
      })
      setResult(await submitGrammarAnswers(topic.slug, payload))
    } catch (err) {
      const serverMessage = err instanceof ApiError ? (err.data as { message?: string } | null)?.message : undefined
      setError(serverMessage || 'Không nộp được bài, thử lại sau nhé.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleRetry() {
    setResult(null)
    setAnswers({})
    // Xáo lại để lần làm thứ hai không chỉ là nhớ vị trí đáp án.
    if (topic) setExercises(shuffleForPractice(topic.exercises))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="mx-auto max-w-3xl">
        <ListeningBreadcrumb items={[{ label: '📐 Ngữ pháp', to: '/app/grammar' }, { label: 'Không tìm thấy' }]} />
        <Alert tone="danger">{error ?? 'Không tìm thấy chủ điểm này.'}</Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <ListeningBreadcrumb
        items={[
          { label: '📐 Ngữ pháp', to: `/app/grammar?level=${topic.level}` },
          { label: topic.titleVi },
        ]}
      />

      <header className="mb-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
          {topic.level}
          {topic.groupLabel && ` · ${topic.groupLabel}`}
        </span>
        <h2 className="mt-3 font-display text-2xl font-bold text-ink">{topic.titleVi}</h2>
        <p className="mt-1 text-sm text-muted">{topic.titleDe}</p>
      </header>

      {topic.theoryMd ? (
        <section className="mb-6 rounded-lg border border-hairline bg-surface p-5">
          <GrammarMarkdown>{topic.theoryMd}</GrammarMarkdown>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() =>
                openTutorWithQuestion(
                  `Giải thích giúp mình chủ điểm ngữ pháp "${topic.titleDe}" (${topic.level}) bằng tiếng Việt, kèm ví dụ.`
                )
              }
              className="rounded-full border border-hairline bg-canvas px-4 py-1.5 text-sm font-medium text-primary transition-colors hover:border-primary/40 hover:bg-surface"
            >
              💬 Hỏi gia sư về chủ điểm này
            </button>
            {/* Mở tab mới: người học đang làm dở bài tập bên dưới, điều hướng đi là mất câu trả lời.
                Có referenceSlug thì nhảy thẳng tới đúng bảng thay vì bắt tự tìm trong 14 bảng. */}
            <a
              href={
                topic.referenceSlug
                  ? `/app/grammar/reference?open=${topic.referenceSlug}`
                  : '/app/grammar/reference'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-hairline bg-canvas px-4 py-1.5 text-sm font-medium text-primary transition-colors hover:border-primary/40 hover:bg-surface"
            >
              📋 Mở bảng tra cứu
            </a>
          </div>
        </section>
      ) : (
        <p className="mb-6 rounded-lg border border-dashed border-hairline p-5 text-sm text-muted">
          Chủ điểm này chưa có phần lý thuyết — bạn vẫn luyện được bài tập bên dưới.
        </p>
      )}

      {error && <Alert tone="danger">{error}</Alert>}

      {exercises.length === 0 ? (
        <p className="rounded-lg border border-dashed border-hairline p-5 text-sm text-muted">
          Chủ điểm này chưa có bài tập nào.
        </p>
      ) : (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-ink">Bài tập</h3>
            {result && (
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  result.correctCount === result.totalCount
                    ? 'bg-success-bg text-success'
                    : 'bg-accent/20 text-primary'
                }`}
              >
                Đúng {result.correctCount}/{result.totalCount}
              </span>
            )}
          </div>

          <ol className="space-y-3">
            {exercises.map((exercise, index) => (
              <li key={exercise.id}>
                <ExerciseCard
                  exercise={exercise}
                  index={index}
                  value={answers[exercise.id] ?? ''}
                  onChange={(value) => setAnswers((prev) => ({ ...prev, [exercise.id]: value }))}
                  result={resultByExercise.get(exercise.id) ?? null}
                />
              </li>
            ))}
          </ol>

          <div className="mt-5 flex gap-2">
            {result ? (
              <button
                onClick={handleRetry}
                className="rounded-md border border-hairline bg-canvas px-5 py-2.5 font-semibold text-ink transition-colors hover:bg-surface"
              >
                Làm lại
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-md bg-primary px-6 py-2.5 font-semibold text-canvas transition-colors hover:bg-primary-deep disabled:opacity-50"
              >
                {submitting ? 'Đang chấm...' : 'Nộp bài'}
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const

function ExerciseCard({
  exercise,
  index,
  value,
  onChange,
  result,
}: {
  exercise: ShuffledExercise
  index: number
  value: string
  onChange: (value: string) => void
  result: GrammarSubmitResult['results'][number] | null
}) {
  const options = [exercise.optionA, exercise.optionB, exercise.optionC, exercise.optionD]
  const graded = result !== null

  const borderTone = !graded
    ? 'border-hairline'
    : result.correct
      ? 'border-success'
      : 'border-danger'

  return (
    <div className={`rounded-lg border bg-surface p-4 ${borderTone}`}>
      <p className="text-sm font-medium text-ink">
        <span className="mr-2 text-muted">{index + 1}.</span>
        {exercise.exerciseType === 'WORD_ORDER' ? (
          <>Sắp xếp thành câu đúng: <span className="font-normal italic">{exercise.promptDe}</span></>
        ) : exercise.exerciseType === 'ERROR_CORRECTION' ? (
          <>
            Câu sau có một lỗi — viết lại cho đúng:{' '}
            {/* Gạch chân lượn sóng đỏ: ám hiệu "có lỗi ở đây" mà ai cũng đọc được ngay, nhưng
                không chỉ ra lỗi nằm ở từ nào. */}
            <span className="font-normal italic underline decoration-danger decoration-wavy underline-offset-4">
              {exercise.promptDe}
            </span>
          </>
        ) : (
          exercise.promptDe
        )}
      </p>
      {exercise.hintVi && <p className="mt-1 text-xs text-muted">Gợi ý: {exercise.hintVi}</p>}

      {exercise.exerciseType === 'MULTIPLE_CHOICE' ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {options.map((option, i) =>
            option === null ? null : (
              <label
                key={OPTION_KEYS[i]}
                className={`flex cursor-pointer items-center gap-2 rounded-sm border px-3 py-2 text-sm transition-colors ${
                  value === OPTION_KEYS[i]
                    ? 'border-primary bg-primary/10 text-primary-deep'
                    : 'border-hairline bg-canvas text-ink hover:border-primary/40'
                }`}
              >
                <input
                  type="radio"
                  name={`exercise-${exercise.id}`}
                  value={OPTION_KEYS[i]}
                  checked={value === OPTION_KEYS[i]}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={graded}
                  className="accent-primary"
                />
                <span className="font-medium text-muted">{OPTION_KEYS[i]}.</span> {option}
              </label>
            )
          )}
        </div>
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={graded}
          placeholder={
            exercise.exerciseType === 'WORD_ORDER' || exercise.exerciseType === 'ERROR_CORRECTION'
              ? 'Gõ cả câu...'
              : 'Điền vào chỗ trống...'
          }
          className="mt-3 w-full rounded-sm border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-surface"
        />
      )}

      {graded && (
        <div className="mt-3 border-t border-hairline pt-3 text-sm">
          <p className={result.correct ? 'font-medium text-success' : 'font-medium text-danger'}>
            {result.correct ? '✓ Đúng rồi!' : `✗ Đáp án đúng: ${result.correctAnswer.split('/').join(' hoặc ')}`}
          </p>
          {result.explanationVi && <p className="mt-1 text-muted">{result.explanationVi}</p>}
        </div>
      )}
    </div>
  )
}
