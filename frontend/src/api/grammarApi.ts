import { apiFetch } from './client'
import type {
  GrammarExerciseType,
  GrammarProgressSummary,
  GrammarReview,
  GrammarReferenceTable,
  GrammarSubmitResult,
  GrammarTopicAdmin,
  GrammarTopicDetail,
  GrammarTopicSummary,
} from './types'

export function listGrammarTopics(level?: string) {
  return apiFetch<GrammarTopicSummary[]>(`/grammar${level ? `?level=${level}` : ''}`)
}

export function getGrammarProgressSummary() {
  return apiFetch<GrammarProgressSummary>('/grammar/progress/summary')
}

export function getGrammarReview(level?: string) {
  return apiFetch<GrammarReview>(`/grammar/review${level ? `?level=${level}` : ''}`)
}

export function getGrammarTopic(slug: string) {
  return apiFetch<GrammarTopicDetail>(`/grammar/${encodeURIComponent(slug)}`)
}

export function submitGrammarAnswers(slug: string, answers: { exerciseId: number; answer: string }[]) {
  return apiFetch<GrammarSubmitResult>(`/grammar/${encodeURIComponent(slug)}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  })
}

// ---- Admin ----

export type GrammarTopicRequest = {
  slug: string
  titleDe: string
  titleVi: string
  level: string
  groupLabel: string | null
  orderIndex: number
  summaryVi: string | null
  theoryMd: string | null
}

export type GrammarExerciseRequest = {
  exerciseType: GrammarExerciseType
  promptDe: string
  hintVi: string | null
  optionA: string | null
  optionB: string | null
  optionC: string | null
  optionD: string | null
  correctAnswer: string
  explanationVi: string | null
  orderIndex: number | null
}

export function listGrammarTopicsAdmin() {
  return apiFetch<GrammarTopicAdmin[]>('/admin/grammar/topics')
}

export function createGrammarTopic(request: GrammarTopicRequest) {
  return apiFetch<GrammarTopicAdmin>('/admin/grammar/topics', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function updateGrammarTopic(id: number, request: GrammarTopicRequest) {
  return apiFetch<GrammarTopicAdmin>(`/admin/grammar/topics/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function deleteGrammarTopic(id: number) {
  return apiFetch<void>(`/admin/grammar/topics/${id}`, { method: 'DELETE' })
}

export function createGrammarExercise(topicId: number, request: GrammarExerciseRequest) {
  return apiFetch<void>(`/admin/grammar/topics/${topicId}/exercises`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function updateGrammarExercise(id: number, request: GrammarExerciseRequest) {
  return apiFetch<void>(`/admin/grammar/exercises/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function deleteGrammarExercise(id: number) {
  return apiFetch<void>(`/admin/grammar/exercises/${id}`, { method: 'DELETE' })
}

export function reviewGrammarExercise(id: number) {
  return apiFetch<void>(`/admin/grammar/exercises/${id}/review`, { method: 'POST' })
}

// ---- Sinh nội dung (Đợt 2) ----

export type GrammarGenerateKind = 'ARTICLE' | 'VERB_CONJUGATION'
export type GrammarKasus = 'NOMINATIV' | 'AKKUSATIV' | 'DATIV'
export type GrammarArticleKind = 'DEFINITE' | 'INDEFINITE'

// created có thể nhỏ hơn số yêu cầu; khi bằng 0 thì note giải thích vì sao.
export type GrammarGenerateResult = {
  created: number
  pendingReview: number
  note: string | null
}

// Sinh từ dữ liệu tra cứu -> đáp án đúng 100%, lưu thẳng ở trạng thái đã duyệt.
export function generateGrammarExercisesFromData(
  topicId: number,
  request: { kind: GrammarGenerateKind; count: number; kasus?: GrammarKasus; articleKind?: GrammarArticleKind }
) {
  return apiFetch<GrammarGenerateResult>(`/admin/grammar/topics/${topicId}/generate/data`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

// Sinh bằng AI -> luôn vào hàng chờ duyệt.
export function generateGrammarExercisesFromAi(topicId: number, count: number) {
  return apiFetch<GrammarGenerateResult>(`/admin/grammar/topics/${topicId}/generate/ai`, {
    method: 'POST',
    body: JSON.stringify({ count }),
  })
}

export function generateGrammarTheoryDraft(titleDe: string, titleVi: string, level: string) {
  return apiFetch<{ theoryMd: string }>('/admin/grammar/topics/generate-theory', {
    method: 'POST',
    body: JSON.stringify({ titleDe, titleVi, level }),
  })
}

// ---- Bảng tra cứu (Đợt 3) ----

export type GrammarReferenceTableRequest = {
  slug: string
  titleVi: string
  category: string
  level: string | null
  orderIndex: number
  contentMd: string
}

export function listGrammarReferenceTables() {
  return apiFetch<GrammarReferenceTable[]>('/grammar/reference')
}

export function listGrammarReferenceTablesAdmin() {
  return apiFetch<GrammarReferenceTable[]>('/admin/grammar/reference-tables')
}

export function createGrammarReferenceTable(request: GrammarReferenceTableRequest) {
  return apiFetch<GrammarReferenceTable>('/admin/grammar/reference-tables', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function updateGrammarReferenceTable(id: number, request: GrammarReferenceTableRequest) {
  return apiFetch<GrammarReferenceTable>(`/admin/grammar/reference-tables/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function deleteGrammarReferenceTable(id: number) {
  return apiFetch<void>(`/admin/grammar/reference-tables/${id}`, { method: 'DELETE' })
}
