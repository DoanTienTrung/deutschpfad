import type { GrammarExercisePractice } from '../api/types'

/**
 * Xáo thứ tự bài tập và thứ tự phương án trắc nghiệm.
 *
 * Vì sao cần: backend trả bài theo `orderIndex` cố định và phương án A/B/C cũng cố định. Làm lại
 * lần hai, người học nhớ *vị trí đáp án* chứ không nhớ ngữ pháp — bài tập mất tác dụng đo lường,
 * đúng như lỗi "78% đáp án rơi vào ô B" đã phải sửa bằng migration trước đây.
 *
 * Xáo ở client là đủ và an toàn: đáp án không nằm trong payload gửi xuống (xem
 * GrammarExercisePracticeResponse), còn bài nộp lên đi theo `exerciseId` nên trật tự hiển thị
 * không ảnh hưởng gì tới việc chấm.
 */

function shuffled<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * Với bài trắc nghiệm, phương án được xáo và ánh xạ lại vào A/B/C.
 * Trả kèm `letterMap`: chữ cái hiển thị → chữ cái gốc, để lúc nộp gửi đúng đáp án backend hiểu.
 */
export type ShuffledExercise = GrammarExercisePractice & {
  letterMap: Record<string, string>
}

const LETTERS = ['A', 'B', 'C', 'D'] as const

export function shuffleForPractice(exercises: GrammarExercisePractice[]): ShuffledExercise[] {
  return shuffled(exercises).map((exercise) => {
    if (exercise.exerciseType !== 'MULTIPLE_CHOICE') {
      return { ...exercise, letterMap: {} }
    }

    const original = [exercise.optionA, exercise.optionB, exercise.optionC, exercise.optionD]
      .map((text, i) => ({ text, letter: LETTERS[i] as string }))
      .filter((o): o is { text: string; letter: string } => o.text !== null && o.text !== '')

    const mixed = shuffled(original)
    const letterMap: Record<string, string> = {}
    const slots: (string | null)[] = [null, null, null, null]
    mixed.forEach((option, i) => {
      slots[i] = option.text
      letterMap[LETTERS[i]] = option.letter
    })

    return {
      ...exercise,
      optionA: slots[0],
      optionB: slots[1],
      optionC: slots[2],
      optionD: slots[3],
      letterMap,
    }
  })
}
