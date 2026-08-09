import { apiFetch } from './client'
import type { TutorKnowledgeBatch, TutorIngestResult } from './types'

export const listTutorGrammarNotes = () =>
  apiFetch<TutorKnowledgeBatch[]>('/admin/tutor-knowledge/grammar-notes')

export const createTutorGrammarNote = (data: {
  title: string
  content: string
  level: string
  topic: string
}) =>
  apiFetch<TutorIngestResult>('/admin/tutor-knowledge/grammar-notes', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const uploadTutorGrammarFile = (file: File, title: string, level: string, topic: string) => {
  const formData = new FormData()
  formData.append('file', file)
  if (title) formData.append('title', title)
  if (level) formData.append('level', level)
  if (topic) formData.append('topic', topic)
  return apiFetch<TutorIngestResult>('/admin/tutor-knowledge/grammar-notes/upload', {
    method: 'POST',
    body: formData,
  })
}

export const deleteTutorGrammarNote = (batchId: string) =>
  apiFetch<void>(`/admin/tutor-knowledge/grammar-notes/${batchId}`, { method: 'DELETE' })

export const syncTutorVocabulary = () =>
  apiFetch<{ chunksCreated: number }>('/admin/tutor-knowledge/sync-vocabulary', { method: 'POST' })
