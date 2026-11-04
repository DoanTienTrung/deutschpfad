import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Breadcrumb, Button, Chip, Input, Radio, Textarea } from '@kit'
import { getReadingPassage, recordReadingProgress, submitReadingAnswers } from '../api/readingApi'
import type { ReadingPassageDetail, ReadingSubmitResult } from '../api/types'
import ClickableWordText from '../components/reading/ClickableWordText'

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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- đổi bài thì hiện trạng thái đang tải trước khi gọi lại
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
      <div className="mx-auto max-w-seite space-y-4">
        <div className="h-48 animate-pulse rounded-karte bg-karteikarte-innen sm:h-64" />
        <div className="h-40 animate-pulse rounded-karte bg-karteikarte-innen" />
      </div>
    )
  if (!passage) return <p className="mx-auto max-w-lesen text-radiert">Không tìm thấy bài đọc.</p>

  const resultByQuestionId = new Map((result?.results ?? []).map((r) => [r.questionId, r]))
  const allAnswered = passage.questions.every((q) => answers[q.id]?.trim())
  // "Đọc qua Đề thi" simulates the real Goethe test: no dictionary lookup or translation until
  // the learner has submitted, so the exam actually measures unaided reading comprehension.
  const isExam = passage.category === 'EXAM'
  const examLocked = isExam && !result

  return (
    <div className="mx-auto max-w-6xl">
      <Breadcrumb
        items={[{ label: 'Đọc', onClick: () => navigate(-1) }, { label: passage.title }]}
      />

      {passage.imageUrl && (
        <div className="relative mb-4 h-48 w-full overflow-hidden rounded-karte bg-karteikarte-innen sm:h-64 lg:h-80">
          <img src={passage.imageUrl} alt="" className="h-full w-full object-cover" />
          {passage.imageAttributionName && passage.imageAttributionUrl && (
            <a
              href={passage.imageAttributionUrl}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-2 right-2 rounded-karte bg-foto-etikett px-2 py-1 text-xs text-foto-etikett-schrift hover:underline"
            >
              Ảnh: {passage.imageAttributionName}
            </a>
          )}
        </div>
      )}

      <h1 className="mb-1 text-xl font-bold text-bleistift">{passage.title}</h1>
      <p className="mb-4 text-sm text-radiert">
        {passage.levelMin === passage.levelMax ? passage.levelMin : `${passage.levelMin}-${passage.levelMax}`}
        {passage.sourceLabel ? ` · ${passage.sourceLabel}` : ''}
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-karte border border-linie p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-radiert">Tiếng Đức</p>
          <ClickableWordText passageId={passage.id} content={passage.content} readOnly={examLocked} />

          {passage.matchingOptions.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-linie pt-4">
              <p className="text-xs font-semibold uppercase text-radiert">Các lựa chọn</p>
              {passage.matchingOptions.map((opt) => (
                <p key={opt.letter} className="text-sm text-bleistift">
                  <span className="font-bold text-bleistift">{opt.letter}</span> {opt.text}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-karte border border-linie p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-radiert">Bản dịch tiếng Việt</p>
            {!isExam && passage.contentTranslation && (
              <Button variant="ghost" size="sm"
                onClick={() => setShowTranslation((v) => !v)}>
                {showTranslation ? 'Ẩn bản dịch' : 'Hiện bản dịch'}
              </Button>
            )}
          </div>

          {examLocked ? (
            <p className="text-sm text-radiert">
              Bản dịch sẽ hiện sau khi bạn nộp bài - giống điều kiện thi thật, không được tra từ điển hay xem bản dịch khi đang làm bài.
            </p>
          ) : !passage.contentTranslation ? (
            <p className="text-sm text-radiert">Chưa có bản dịch cho bài này.</p>
          ) : !isExam && !showTranslation ? (
            <p className="text-sm text-radiert">Bản dịch đang ẩn.</p>
          ) : (
            <div className="space-y-3">
              {passage.contentTranslation.split(/\n\s*\n/).map((paragraph, i) => (
                <p key={i} className="text-sm leading-relaxed text-bleistift">
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
                <div key={question.id} className="rounded-karte border border-linie p-4">
                  <p className="mb-3 font-medium text-bleistift">
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
                          <Radio key={opt.letter} name={`question-${question.id}`} checked={answers[question.id] === opt.letter}
                            onChange={() => setAnswer(question.id, opt.letter)} disabled={!!result} label={opt.text} className="py-1.5" />
                        ))}
                    </div>
                  ) : question.questionType === 'MATCHING' ? (
                    <div className="flex flex-wrap gap-2">
                      {[...passage.matchingOptions.map((opt) => opt.letter), '0'].map((letter) => (
                        <Chip key={letter} selected={answers[question.id] === letter} onClick={() => setAnswer(question.id, letter)}
                          disabled={!!result} className="min-w-11 justify-center uppercase">
                          {letter}
                        </Chip>
                      ))}
                    </div>
                  ) : question.questionType === 'FILL_BLANK' ? (
                    <Input
                      type="text"
                      value={answers[question.id] ?? ''}
                      onChange={(e) => setAnswer(question.id, e.target.value)}
                      disabled={!!result}
                      placeholder="Điền từ..."
                      className="w-full"
                    />
                  ) : question.questionType === 'SHORT_ANSWER' ? (
                    <Textarea
                      value={answers[question.id] ?? ''}
                      onChange={(e) => setAnswer(question.id, e.target.value)}
                      disabled={!!result}
                      placeholder="Viết từ khóa hoặc tóm tắt ngắn..."
                      rows={2}
                      className="w-full"
                    />
                  ) : (
                    <div className="flex gap-4">
                      {(['true', 'false'] as const).map((value) => (
                        <Radio key={value} name={`question-${question.id}`} checked={answers[question.id] === value}
                          onChange={() => setAnswer(question.id, value)} disabled={!!result} label={value === 'true' ? 'Đúng' : 'Sai'} />
                      ))}
                    </div>
                  )}

                  {questionResult && question.questionType === 'SHORT_ANSWER' && (
                    <div className="mt-3 rounded-karte bg-karteikarte-innen p-3 text-sm">
                      <p className="text-radiert">
                        Câu trả lời của bạn: <span className="text-bleistift">{questionResult.submittedAnswer || '(bỏ trống)'}</span>
                      </p>
                      <p className="mt-1 text-radiert">
                        Đáp án mẫu (tự đối chiếu): <span className="font-medium text-bleistift">{questionResult.correctAnswer}</span>
                      </p>
                      {questionResult.explanation && <p className="mt-1 text-radiert">{questionResult.explanation}</p>}
                    </div>
                  )}
                  {questionResult && question.questionType !== 'SHORT_ANSWER' && (
                    <p className={`mt-3 text-sm ${questionResult.correct ? 'text-aufstieg' : 'text-rotstift'}`}>
                      {questionResult.correct ? 'Đúng' : `Sai - đáp án đúng: ${questionResult.correctAnswer}`}
                      {questionResult.explanation && (
                        <span className="ml-1 block text-radiert">{questionResult.explanation}</span>
                      )}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {!result && (
            <Button variant="primary" className="mt-6 disabled:opacity-50"
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}>
              {submitting ? 'Đang chấm...' : 'Nộp bài'}
            </Button>
          )}

          {result && (
            <p className="mt-6 text-lg font-semibold text-bleistift">
              Kết quả: {result.correctCount}/{result.totalCount} câu đúng
            </p>
          )}
      </div>
    </div>
  )
}
