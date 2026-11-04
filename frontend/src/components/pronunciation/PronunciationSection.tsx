import { useState } from 'react'
import { Tabs } from '@kit'
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
      <Tabs label="Bảng chữ cái & phát âm" value={tab} onChange={(v) => setTab(v as Tab)}
        items={TABS.map((t) => ({ value: t.id, label: t.label }))}>
        {tab === 'alphabet' && <AlphabetGrid />}
        {tab === 'sounds' && <SoundRules />}
        {tab === 'practice' && <PronunciationPractice />}
      </Tabs>
      <p className="mt-6 text-xs text-radiert">
        Âm thanh dùng giọng đọc tiếng Đức có sẵn trên máy bạn - chất lượng tùy thiết bị. Nếu không nghe thấy gì, hãy kiểm tra máy
        đã cài giọng tiếng Đức (Deutsch) chưa.
      </p>
    </div>
  )
}
