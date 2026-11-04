import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Table2 } from 'lucide-react'
import { Breadcrumb, Button, Chip, EmptyState, ListCardSkeleton, SearchInput } from '@kit'
import { listGrammarReferenceTables } from '../api/grammarApi'
import type { GrammarReferenceTable } from '../api/types'
import GrammarMarkdown from '../components/grammar/GrammarMarkdown'

export default function GrammarReferencePage() {
  const [tables, setTables] = useState<GrammarReferenceTable[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState<number | null>(null)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    listGrammarReferenceTables()
      .then((loaded) => {
        setTables(loaded)
        // Mở sẵn bảng được chỉ định từ trang chủ điểm (?open=slug), để người học không phải
        // tự dò trong danh sách.
        const wanted = searchParams.get('open')
        if (wanted) setOpenId(loaded.find((t) => t.slug === wanted)?.id ?? null)
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ đọc ?open= một lần lúc mở trang
  }, [])

  const categories = useMemo(() => [...new Set(tables.map((t) => t.category))], [tables])

  const query = search.trim().toLowerCase()
  const visible = tables
    .filter((t) => !category || t.category === category)
    // Tìm cả trong nội dung bảng, không chỉ tiêu đề: người học thường nhớ chính cái từ cần tra
    // ("durch", "weil") chứ không nhớ bảng đó tên gì.
    .filter((t) => !query || t.titleVi.toLowerCase().includes(query) || t.contentMd.toLowerCase().includes(query))

  return (
    <div className="mx-auto max-w-lesen">
      <Breadcrumb items={[{ label: 'Ngữ pháp', to: '/app/grammar' }, { label: 'Tra cứu nhanh' }]} />

      <h2 className="font-display text-2xl font-bold text-bleistift">Bảng tra cứu nhanh</h2>
      <p className="mt-1 text-sm text-radiert">
        Mở ra xem giữa chừng lúc đang làm bài, không cần học tuần tự. Gõ thẳng từ cần tra - tìm cả
        trong nội dung bảng.
      </p>

      {/* Dính trên đầu khi cuộn: đây là trang để tra giữa chừng, ô tìm phải luôn trong tầm tay.
          -mx-6/px-6 khớp đúng p-6 của <main> trong AppLayout, để dải nền phủ trọn bề ngang -
          lệch một chút là nội dung cuộn bên dưới lòi ra ở hai mép. */}
      <div className="sticky top-0 z-10 -mx-6 mt-5 bg-karteikarte px-6 pb-3 pt-3">
        <div>
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm nhanh (vd. Dativ, weil, Perfekt...)" aria-label="Tìm nhanh (vd. Dativ, weil, Perfekt...)" />
      </div>
        {categories.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip selected={category === ''} onClick={() => setCategory('')}>Tất cả</Chip>
            {categories.map((c) => (
              <Chip key={c} selected={category === c} onClick={() => setCategory(c)}>{c}</Chip>
            ))}
          </div>
        )}
      </div>

      {loading && <ListCardSkeleton />}

      {!loading && tables.length === 0 && (
        <EmptyState icon={<Table2 />} title="Chưa có bảng tra cứu nào" />
      )}
      {!loading && tables.length > 0 && visible.length === 0 && (
        <p className="mt-4 text-radiert">Không tìm thấy bảng nào khớp với "{search}".</p>
      )}

      <ul className="mt-2 space-y-2">
        {visible.map((table) => {
          const open = openId === table.id
          return (
            <li key={table.id} className="overflow-hidden rounded-karte border border-linie bg-karteikarte-innen">
              <Button variant="ghost" className="w-full justify-between text-left"
                onClick={() => setOpenId(open ? null : table.id)}
                aria-expanded={open}>
                <span className="min-w-0">
                  <span className="block font-semibold text-bleistift">{table.titleVi}</span>
                  <span className="mt-0.5 block text-xs text-radiert">
                    {table.category}
                    {table.level && ` · ${table.level}`}
                  </span>
                </span>
                <span className={`shrink-0 text-radiert transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
              </Button>
              {open && (
                <div className="border-t border-linie bg-karteikarte px-4 py-4">
                  <GrammarMarkdown>{table.contentMd}</GrammarMarkdown>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
