import { useEffect, useMemo, useState } from 'react'
import {
  LETTERS,
  MINIMAL_PAIRS,
  SPELLING_DRILL_WORDS,
  spellOut,
  spellingSpeech,
  type Letter,
} from '../../lib/pronunciation'
import { shuffle } from '../../lib/quiz'
import { speak } from '../../lib/speech'
import { markAlphabetVisited } from '../../lib/onboarding'

type Activity = 'letters' | 'pairs' | 'spelling' | 'name'

const ACTIVITIES: { id: Activity; title: string; desc: string; icon: string }[] = [
  { id: 'letters', title: 'Nghe & chọn chữ cái', desc: 'Nghe tên một chữ cái, chọn đúng chữ trong 4 đáp án.', icon: '🔤' },
  { id: 'pairs', title: 'Cặp từ dễ nhầm', desc: 'schon hay schön? Nghe và chọn đúng từ vừa đọc.', icon: '👂' },
  { id: 'spelling', title: 'Nghe đánh vần, gõ lại', desc: 'App đánh vần từng chữ cái, bạn gõ lại cả từ.', icon: '⌨️' },
  { id: 'name', title: 'Đánh vần tên của bạn', desc: 'Gõ tên, xem và nghe cách đánh vần - dùng khi gọi điện, ở Bürgeramt.', icon: '🪪' },
]

const QUESTIONS = 10

// Đáp án nhiễu là những chữ hay bị nghe nhầm với nhau, không phải chữ ngẫu nhiên — chọn giữa V và
// Z thì quá dễ, chọn giữa V, F và W mới luyện được tai.
const CONFUSABLE: Record<string, string[]> = {
  A: ['Ä', 'H', 'R'], Ä: ['E', 'A', 'Ö'], B: ['P', 'D', 'W'], C: ['Z', 'T', 'K'], D: ['T', 'B', 'G'],
  E: ['I', 'Ä', 'Ö'], F: ['V', 'S', 'X'], G: ['J', 'K', 'C'], H: ['A', 'K', 'R'], I: ['E', 'Y', 'J'],
  J: ['G', 'Y', 'I'], K: ['G', 'Q', 'H'], L: ['R', 'N', 'M'], M: ['N', 'L', 'E'], N: ['M', 'L', 'R'],
  O: ['Ö', 'U', 'A'], Ö: ['Ü', 'E', 'O'], P: ['B', 'T', 'K'], Q: ['K', 'U', 'C'], R: ['L', 'A', 'H'],
  S: ['Z', 'ß', 'X'], ß: ['S', 'Z', 'B'], T: ['D', 'C', 'P'], U: ['Ü', 'O', 'Q'], Ü: ['U', 'I', 'Y'],
  V: ['F', 'W', 'B'], W: ['V', 'B', 'U'], X: ['S', 'Z', 'C'], Y: ['J', 'Ü', 'I'], Z: ['C', 'S', 'T'],
}

function letterByUpper(upper: string): Letter {
  return LETTERS.find((l) => l.upper === upper || l.lower === upper)!
}

function keyOf(l: Letter) {
  return l.lower === 'ß' ? 'ß' : l.upper
}

function ResultScreen({ score, total, onRestart, onBack }: { score: number; total: number; onRestart: () => void; onBack: () => void }) {
  const great = score >= total * 0.8
  return (
    <div className="rounded-lg border border-hairline bg-card p-8 text-center">
      <p className="text-4xl">{great ? '🎉' : '💪'}</p>
      <p className="mt-3 font-display text-2xl font-semibold text-ink">
        {score}/{total} câu đúng
      </p>
      <p className="mt-1 text-sm text-muted">{great ? 'Tai bạn đã quen với những âm này rồi.' : 'Nghe lại vài lần nữa là quen - từng bước một.'}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button onClick={onRestart} className="rounded-md bg-primary px-5 py-2.5 font-medium text-canvas hover:bg-primary-deep">
          Làm lại
        </button>
        <button onClick={onBack} className="rounded-md border border-hairline px-5 py-2.5 font-medium text-ink hover:bg-surface">
          Chọn bài khác
        </button>
      </div>
    </div>
  )
}

