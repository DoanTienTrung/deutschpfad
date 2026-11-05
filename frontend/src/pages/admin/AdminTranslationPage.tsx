import { useCallback, useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { Button, Chip, Field, Input, NativeSelect, Note, Segmented, Textarea, TextLink } from '@kit'
import {
  createThemedTranslationSet,
  deleteTranslationSet,
  generateThemedTranslationSet,
  generateTranslationForTopic,
  getTranslationSetAdmin,
  listThemedTranslationSets,
  listTranslationGrammarTopics,
  updateTranslationSet,
  type TranslationGrammarTopicRow,
  type TranslationItemData,
  type TranslationSetData,
  type TranslationSetRow,
  type TranslationType,
} from '../../api/translationApi'
import { ApiError } from '../../api/client'

const LEVELS = ['A1', 'A2', 'B1', 'B2']
const ALL_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']
const PARTS = ['Einleitung', 'Hauptteil', 'Schluss']

const TYPES: { value: TranslationType; label: string; count: number; hint: string }[] = [
  { value: 'GRAMMAR', label: 'Ngữ pháp', count: 10, hint: '' },
  { value: 'COLLOCATION', label: 'Collocation', count: 10, hint: 'vd: Arbeit, Wohnen, Reisen' },
  { value: 'PARAGRAPH', label: 'Đoạn văn', count: 6, hint: 'vd: Mein erster Arbeitstag' },
  { value: 'ESSAY', label: 'Essay', count: 10, hint: 'vd: Sollte Homeoffice Pflicht sein?' },
]

function messageOf(err: unknown, fallback: string) {
  const serverMessage = err instanceof ApiError ? (err.data as { message?: string } | null)?.message : undefined
  return serverMessage || fallback
}

const emptyItem = (): TranslationItemData => ({
  id: null,
  partLabel: null,
  viText: '',
  deReference: '',
  acceptedAnswers: null,
  hintKeywords: null,
  focus: null,
  gap: null,
})

/**
 * Luyện dịch: bài theo chủ điểm ngữ pháp (mỗi chủ điểm một bài) và bài theo chủ đề cho collocation, đoạn văn,
 * essay. AI soạn nháp (Groq → Gemini), admin sửa từng câu rồi đăng.
 */
export default function AdminTranslationPage() {
  const [type, setType] = useState<TranslationType>('GRAMMAR')
  const [level, setLevel] = useState('B1')
  const [rows, setRows] = useState<TranslationGrammarTopicRow[]>([])
  const [themed, setThemed] = useState<TranslationSetRow[]>([])
  const [newTheme, setNewTheme] = useState('')
  const [newLevel, setNewLevel] = useState('B1')
  const [generating, setGenerating] = useState(false)
  const [editing, setEditing] = useState<TranslationSetData | null>(null)
  const [busyTopic, setBusyTopic] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (type === 'GRAMMAR') setRows(await listTranslationGrammarTopics())
    else setThemed(await listThemedTranslationSets(type))
  }, [type])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, load() reused by handlers below
    load().catch(() => setError('Không tải được danh sách bài'))
  }, [load])

  async function generateThemed() {
    if (!newTheme.trim()) return
    setError(null)
    setMessage(null)
    setGenerating(true)
    try {
      const set = await generateThemedTranslationSet(type, newLevel, newTheme.trim(), TYPES.find((t) => t.value === type)!.count)
      setEditing(set)
      setNewTheme('')
      setMessage(`AI đã soạn bài "${set.title}" (nháp). Xem lại từng câu, sửa nếu cần, rồi chọn "Đã đăng" và lưu.`)
      await load()
    } catch (err) {
      setError(messageOf(err, 'AI chưa soạn được, thử lại sau'))
    } finally {
      setGenerating(false)
    }
  }

  async function createEmpty() {
    if (!newTheme.trim()) return
    setError(null)
    setMessage(null)
    try {
      setEditing(await createThemedTranslationSet({ type, level: newLevel, title: newTheme.trim(), theme: newTheme.trim() }))
      setNewTheme('')
      await load()
    } catch (err) {
      setError(messageOf(err, 'Không tạo được bài'))
    }
  }

  async function generate(row: TranslationGrammarTopicRow) {
    setError(null)
    setMessage(null)
    setBusyTopic(row.topicId)
    try {
      const set = await generateTranslationForTopic(row.topicId, 10)
      setEditing(set)
      setMessage(`AI đã soạn thêm câu cho "${row.titleVi}". Xem lại từng câu, sửa nếu cần, rồi chọn "Đã đăng" và lưu.`)
      await load()
    } catch (err) {
      setError(messageOf(err, 'AI chưa soạn được, thử lại sau'))
    } finally {
      setBusyTopic(null)
    }
  }

  async function open(setId: number) {
    setError(null)
    setMessage(null)
    try {
      setEditing(await getTranslationSetAdmin(setId))
    } catch (err) {
      setError(messageOf(err, 'Không mở được bài'))
    }
  }

  async function save() {
    if (!editing) return
    setSaving(true)
    setError(null)
    try {
      const saved = await updateTranslationSet(editing.id, {
        title: editing.title,
        theme: editing.type === 'GRAMMAR' ? undefined : editing.theme,
        level: editing.type === 'GRAMMAR' ? undefined : editing.level,
        structureNote: editing.structureNote,
        status: editing.status,
        items: editing.items,
      })
      setEditing(saved)
      setMessage('Đã lưu.')
      await load()
    } catch (err) {
      setError(messageOf(err, 'Không lưu được'))
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!editing || !confirm(`Xoá bài "${editing.title}" cùng ${editing.items.length} câu?`)) return
    try {
      await deleteTranslationSet(editing.id)
      setEditing(null)
      await load()
    } catch (err) {
      setError(messageOf(err, 'Không xoá được'))
    }
  }

  function updateItem(index: number, patch: Partial<TranslationItemData>) {
    if (!editing) return
    setEditing({ ...editing, items: editing.items.map((it, i) => (i === index ? { ...it, ...patch } : it)) })
  }

  const visible = rows.filter((r) => r.level === level)
  const typeInfo = TYPES.find((t) => t.value === type)!

  return (
    <div>
      <h2 className="mb-1 font-display text-xl font-bold text-bleistift">Luyện dịch</h2>
      <p className="mb-4 text-sm text-radiert">
        {type === 'GRAMMAR'
          ? 'Mỗi chủ điểm ngữ pháp một bài. Chủ điểm chưa có thì bấm "AI soạn 10 câu", xem lại từng câu rồi đăng.'
          : 'Bài theo chủ đề. Nhập chủ đề rồi cho AI soạn nháp, hoặc tạo bài trống để tự nhập. Bài mới luôn là nháp cho tới khi bạn đăng.'}
      </p>

      <Segmented label="Dạng bài" className="mb-4" value={type}
        onChange={(v) => { setType(v as TranslationType); setEditing(null); setMessage(null); setError(null) }}
        options={TYPES.map((t) => ({ value: t.value, label: t.label }))} />

      {error && <Note tone="bad" className="mb-4">{error}</Note>}
      {message && <Note tone="ok" className="mb-4">{message}</Note>}

      {type !== 'GRAMMAR' && (
        <>
          <div className="mb-4 grid gap-2 rounded-karte border border-kartenrand bg-karteikarte p-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
            <Field label="Chủ đề (tiếng Đức hoặc tiếng Việt)">
              <Input value={newTheme} onChange={(e) => setNewTheme(e.target.value)} placeholder={typeInfo.hint} />
            </Field>
            <Field label="Cấp độ">
              <NativeSelect value={newLevel} onChange={(e) => setNewLevel(e.target.value)}>
                {ALL_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </NativeSelect>
            </Field>
            <Button variant="primary" loading={generating} disabled={!newTheme.trim() || generating} onClick={generateThemed}>
              {generating ? 'AI đang soạn...' : `AI soạn ${typeInfo.count} câu`}
            </Button>
            <Button variant="secondary" disabled={!newTheme.trim() || generating} onClick={createEmpty}>Tạo bài trống</Button>
          </div>

          <ul className="mb-8 space-y-2">
            {themed.length === 0 && <li className="text-sm text-radiert">Chưa có bài nào.</li>}
            {themed.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-karte border border-kartenrand bg-karteikarte p-3">
                <span className="min-w-0">
                  <span className={`mr-2 rounded-rund px-2 py-0.5 text-xs font-medium ${r.status === 'PUBLISHED' ? 'bg-aufstieg-soft text-aufstieg' : 'bg-karteikarte-innen text-bleistift'}`}>
                    {r.status === 'PUBLISHED' ? 'Đã đăng' : 'Nháp'}
                  </span>
                  <strong className="text-bleistift">{r.title}</strong>
                  <span className="ml-2 text-xs text-radiert">{r.theme} · {r.level} · {r.itemCount} câu</span>
                </span>
                <Button variant="ghost" onClick={() => open(r.id)}>Sửa</Button>
              </li>
            ))}
          </ul>
        </>
      )}

      {type === 'GRAMMAR' && (
      <>
      <div className="mb-4 flex gap-2">
        {LEVELS.map((l) => (
          <Chip selected={l === level}
            key={l}
            onClick={() => setLevel(l)}>
            {l} ({rows.filter((r) => r.level === l && r.status === 'PUBLISHED').length}/{rows.filter((r) => r.level === l).length})
          </Chip>
        ))}
      </div>

      <ul className="mb-8 space-y-2">
        {visible.map((r) => (
          <li key={r.topicId} className="flex flex-wrap items-center justify-between gap-3 rounded-karte border border-kartenrand bg-karteikarte p-3">
            <span className="min-w-0">
              <span
                className={`mr-2 rounded-rund px-2 py-0.5 text-xs font-medium ${
                  r.status === 'PUBLISHED' ? 'bg-aufstieg-soft text-aufstieg' : r.status === 'DRAFT' ? 'bg-karteikarte-innen text-bleistift' : 'bg-karteikarte-innen text-radiert'
                }`}
              >
                {r.status === 'PUBLISHED' ? 'Đã đăng' : r.status === 'DRAFT' ? 'Nháp' : 'Chưa có'}
              </span>
              <strong className="text-bleistift">{r.titleVi}</strong>
              <span className="ml-2 text-xs text-radiert">{r.titleDe}</span>
              {r.setId && <span className="ml-2 text-xs text-radiert">[{r.itemCount} câu]</span>}
            </span>
            <span className="flex shrink-0 gap-3 text-sm">
              {r.setId && (
                <Button variant="ghost" onClick={() => open(r.setId!)}>
                  Sửa
                </Button>
              )}
              <Button variant="ghost" className="disabled:opacity-40" onClick={() => generate(r)} disabled={busyTopic !== null}>
                {busyTopic === r.topicId ? 'AI đang soạn...' : 'AI soạn 10 câu'}
              </Button>
            </span>
          </li>
        ))}
      </ul>
      </>
      )}

      {editing && (
        <div className="space-y-3 rounded-karte border border-kartenrand bg-karteikarte p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-bleistift">
              {editing.title} <span className="text-sm font-normal text-radiert">{editing.grammarTitleDe ?? editing.theme} · {editing.level}</span>
            </p>
            <TextLink to={`/app/writing/translate/${editing.id}`} target="_blank" className="inline-flex items-center gap-1 text-sm">
              Xem như người học <ExternalLink className="size-3.5" aria-hidden="true" />
            </TextLink>
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <Input
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              placeholder="Tên bài"
             
            />
            <NativeSelect
              value={editing.status}
              onChange={(e) => setEditing({ ...editing, status: e.target.value as 'DRAFT' | 'PUBLISHED' })}
             
            >
              <option value="DRAFT">Nháp (người học chưa thấy)</option>
              <option value="PUBLISHED">Đã đăng</option>
            </NativeSelect>
          </div>
          {editing.type !== 'GRAMMAR' && (
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <Input value={editing.theme ?? ''} onChange={(e) => setEditing({ ...editing, theme: e.target.value || null })}
                placeholder="Chủ đề tiếng Đức, hiện dưới tên bài (vd: Arbeit)" aria-label="Chủ đề" />
              <NativeSelect value={editing.level} onChange={(e) => setEditing({ ...editing, level: e.target.value })} aria-label="Cấp độ">
                {ALL_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </NativeSelect>
            </div>
          )}
          <Textarea
            value={editing.structureNote ?? ''}
            onChange={(e) => setEditing({ ...editing, structureNote: e.target.value || null })}
            placeholder={editing.type === 'GRAMMAR' ? 'Công thức hiện đầu bài, vd: haben/sein + Partizip II cuối câu'
              : editing.type === 'COLLOCATION' ? 'Giới thiệu nhóm cụm từ, hiện đầu bài'
                : 'Từ nối hoặc Redemittel chính của bài, hiện đầu bài'}
            rows={2}
            className="w-full"
          />

          <ol className="space-y-3">
            {editing.items.map((it, i) => (
              <li key={it.id ?? `new-${i}`} className="rounded-karte border border-linie p-3">
                <div className="mb-2 flex items-center justify-between text-xs text-radiert">
                  <span>Câu {i + 1}</span>
                  <Button variant="ghost" className="text-rotstift"
                    onClick={() => setEditing({ ...editing, items: editing.items.filter((_, x) => x !== i) })}>
                    Xoá câu
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input value={it.viText} onChange={(e) => updateItem(i, { viText: e.target.value })} placeholder="Câu tiếng Việt" />
                  <Input value={it.deReference} onChange={(e) => updateItem(i, { deReference: e.target.value })} placeholder="Câu tiếng Đức (đáp án chính)" />
                  <Textarea
                    value={it.acceptedAnswers ?? ''}
                    onChange={(e) => updateItem(i, { acceptedAnswers: e.target.value || null })}
                    placeholder="Cách dịch đúng khác, mỗi dòng một câu"
                    rows={2}
                   
                  />
                  <Input
                    value={it.hintKeywords ?? ''}
                    onChange={(e) => updateItem(i, { hintKeywords: e.target.value || null })}
                    placeholder="Từ khoá gợi ý, ngăn bằng dấu phẩy"

                  />
                  {editing.type !== 'GRAMMAR' && (
                    <Input value={it.focus ?? ''} onChange={(e) => updateItem(i, { focus: e.target.value || null })}
                      placeholder={editing.type === 'COLLOCATION' ? 'Collocation dạng từ điển, vd: eine Entscheidung treffen' : 'Từ nối hoặc mẫu câu của câu này'} />
                  )}
                  {editing.type === 'COLLOCATION' && (
                    <Input value={it.gap ?? ''} onChange={(e) => updateItem(i, { gap: e.target.value || null })}
                      placeholder="Từ khoét cho chế độ Điền từ, phải có trong câu Đức (vd: getroffen)" />
                  )}
                  {editing.type === 'ESSAY' && (
                    <NativeSelect value={it.partLabel ?? ''} onChange={(e) => updateItem(i, { partLabel: e.target.value || null })} aria-label="Phần bài">
                      <option value="">Phần bài</option>
                      {PARTS.map((part) => <option key={part} value={part}>{part}</option>)}
                    </NativeSelect>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setEditing({ ...editing, items: [...editing.items, emptyItem()] })}>
              Thêm câu
            </Button>
            <Button variant="primary" className="flex-1 disabled:opacity-50" onClick={save} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu bài'}
            </Button>
            <Button variant="secondary" className="text-rotstift" onClick={remove}>
              Xoá bài
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
