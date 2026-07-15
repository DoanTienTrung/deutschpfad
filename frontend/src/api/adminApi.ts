import { apiFetch } from './client'
import type { Topic, Lesson, VocabularyItem, VocabularySource } from './types'

// Topics
export const listTopics = () => apiFetch<Topic[]>('/admin/topics')
export const createTopic = (name: string) =>
  apiFetch<Topic>('/admin/topics', { method: 'POST', body: JSON.stringify({ name }) })
export const deleteTopic = (id: number) =>
  apiFetch<void>(`/admin/topics/${id}`, { method: 'DELETE' })

// Lessons
export const listLessons = () => apiFetch<Lesson[]>('/admin/lessons')
export const createLesson = (data: {
  title: string
  level: string
  source?: VocabularySource
  orderIndex: number
  description?: string
  topicId?: number | null
}) => apiFetch<Lesson>('/admin/lessons', { method: 'POST', body: JSON.stringify(data) })
export const updateLesson = (id: number, data: {
  title: string
  level: string
  source?: VocabularySource
  orderIndex: number
  description?: string
  topicId?: number | null
}) => apiFetch<Lesson>(`/admin/lessons/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteLesson = (id: number) =>
  apiFetch<void>(`/admin/lessons/${id}`, { method: 'DELETE' })

// Vocabulary Items
export type VocabularyItemInput = {
  germanWord: string
  vietnameseMeaning: string
  englishMeaning?: string
  phonetic?: string
  wordType?: string
  exampleSentence?: string
  imageUrl?: string
  level: string
  source?: VocabularySource
  topicId?: number | null
  lessonId?: number | null
}

export const listVocabularyItems = () => apiFetch<VocabularyItem[]>('/admin/vocabulary-items')
export const createVocabularyItem = (data: VocabularyItemInput) =>
  apiFetch<VocabularyItem>('/admin/vocabulary-items', { method: 'POST', body: JSON.stringify(data) })
export const updateVocabularyItem = (id: number, data: VocabularyItemInput) =>
  apiFetch<VocabularyItem>(`/admin/vocabulary-items/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteVocabularyItem = (id: number) =>
  apiFetch<void>(`/admin/vocabulary-items/${id}`, { method: 'DELETE' })
