import { useRef, useState, type MouseEvent, type MutableRefObject } from 'react'
import { Link } from 'react-router-dom'
import { Check, Plus, X } from 'lucide-react'
import { Button, IconButton, NativeSelect } from '@kit'
import { getReadingWordTranslation } from '../../api/readingApi'
import { listDecks, addDeckItem, lookupVocabWord } from '../../api/deckApi'
import type { Deck, VocabLookupResult } from '../../api/types'
import { speak } from '../../lib/speech'
import { Volume2 as SpeakerIcon } from 'lucide-react'

const LAST_DECK_KEY = 'deutschpfad.lastDeckId'

function tokenize(text: string): string[] {
  return text.match(/[A-Za-zäöüßÄÖÜ]+|[^A-Za-zäöüßÄÖÜ]+/g) ?? []
}

function isWordToken(token: string) {
  return /^[A-Za-zäöüßÄÖÜ]+$/.test(token)
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

function HoverWord({
  word,
  passageId,
  cacheRef,
  onOpen,
}: {
  word: string
  passageId: number
  cacheRef: MutableRefObject<Map<string, string | null>>
  onOpen: (event: MouseEvent, word: string) => void
}) {
  const [hoverTranslation, setHoverTranslation] = useState<string | null | undefined>(undefined)
  const [hoverLoading, setHoverLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleMouseEnter() {
    const cached = cacheRef.current.get(word.toLowerCase())
    if (cached !== undefined) {
      setHoverTranslation(cached)
      return
    }
    // Debounce so a quick mouse pass over several words on the way to somewhere else doesn't
    // fire a lookup for each one -- only fetch once the cursor actually settles on a word.
    debounceRef.current = setTimeout(async () => {
      setHoverLoading(true)
      try {
        const result = await getReadingWordTranslation(passageId, word)
        cacheRef.current.set(word.toLowerCase(), result.translation)
        setHoverTranslation(result.translation)
      } catch {
        setHoverTranslation(null)
      } finally {
        setHoverLoading(false)
      }
    }, 200)
  }

  function handleMouseLeave() {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
  }

  return (
    <span className="group relative inline-block">
      <span
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => onOpen(e, word)}
        className="cursor-pointer rounded-karte px-0.5 hover:bg-tinte-soft"
      >
        {word}
      </span>
      {(hoverLoading || hoverTranslation) && (
        <span className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-rund bg-bleistift px-2.5 py-1 text-xs font-medium text-bleistift-invers shadow-lift group-hover:block">
          {hoverLoading ? '···' : hoverTranslation}
        </span>
      )}
    </span>
  )
}

export default function ClickableWordText({
  passageId,
  content,
  readOnly = false,
}: {
  passageId: number
  content: string
  // When true (used for "Đọc qua Đề thi" while the exam is still in progress), words render as
  // plain text -- no hover tooltip, no click dictionary -- so the exam measures unaided reading
  // comprehension, matching the real Goethe test conditions.
  readOnly?: boolean
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const wordCacheRef = useRef(new Map<string, string | null>())

  const [openWord, setOpenWord] = useState<string | null>(null)
  const [popupPos, setPopupPos] = useState<{ x: number; y: number; width: number } | null>(null)
  const [lookup, setLookup] = useState<VocabLookupResult | null>(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [decks, setDecks] = useState<Deck[] | null>(null)
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null)
  const [showDeckPicker, setShowDeckPicker] = useState(false)

  const paragraphs = content.split(/\n+/).filter((p) => p.trim().length > 0)

  async function handleOpen(event: MouseEvent, word: string) {
    const rect = wrapperRef.current?.getBoundingClientRect()
    if (rect) {
      // Cap the popup width to whatever actually fits inside the wrapper (minus a small margin)
      // instead of assuming a fixed 320px -- on narrow phone screens the wrapper itself can be
      // narrower than that, which would otherwise push the popup past the viewport edge.
      const width = Math.min(320, rect.width - 16)
      const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width - width))
      const y = event.clientY - rect.top
      setPopupPos({ x, y: y + 16, width })
    }
    setOpenWord(word)
    setLookup(null)
    setSaveState('idle')
    setShowDeckPicker(false)
    setLookupLoading(true)
    try {
      setLookup(await lookupVocabWord(word))
    } catch {
      setLookup(null)
    } finally {
      setLookupLoading(false)
    }
  }

  function closePopup() {
    setOpenWord(null)
    setPopupPos(null)
  }

  async function ensureDecks() {
    if (decks) return decks
    const list = await listDecks()
    setDecks(list)
    return list
  }

  async function handleQuickSave() {
    if (!lookup) return
    setSaveState('saving')
    try {
      const list = await ensureDecks()
      const rememberedId = Number(localStorage.getItem(LAST_DECK_KEY) ?? '')
      const targetId = list.find((d) => d.id === rememberedId)?.id ?? list[0]?.id
      if (!targetId) {
        setShowDeckPicker(true)
        setSaveState('idle')
        return
      }
      await saveToDeck(targetId)
    } catch {
      setSaveState('error')
    }
  }

  async function handleChooseFolder() {
    const list = await ensureDecks()
    setSelectedDeckId(list[0]?.id ?? null)
    setShowDeckPicker(true)
  }

  async function saveToDeck(deckId: number) {
    if (!lookup) return
    setSaveState('saving')
    try {
      await addDeckItem(deckId, {
        germanWord: lookup.germanWord,
        vietnameseMeaning: lookup.vietnameseMeaning,
        wordType: lookup.wordType,
        exampleSentence: lookup.exampleSentence,
        phonetic: lookup.phonetic,
        englishMeaning: lookup.englishMeaning ?? undefined,
        synonyms: lookup.synonyms ?? undefined,
        antonyms: lookup.antonyms ?? undefined,
      })
      localStorage.setItem(LAST_DECK_KEY, String(deckId))
      setSaveState('saved')
      setShowDeckPicker(false)
    } catch {
      setSaveState('error')
    }
  }

  return (
    <div ref={wrapperRef} className="relative text-base leading-relaxed text-bleistift">
      {paragraphs.map((paragraph, pIndex) => (
        <p key={pIndex} className="mb-4">
          {tokenize(paragraph).map((token, i) =>
            isWordToken(token) && !readOnly ? (
              <HoverWord key={i} word={token} passageId={passageId} cacheRef={wordCacheRef} onOpen={handleOpen} />
            ) : (
              <span key={i}>{token}</span>
            )
          )}
        </p>
      ))}

      {openWord && popupPos && (
        <div
          style={{ left: popupPos.x, top: popupPos.y, width: popupPos.width }}
          className="absolute z-popover rounded-karte bg-karteikarte p-4 text-bleistift shadow-pop"
        >
          <IconButton label="Đóng" icon={<X className="size-4" aria-hidden="true" />} className="absolute top-1 right-1" onClick={closePopup} />

          <div className="mb-2 flex items-center justify-between pr-8 text-xs font-semibold text-radiert">
            <span>DE {lookup?.phonetic ? `/${lookup.phonetic}/` : ''}</span>
            <span>VI</span>
          </div>

          <div className="mb-3 flex items-center gap-2">
            <Button variant="ghost" className="h-7 w-7 shrink-0 justify-center"
              onClick={() => speak(lookup?.germanWord ?? openWord)}
             
              aria-label="Nghe phát âm">
              <SpeakerIcon className="h-4 w-4" />
            </Button>
            <span className="text-lg font-bold italic">{lookup?.germanWord ?? openWord}</span>
          </div>

          {lookupLoading && <p className="text-sm text-radiert">Đang tra từ điển...</p>}

          {!lookupLoading && lookup && (
            <>
              {lookup.wordType && (
                <span className="mb-2 inline-block rounded-rund bg-tinte-soft px-2 py-0.5 text-xs font-bold text-tinte uppercase">
                  {lookup.wordType}
                </span>
              )}
              <p className="mt-1 text-sm font-medium">{lookup.vietnameseMeaning}</p>
              {lookup.englishMeaning && <p className="text-xs italic text-radiert">{lookup.englishMeaning}</p>}
              {lookup.exampleSentence && (
                <p className="mt-2 rounded-karte border border-linie bg-karteikarte-innen p-2 text-xs text-radiert italic">
                  "{lookup.exampleSentence}"
                </p>
              )}

              {!showDeckPicker && (
                <>
                  <Button variant="secondary" className="mt-3 w-full" loading={saveState === 'saving'}
                    icon={saveState === 'saved' ? <Check className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
                    onClick={handleQuickSave}
                    disabled={saveState === 'saved'}>
                    {saveState === 'saving' ? 'Đang lưu...' : saveState === 'saved' ? 'Đã lưu' : 'Lưu từ'}
                  </Button>
                  {saveState !== 'saved' && (
                    <Button variant="ghost" size="sm" className="mt-2 block w-full text-center"
                      onClick={handleChooseFolder}>
                      Chọn thư mục
                    </Button>
                  )}
                </>
              )}

              {showDeckPicker && decks && decks.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <NativeSelect
                    value={selectedDeckId ?? ''}
                    onChange={(e) => setSelectedDeckId(Number(e.target.value))}
                   
                  >
                    {decks.map((deck) => (
                      <option key={deck.id} value={deck.id} className="text-bleistift">
                        {deck.name}
                      </option>
                    ))}
                  </NativeSelect>
                  <Button variant="ghost" size="sm" className="disabled:opacity-60"
                    onClick={() => selectedDeckId && saveToDeck(selectedDeckId)}
                    disabled={!selectedDeckId || saveState === 'saving'}>
                    Lưu
                  </Button>
                </div>
              )}
              {showDeckPicker && decks && decks.length === 0 && (
                <p className="mt-2 text-xs text-radiert">
                  Bạn chưa có bộ từ nào.{' '}
                  <Link to="/app/decks" className="underline">
                    Tạo bộ từ mới
                  </Link>{' '}
                  rồi quay lại đây.
                </p>
              )}
              {saveState === 'error' && <p className="mt-2 text-xs text-rotstift-soft">Có lỗi xảy ra, thử lại sau.</p>}
            </>
          )}

          {!lookupLoading && !lookup && <p className="text-sm text-radiert">Không tra được nghĩa từ này.</p>}
        </div>
      )}
    </div>
  )
}
