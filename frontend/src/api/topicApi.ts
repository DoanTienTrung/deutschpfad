import { apiFetch } from './client'
import type { Topic } from './types'

export function listTopics() {
  return apiFetch<Topic[]>('/topics')
}