function Progress({ index, total, score }: { index: number; total: number; score: number }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm text-muted">
        <span>
          Câu {index + 1}/{total}
        </span>
        <span>Đúng {score}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface">
        <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${(index / total) * 100}%` }} />
      </div>
    </div>
  )
}

function choiceClass(state: 'idle' | 'correct' | 'wrong' | 'dim') {
  const base = 'rounded-lg border px-4 py-4 font-display font-bold transition-colors disabled:cursor-default'
  if (state === 'correct') return `${base} border-success bg-success-bg text-success`
  if (state === 'wrong') return `${base} border-danger bg-danger-bg text-danger`
  if (state === 'dim') return `${base} border-hairline bg-card text-muted`
  return `${base} border-hairline bg-card text-ink hover:bg-surface`
}

// ---------------------------------------------------------------------------------------------

function LetterQuiz({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(0)
  const questions = useMemo(() => {
    void round
    return shuffle(LETTERS)
      .slice(0, QUESTIONS)
      .map((answer) => {
        const distractors = CONFUSABLE[keyOf(answer)].map(letterByUpper)
        return { answer, choices: shuffle([answer, ...distractors]) }
      })
  }, [round])
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<Letter | null>(null)
  const [score, setScore] = useState(0)

  const q = questions[index]
  const done = index >= questions.length

  // Tự đọc khi sang câu mới.
  useEffect(() => {
    if (!done) speak(q.answer.speak)
  }, [q, done])

  function restart() {
    setRound((r) => r + 1)
    setIndex(0)
    setPicked(null)
    setScore(0)
  }

  function pick(l: Letter) {
    if (picked) return
    setPicked(l)
    if (l === q.answer) setScore((s) => s + 1)
  }

  function next() {
    setPicked(null)
    setIndex((i) => i + 1)
  }

  if (done) return <ResultScreen score={score} total={questions.length} onRestart={restart} onBack={onBack} />

  return (
    <div>
      <Progress index={index} total={questions.length} score={score} />
      <div className="rounded-lg border border-hairline bg-card p-6 text-center">
        <p className="text-sm text-muted">Chữ cái nào vừa được đọc?</p>
        <button
          onClick={() => speak(q.answer.speak)}
          className="mt-3 rounded-full border border-hairline px-5 py-2.5 text-ink hover:bg-surface"
        >
          🔊 Nghe lại
        </button>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {q.choices.map((c) => {
            const state = !picked ? 'idle' : c === q.answer ? 'correct' : c === picked ? 'wrong' : 'dim'
            return (
              <button key={c.upper} onClick={() => pick(c)} disabled={!!picked} className={`${choiceClass(state)} text-3xl`}>
                {c.upper}
              </button>
            )
          })}
        </div>
        {picked && (
          <div className="mt-5">
            <p className={`text-sm font-medium ${picked === q.answer ? 'text-success' : 'text-danger'}`}>
              {picked === q.answer ? 'Chính xác!' : `Chưa đúng - đó là chữ ${q.answer.upper} (đọc "${q.answer.name}").`}
            </p>
            <button onClick={next} className="mt-3 rounded-md bg-primary px-5 py-2.5 font-medium text-canvas hover:bg-primary-deep">
              {index === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------------------------

function PairQuiz({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(0)
  const questions = useMemo(() => {
    void round
    return shuffle(MINIMAL_PAIRS)
      .slice(0, QUESTIONS)
      .map((pair) => ({ pair, target: shuffle([pair.a, pair.b])[0], order: shuffle([pair.a, pair.b]) }))
  }, [round])
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)

  const q = questions[index]
  const done = index >= questions.length

  useEffect(() => {
    if (!done) speak(q.target.word)
  }, [q, done])

  function restart() {
    setRound((r) => r + 1)
    setIndex(0)
    setPicked(null)
    setScore(0)
  }

  function pick(word: string) {
    if (picked) return
    setPicked(word)
    if (word === q.target.word) setScore((s) => s + 1)
  }

  if (done) return <ResultScreen score={score} total={questions.length} onRestart={restart} onBack={onBack} />

  return (
    <div>
      <Progress index={index} total={questions.length} score={score} />
      <div className="rounded-lg border border-hairline bg-card p-6 text-center">
        <p className="text-sm text-muted">Từ nào vừa được đọc? (khác nhau ở: {q.pair.focus})</p>
        <button
          onClick={() => speak(q.target.word)}
          className="mt-3 rounded-full border border-hairline px-5 py-2.5 text-ink hover:bg-surface"
        >
          🔊 Nghe lại
        </button>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {q.order.map((ex) => {
            const state = !picked ? 'idle' : ex.word === q.target.word ? 'correct' : ex.word === picked ? 'wrong' : 'dim'
            return (
              <button key={ex.word} onClick={() => pick(ex.word)} disabled={!!picked} className={`${choiceClass(state)} text-2xl`}>
                {ex.word}
                {picked && <span className="mt-1 block font-sans text-sm font-normal">{ex.meaning}</span>}
              </button>
            )
          })}
        </div>
        {picked && (
          <div className="mt-5">
            <p className="text-sm text-muted">Nghe lại cả hai để so sánh:</p>
            <div className="mt-2 flex justify-center gap-2">
              {q.order.map((ex) => (
                <button key={ex.word} onClick={() => speak(ex.word, { rate: 0.8 })} className="rounded-full border border-hairline px-4 py-2 text-sm text-ink hover:bg-surface">
                  🔊 {ex.word}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setPicked(null)
                setIndex((i) => i + 1)
              }}
              className="mt-4 rounded-md bg-primary px-5 py-2.5 font-medium text-canvas hover:bg-primary-deep"
            >
              {index === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------------------------

const UMLAUT_KEYS = ['ä', 'ö', 'ü', 'ß']
const SPELLING_QUESTIONS = 8

function normalize(s: string) {
  return s.normalize('NFC').trim().toLowerCase()
}

function SpellingDrill({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(0)
  const words = useMemo(() => {
    void round
    return shuffle(SPELLING_DRILL_WORDS).slice(0, SPELLING_QUESTIONS)
  }, [round])
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [score, setScore] = useState(0)

  const word = words[index]
  const done = index >= words.length

  function play(rate = 0.8) {
    speak(spellingSpeech(word.word), { rate })
  }

  useEffect(() => {
    if (!done) speak(spellingSpeech(word.word), { rate: 0.8 })
  }, [word, done])

  function restart() {
    setRound((r) => r + 1)
    setIndex(0)
    setInput('')
    setResult(null)
    setScore(0)
  }

  function check() {
    if (result || !input.trim()) return
    const ok = normalize(input) === normalize(word.word)
    setResult(ok ? 'correct' : 'wrong')
    if (ok) setScore((s) => s + 1)
  }

  function next() {
    setInput('')
    setResult(null)
    setIndex((i) => i + 1)
  }

  if (done) return <ResultScreen score={score} total={words.length} onRestart={restart} onBack={onBack} />

  return (
    <div>
      <Progress index={index} total={words.length} score={score} />
      <div className="rounded-lg border border-hairline bg-card p-6 text-center">
        <p className="text-sm text-muted">Nghe đánh vần từng chữ cái, rồi gõ lại cả từ.</p>
        <div className="mt-3 flex justify-center gap-2">
          <button
            onClick={() => play()}
            className="rounded-full border border-hairline px-5 py-2.5 text-ink hover:bg-surface"
          >
            🔊 Nghe lại
          </button>
          <button onClick={() => play(0.55)} className="rounded-full border border-hairline px-5 py-2.5 text-ink hover:bg-surface">
            🐢 Chậm
          </button>
        </div>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (result ? next() : check())}
          readOnly={!!result}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          aria-label="Gõ từ vừa nghe đánh vần"
          className={`mt-6 w-full rounded-sm border bg-canvas px-4 py-3 text-center font-display text-2xl text-ink outline-none focus:ring-2 focus:ring-primary/20 ${
            result === 'correct' ? 'border-success' : result === 'wrong' ? 'border-danger' : 'border-hairline focus:border-primary'
          }`}
        />
        {!result && (
          <div className="mt-2 flex justify-center gap-1.5">
            {UMLAUT_KEYS.map((k) => (
              <button key={k} type="button" onClick={() => setInput((v) => v + k)} className="rounded-sm border border-hairline px-3 py-1 text-ink hover:bg-surface">
                {k}
              </button>
            ))}
          </div>
        )}

        {result && (
          <div className="mt-4">
            <p className={`text-sm font-medium ${result === 'correct' ? 'text-success' : 'text-danger'}`}>
              {result === 'correct' ? 'Chính xác!' : `Đáp án: ${word.word}`}{' '}
              <span className="font-normal text-muted">({word.meaning})</span>
            </p>
            <p className="mt-2 text-sm text-muted">
              {spellOut(word.word)
                .filter((c) => c.letter)
                .map((c) => c.letter!.name)
                .join(' – ')}
            </p>
          </div>
        )}

        <div className="mt-5">
          {result ? (
            <button onClick={next} className="rounded-md bg-primary px-5 py-2.5 font-medium text-canvas hover:bg-primary-deep">
              {index === words.length - 1 ? 'Xem kết quả' : 'Câu tiếp →'}
            </button>
          ) : (
            <button onClick={check} disabled={!input.trim()} className="rounded-md bg-primary px-5 py-2.5 font-medium text-canvas hover:bg-primary-deep disabled:opacity-40">
              Kiểm tra
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------------------------

function SpellMyName() {
  const [name, setName] = useState('')
  const chars = spellOut(name)
  const letters = chars.filter((c) => c.letter)

  return (
    <div className="rounded-lg border border-hairline bg-card p-6">
      <label htmlFor="spell-name" className="text-sm font-medium text-ink">
        Gõ tên của bạn (có dấu cũng được - sẽ đánh vần theo chữ không dấu, như trên giấy tờ ở Đức)
      </label>
      <input
        id="spell-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="vd. Nguyễn Văn An"
        autoComplete="off"
        spellCheck={false}
        className="mt-2 w-full rounded-sm border border-hairline bg-canvas px-4 py-3 font-display text-xl text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />

      {letters.length > 0 && (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => speak(spellingSpeech(name), { rate: 0.8 })} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-canvas hover:bg-primary-deep">
              🔊 Nghe đánh vần
            </button>
            <button
              onClick={() =>
                speak(
                  letters.map((c) => `${c.letter!.speak} wie ${c.spellingWord}`).join(', '),
                  { rate: 0.85 },
                )
              }
              className="rounded-full border border-hairline px-4 py-2 text-sm font-medium text-ink hover:bg-surface"
            >
              🔊 Đánh vần kiểu điện thoại ("A wie Anton")
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {chars.map((c, i) =>
              c.letter ? (
                <button
                  key={i}
                  onClick={() => speak(c.letter!.speak)}
                  className="rounded-md border border-hairline bg-canvas px-3 py-2 text-left transition-colors hover:bg-surface"
                >
                  <span className="font-display text-2xl font-bold text-ink">{c.letter.lower === 'ß' ? 'ß' : c.letter.upper}</span>
                  <span className="ml-2 text-sm text-ink">{c.letter.name}</span>
                  <span className="block text-xs text-muted">wie {c.spellingWord}</span>
                </button>
              ) : null,
            )}
          </div>
          <p className="mt-4 text-xs text-muted">
            Khi gọi điện, người Đức hay đánh vần kèm một từ cho chắc: "N wie Nordpol, G wie Gustav…".
          </p>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------------------------

export default function PronunciationPractice() {
  const [activity, setActivity] = useState<Activity | null>(null)
  const back = () => setActivity(null)

  if (!activity) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ACTIVITIES.map((a) => (
          <button
            key={a.id}
            onClick={() => {
              markAlphabetVisited()
              setActivity(a.id)
            }}
            className="flex items-start gap-4 rounded-lg border border-hairline bg-card p-5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lifted"
          >
            <span className="text-3xl">{a.icon}</span>
            <span>
              <span className="block font-display font-semibold text-ink">{a.title}</span>
              <span className="mt-1 block text-sm text-muted">{a.desc}</span>
            </span>
          </button>
        ))}
      </div>
    )
  }

  const title = ACTIVITIES.find((a) => a.id === activity)!.title
  return (
    <div className="mx-auto max-w-xl">
      <button onClick={back} className="mb-4 text-sm text-primary hover:underline">
        ← Các bài luyện
      </button>
      <h3 className="mb-4 font-display text-lg font-semibold text-ink">{title}</h3>
      {activity === 'letters' && <LetterQuiz onBack={back} />}
      {activity === 'pairs' && <PairQuiz onBack={back} />}
      {activity === 'spelling' && <SpellingDrill onBack={back} />}
      {activity === 'name' && <SpellMyName />}
    </div>
  )
}
