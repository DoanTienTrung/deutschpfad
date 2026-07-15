import { apiFetch } from './client'
import type { Deck, DeckItem } from './types'

export function listDecks() {
  return apiFetch<Deck[]>('/decks')
}

export function createDeck(name: string, description: string) {
  return apiFetch<Deck>('/decks', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  })
}

export function deleteDeck(deckId: number) {
  return apiFetch<void>(`/decks/${deckId}`, { method: 'DELETE' })
}

export function listDeckItems(deckId: number) {
  return apiFetch<DeckItem[]>(`/decks/${deckId}/items`)
}

export type DeckItemInput = {
  germanWord: string
  vietnameseMeaning: string
  wordType: string
  exampleSentence: string
}

export function addDeckItem(deckId: number, input: DeckItemInput) {
  return apiFetch<DeckItem>(`/decks/${deckId}/items`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function deleteDeckItem(deckId: number, itemId: number) {
  return apiFetch<void>(`/decks/${deckId}/items/${itemId}`, { method: 'DELETE' })
}
