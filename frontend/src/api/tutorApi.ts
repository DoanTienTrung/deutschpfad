import { apiFetch } from './client'
import type { TutorAnswer, TutorHistoryTurn } from './types'

export const askTutor = (question: string, history: TutorHistoryTurn[]) =>
  apiFetch<TutorAnswer>('/tutor/ask', {
    method: 'POST',
    body: JSON.stringify({ question, history }),
  })
