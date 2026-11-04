import { useCallback, useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { Button, Chip, Input, NativeSelect, Note, Textarea, TextLink } from '@kit'
import {
  deleteTranslationSet,
  generateTranslationForTopic,
  getTranslationSetAdmin,
  listTranslationGrammarTopics,
  updateTranslationSet,
  type TranslationGrammarTopicRow,
  type TranslationItemData,
  type TranslationSetData,
} from '../../api/translationApi'
import { ApiError } from '../../api/client'

const LEVELS = ['A1', 'A2', 'B1', 'B2']

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
})

/**
 * Luyện dịch theo chủ điểm ngữ pháp: xem chủ điểm nào đã có bài, AI soạn nháp câu (Groq → Gemini), sửa từng
 * câu rồi đăng. Câu A1-A2 đã có sẵn từ migration V77; B1-B2 soạn ở đây.
 */
export default function AdminTranslationPage() {
  const [level, setLevel] = useState('B1')
  const [rows, setRows] = useState<TranslationGrammarTopicRow[]>([])
  const [editing, setEditing] = useState<TranslationSetData | null>(null)
  const [busyTopic, setBusyTopic] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    setRows(await listTranslationGrammarTopics())
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, load() reused by handlers below
    load().catch(() => setError('Không tải được danh sách chủ điểm'))
  }, [load])

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

  return (
    <div>
      <h2 className="mb-1 font-display text-xl font-bold text-bleistift">Luyện dịch theo chủ điểm ngữ pháp</h2>
      <p className="mb-4 text-sm text-radiert">
        A1-A2 đã có sẵn 10 câu mỗi chủ điểm. Với chủ điểm chưa có: bấm "AI soạn 10 câu", xem lại từng câu rồi đăng.
        Bỏ qua các chủ điểm thuần lý thuyết (quy tắc giống, từ ghép).
      </p>

      {error && <Note tone="bad" className="mb-4">{error}</Note>}
      {message && <Note tone="ok" className="mb-4">{message}</Note>}

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

      {editing && (
        <div className="space-y-3 rounded-karte border border-kartenrand bg-karteikarte p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-bleistift">
              {editing.title} <span className="text-sm font-normal text-radiert">{editing.grammarTitleDe} · {editing.level}</span>
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
          <Textarea
            value={editing.structureNote ?? ''}
            onChange={(e) => setEditing({ ...editing, structureNote: e.target.value || null })}
            placeholder="Công thức hiện đầu bài, vd: haben/sein + Partizip II cuối câu"
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
