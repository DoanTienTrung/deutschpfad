import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AnswerFeedback, Breadcrumb, Button, ButtonLink, Input, Note, Radio, Skeleton, buttonClass, cn } from '@kit'
import { getGrammarTopic, submitGrammarAnswers } from '../api/grammarApi'
import { getTranslationSetForGrammar } from '../api/translationApi'
import type { GrammarSubmitResult, GrammarTopicDetail } from '../api/types'
import { shuffleForPractice, type ShuffledExercise } from '../lib/shuffleExercises'
import { ApiError } from '../api/client'
import { openTutorWithQuestion } from '../lib/tutorChat'
import GrammarMarkdown from '../components/grammar/GrammarMarkdown'

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
  const [translationSetId, setTranslationSetId] = useState<number | null>(null)

  useEffect(() => {
    getTranslationSetForGrammar(slug)
      .then((r) => setTranslationSetId(r.id))
      .catch(() => setTranslationSetId(null))
  }, [slug])

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
      <div className="mx-auto max-w-lesen space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="mx-auto max-w-lesen">
        <Breadcrumb items={[{ label: 'Ngữ pháp', to: '/app/grammar' }, { label: 'Không tìm thấy' }]} />
        <Note tone="bad" className="mb-4">{error ?? 'Không tìm thấy chủ điểm này.'}</Note>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lesen">
      <Breadcrumb
        items={[
          { label: 'Ngữ pháp', to: `/app/grammar?level=${topic.level}` },
          { label: topic.titleVi },
        ]}
      />

      <header className="mb-6">
        <span className="inline-flex items-center gap-2 rounded-rund border border-linie bg-karteikarte-innen px-3 py-1 text-xs font-bold tracking-widest text-radiert uppercase">
          {topic.level}
          {topic.groupLabel && ` · ${topic.groupLabel}`}
        </span>
        <h2 className="mt-3 font-display text-2xl font-bold text-bleistift">{topic.titleVi}</h2>
        <p className="mt-1 text-sm text-radiert">{topic.titleDe}</p>
      </header>

      {topic.theoryMd ? (
        <section className="mb-6 rounded-karte border border-linie bg-karteikarte-innen p-5">
          <GrammarMarkdown>{topic.theoryMd}</GrammarMarkdown>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm"
              onClick={() =>
                openTutorWithQuestion(
                  `Giải thích giúp mình chủ điểm ngữ pháp "${topic.titleDe}" (${topic.level}) bằng tiếng Việt, kèm ví dụ.`
                )
              }>
              Hỏi gia sư về chủ điểm này
            </Button>
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
              className={buttonClass('secondary', 'sm')}
            >
              Mở bảng tra cứu
            </a>
            {translationSetId && (
              <ButtonLink to={`/app/writing/translate/${translationSetId}`} variant="secondary" size="sm">
                Luyện dịch chủ điểm này
                </ButtonLink>
            )}
          </div>
        </section>
      ) : (
        <p className="mb-6 rounded-karte border border-dashed border-linie p-5 text-sm text-radiert">
          Chủ điểm này chưa có phần lý thuyết - bạn vẫn luyện được bài tập bên dưới.
        </p>
      )}

      {error && <Note tone="bad" className="mb-4">{error}</Note>}

      {exercises.length === 0 ? (
        <p className="rounded-karte border border-dashed border-linie p-5 text-sm text-radiert">
          Chủ điểm này chưa có bài tập nào.
        </p>
      ) : (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-bleistift">Bài tập</h3>
            {result && (
              <span
                className={`rounded-rund px-3 py-1 text-sm font-semibold ${
                  result.correctCount === result.totalCount
                    ? 'bg-aufstieg-soft text-aufstieg'
                    : 'bg-tinte-soft text-tinte'
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
              <Button variant="secondary"
                onClick={handleRetry}>
                Làm lại
              </Button>
            ) : (
              <Button variant="primary" className="disabled:opacity-50"
                onClick={handleSubmit}
                disabled={submitting}>
                {submitting ? 'Đang chấm...' : 'Nộp bài'}
              </Button>
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
    ? 'border-linie'
    : result.correct
      ? 'border-aufstieg'
      : 'border-rotstift'

  return (
    <div className={`rounded-karte border bg-karteikarte-innen p-4 ${borderTone}`}>
      <p className="text-sm font-medium text-bleistift">
        <span className="mr-2 text-radiert">{index + 1}.</span>
        {exercise.exerciseType === 'WORD_ORDER' ? (
          <>Sắp xếp thành câu đúng: <span className="font-normal italic">{exercise.promptDe}</span></>
        ) : exercise.exerciseType === 'ERROR_CORRECTION' ? (
          <>
            Câu sau có một lỗi - viết lại cho đúng:{' '}
            {/* Gạch chân lượn sóng đỏ: ám hiệu "có lỗi ở đây" mà ai cũng đọc được ngay, nhưng
                không chỉ ra lỗi nằm ở từ nào. */}
            <span className="font-normal italic underline decoration-rotstift decoration-wavy underline-offset-4">
              {exercise.promptDe}
            </span>
          </>
        ) : (
          exercise.promptDe
        )}
      </p>
      {exercise.hintVi && <p className="mt-1 text-xs text-radiert">Gợi ý: {exercise.hintVi}</p>}

      {exercise.exerciseType === 'MULTIPLE_CHOICE' ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {options.map((option, i) =>
            option === null ? null : (
              <Radio key={OPTION_KEYS[i]} name={`exercise-${exercise.id}`} value={OPTION_KEYS[i]} checked={value === OPTION_KEYS[i]}
                onChange={(e) => onChange(e.target.value)} disabled={graded}
                className={cn('rounded-karte border px-3 py-2', value === OPTION_KEYS[i] ? 'border-bleistift bg-bleistift/10' : 'border-kante bg-karteikarte hover:bg-karteikarte-innen')}
                label={<><span className="font-medium text-radiert">{OPTION_KEYS[i]}.</span> {option}</>} />
            )
          )}
        </div>
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={graded}
          placeholder={
            exercise.exerciseType === 'WORD_ORDER' || exercise.exerciseType === 'ERROR_CORRECTION'
              ? 'Gõ cả câu...'
              : 'Điền vào chỗ trống...'
          }
          className="mt-3 w-full"
        />
      )}

      {graded && (
        <div className="mt-3 border-t border-linie pt-3 text-sm">
          <AnswerFeedback correct={result.correct}
            title={result.correct ? 'Đúng rồi.' : `Đáp án đúng: ${result.correctAnswer.split('/').join(' hoặc ')}`} />
          {result.explanationVi && <p className="mt-1 text-radiert">{result.explanationVi}</p>}
        </div>
      )}
    </div>
  )
}
