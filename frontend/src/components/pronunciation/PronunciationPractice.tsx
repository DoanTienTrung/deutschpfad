import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, CaseSensitive, Ear, IdCard, Keyboard, PartyPopper, Snail, Trophy, Volume2 } from 'lucide-react'
import { AnswerFeedback, AnswerOption, Button, Card, CardButton, Input, ProgressBar, type AnswerState } from '@kit'
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

const ACTIVITIES: { id: Activity; title: string; desc: string; icon: ReactNode }[] = [
  { id: 'letters', title: 'Nghe & chọn chữ cái', desc: 'Nghe tên một chữ cái, chọn đúng chữ trong 4 đáp án.', icon: <CaseSensitive /> },
  { id: 'pairs', title: 'Cặp từ dễ nhầm', desc: 'schon hay schön? Nghe và chọn đúng từ vừa đọc.', icon: <Ear /> },
  { id: 'spelling', title: 'Nghe đánh vần, gõ lại', desc: 'App đánh vần từng chữ cái, bạn gõ lại cả từ.', icon: <Keyboard /> },
  { id: 'name', title: 'Đánh vần tên của bạn', desc: 'Gõ tên, xem và nghe cách đánh vần - dùng khi gọi điện, ở Bürgeramt.', icon: <IdCard /> },
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
    <Card className="p-8 text-center">
      <span className="inline-flex text-radiert [&_svg]:size-9" aria-hidden="true">{great ? <PartyPopper /> : <Trophy />}</span>
      <p className="mt-3 font-display text-2xl font-semibold text-bleistift">
        {score}/{total} câu đúng
      </p>
      <p className="mt-1 text-sm text-radiert">{great ? 'Tai bạn đã quen với những âm này rồi.' : 'Nghe lại vài lần nữa là quen - từng bước một.'}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={onRestart}>Làm lại</Button>
        <Button variant="secondary" onClick={onBack}>Chọn bài khác</Button>
      </div>
    </Card>
  )
}

