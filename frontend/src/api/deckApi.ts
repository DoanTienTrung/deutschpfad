import { apiFetch } from './client'
import type { Deck, DeckItem, VocabLookupResult } from './types'

export function listDecks() {
  return apiFetch<Deck[]>('/decks')
}

export function createDeck(name: string, description: string) {
  return apiFetch<Deck>('/decks', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  })
}

export function updateDeck(deckId: number, name: string, description: string) {
  return apiFetch<Deck>(`/decks/${deckId}`, {
    method: 'PUT',
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
  phonetic?: string
  englishMeaning?: string
  synonyms?: string
  antonyms?: string
}

export function addDeckItem(deckId: number, input: DeckItemInput) {
  return apiFetch<DeckItem>(`/decks/${deckId}/items`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function lookupVocabWord(germanWord: string) {
  return apiFetch<VocabLookupResult>('/decks/lookup', {
    method: 'POST',
    body: JSON.stringify({ germanWord }),
  })
}

export function updateDeckItem(deckId: number, itemId: number, input: DeckItemInput) {
  return apiFetch<DeckItem>(`/decks/${deckId}/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function deleteDeckItem(deckId: number, itemId: number) {
  return apiFetch<void>(`/decks/${deckId}/items/${itemId}`, { method: 'DELETE' })
}
