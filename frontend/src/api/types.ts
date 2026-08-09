export type User = {
  id: number
  email: string
  fullName: string
  role: 'USER' | 'ADMIN'
  goal: string | null
  targetCertificate: string | null
  currentLevel: string | null
}

export type Topic = {
  id: number
  name: string
}

export type VocabularySource = 'FREQUENCY' | 'GOETHE' | 'TEXTBOOK'

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
  exampleSentenceHighlight: string | null
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

export type VocabularyStats = {
  learned: number
  remembered: number
  dueForReview: number
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
  phonetic: string | null
  englishMeaning: string | null
  synonyms: string | null
  antonyms: string | null
}

export type VocabLookupResult = {
  germanWord: string
  wordType: string
  vietnameseMeaning: string
  englishMeaning: string | null
  phonetic: string
  exampleSentence: string
  synonyms: string | null
  antonyms: string | null
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
  youtubeVideoId: string | null
  sourceLabel: string | null
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
  youtubeVideoId: string | null
  audioUrl: string | null
  sourceLabel: string | null
  sourceUrl: string | null
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
  youtubeVideoId: string | null
  audioUrl: string | null
  sourceLabel: string | null
  sourceUrl: string | null
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

export type ReadingQuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'MATCHING' | 'FILL_BLANK' | 'SHORT_ANSWER'
export type ReadingCategory = 'EXAM' | 'ARTICLE'

export type ReadingMatchingOption = {
  letter: string
  text: string
}

export type ReadingPassageSummary = {
  id: number
  title: string
  levelMin: string
  levelMax: string
  topic: string | null
  sourceLabel: string | null
  orderIndex: number
  questionCount: number
  category: ReadingCategory
  imageUrl: string | null
  imageAttributionName: string | null
  imageAttributionUrl: string | null
}

export type ReadingQuestionPractice = {
  id: number
  orderIndex: number
  questionText: string
  questionType: ReadingQuestionType
  optionA: string | null
  optionB: string | null
  optionC: string | null
  optionD: string | null
}

export type ReadingPassageDetail = {
  id: number
  title: string
  levelMin: string
  levelMax: string
  topic: string | null
  sourceLabel: string | null
  sourceUrl: string | null
  content: string
  contentTranslation: string | null
  category: ReadingCategory
  imageUrl: string | null
  imageAttributionName: string | null
  imageAttributionUrl: string | null
  questions: ReadingQuestionPractice[]
  matchingOptions: ReadingMatchingOption[]
}

export type ReadingSubmitResult = {
  correctCount: number
  totalCount: number
  results: {
    questionId: number
    correct: boolean
    submittedAnswer: string | null
    correctAnswer: string
    explanation: string | null
  }[]
}

export type ReadingQuestionAdmin = {
  id: number
  orderIndex: number
  questionText: string
  questionType: ReadingQuestionType
  optionA: string | null
  optionB: string | null
  optionC: string | null
  optionD: string | null
  correctAnswer: string
  explanation: string | null
}

export type ReadingPassageAdmin = {
  id: number
  title: string
  levelMin: string
  levelMax: string
  topic: string | null
  sourceLabel: string | null
  sourceUrl: string | null
  orderIndex: number
  content: string
  category: ReadingCategory
  imageUrl: string | null
  imageAttributionName: string | null
  imageAttributionUrl: string | null
  questions: ReadingQuestionAdmin[]
  matchingOptions: ReadingMatchingOption[]
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

export type TutorKnowledgeBatch = {
  batchId: string
  title: string
  level: string
  topic: string
  chunkCount: number
  createdAt: string
}

export type TutorIngestResult = {
  batchId: string
  chunksCreated: number
}

export type TutorHistoryTurn = {
  role: 'user' | 'assistant'
  text: string
}

export type TutorAnswer = {
  answer: string
}

