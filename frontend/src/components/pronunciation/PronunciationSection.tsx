import { useState } from 'react'
import AlphabetGrid from './AlphabetGrid'
import PronunciationPractice from './PronunciationPractice'
import SoundRules from './SoundRules'

type Tab = 'alphabet' | 'sounds' | 'practice'

const TABS: { id: Tab; label: string }[] = [
  { id: 'alphabet', label: 'Bảng chữ cái' },
  { id: 'sounds', label: 'Âm ghép & quy tắc' },
  { id: 'practice', label: 'Luyện tập' },
]

export default function PronunciationSection() {
  const [tab, setTab] = useState<Tab>('alphabet')

  return (
    <div>
      <div role="tablist" aria-label="Bảng chữ cái & phát âm" className="mb-5 flex gap-1 overflow-x-auto border-b border-hairline">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? 'border-primary text-ink' : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'alphabet' && <AlphabetGrid />}
      {tab === 'sounds' && <SoundRules />}
      {tab === 'practice' && <PronunciationPractice />}
      <p className="mt-6 text-xs text-muted">
        Âm thanh dùng giọng đọc tiếng Đức có sẵn trên máy bạn - chất lượng tùy thiết bị. Nếu không nghe thấy gì, hãy kiểm tra máy
        đã cài giọng tiếng Đức (Deutsch) chưa.
      </p>
    </div>
  )
}
