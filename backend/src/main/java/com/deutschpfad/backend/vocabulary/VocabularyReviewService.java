package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.auth.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
public class VocabularyReviewService {

    /** SM2 repetitions count at which a word is considered "remembered" (past the 1-day/6-day bootstrap). */
    private static final int REMEMBERED_MIN_REPETITIONS = 2;

    private final VocabularyItemRepository vocabularyItemRepository;
    private final UserVocabularyRepository userVocabularyRepository;
    private final LearningStreakService learningStreakService;
    private final VocabularyVisibility visibility;
    private final int reviewSessionSize;

    public VocabularyReviewService(
        VocabularyItemRepository vocabularyItemRepository,
        UserVocabularyRepository userVocabularyRepository,
        LearningStreakService learningStreakService,
        VocabularyVisibility visibility,
        @Value("${app.vocabulary.review-session-size:30}") int reviewSessionSize
    ) {
        this.vocabularyItemRepository = vocabularyItemRepository;
        this.userVocabularyRepository = userVocabularyRepository;
        this.learningStreakService = learningStreakService;
        this.visibility = visibility;
        this.reviewSessionSize = reviewSessionSize;
    }

    /** Một phiên ôn: tối đa {@code reviewSessionSize} thẻ, thẻ quá hạn lâu nhất trước. */
    public List<VocabularyItemResponse> getDueCards(User user) {
        return userVocabularyRepository
            .findDue(user, LocalDate.now(), PageRequest.of(0, reviewSessionSize))
            .stream()
            .map(uv -> visibleCard(uv.getVocabularyItem()))
            .toList();
    }

    /**
     * Thẻ ôn của một từ mà dòng gắn với lịch ôn thuộc nguồn đang ẩn (xem {@link VocabularyVisibility}):
     * lịch ôn gắn với TỪ, nên lấy dòng cùng từ ở nguồn khác để hiện — chấm thẻ đó vẫn cộng vào đúng
     * lịch ôn. Không có dòng nào khác thì vẫn cho ôn nhưng bỏ câu ví dụ (phần chép từ sách).
     */
    private VocabularyItemResponse visibleCard(VocabularyItem item) {
        if (!visibility.isHidden(item.getSource())) return VocabularyItemResponse.from(item);
        return vocabularyItemRepository.findByWordKey(item.getWordKey()).stream()
            .filter(other -> !visibility.isHidden(other.getSource()))
            .min(Comparator.comparing((VocabularyItem other) -> other.getExampleSentence() == null)
                .thenComparing(VocabularyItem::getId))
            .map(VocabularyItemResponse::from)
            .orElseGet(() -> VocabularyItemResponse.from(item).withoutExample());
    }

    public VocabularyStatsResponse getStats(User user) {
        long learned = userVocabularyRepository.countByUser(user);
        long remembered = userVocabularyRepository.countByUserAndRepetitionsGreaterThanEqual(user, REMEMBERED_MIN_REPETITIONS);
        long dueForReview = userVocabularyRepository.countByUserAndNextReviewDateLessThanEqual(user, LocalDate.now());
        return new VocabularyStatsResponse(learned, remembered, dueForReview);
    }

    /**
     * Ghi một kết quả ôn/luyện từ BẤT KỲ chế độ nào (flashcard tự chấm, trắc nghiệm, nghe chọn, gõ
     * từ, chính tả) vào lịch ôn của TỪ đó.
     *
     * <p><b>Nguyên tắc: hệ số dễ chỉ thay đổi ở lần ôn ĐÚNG LỊCH.</b> Từ khi cả 5 chế độ cùng ghi vào
     * SM-2, một buổi luyện đủ các chế độ của một bài sẽ đưa mỗi từ qua đây nhiều lần liền. Nếu lần nào
     * cũng áp SM-2 đầy đủ thì:
     * <ul>
     *   <li>trả lời đúng 5 lần trong một buổi → khoảng cách nhảy 1 → 6 → 15 → 38 → 95 ngày ngay trong
     *       ngày, cho một từ vừa mới học;</li>
     *   <li>sai ở vài chế độ → hệ số dễ bị trừ 0,8 chồng nhiều lần trong ngày, tụt về sàn 1,30 —
     *       chính là "ease hell" mà đợt 1 vừa sửa, chỉ đi đường khác.</li>
     * </ul>
     * Nên chỉ lần ôn khi từ ĐÃ ĐẾN HẠN mới là phép đo thật về việc người học còn nhớ sau một khoảng
     * thời gian. Mọi lần khác chỉ quyết định từ có cần quay lại sớm hay không. Nguyên tắc này đồng
     * thời sửa một lỗi có sẵn: làm lại flashcard của một bài nhiều lần trong ngày cũng đẩy lịch ra xa.
     */
    @Transactional
    public ReviewResultResponse submitReview(User user, Long vocabularyItemId, ReviewQuality quality) {
        VocabularyItem item = vocabularyItemRepository.findById(vocabularyItemId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy từ vựng"));
        LocalDate today = LocalDate.now();

        UserVocabulary existing = userVocabularyRepository.findByUserAndWordKey(user, item.getWordKey()).orElse(null);
        boolean forgot = quality == ReviewQuality.FORGOT;

        UserVocabulary uv;
        if (existing == null) {
            uv = new UserVocabulary();
            uv.setUser(user);
            uv.setVocabularyItem(item);
            uv.setWordKey(item.getWordKey());
            // Gặp lần đầu: sai là chuyện bình thường của việc HỌC, chưa phải bằng chứng QUÊN — hẹn
            // ngày mai, không trừ hệ số dễ. Đúng thì áp SM-2 như thường.
            if (forgot) relearnTomorrow(uv, today);
            else applySm2(uv, quality);
        } else if (!existing.getNextReviewDate().isAfter(today)) {
            uv = existing;
            applySm2(uv, quality); // ôn đúng lịch: phép đo thật, áp SM-2 đầy đủ
        } else if (forgot) {
            uv = existing;
            relearnTomorrow(uv, today); // luyện thêm mà sai: quay lại sớm, không trừ hệ số chồng
        } else {
            // Luyện thêm một từ chưa đến hạn mà đúng: không đẩy lịch ra xa hơn.
            learningStreakService.recordActivity(user);
            return toResponse(existing);
        }

        uv.setLastReviewedAt(LocalDateTime.now());
        userVocabularyRepository.save(uv);
        learningStreakService.recordActivity(user);
        return toResponse(uv);
    }

    private static void applySm2(UserVocabulary uv, ReviewQuality quality) {
        Sm2Calculator.Result result = Sm2Calculator.calculate(
            uv.getRepetitions(), uv.getEaseFactor(), uv.getIntervalDays(), quality.getQuality()
        );
        uv.setRepetitions(result.repetitions());
        uv.setEaseFactor(result.easeFactor());
        uv.setIntervalDays(result.intervalDays());
        uv.setNextReviewDate(result.nextReviewDate());
    }

    private static void relearnTomorrow(UserVocabulary uv, LocalDate today) {
        uv.setRepetitions(0);
        uv.setIntervalDays(1);
        uv.setNextReviewDate(today.plusDays(1));
    }

    private static ReviewResultResponse toResponse(UserVocabulary uv) {
        return new ReviewResultResponse(
            uv.getRepetitions(), uv.getEaseFactor(), uv.getIntervalDays(), uv.getNextReviewDate()
        );
    }
}
