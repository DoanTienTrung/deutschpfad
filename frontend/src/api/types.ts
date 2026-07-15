export type User = {
  id: number
  email: string
  fullName: string
  role: 'USER' | 'ADMIN'
}

export type Topic = {
  id: number
  name: string
}

export type VocabularySource = 'FREQUENCY' | 'GOETHE'

export type Lesson = {
  id: number
  title: string
  level: string
  source: VocabularySource
  orderIndex: number
  description: string | null
  topicId: number | null
  topicName: string | null
}

export type VocabularyItem = {
  id: number
  germanWord: string
  vietnameseMeaning: string
  englishMeaning: string | null
  phonetic: string | null
  wordType: string | null
  exampleSentence: string | null
  imageUrl: string | null
  level: string
  source: VocabularySource
  topicId: number | null
  topicName: string | null
  lessonId: number | null
  lessonTitle: string | null
}

export type ReviewQuality = 'FORGOT' | 'REMEMBERED' | 'EASY'

export type ReviewResult = {
  repetitions: number
  easeFactor: number
  intervalDays: number
  nextReviewDate: string
}

export type Deck = {
  id: number
  name: string
  description: string | null
  itemCount: number
}

export type DeckItem = {
  id: number
  germanWord: string
  vietnameseMeaning: string
  wordType: string | null
  exampleSentence: string | null
}

export type LessonSummary = {
  id: number
  title: string
  level: string
  source: VocabularySource
  orderIndex: number
  description: string | null
  wordCount: number
  topicId: number | null
  topicName: string | null
}

export type Streak = {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string | null
}

export type ProgressSummary = {
  source: VocabularySource
  level: string
  completedLessons: number
  totalLessons: number
}

export type HeatmapDay = {
  date: string
  count: number
}

export type ListeningSentence = {
  id: number
  orderIndex: number
  text: string
  startSeconds: number
  endSeconds: number
  translation: string | null
  phonetic: string | null
}

export type WordTranslation = {
  word: string
  translation: string | null
  available: boolean
}

export type ListeningExerciseSummary = {
  id: number
  title: string
  levelMin: string
  levelMax: string
  youtubeVideoId: string
  description: string | null
  topic: string | null
  orderIndex: number
  sentenceCount: number
  durationSeconds: number | null
}

export type ListeningExerciseDetail = {
  id: number
  title: string
  levelMin: string
  levelMax: string
  youtubeVideoId: string
  description: string | null
  topic: string | null
  sentences: ListeningSentence[]
}

export type ShadowingFeedback = {
  available: boolean
  transcript: string | null
  words: { word: string; correct: boolean }[]
  scorePercent: number
}

export type ListeningExerciseAdmin = {
  id: number
  title: string
  levelMin: string
  levelMax: string
  youtubeVideoId: string
  description: string | null
  topic: string | null
  orderIndex: number
  autoFetched: boolean
  sentences: ListeningSentence[]
}

export type UserListeningItemSummary = {
  id: number
  title: string
  youtubeVideoId: string
  description: string | null
  sentenceCount: number
  durationSeconds: number | null
}

export type UserListeningItemDetail = {
  id: number
  title: string
  youtubeVideoId: string
  description: string | null
  autoFetched: boolean
  sentences: ListeningSentence[]
}

export type SpeakingPrompt = {
  id: number
  level: string
  promptText: string
  description: string | null
  orderIndex: number
}

export type WordConfidence = {
  word: string
  confidence: number
}

export type SpeakingSubmission = {
  available: boolean
  transcript: string | null
  words: WordConfidence[]
  feedback: string | null
}

export type ConversationTurnDto = {
  id: number
  role: 'USER' | 'AGENT'
  text: string
}

export type RecordingHistory = {
  id: number
  transcript: string | null
  feedback: string | null
  createdAt: string
  turns: ConversationTurnDto[]
}
