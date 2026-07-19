import { useEffect, useState } from 'react'
import {
  listReadingAdmin,
  createReadingPassage,
  updateReadingPassage,
  deleteReadingPassage,
  generateReadingPassageDraft,
  type ReadingQuestionAdminInput,
} from '../../api/readingApi'
import type { ReadingCategory, ReadingPassageAdmin } from '../../api/types'
import { ApiError } from '../../api/client'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']

const EMPTY_QUESTION: ReadingQuestionAdminInput = {
  questionText: '',
  questionType: 'MULTIPLE_CHOICE',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
  explanation: '',
}

type MatchingOptionInput = { letter: string; text: string }
const EMPTY_MATCHING_OPTION: MatchingOptionInput = { letter: '', text: '' }

export default function AdminReadingPage() {
  const [passages, setPassages] = useState<ReadingPassageAdmin[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [levelMin, setLevelMin] = useState('A1')
  const [levelMax, setLevelMax] = useState('A1')
  const [category, setCategory] = useState<ReadingCategory>('EXAM')
  const [topic, setTopic] = useState('')
  const [sourceLabel, setSourceLabel] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [orderIndex, setOrderIndex] = useState(1)
  const [content, setContent] = useState('')
  const [questions, setQuestions] = useState<ReadingQuestionAdminInput[]>([{ ...EMPTY_QUESTION }])
  const [matchingOptions, setMatchingOptions] = useState<MatchingOptionInput[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [draftTopic, setDraftTopic] = useState('')
  const [drafting, setDrafting] = useState(false)

  const topicSuggestions = [...new Set(passages.map((p) => p.topic).filter((t): t is string => !!t))].sort()

  async function load() {
    setPassages(await listReadingAdmin())
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, load() reused by handlers below
    load()
  }, [])

  function resetForm() {
    setEditingId(null)
    setTitle('')
    setLevelMin('A1')
    setLevelMax('A1')
    setCategory('EXAM')
    setTopic('')
    setSourceLabel('')
    setSourceUrl('')
    setOrderIndex(1)
    setContent('')
    setQuestions([{ ...EMPTY_QUESTION }])
    setMatchingOptions([])
  }

  function startEdit(passage: ReadingPassageAdmin) {
    setEditingId(passage.id)
    setTitle(passage.title)
    setLevelMin(passage.levelMin)
    setLevelMax(passage.levelMax)
    setCategory(passage.category)
    setTopic(passage.topic ?? '')
    setSourceLabel(passage.sourceLabel ?? '')
    setSourceUrl(passage.sourceUrl ?? '')
    setOrderIndex(passage.orderIndex)
    setContent(passage.content)
    setQuestions(
      passage.questions.map((q) => ({
        questionText: q.questionText,
        questionType: q.questionType,
        optionA: q.optionA ?? '',
        optionB: q.optionB ?? '',
        optionC: q.optionC ?? '',
        optionD: q.optionD ?? '',
        correctAnswer: q.correctAnswer,
        explanation: q.explanation ?? '',
      }))
    )
    setMatchingOptions(passage.matchingOptions.map((o) => ({ letter: o.letter, text: o.text })))
  }

  function updateQuestion(index: number, patch: Partial<ReadingQuestionAdminInput>) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)))
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, { ...EMPTY_QUESTION }])
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  function updateMatchingOption(index: number, patch: Partial<MatchingOptionInput>) {
    setMatchingOptions((prev) => prev.map((o, i) => (i === index ? { ...o, ...patch } : o)))
  }

  function addMatchingOption() {
    setMatchingOptions((prev) => [...prev, { ...EMPTY_MATCHING_OPTION }])
  }

  function removeMatchingOption(index: number) {
    setMatchingOptions((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    setError(null)
    setSaving(true)
    try {
      const request = {
        title,
        levelMin,
        levelMax,
        topic: topic || null,
        sourceLabel: sourceLabel.trim() || null,
        sourceUrl: sourceUrl.trim() || null,
        orderIndex,
        content,
        category,
        // Blank rows (the default empty first row, or extra rows an admin added then abandoned)
        // are dropped rather than sent as-is -- for ARTICLE passages this is what lets the backend
        // tell "no questions supplied" apart from "questions supplied" and fall back to AI drafting.
        questions: questions
          .filter((q) => q.questionText.trim())
          .map((q) => ({
            ...q,
            optionA: q.questionType === 'MULTIPLE_CHOICE' ? q.optionA || null : null,
            optionB: q.questionType === 'MULTIPLE_CHOICE' ? q.optionB || null : null,
            optionC: q.questionType === 'MULTIPLE_CHOICE' ? q.optionC || null : null,
            optionD: q.questionType === 'MULTIPLE_CHOICE' ? q.optionD || null : null,
            explanation: q.explanation || null,
          })),
        matchingOptions,
      }
      if (editingId) {
        await updateReadingPassage(editingId, request)
      } else {
        await createReadingPassage(request)
      }
      resetForm()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? String((err.data as { message?: string })?.message) : 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  async function handleGenerateDraft() {
    setError(null)
    setDrafting(true)
    try {
      const result = await generateReadingPassageDraft(draftTopic, levelMin)
      setContent(result.content)
      if (!topic) setTopic(draftTopic)
    } catch (err) {
      setError(err instanceof ApiError ? String((err.data as { message?: string })?.message) : 'Không soạn được bài đọc, thử lại sau')
    } finally {
      setDrafting(false)
    }
  }

  async function handleDelete(id: number) {
    setError(null)
    try {
      await deleteReadingPassage(id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? String((err.data as { message?: string })?.message) : 'Có lỗi xảy ra')
    }
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-bold text-ink">Quản lý Bài đọc</h2>

      {error && <div className="mb-4 rounded-sm bg-danger-bg p-3 text-sm text-danger">{error}</div>}

      <div className="mb-6 grid grid-cols-1 gap-2 rounded-sm border border-hairline bg-white p-4 sm:grid-cols-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tên bài đọc"
          className="sm:col-span-2 rounded-sm border border-hairline px-3 py-2"
        />
        <select
          value={levelMin}
          onChange={(e) => setLevelMin(e.target.value)}
          className="rounded-sm border border-hairline px-3 py-2"
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>Từ {l}</option>
          ))}
        </select>
        <select
          value={levelMax}
          onChange={(e) => setLevelMax(e.target.value)}
          className="rounded-sm border border-hairline px-3 py-2"
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>Đến {l}</option>
          ))}
        </select>
        <input
          type="number"
          value={orderIndex}
          onChange={(e) => setOrderIndex(Number(e.target.value))}
          placeholder="Thứ tự"
          className="rounded-sm border border-hairline px-3 py-2"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ReadingCategory)}
          className="rounded-sm border border-hairline px-3 py-2"
        >
          <option value="EXAM">Loại: Đề thi</option>
          <option value="ARTICLE">Loại: Sách, Báo</option>
        </select>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Chủ đề (tuỳ chọn)"
          list="reading-topic-suggestions"
          className="rounded-sm border border-hairline px-3 py-2"
        />
        <datalist id="reading-topic-suggestions">
          {topicSuggestions.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
        <input
          value={sourceLabel}
          onChange={(e) => setSourceLabel(e.target.value)}
          placeholder="Tên nguồn hiển thị (tuỳ chọn)"
          className="col-span-2 rounded-sm border border-hairline px-3 py-2"
        />
        <input
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="Link gốc tới nguồn (tuỳ chọn)"
          className="col-span-2 rounded-sm border border-hairline px-3 py-2"
        />
        {category === 'ARTICLE' && (
          <div className="col-span-2 flex items-end gap-2 rounded-sm border border-dashed border-hairline bg-surface p-3">
            <div className="flex-1">
              <p className="mb-1 text-xs font-medium text-ink">AI soạn nháp bài đọc (nội dung gốc, không sao chép báo thật)</p>
              <input
                value={draftTopic}
                onChange={(e) => setDraftTopic(e.target.value)}
                placeholder="Chủ đề, vd. bảo vệ môi trường"
                className="w-full rounded-sm border border-hairline px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={handleGenerateDraft}
              disabled={drafting || !draftTopic.trim()}
              className="shrink-0 rounded-sm border border-hairline bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-accent/10 disabled:opacity-50"
            >
              {drafting ? 'Đang soạn...' : 'AI soạn bài đọc'}
            </button>
          </div>
        )}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Nội dung đoạn văn (tiếng Đức)"
          rows={8}
          className="col-span-2 rounded-sm border border-hairline px-3 py-2"
        />

        <div className="col-span-2 mt-2 space-y-3">
          <p className="text-sm font-semibold text-ink">
            Kho lựa chọn (dùng chung cho câu dạng "Nối câu")
          </p>
          <p className="text-xs text-muted">
            Vd. các quảng cáo A-J trong bài "nối tình huống với quảng cáo phù hợp" — mỗi câu hỏi dạng
            Nối câu sẽ chọn 1 chữ cái từ đây, hoặc "0" nếu không có lựa chọn nào phù hợp.
          </p>
          {matchingOptions.map((opt, i) => (
            <div key={i} className="flex items-start gap-2">
              <input
                value={opt.letter}
                onChange={(e) => updateMatchingOption(i, { letter: e.target.value })}
                placeholder="A"
                className="w-14 rounded-sm border border-hairline px-2 py-2 text-center"
              />
              <input
                value={opt.text}
                onChange={(e) => updateMatchingOption(i, { text: e.target.value })}
                placeholder="Nội dung lựa chọn"
                className="flex-1 rounded-sm border border-hairline px-3 py-2"
              />
              <button onClick={() => removeMatchingOption(i)} className="px-2 py-2 text-xs text-danger hover:underline">
                Xoá
              </button>
            </div>
          ))}
          <button onClick={addMatchingOption} className="rounded-sm border border-hairline px-3 py-1.5 text-sm text-ink">
            + Thêm lựa chọn
          </button>
        </div>

        <div className="col-span-2 mt-4 space-y-3">
          <p className="text-sm font-semibold text-ink">Câu hỏi</p>
          {category === 'ARTICLE' && (
            <p className="text-xs text-muted">
              Để trống toàn bộ câu hỏi bên dưới để AI tự soạn 5-7 câu trắc nghiệm sau khi lưu, hoặc
              tự soạn tay nếu muốn kiểm soát chính xác.
            </p>
          )}
          {questions.map((q, i) => (
            <div key={i} className="rounded-sm border border-hairline p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted">Câu {i + 1}</span>
                <button onClick={() => removeQuestion(i)} className="text-xs text-danger hover:underline">
                  Xoá câu này
                </button>
              </div>
              <input
                value={q.questionText}
                onChange={(e) => updateQuestion(i, { questionText: e.target.value })}
                placeholder="Nội dung câu hỏi"
                className="mb-2 w-full rounded-sm border border-hairline px-3 py-2"
              />
              <select
                value={q.questionType}
                onChange={(e) => {
                  const type = e.target.value as ReadingQuestionAdminInput['questionType']
                  const defaultAnswer =
                    type === 'TRUE_FALSE' ? 'true' : type === 'MATCHING' ? '0' : type === 'MULTIPLE_CHOICE' ? 'A' : ''
                  updateQuestion(i, { questionType: type, correctAnswer: defaultAnswer })
                }}
                className="mb-2 rounded-sm border border-hairline px-3 py-2"
              >
                <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                <option value="TRUE_FALSE">Đúng / Sai</option>
                <option value="MATCHING">Nối câu</option>
                <option value="FILL_BLANK">Điền từ</option>
                <option value="SHORT_ANSWER">Trả lời ngắn (tự đối chiếu)</option>
              </select>

              {q.questionType === 'FILL_BLANK' ? (
                <input
                  value={q.correctAnswer}
                  onChange={(e) => updateQuestion(i, { correctAnswer: e.target.value })}
                  placeholder="Đáp án đúng (nhiều đáp án cách nhau bởi /, vd: Etiketten/Etikett)"
                  className="w-full rounded-sm border border-hairline px-3 py-2"
                />
              ) : q.questionType === 'SHORT_ANSWER' ? (
                <textarea
                  value={q.correctAnswer}
                  onChange={(e) => updateQuestion(i, { correctAnswer: e.target.value })}
                  placeholder="Đáp án mẫu (hiện cho người học tự đối chiếu, không chấm điểm tự động)"
                  rows={2}
                  className="w-full rounded-sm border border-hairline px-3 py-2"
                />
              ) : q.questionType === 'MATCHING' ? (
                <select
                  value={q.correctAnswer}
                  onChange={(e) => updateQuestion(i, { correctAnswer: e.target.value })}
                  className="rounded-sm border border-hairline px-3 py-2"
                >
                  <option value="0">Đáp án đúng: 0 (không có lựa chọn phù hợp)</option>
                  {matchingOptions.filter((o) => o.letter).map((o) => (
                    <option key={o.letter} value={o.letter}>Đáp án đúng: {o.letter}</option>
                  ))}
                </select>
              ) : q.questionType === 'MULTIPLE_CHOICE' ? (
                <div className="space-y-2">
                  <input
                    value={q.optionA ?? ''}
                    onChange={(e) => updateQuestion(i, { optionA: e.target.value })}
                    placeholder="Đáp án A"
                    className="w-full rounded-sm border border-hairline px-3 py-2"
                  />
                  <input
                    value={q.optionB ?? ''}
                    onChange={(e) => updateQuestion(i, { optionB: e.target.value })}
                    placeholder="Đáp án B"
                    className="w-full rounded-sm border border-hairline px-3 py-2"
                  />
                  <input
                    value={q.optionC ?? ''}
                    onChange={(e) => updateQuestion(i, { optionC: e.target.value })}
                    placeholder="Đáp án C (tuỳ chọn)"
                    className="w-full rounded-sm border border-hairline px-3 py-2"
                  />
                  <input
                    value={q.optionD ?? ''}
                    onChange={(e) => updateQuestion(i, { optionD: e.target.value })}
                    placeholder="Đáp án D (tuỳ chọn)"
                    className="w-full rounded-sm border border-hairline px-3 py-2"
                  />
                  <select
                    value={q.correctAnswer}
                    onChange={(e) => updateQuestion(i, { correctAnswer: e.target.value })}
                    className="rounded-sm border border-hairline px-3 py-2"
                  >
                    <option value="A">Đáp án đúng: A</option>
                    <option value="B">Đáp án đúng: B</option>
                    <option value="C">Đáp án đúng: C</option>
                    <option value="D">Đáp án đúng: D</option>
                  </select>
                </div>
              ) : (
                <select
                  value={q.correctAnswer}
                  onChange={(e) => updateQuestion(i, { correctAnswer: e.target.value })}
                  className="rounded-sm border border-hairline px-3 py-2"
                >
                  <option value="true">Đáp án đúng: Đúng</option>
                  <option value="false">Đáp án đúng: Sai</option>
                </select>
              )}

              <input
                value={q.explanation ?? ''}
                onChange={(e) => updateQuestion(i, { explanation: e.target.value })}
                placeholder="Giải thích (tuỳ chọn, hiện sau khi nộp bài)"
                className="mt-2 w-full rounded-sm border border-hairline px-3 py-2"
              />
            </div>
          ))}
          <button onClick={addQuestion} className="rounded-sm border border-hairline px-3 py-1.5 text-sm text-ink">
            + Thêm câu hỏi
          </button>
        </div>

        <div className="col-span-2 mt-2 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-sm bg-primary px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : editingId ? 'Cập nhật bài đọc' : 'Thêm bài đọc'}
          </button>
          {editingId && (
            <button onClick={resetForm} className="rounded-sm border border-hairline px-4 py-2 text-ink">
              Huỷ
            </button>
          )}
        </div>
      </div>

      <ul className="space-y-2">
        {passages.map((passage) => (
          <li
            key={passage.id}
            className="flex items-center justify-between rounded-sm border border-hairline bg-white p-3"
          >
            <span>
              <strong>{passage.levelMin === passage.levelMax ? passage.levelMin : `${passage.levelMin}-${passage.levelMax}`}</strong> — Bài {passage.orderIndex}: {passage.title}
              <span className="ml-2 text-xs text-muted">[{passage.category === 'EXAM' ? 'Đề thi' : 'Sách, Báo'}]</span>
              {passage.topic && <span className="ml-2 text-xs text-muted">#{passage.topic}</span>}
              <span className="ml-2 text-xs text-muted">[{passage.questions.length} câu hỏi]</span>
            </span>
            <span className="flex gap-3">
              <button onClick={() => startEdit(passage)} className="text-sm text-primary hover:underline">
                Sửa
              </button>
              <button onClick={() => handleDelete(passage.id)} className="text-sm text-danger hover:underline">
                Xoá
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
