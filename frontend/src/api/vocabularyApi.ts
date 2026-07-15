import { apiFetch } from './client'
import type { VocabularyItem, ReviewQuality, ReviewResult } from './types'

export function getDueCards() {
  return apiFetch<VocabularyItem[]>('/vocabulary/review')
}

export function submitReview(vocabularyItemId: number, result: ReviewQuality) {
  return apiFetch<ReviewResult>(`/vocabulary/review/${vocabularyItemId}`, {
    method: 'POST',
    body: JSON.stringify({ result }),
  })
}
