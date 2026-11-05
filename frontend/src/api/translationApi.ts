import { apiFetch } from './client'

export type TranslationType = 'GRAMMAR' | 'COLLOCATION' | 'PARAGRAPH' | 'ESSAY'
export type TranslationVerdict = 'CORRECT' | 'ALMOST' | 'WRONG' | 'REVEALED' | 'UNGRADED'
export type TranslationMode = 'WORD_BANK' | 'TYPING' | 'CLOZE' | 'REVEAL'

export type TranslationSetSummary = {
  id: number
  type: TranslationType
  level: string
  title: string
  subtitle: string | null
  grammarSlug: string | null
  itemCount: number
  passedCount: number
}

export type TranslationItem = {
  id: number
  orderIndex: number
  partLabel: string | null
  viText: string
  deReference: string
  alternatives: string[]
  keywords: string[]
  /** Cụm cần luyện: collocation dạng từ điển, từ nối hoặc mẫu câu của essay. */
  focus: string | null
  /** Từ bị khoét cho chế độ "Điền từ" (có trong deReference), null nếu câu không có. */
  gap: string | null
  lastVerdict: TranslationVerdict | null
}

export type TranslationSetDetail = {
  id: number
  type: TranslationType
  level: string
  title: string
  subtitle: string | null
  grammarSlug: string | null
  structureNote: string | null
  items: TranslationItem[]
}

export type TranslationErrorNote = { wrong: string | null; right: string | null; explain: string }

export type TranslationCheckResult = {
  verdict: TranslationVerdict
  judgedBy: 'LOCAL' | 'CACHE' | 'AI' | 'NONE'
  corrected: string | null
  errors: TranslationErrorNote[]
  note: string | null
  reference: string
  alternatives: string[]
}

export function listTranslationSets(type: TranslationType, level: string) {
  return apiFetch<TranslationSetSummary[]>(`/translation/sets?type=${type}&level=${level}`)
}

export function getTranslationSet(id: number) {
  return apiFetch<TranslationSetDetail>(`/translation/sets/${id}`)
}

export function getTranslationSetForGrammar(slug: string) {
  return apiFetch<{ id: number }>(`/translation/sets/by-grammar/${encodeURIComponent(slug)}`)
}

export function checkTranslation(itemId: number, answer: string | null, mode: TranslationMode) {
  return apiFetch<TranslationCheckResult>(`/translation/items/${itemId}/check`, {
    method: 'POST',
    body: JSON.stringify({ answer, mode }),
  })
}

// ---------------------------------------------------------------- admin

export type TranslationGrammarTopicRow = {
  topicId: number
  level: string
  slug: string
  titleVi: string
  titleDe: string
  setId: number | null
  status: 'DRAFT' | 'PUBLISHED' | null
  itemCount: number
}

export type TranslationItemData = {
  id: number | null
  partLabel: string | null
  viText: string
  deReference: string
  acceptedAnswers: string | null
  hintKeywords: string | null
  focus: string | null
  gap: string | null
}

export type TranslationSetData = {
  id: number
  type: TranslationType
  level: string
  title: string
  theme: string | null
  grammarTitleDe: string | null
  structureNote: string | null
  status: 'DRAFT' | 'PUBLISHED'
  items: TranslationItemData[]
}

export function listTranslationGrammarTopics() {
  return apiFetch<TranslationGrammarTopicRow[]>('/admin/translation/grammar-topics')
}

export function getTranslationSetAdmin(id: number) {
  return apiFetch<TranslationSetData>(`/admin/translation/sets/${id}`)
}

export function generateTranslationForTopic(topicId: number, count: number) {
  return apiFetch<TranslationSetData>(`/admin/translation/grammar-topics/${topicId}/generate?count=${count}`, { method: 'POST' })
}

export type TranslationSetRow = {
  id: number
  type: TranslationType
  level: string
  title: string
  theme: string | null
  status: 'DRAFT' | 'PUBLISHED'
  itemCount: number
}

export function listThemedTranslationSets(type: TranslationType) {
  return apiFetch<TranslationSetRow[]>(`/admin/translation/sets?type=${type}`)
}

export function createThemedTranslationSet(set: { type: TranslationType; level: string; title: string; theme: string | null }) {
  return apiFetch<TranslationSetData>('/admin/translation/sets', { method: 'POST', body: JSON.stringify(set) })
}

export function generateThemedTranslationSet(type: TranslationType, level: string, theme: string, count: number) {
  const q = new URLSearchParams({ type, level, theme, count: String(count) })
  return apiFetch<TranslationSetData>(`/admin/translation/sets/generate?${q}`, { method: 'POST' })
}

export function updateTranslationSet(
  id: number,
  update: {
    title: string
    theme?: string | null
    level?: string
    structureNote: string | null
    status: 'DRAFT' | 'PUBLISHED'
    items: TranslationItemData[]
  },
) {
  return apiFetch<TranslationSetData>(`/admin/translation/sets/${id}`, { method: 'PUT', body: JSON.stringify(update) })
}

export function deleteTranslationSet(id: number) {
  return apiFetch<void>(`/admin/translation/sets/${id}`, { method: 'DELETE' })
}
