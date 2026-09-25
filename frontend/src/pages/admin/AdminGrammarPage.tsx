import { useEffect, useState } from 'react'
import {
  createGrammarExercise,
  createGrammarTopic,
  deleteGrammarExercise,
  deleteGrammarTopic,
  generateGrammarExercisesFromAi,
  generateGrammarExercisesFromData,
  generateGrammarTheoryDraft,
  listGrammarTopicsAdmin,
  reviewGrammarExercise,
  updateGrammarTopic,
  createGrammarReferenceTable,
  deleteGrammarReferenceTable,
  listGrammarReferenceTablesAdmin,
  updateGrammarReferenceTable,
  type GrammarArticleKind,
  type GrammarExerciseRequest,
  type GrammarGenerateKind,
  type GrammarKasus,
  type GrammarReferenceTableRequest,
  type GrammarTopicRequest,
} from '../../api/grammarApi'
import type { GrammarExerciseType, GrammarReferenceTable, GrammarTopicAdmin } from '../../api/types'
import { ApiError } from '../../api/client'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']

const EXERCISE_TYPES: { value: GrammarExerciseType; label: string; hint: string }[] = [
  { value: 'FILL_BLANK', label: 'Điền chỗ trống', hint: 'Dùng ___ để đánh dấu chỗ cần điền' },
  { value: 'MULTIPLE_CHOICE', label: 'Trắc nghiệm', hint: 'Đáp án đúng ghi A/B/C/D' },
  { value: 'CONJUGATE', label: 'Chia động từ', hint: 'Dùng ___ , ghi dạng đã chia vào đáp án' },
  { value: 'WORD_ORDER', label: 'Sắp xếp câu', hint: 'Đề là các từ xáo trộn, đáp án là câu hoàn chỉnh' },
  {
    value: 'ERROR_CORRECTION',
    label: 'Sửa lỗi sai',
    hint: 'Đề là câu SAI, đáp án là câu đã sửa đúng',
  },
]

const EMPTY_TOPIC: GrammarTopicRequest = {
  slug: '',
  titleDe: '',
  titleVi: '',
  level: 'A1',
  groupLabel: '',
  orderIndex: 1,
  summaryVi: '',
  theoryMd: '',
}

const EMPTY_REFERENCE: GrammarReferenceTableRequest = {
  slug: '',
  titleVi: '',
  category: '',
  level: null,
  orderIndex: 1,
  contentMd: '',
}

const EMPTY_EXERCISE: GrammarExerciseRequest = {
  exerciseType: 'FILL_BLANK',
  promptDe: '',
  hintVi: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: '',
  explanationVi: '',
  orderIndex: null,
}