function Progress({ index, total, score }: { index: number; total: number; score: number }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm text-radiert">
        <span>
          Câu {index + 1}/{total}
        </span>
        <span>Đúng {score}</span>
      </div>
      <ProgressBar value={index / total} label="Tiến độ bài luyện" className="mt-1.5" />
    </div>
  )
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
      <Card className="p-6 text-center">
        <p className="text-sm text-radiert">Chữ cái nào vừa được đọc?</p>
        <Button variant="secondary" size="sm" className="mt-3" icon={<Volume2 className="size-4" aria-hidden="true" />} onClick={() => speak(q.answer.speak)}>
          Nghe lại
        </Button>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {q.choices.map((c) => {
            const state: AnswerState = !picked ? 'idle' : c === q.answer ? 'correct' : c === picked ? 'wrong' : 'dim'
            return (
              <AnswerOption key={c.upper} state={state} onClick={() => pick(c)} disabled={!!picked} className="py-4 font-display text-3xl font-bold">
                {c.upper}
              </AnswerOption>
            )
          })}
        </div>
        {picked && (
          <div className="mt-5">
            <AnswerFeedback correct={picked === q.answer} className="text-left"
              title={picked === q.answer ? 'Chính xác.' : `Chưa đúng - đó là chữ ${q.answer.upper} (đọc "${q.answer.name}").`} />
            <Button onClick={next} className="mt-3">
              {index === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp'}
              {index < questions.length - 1 && <ArrowRight className="size-4" aria-hidden="true" />}
            </Button>
          </div>
        )}
      </Card>
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
      <Card className="p-6 text-center">
        <p className="text-sm text-radiert">Từ nào vừa được đọc? (khác nhau ở: {q.pair.focus})</p>
        <Button variant="secondary" size="sm" className="mt-3" icon={<Volume2 className="size-4" aria-hidden="true" />} onClick={() => speak(q.target.word)}>
          Nghe lại
        </Button>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {q.order.map((ex) => {
            const state: AnswerState = !picked ? 'idle' : ex.word === q.target.word ? 'correct' : ex.word === picked ? 'wrong' : 'dim'
            return (
              <AnswerOption key={ex.word} state={state} onClick={() => pick(ex.word)} disabled={!!picked} className="py-4 font-display text-2xl font-bold">
                {ex.word}
                {picked && <span className="mt-1 block font-sans text-sm font-normal">{ex.meaning}</span>}
              </AnswerOption>
            )
          })}
        </div>
        {picked && (
          <div className="mt-5">
            <p className="text-sm text-radiert">Nghe lại cả hai để so sánh:</p>
            <div className="mt-2 flex justify-center gap-2">
              {q.order.map((ex) => (
                <Button key={ex.word} variant="secondary" size="sm" icon={<Volume2 className="size-4" aria-hidden="true" />} onClick={() => speak(ex.word, { rate: 0.8 })}>
                  {ex.word}
                </Button>
              ))}
            </div>
            <Button className="mt-4" onClick={() => { setPicked(null); setIndex((i) => i + 1) }}>
              {index === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp'}
              {index < questions.length - 1 && <ArrowRight className="size-4" aria-hidden="true" />}
            </Button>
          </div>
        )}
      </Card>
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
      <Card className="p-6 text-center">
        <p className="text-sm text-radiert">Nghe đánh vần từng chữ cái, rồi gõ lại cả từ.</p>
        <div className="mt-3 flex justify-center gap-2">
          <Button variant="secondary" size="sm" icon={<Volume2 className="size-4" aria-hidden="true" />} onClick={() => play()}>Nghe lại</Button>
          <Button variant="secondary" size="sm" icon={<Snail className="size-4" aria-hidden="true" />} onClick={() => play(0.55)}>Chậm</Button>
        </div>

        <Input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (result ? next() : check())}
          readOnly={!!result} autoFocus autoComplete="off" spellCheck={false} aria-label="Gõ từ vừa nghe đánh vần"
          invalid={result === 'wrong'}
          className={`mt-6 min-h-14 text-center font-display text-2xl ${result === 'correct' ? 'border-aufstieg' : ''}`} />
        {!result && (
          <div className="mt-2 flex justify-center gap-1.5">
            {UMLAUT_KEYS.map((k) => (
              <Button key={k} variant="secondary" size="sm" onClick={() => setInput((v) => v + k)} aria-label={`Thêm chữ ${k}`}>
                {k}
              </Button>
            ))}
          </div>
        )}

        {result && (
          <div className="mt-4">
            <AnswerFeedback correct={result === 'correct'} className="text-left"
              title={result === 'correct' ? 'Chính xác.' : `Đáp án: ${word.word}`}>
              <span className="text-radiert">({word.meaning}) </span>
              {spellOut(word.word).filter((c) => c.letter).map((c) => c.letter!.name).join(' - ')}
            </AnswerFeedback>
          </div>
        )}

        <div className="mt-5">
          {result ? (
            <Button onClick={next}>
              {index === words.length - 1 ? 'Xem kết quả' : 'Câu tiếp'}
              {index < words.length - 1 && <ArrowRight className="size-4" aria-hidden="true" />}
            </Button>
          ) : (
            <Button onClick={check} disabled={!input.trim()}>Kiểm tra</Button>
          )}
        </div>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------------------------

function SpellMyName() {
  const [name, setName] = useState('')
  const chars = spellOut(name)
  const letters = chars.filter((c) => c.letter)

  return (
    <Card className="p-6">
      <label htmlFor="spell-name" className="text-sm font-medium text-bleistift">
        Gõ tên của bạn (có dấu cũng được - sẽ đánh vần theo chữ không dấu, như trên giấy tờ ở Đức)
      </label>
      <Input id="spell-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="vd. Nguyễn Văn An"
        autoComplete="off" spellCheck={false} className="mt-2 min-h-12 font-display text-xl" />

      {letters.length > 0 && (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" icon={<Volume2 className="size-4" aria-hidden="true" />} onClick={() => speak(spellingSpeech(name), { rate: 0.8 })}>
              Nghe đánh vần
            </Button>
            <Button variant="secondary" size="sm" icon={<Volume2 className="size-4" aria-hidden="true" />}
              onClick={() => speak(letters.map((c) => `${c.letter!.speak} wie ${c.spellingWord}`).join(', '), { rate: 0.85 })}>
              Đánh vần kiểu điện thoại ("A wie Anton")
            </Button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {chars.map((c, i) =>
              c.letter ? (
                <CardButton key={i} onClick={() => speak(c.letter!.speak)} className="px-3 py-2">
                  <span className="font-display text-2xl font-bold text-bleistift">{c.letter.lower === 'ß' ? 'ß' : c.letter.upper}</span>
                  <span className="ml-2 text-sm text-bleistift">{c.letter.name}</span>
                  <span className="block text-xs text-radiert">wie {c.spellingWord}</span>
                </CardButton>
              ) : null,
            )}
          </div>
          <p className="mt-4 text-xs text-radiert">
            Khi gọi điện, người Đức hay đánh vần kèm một từ cho chắc: "N wie Nordpol, G wie Gustav...".
          </p>
        </>
      )}
    </Card>
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
          <CardButton key={a.id} onClick={() => { markAlphabetVisited(); setActivity(a.id) }} className="flex items-start gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-rund bg-karteikarte-innen text-radiert [&_svg]:size-5" aria-hidden="true">{a.icon}</span>
            <span>
              <span className="block font-display font-semibold text-bleistift">{a.title}</span>
              <span className="mt-1 block text-sm text-radiert">{a.desc}</span>
            </span>
          </CardButton>
        ))}
      </div>
    )
  }

  const title = ACTIVITIES.find((a) => a.id === activity)!.title
  return (
    <div className="mx-auto max-w-xl">
      <Button variant="ghost" size="sm" onClick={back} icon={<ArrowLeft className="size-4" aria-hidden="true" />} className="mb-2 -ml-3">
        Các bài luyện
      </Button>
      <h3 className="mb-4 font-display text-lg font-semibold text-bleistift">{title}</h3>
      {activity === 'letters' && <LetterQuiz onBack={back} />}
      {activity === 'pairs' && <PairQuiz onBack={back} />}
      {activity === 'spelling' && <SpellingDrill onBack={back} />}
      {activity === 'name' && <SpellMyName />}
    </div>
  )
}
