import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getReadingPassage, recordReadingProgress, submitReadingAnswers } from '../api/readingApi'
import type { ReadingPassageDetail, ReadingSubmitResult } from '../api/types'
import ClickableWordText from '../components/reading/ClickableWordText'
import ListeningBreadcrumb from '../components/listening/ListeningBreadcrumb'

export default function ReadingPracticePage() {
  const { passageId } = useParams<{ passageId: string }>()
  const navigate = useNavigate()
  const id = Number(passageId)

  const [passage, setPassage] = useState<ReadingPassageDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [result, setResult] = useState<ReadingSubmitResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showTranslation, setShowTranslation] = useState(true)
  const hasRecordedProgressRef = useRef(false)

  useEffect(() => {
    setLoading(true)
    getReadingPassage(id)
      .then(setPassage)
      .finally(() => setLoading(false))
  }, [id])

  function setAnswer(questionId: number, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  async function handleSubmit() {
    if (!passage) return
    setSubmitting(true)
    try {
      const payload = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: Number(questionId),
        answer,
      }))
      const res = await submitReadingAnswers(passage.id, payload)
      setResult(res)
      if (!hasRecordedProgressRef.current) {
        hasRecordedProgressRef.current = true
        recordReadingProgress().catch(() => {})
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading)
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="h-48 animate-pulse rounded-lg bg-surface sm:h-64" />
        <div className="h-40 animate-pulse rounded-lg bg-surface" />
      </div>
    )
  if (!passage) return <p className="mx-auto max-w-3xl text-muted">Không tìm thấy bài đọc.</p>

  const resultByQuestionId = new Map((result?.results ?? []).map((r) => [r.questionId, r]))
  const allAnswered = passage.questions.every((q) => answers[q.id]?.trim())
  // "Đọc qua Đề thi" simulates the real Goethe test: no dictionary lookup or translation until
  // the learner has submitted, so the exam actually measures unaided reading comprehension.
  const isExam = passage.category === 'EXAM'
  const examLocked = isExam && !result

  return (
    <div className="mx-auto max-w-6xl">
      <ListeningBreadcrumb
        items={[{ label: '📖 Đọc', onClick: () => navigate(-1) }, { label: passage.title }]}
      />

      {passage.imageUrl && (
        <div className="relative mb-4 h-48 w-full overflow-hidden rounded-lg bg-surface sm:h-64 lg:h-80">
          <img src={passage.imageUrl} alt="" className="h-full w-full object-cover" />
          {passage.imageAttributionName && passage.imageAttributionUrl && (
            <a
              href={passage.imageAttributionUrl}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-2 right-2 rounded-sm bg-black/50 px-2 py-1 text-xs text-white/90 hover:underline"
            >
              Ảnh: {passage.imageAttributionName}
            </a>
          )}
        </div>
      )}

      <h1 className="mb-1 text-xl font-bold text-ink">{passage.title}</h1>
      <p className="mb-4 text-sm text-muted">
        {passage.levelMin === passage.levelMax ? passage.levelMin : `${passage.levelMin}-${passage.levelMax}`}
        {passage.sourceLabel ? ` · ${passage.sourceLabel}` : ''}
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-hairline p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Tiếng Đức</p>
          <ClickableWordText passageId={passage.id} content={passage.content} readOnly={examLocked} />

          {passage.matchingOptions.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-hairline pt-4">
              <p className="text-xs font-semibold uppercase text-muted">Các lựa chọn</p>
              {passage.matchingOptions.map((opt) => (
                <p key={opt.letter} className="text-sm text-ink">
                  <span className="font-bold text-primary">{opt.letter}</span> {opt.text}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-hairline p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Bản dịch tiếng Việt</p>
            {!isExam && passage.contentTranslation && (
              <button
                onClick={() => setShowTranslation((v) => !v)}
                className="text-xs font-medium text-primary hover:underline"
              >
                {showTranslation ? 'Ẩn bản dịch' : 'Hiện bản dịch'}
              </button>
            )}
          </div>

          {examLocked ? (
            <p className="text-sm text-muted">
              Bản dịch sẽ hiện sau khi bạn nộp bài — giống điều kiện thi thật, không được tra từ điển hay xem bản dịch khi đang làm bài.
            </p>
          ) : !passage.contentTranslation ? (
            <p className="text-sm text-muted">Chưa có bản dịch cho bài này.</p>
          ) : !isExam && !showTranslation ? (
            <p className="text-sm text-muted">Bản dịch đang ẩn.</p>
          ) : (
            <div className="space-y-3">
              {passage.contentTranslation.split(/\n\s*\n/).map((paragraph, i) => (
                <p key={i} className="text-sm leading-relaxed text-ink">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
          <div className="space-y-6">
            {passage.questions.map((question, qi) => {
              const questionResult = resultByQuestionId.get(question.id)
              return (
                <div key={question.id} className="rounded-lg border border-hairline p-4">
                  <p className="mb-3 font-medium text-ink">
                    {/^\d+[.)]/.test(question.questionText.trim()) ? question.questionText : `${qi + 1}. ${question.questionText}`}
                  </p>

                  {question.questionType === 'MULTIPLE_CHOICE' ? (
                    <div className="space-y-2">
                      {(['A', 'B', 'C', 'D'] as const)
                        .map((letter) => ({
                          letter,
                          text:
                            letter === 'A' ? question.optionA
                              : letter === 'B' ? question.optionB
                              : letter === 'C' ? question.optionC
                              : question.optionD,
                        }))
                        .filter((opt) => opt.text)
                        .map((opt) => (
                          <label key={opt.letter} className="flex items-center gap-2 text-sm text-ink">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              checked={answers[question.id] === opt.letter}
                              onChange={() => setAnswer(question.id, opt.letter)}
                              disabled={!!result}
                            />
                            {opt.text}
                          </label>
                        ))}
                    </div>
                  ) : question.questionType === 'MATCHING' ? (
                    <div className="flex flex-wrap gap-2">
                      {[...passage.matchingOptions.map((opt) => opt.letter), '0'].map((letter) => (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => setAnswer(question.id, letter)}
                          disabled={!!result}
                          className={`h-9 min-w-9 rounded-sm border px-2 text-sm font-semibold uppercase ${
                            answers[question.id] === letter
                              ? 'border-primary bg-primary text-canvas'
                              : 'border-hairline text-ink hover:bg-surface'
                          }`}
                        >
                          {letter}
                        </button>
                      ))}
                    </div>
                  ) : question.questionType === 'FILL_BLANK' ? (
                    <input
                      type="text"
                      value={answers[question.id] ?? ''}
                      onChange={(e) => setAnswer(question.id, e.target.value)}
                      disabled={!!result}
                      placeholder="Điền từ..."
                      className="w-full rounded-sm border border-hairline px-3 py-2 text-sm text-ink"
                    />
                  ) : question.questionType === 'SHORT_ANSWER' ? (
                    <textarea
                      value={answers[question.id] ?? ''}
                      onChange={(e) => setAnswer(question.id, e.target.value)}
                      disabled={!!result}
                      placeholder="Viết từ khóa hoặc tóm tắt ngắn..."
                      rows={2}
                      className="w-full rounded-sm border border-hairline px-3 py-2 text-sm text-ink"
                    />
                  ) : (
                    <div className="flex gap-4">
                      {(['true', 'false'] as const).map((value) => (
                        <label key={value} className="flex items-center gap-2 text-sm text-ink">
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            checked={answers[question.id] === value}
                            onChange={() => setAnswer(question.id, value)}
                            disabled={!!result}
                          />
                          {value === 'true' ? 'Đúng' : 'Sai'}
                        </label>
                      ))}
                    </div>
                  )}

                  {questionResult && question.questionType === 'SHORT_ANSWER' && (
                    <div className="mt-3 rounded-sm bg-surface p-3 text-sm">
                      <p className="text-muted">
                        Câu trả lời của bạn: <span className="text-ink">{questionResult.submittedAnswer || '(bỏ trống)'}</span>
                      </p>
                      <p className="mt-1 text-muted">
                        Đáp án mẫu (tự đối chiếu): <span className="font-medium text-ink">{questionResult.correctAnswer}</span>
                      </p>
                      {questionResult.explanation && <p className="mt-1 text-muted">{questionResult.explanation}</p>}
                    </div>
                  )}
                  {questionResult && question.questionType !== 'SHORT_ANSWER' && (
                    <p className={`mt-3 text-sm ${questionResult.correct ? 'text-success' : 'text-danger'}`}>
                      {questionResult.correct ? '✓ Đúng' : `✗ Sai — đáp án đúng: ${questionResult.correctAnswer}`}
                      {questionResult.explanation && (
                        <span className="ml-1 block text-muted">{questionResult.explanation}</span>
                      )}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {!result && (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-canvas transition-colors hover:bg-primary-deep disabled:opacity-50"
            >
              {submitting ? 'Đang chấm...' : 'Nộp bài'}
            </button>
          )}

          {result && (
            <p className="mt-6 text-lg font-semibold text-ink">
              Kết quả: {result.correctCount}/{result.totalCount} câu đúng
            </p>
          )}
      </div>
    </div>
  )
}
