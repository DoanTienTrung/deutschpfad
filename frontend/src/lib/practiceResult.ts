import { submitReview } from '../api/vocabularyApi'
import type { VocabularyItem } from '../api/types'

/**
 * Kết quả LẦN THỬ ĐẦU của một từ ở chế độ chấm khách quan (trắc nghiệm, nghe chọn, gõ từ, chính
 * tả). Lần thử đầu mới là phép đo — gõ lại cho đúng sau khi đã xem đáp án thì không còn đo việc
 * nhớ nữa.
 */
export type PracticeResultHandler = (item: VocabularyItem, correct: boolean) => void

/**
 * Ghi kết quả vào lịch ôn SM-2. Trước đây chỉ flashcard tự chấm mới ghi vào SM-2; 5 chế độ còn lại
 * — đúng là những chỗ hệ thống BIẾT CHẮC người học đúng hay sai — bị bỏ phí: gõ sai một từ trong
 * bài chính tả thì từ đó vẫn không được xếp lịch ôn lại.
 *
 * Backend quyết định có thật sự đổi lịch hay không (xem VocabularyReviewService.submitReview —
 * luyện thêm một từ chưa đến hạn thì không đẩy lịch ra xa), nên ở đây cứ gửi mọi kết quả.
 *
 * Gửi đi rồi bỏ qua lỗi: buổi luyện không được dừng lại vì mất mạng; mất một lần ghi chỉ làm lịch
 * ôn kém chính xác một chút.
 *
 * Do TRANG truyền vào component, không phải component tự gọi: id ở đây phải là id của TỪ VỰNG. Khi
 * bộ từ cá nhân dùng lại các component này, id sẽ là id của mục trong bộ từ — tự gọi API ở trong
 * component là cập nhật nhầm sang một từ khác.
 */
export const recordPracticeResult: PracticeResultHandler = (item, correct) => {
  submitReview(item.id, correct ? 'REMEMBERED' : 'FORGOT').catch(() => {})
}