export default function AdminGrammarPage() {
  const [topics, setTopics] = useState<GrammarTopicAdmin[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<GrammarTopicRequest>(EMPTY_TOPIC)
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null)
  const [exerciseForm, setExerciseForm] = useState<GrammarExerciseRequest>(EMPTY_EXERCISE)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [generateNote, setGenerateNote] = useState<string | null>(null)
  const [genKind, setGenKind] = useState<GrammarGenerateKind>('ARTICLE')
  const [genCount, setGenCount] = useState(10)
  const [genKasus, setGenKasus] = useState<GrammarKasus>('NOMINATIV')
  const [genArticleKind, setGenArticleKind] = useState<GrammarArticleKind>('DEFINITE')
  const [tab, setTab] = useState<'topics' | 'reference'>('topics')
  const [references, setReferences] = useState<GrammarReferenceTable[]>([])
  const [refEditingId, setRefEditingId] = useState<number | null>(null)
  const [refForm, setRefForm] = useState<GrammarReferenceTableRequest>(EMPTY_REFERENCE)

  async function load() {
    const [loadedTopics, loadedReferences] = await Promise.all([
      listGrammarTopicsAdmin(),
      listGrammarReferenceTablesAdmin(),
    ])
    setTopics(loadedTopics)
    setReferences(loadedReferences)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, load() reused by handlers below
    load()
  }, [])

  const selectedTopic = topics.find((t) => t.id === selectedTopicId) ?? null

  function resetTopicForm() {
    setEditingId(null)
    setForm(EMPTY_TOPIC)
  }

  function startEdit(topic: GrammarTopicAdmin) {
    setEditingId(topic.id)
    setForm({
      slug: topic.slug,
      titleDe: topic.titleDe,
      titleVi: topic.titleVi,
      level: topic.level,
      groupLabel: topic.groupLabel ?? '',
      orderIndex: topic.orderIndex,
      summaryVi: topic.summaryVi ?? '',
      theoryMd: topic.theoryMd ?? '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function reportError(err: unknown) {
    const serverMessage = err instanceof ApiError ? (err.data as { message?: string } | null)?.message : undefined
    setError(serverMessage || 'Có lỗi xảy ra')
  }

  async function handleSaveTopic() {
    setError(null)
    setSaving(true)
    try {
      const request: GrammarTopicRequest = {
        ...form,
        groupLabel: form.groupLabel || null,
        summaryVi: form.summaryVi || null,
        theoryMd: form.theoryMd || null,
      }
      if (editingId) await updateGrammarTopic(editingId, request)
      else await createGrammarTopic(request)
      resetTopicForm()
      await load()
    } catch (err) {
      reportError(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteTopic(id: number) {
    setError(null)
    try {
      await deleteGrammarTopic(id)
      if (selectedTopicId === id) setSelectedTopicId(null)
      await load()
    } catch (err) {
      reportError(err)
    }
  }

  async function handleAddExercise() {
    if (!selectedTopicId) return
    setError(null)
    try {
      await createGrammarExercise(selectedTopicId, {
        ...exerciseForm,
        hintVi: exerciseForm.hintVi || null,
        optionA: exerciseForm.optionA || null,
        optionB: exerciseForm.optionB || null,
        optionC: exerciseForm.optionC || null,
        optionD: exerciseForm.optionD || null,
        explanationVi: exerciseForm.explanationVi || null,
      })
      setExerciseForm({ ...EMPTY_EXERCISE, exerciseType: exerciseForm.exerciseType })
      await load()
    } catch (err) {
      reportError(err)
    }
  }

  async function handleDeleteExercise(id: number) {
    setError(null)
    try {
      await deleteGrammarExercise(id)
      await load()
    } catch (err) {
      reportError(err)
    }
  }

  async function handleReviewExercise(id: number) {
    setError(null)
    try {
      await reviewGrammarExercise(id)
      await load()
    } catch (err) {
      reportError(err)
    }
  }

  async function handleGenerateTheory() {
    if (!form.titleDe.trim()) {
      setError('Nhập tên chủ điểm (tiếng Đức) trước khi nhờ AI soạn lý thuyết.')
      return
    }
    setError(null)
    setBusy('theory')
    try {
      const { theoryMd } = await generateGrammarTheoryDraft(form.titleDe, form.titleVi, form.level)
      // Chỉ đổ vào ô soạn thảo, KHÔNG tự lưu -- admin phải đọc/sửa rồi mới bấm lưu.
      setForm((prev) => ({ ...prev, theoryMd }))
    } catch (err) {
      reportError(err)
    } finally {
      setBusy(null)
    }
  }

  async function handleGenerate(source: 'data' | 'ai') {
    if (!selectedTopicId) return
    setError(null)
    setGenerateNote(null)
    setBusy(source)
    try {
      const result =
        source === 'data'
          ? await generateGrammarExercisesFromData(selectedTopicId, {
              kind: genKind,
              count: genCount,
              kasus: genKind === 'ARTICLE' ? genKasus : undefined,
              articleKind: genKind === 'ARTICLE' ? genArticleKind : undefined,
            })
          : await generateGrammarExercisesFromAi(selectedTopicId, genCount)

      setGenerateNote(
        result.note ??
          `Đã tạo ${result.created} bài` +
            (result.pendingReview > 0 ? ` — ${result.pendingReview} bài đang chờ bạn duyệt.` : ' (duyệt sẵn).')
      )
      await load()
    } catch (err) {
      reportError(err)
    } finally {
      setBusy(null)
    }
  }

  function resetRefForm() {
    setRefEditingId(null)
    setRefForm(EMPTY_REFERENCE)
  }

  function startEditReference(table: GrammarReferenceTable) {
    setRefEditingId(table.id)
    setRefForm({
      slug: table.slug,
      titleVi: table.titleVi,
      category: table.category,
      level: table.level,
      orderIndex: table.orderIndex,
      contentMd: table.contentMd,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSaveReference() {
    setError(null)
    setSaving(true)
    try {
      if (refEditingId) await updateGrammarReferenceTable(refEditingId, refForm)
      else await createGrammarReferenceTable(refForm)
      resetRefForm()
      await load()
    } catch (err) {
      reportError(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteReference(id: number) {
    setError(null)
    try {
      await deleteGrammarReferenceTable(id)
      if (refEditingId === id) resetRefForm()
      await load()
    } catch (err) {
      reportError(err)
    }
  }

  const input = 'rounded-sm border border-hairline px-3 py-2'
  const isMultipleChoice = exerciseForm.exerciseType === 'MULTIPLE_CHOICE'
  const typeHint = EXERCISE_TYPES.find((t) => t.value === exerciseForm.exerciseType)?.hint

  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-bold text-ink">Quản lý Ngữ pháp</h2>

      {error && <div className="mb-4 rounded-sm bg-danger-bg p-3 text-sm text-danger">{error}</div>}

      <div className="mb-4 flex gap-2">
        {([
          ['topics', `Chủ điểm (${topics.length})`],
          ['reference', `Bảng tra cứu (${references.length})`],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === value
                ? 'bg-primary/12 text-primary-deep'
                : 'border border-hairline bg-white text-ink hover:border-primary/40'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'reference' && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-2 rounded-sm border border-hairline bg-white p-4 sm:grid-cols-2">
            <input
              value={refForm.slug}
              onChange={(e) => setRefForm({ ...refForm, slug: e.target.value })}
              placeholder="Slug (vd. artikel-bestimmt)"
              className={input}
            />
            <input
              value={refForm.category}
              onChange={(e) => setRefForm({ ...refForm, category: e.target.value })}
              placeholder="Nhóm (vd. Mạo từ, Động từ, Giới từ)"
              className={input}
            />
            <input
              value={refForm.titleVi}
              onChange={(e) => setRefForm({ ...refForm, titleVi: e.target.value })}
              placeholder="Tiêu đề tiếng Việt"
              className={`sm:col-span-2 ${input}`}
            />
            <select
              value={refForm.level ?? ''}
              onChange={(e) => setRefForm({ ...refForm, level: e.target.value || null })}
              className={input}
            >
              <option value="">Mọi trình độ</option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <input
              type="number"
              value={refForm.orderIndex}
              onChange={(e) => setRefForm({ ...refForm, orderIndex: Number(e.target.value) })}
              placeholder="Thứ tự trong nhóm"
              className={input}
            />
            <textarea
              value={refForm.contentMd}
              onChange={(e) => setRefForm({ ...refForm, contentMd: e.target.value })}
              placeholder={'Nội dung bảng, viết bằng markdown GFM:\n\n| Cách | der | die |\n| --- | --- | --- |\n| Nominativ | der | die |'}
              rows={12}
              className={`sm:col-span-2 font-mono text-sm ${input}`}
            />
            <div className="sm:col-span-2 flex gap-2">
              <button
                onClick={handleSaveReference}
                disabled={saving}
                className="flex-1 rounded-sm bg-primary px-4 py-2 font-medium text-white disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : refEditingId ? 'Cập nhật bảng' : 'Thêm bảng'}
              </button>
              {refEditingId && (
                <button onClick={resetRefForm} className="rounded-sm border border-hairline px-4 py-2 text-ink">
                  Huỷ
                </button>
              )}
            </div>
          </div>

          <ul className="space-y-2">
            {references.map((table) => (
              <li
                key={table.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-hairline bg-white p-3"
              >
                <span className="min-w-0">
                  <strong>{table.category}</strong>
                  {table.level && <span className="text-muted"> · {table.level}</span>} — {table.titleVi}
                </span>
                <span className="flex shrink-0 gap-3">
                  <button onClick={() => startEditReference(table)} className="text-sm text-primary hover:underline">
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteReference(table.id)}
                    className="text-sm text-danger hover:underline"
                  >
                    Xoá
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {tab === 'topics' && (
      <>
      <div className="mb-6 grid grid-cols-1 gap-2 rounded-sm border border-hairline bg-white p-4 sm:grid-cols-2">
        <input
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          placeholder="Slug (vd. a1-verb-konjugation)"
          className={input}
        />
        <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className={input}>
          {LEVELS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <input
          value={form.titleDe}
          onChange={(e) => setForm({ ...form, titleDe: e.target.value })}
          placeholder="Tên chủ điểm (tiếng Đức)"
          className={input}
        />
        <input
          value={form.titleVi}
          onChange={(e) => setForm({ ...form, titleVi: e.target.value })}
          placeholder="Tên chủ điểm (tiếng Việt)"
          className={input}
        />
        <input
          value={form.groupLabel ?? ''}
          onChange={(e) => setForm({ ...form, groupLabel: e.target.value })}
          placeholder="Nhóm hiển thị (vd. Lektion 1) — tuỳ chọn"
          className={input}
        />
        <input
          type="number"
          value={form.orderIndex}
          onChange={(e) => setForm({ ...form, orderIndex: Number(e.target.value) })}
          placeholder="Thứ tự"
          className={input}
        />
        <input
          value={form.summaryVi ?? ''}
          onChange={(e) => setForm({ ...form, summaryVi: e.target.value })}
          placeholder="Tóm tắt 1-2 câu (hiện ở danh sách)"
          className={`sm:col-span-2 ${input}`}
        />
        <div className="sm:col-span-2 flex items-center justify-between gap-2">
          <label className="text-sm font-medium text-ink">Lý thuyết (markdown, tiếng Việt)</label>
          <button
            onClick={handleGenerateTheory}
            disabled={busy === 'theory'}
            className="rounded-full border border-hairline px-3 py-1 text-xs font-medium text-primary hover:border-primary/40 disabled:opacity-50"
          >
            {busy === 'theory' ? 'AI đang soạn...' : '✨ AI soạn nháp'}
          </button>
        </div>
        <textarea
          value={form.theoryMd ?? ''}
          onChange={(e) => setForm({ ...form, theoryMd: e.target.value })}
          placeholder={
            'Lý thuyết bằng tiếng Việt, viết bằng markdown.\n\n' +
            'Hỗ trợ **in đậm**, danh sách, và bảng GFM:\n' +
            '| Ngôi | Đuôi |\n| --- | --- |\n| ich | -e |'
          }
          rows={10}
          className={`sm:col-span-2 font-mono text-sm ${input}`}
        />
        <p className="sm:col-span-2 -mt-1 text-xs text-muted">
          AI chỉ soạn nháp và đổ vào ô trên — đọc lại, sửa cho đúng rồi mới bấm lưu.
        </p>
        <div className="sm:col-span-2 flex gap-2">
          <button
            onClick={handleSaveTopic}
            disabled={saving}
            className="flex-1 rounded-sm bg-primary px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : editingId ? 'Cập nhật chủ điểm' : 'Thêm chủ điểm'}
          </button>
          {editingId && (
            <button onClick={resetTopicForm} className="rounded-sm border border-hairline px-4 py-2 text-ink">
              Huỷ
            </button>
          )}
        </div>
      </div>

      <ul className="space-y-2">
        {topics.map((topic) => (
          <li key={topic.id} className="rounded-sm border border-hairline bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="min-w-0">
                <strong>{topic.level}</strong>
                {topic.groupLabel && <span className="text-muted"> · {topic.groupLabel}</span>} — {topic.titleVi}{' '}
                <span className="text-muted">({topic.titleDe})</span>
                <span className="ml-2 text-xs text-muted">
                  {topic.exercises.filter((e) => e.reviewed).length}/{topic.exercises.length} bài tập đã duyệt
                </span>
              </span>
              <span className="flex shrink-0 gap-3">
                <button
                  onClick={() => setSelectedTopicId(selectedTopicId === topic.id ? null : topic.id)}
                  className="text-sm text-primary hover:underline"
                >
                  {selectedTopicId === topic.id ? 'Đóng bài tập' : 'Bài tập'}
                </button>
                <button onClick={() => startEdit(topic)} className="text-sm text-primary hover:underline">
                  Sửa
                </button>
                <button onClick={() => handleDeleteTopic(topic.id)} className="text-sm text-danger hover:underline">
                  Xoá
                </button>
              </span>
            </div>

            {selectedTopicId === topic.id && selectedTopic && (
              <div className="mt-3 border-t border-hairline pt-3">
                <div className="mb-3 rounded-sm border border-hairline bg-surface p-3">
                  <p className="mb-2 text-sm font-medium text-ink">Sinh bài tập hàng loạt</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                    <select
                      value={genKind}
                      onChange={(e) => setGenKind(e.target.value as GrammarGenerateKind)}
                      className={input}
                    >
                      <option value="ARTICLE">Mạo từ / biến cách</option>
                      <option value="VERB_CONJUGATION">Chia động từ</option>
                    </select>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={genCount}
                      onChange={(e) => setGenCount(Number(e.target.value))}
                      placeholder="Số bài"
                      className={input}
                    />
                    {genKind === 'ARTICLE' ? (
                      <>
                        <select
                          value={genKasus}
                          onChange={(e) => setGenKasus(e.target.value as GrammarKasus)}
                          className={input}
                        >
                          <option value="NOMINATIV">Nominativ (cách 1)</option>
                          <option value="AKKUSATIV">Akkusativ (cách 4)</option>
                          <option value="DATIV">Dativ (cách 3)</option>
                        </select>
                        <select
                          value={genArticleKind}
                          onChange={(e) => setGenArticleKind(e.target.value as GrammarArticleKind)}
                          className={input}
                        >
                          <option value="DEFINITE">Mạo từ xác định</option>
                          <option value="INDEFINITE">Mạo từ không xác định</option>
                        </select>
                      </>
                    ) : (
                      <p className="text-xs text-muted sm:col-span-2 sm:self-center">
                        Chỉ lấy động từ yếu; động từ mạnh và tách được bị bỏ qua để không ra đáp án sai.
                      </p>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleGenerate('data')}
                      disabled={busy === 'data'}
                      className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {busy === 'data' ? 'Đang sinh...' : 'Sinh từ dữ liệu (duyệt sẵn)'}
                    </button>
                    <button
                      onClick={() => handleGenerate('ai')}
                      disabled={busy === 'ai'}
                      className="rounded-sm border border-hairline bg-canvas px-4 py-2 text-sm font-medium text-primary disabled:opacity-50"
                    >
                      {busy === 'ai' ? 'AI đang soạn...' : '✨ AI soạn (chờ duyệt)'}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-muted">
                    Sinh từ dữ liệu dùng bảng tra giống danh từ + quy tắc chia động từ nên đáp án
                    chắc chắn đúng. AI dùng cho dạng cần ngữ cảnh và luôn phải duyệt tay.
                  </p>
                  {generateNote && <p className="mt-2 text-xs font-medium text-primary">{generateNote}</p>}
                </div>

                <ul className="mb-3 space-y-1">
                  {selectedTopic.exercises.length === 0 && (
                    <li className="text-sm text-muted">Chưa có bài tập nào.</li>
                  )}
                  {selectedTopic.exercises.map((exercise) => (
                    <li key={exercise.id} className="flex items-start justify-between gap-3 text-sm">
                      <span className="min-w-0">
                        <span className="text-muted">{exercise.orderIndex + 1}.</span> {exercise.promptDe}{' '}
                        <span className="text-primary">→ {exercise.correctAnswer}</span>
                        {!exercise.reviewed && (
                          <span className="ml-2 rounded-full bg-accent/25 px-2 py-0.5 text-xs text-primary">
                            chờ duyệt
                          </span>
                        )}
                      </span>
                      <span className="flex shrink-0 gap-3">
                        {!exercise.reviewed && (
                          <button
                            onClick={() => handleReviewExercise(exercise.id)}
                            className="text-success hover:underline"
                          >
                            Duyệt
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteExercise(exercise.id)}
                          className="text-danger hover:underline"
                        >
                          Xoá
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="grid grid-cols-1 gap-2 rounded-sm bg-surface p-3 sm:grid-cols-2">
                  <select
                    value={exerciseForm.exerciseType}
                    onChange={(e) =>
                      setExerciseForm({ ...exerciseForm, exerciseType: e.target.value as GrammarExerciseType })
                    }
                    className={input}
                  >
                    {EXERCISE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <input
                    value={exerciseForm.correctAnswer}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, correctAnswer: e.target.value })}
                    placeholder="Đáp án đúng (nhiều đáp án ngăn bằng /)"
                    className={input}
                  />
                  <input
                    value={exerciseForm.promptDe}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, promptDe: e.target.value })}
                    placeholder="Đề bài (tiếng Đức)"
                    className={`sm:col-span-2 ${input}`}
                  />
                  {typeHint && <p className="sm:col-span-2 -mt-1 text-xs text-muted">{typeHint}</p>}
                  {isMultipleChoice && (
                    <>
                      <input
                        value={exerciseForm.optionA ?? ''}
                        onChange={(e) => setExerciseForm({ ...exerciseForm, optionA: e.target.value })}
                        placeholder="Đáp án A"
                        className={input}
                      />
                      <input
                        value={exerciseForm.optionB ?? ''}
                        onChange={(e) => setExerciseForm({ ...exerciseForm, optionB: e.target.value })}
                        placeholder="Đáp án B"
                        className={input}
                      />
                      <input
                        value={exerciseForm.optionC ?? ''}
                        onChange={(e) => setExerciseForm({ ...exerciseForm, optionC: e.target.value })}
                        placeholder="Đáp án C"
                        className={input}
                      />
                      <input
                        value={exerciseForm.optionD ?? ''}
                        onChange={(e) => setExerciseForm({ ...exerciseForm, optionD: e.target.value })}
                        placeholder="Đáp án D (tuỳ chọn)"
                        className={input}
                      />
                    </>
                  )}
                  <input
                    value={exerciseForm.hintVi ?? ''}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, hintVi: e.target.value })}
                    placeholder="Gợi ý tiếng Việt (tuỳ chọn)"
                    className={input}
                  />
                  <input
                    value={exerciseForm.explanationVi ?? ''}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, explanationVi: e.target.value })}
                    placeholder="Giải thích tiếng Việt (hiện sau khi chấm)"
                    className={input}
                  />
                  <button
                    onClick={handleAddExercise}
                    className="sm:col-span-2 rounded-sm bg-primary px-4 py-2 font-medium text-white"
                  >
                    Thêm bài tập
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      </>
      )}
    </div>
  )
}
