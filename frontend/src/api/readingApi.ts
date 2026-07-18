import { apiFetch } from './client'
import type {
  ReadingCategory,
  ReadingPassageAdmin,
  ReadingPassageDetail,
  ReadingPassageSummary,
  ReadingQuestionType,
  ReadingSubmitResult,
  WordTranslation,
} from './types'

export function listReadingByLevel(level: string, topic?: string) {
  const query = topic ? `&topic=${encodeURIComponent(topic)}` : ''
  return apiFetch<ReadingPassageSummary[]>(`/reading?level=${level}${query}`)
}

export function listReadingTopics() {
  return apiFetch<string[]>('/reading/topics')
}

export function getReadingPassage(id: number) {
  return apiFetch<ReadingPassageDetail>(`/reading/${id}`)
}

export function recordReadingProgress() {
  return apiFetch<void>('/reading/progress', { method: 'POST' })
}

export function getReadingWordTranslation(passageId: number, word: string) {
  return apiFetch<WordTranslation>(`/reading/passages/${passageId}/word-translation?word=${encodeURIComponent(word)}`)
}

export function submitReadingAnswers(passageId: number, answers: { questionId: number; answer: string }[]) {
  return apiFetch<ReadingSubmitResult>(`/reading/passages/${passageId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  })
}

export type ReadingQuestionAdminInput = {
  questionText: string
  questionType: ReadingQuestionType
  optionA: string | null
  optionB: string | null
  optionC: string | null
  optionD: string | null
  correctAnswer: string
  explanation: string | null
}

export type ReadingPassageAdminRequest = {
  title: string
  levelMin: string
  levelMax: string
  topic: string | null
  sourceLabel: string | null
  sourceUrl: string | null
  orderIndex: number
  content: string
  category: ReadingCategory
  questions: ReadingQuestionAdminInput[]
  matchingOptions: { letter: string; text: string }[]
}

export function listReadingAdmin() {
  return apiFetch<ReadingPassageAdmin[]>('/admin/reading-passages')
}

export function createReadingPassage(request: ReadingPassageAdminRequest) {
  return apiFetch<ReadingPassageAdmin>('/admin/reading-passages', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function updateReadingPassage(id: number, request: ReadingPassageAdminRequest) {
  return apiFetch<ReadingPassageAdmin>(`/admin/reading-passages/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function deleteReadingPassage(id: number) {
  return apiFetch<void>(`/admin/reading-passages/${id}`, { method: 'DELETE' })
}

// AI drafts an original German passage (never copied from a real source) for a topic/level,
// so the admin has a starting point to review/edit instead of pasting copyrighted news text.
export function generateReadingPassageDraft(topic: string, level: string) {
  return apiFetch<{ content: string }>('/admin/reading-passages/generate-draft', {
    method: 'POST',
    body: JSON.stringify({ topic, level }),
  })
}

// ---- "Bài đọc của tôi": private passages a user pastes and practices on their own ----

export type UserReadingPassageRequest = {
  title: string
  levelMin: string
  levelMax: string
  content: string
  sourceUrl: string | null
}

export function listMyReadingPassages() {
  return apiFetch<ReadingPassageSummary[]>('/reading/mine')
}

export function createMyReadingPassage(request: UserReadingPassageRequest) {
  return apiFetch<ReadingPassageDetail>('/reading/mine', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function updateMyReadingPassage(id: number, request: UserReadingPassageRequest) {
  return apiFetch<ReadingPassageDetail>(`/reading/mine/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function deleteMyReadingPassage(id: number) {
  return apiFetch<void>(`/reading/mine/${id}`, { method: 'DELETE' })
}
