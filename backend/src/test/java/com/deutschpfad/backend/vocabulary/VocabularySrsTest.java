package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.TestcontainersConfiguration;
import com.deutschpfad.backend.auth.User;
import com.deutschpfad.backend.auth.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static com.deutschpfad.backend.vocabulary.ReviewQuality.FORGOT;
import static com.deutschpfad.backend.vocabulary.ReviewQuality.REMEMBERED;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

/**
 * Lịch ôn SM-2 theo TỪ, và nguyên tắc "hệ số dễ chỉ đổi ở lần ôn đúng lịch".
 * Cỡ phiên ôn đặt là 3 để kiểm được phần giới hạn mà không phải tạo hàng chục từ.
 */
@SpringBootTest(properties = "app.vocabulary.review-session-size=3")
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
class VocabularySrsTest {

    @Autowired private VocabularyReviewService reviewService;
    @Autowired private VocabularyItemRepository itemRepository;
    @Autowired private UserVocabularyRepository userVocabularyRepository;
    @Autowired private UserRepository userRepository;

    @Test
    void khoaTuDuocTinhTuDongKhiLuu() {
        assertThat(item("das Bild, -er", VocabularyItem.Source.TEXTBOOK).getWordKey()).isEqualTo("das bild");
    }

    @Test
    void cungMotTuOHaiNguon_chiCoMotLichOn() {
        // Trước đây: hai lịch ôn độc lập cho cùng một "die Mutter".
        User user = user();
        VocabularyItem frequency = item("die Mutter", VocabularyItem.Source.FREQUENCY);
        VocabularyItem textbook = item("die Mutter, ¨", VocabularyItem.Source.TEXTBOOK);

        reviewService.submitReview(user, frequency.getId(), REMEMBERED);
        makeDue(user, frequency);
        reviewService.submitReview(user, textbook.getId(), REMEMBERED);

        assertThat(userVocabularyRepository.countByUser(user)).isEqualTo(1);
        assertThat(state(user, frequency).getRepetitions())
            .as("lần ôn qua dòng giáo trình được cộng vào CÙNG lịch ôn").isEqualTo(2);
    }

    @Test
    void gapLanDau_maSai_henNgayMai_khongTruHeSoDe() {
        User user = user();
        VocabularyItem word = item("das Haus", VocabularyItem.Source.FREQUENCY);

        reviewService.submitReview(user, word.getId(), FORGOT);

        UserVocabulary uv = state(user, word);
        assertThat(uv.getNextReviewDate()).isEqualTo(LocalDate.now().plusDays(1));
        assertThat(uv.getEaseFactor()).isCloseTo(2.5, within(1e-9));
    }

    @Test
    void chuaDenHan_traLoiDung_khongDayLichRaXa() {
        // Trước đây làm lại flashcard của một bài trong ngày cũng đẩy lịch ra xa mỗi lần.
        User user = user();
        VocabularyItem word = item("der Tisch", VocabularyItem.Source.FREQUENCY);
        reviewService.submitReview(user, word.getId(), REMEMBERED);
        UserVocabulary before = state(user, word);

        for (int i = 0; i < 5; i++) reviewService.submitReview(user, word.getId(), REMEMBERED);

        UserVocabulary after = state(user, word);
        assertThat(after.getRepetitions()).isEqualTo(before.getRepetitions());
        assertThat(after.getIntervalDays()).isEqualTo(before.getIntervalDays());
        assertThat(after.getNextReviewDate()).isEqualTo(before.getNextReviewDate());
    }

    @Test
    void chuaDenHan_saiNhieuLanTrongNgay_heSoDeKhongBiTruChong() {
        // Luyện đủ các chế độ của một bài mà sai ở vài chế độ: không được trừ -0,8 chồng mỗi lần.
        User user = user();
        VocabularyItem word = item("der Stuhl", VocabularyItem.Source.FREQUENCY);
        reviewService.submitReview(user, word.getId(), REMEMBERED);

        for (int i = 0; i < 3; i++) reviewService.submitReview(user, word.getId(), FORGOT);

        UserVocabulary uv = state(user, word);
        assertThat(uv.getEaseFactor()).isCloseTo(2.5, within(1e-9));
        assertThat(uv.getRepetitions()).isZero();
        assertThat(uv.getNextReviewDate()).isEqualTo(LocalDate.now().plusDays(1));
    }

    @Test
    void denHan_maQuen_apSm2DayDu() {
        // Ôn ĐÚNG LỊCH là phép đo thật — quên thì phải trừ hệ số như SM-2 chuẩn.
        User user = user();
        VocabularyItem word = item("das Fenster", VocabularyItem.Source.FREQUENCY);
        reviewService.submitReview(user, word.getId(), REMEMBERED);
        makeDue(user, word);

        reviewService.submitReview(user, word.getId(), FORGOT);

        assertThat(state(user, word).getEaseFactor()).isCloseTo(1.7, within(1e-9));
    }

    @Test
    void phienOn_gioiHanSoThe_vaTheQuaHanLauNhatLenTruoc() {
        User user = user();
        String[] words = {"der Apfel", "die Birne", "die Banane", "die Kirsche", "die Traube"};
        int[] daysOverdue = {1, 9, 3, 30, 5};
        for (int i = 0; i < words.length; i++) {
            VocabularyItem w = item(words[i], VocabularyItem.Source.FREQUENCY);
            reviewService.submitReview(user, w.getId(), REMEMBERED);
            UserVocabulary uv = state(user, w);
            uv.setNextReviewDate(LocalDate.now().minusDays(daysOverdue[i]));
            userVocabularyRepository.save(uv);
        }

        List<String> session = reviewService.getDueCards(user).stream().map(VocabularyItemResponse::germanWord).toList();

        assertThat(session).as("tối đa 3 thẻ, quá hạn lâu nhất trước")
            .containsExactly("die Kirsche", "die Birne", "die Traube");
        assertThat(reviewService.getStats(user).dueForReview()).as("vẫn đếm đủ mọi thẻ đến hạn").isEqualTo(5);
    }

    // ------------------------------------------------------------------------------------------

    private User user() {
        User user = new User();
        user.setEmail("srs-" + UUID.randomUUID() + "@example.com");
        user.setPasswordHash("khong-dung-toi");
        user.setFullName("Người Test");
        user.setEmailVerified(true);
        return userRepository.save(user);
    }

    private VocabularyItem item(String germanWord, VocabularyItem.Source source) {
        // Các test dùng chung DB và có thể tạo trùng germanWord — không sao, vì mỗi test có người
        // dùng riêng và lịch ôn là duy nhất theo (người dùng, từ).
        VocabularyItem item = new VocabularyItem();
        item.setGermanWord(germanWord);
        item.setVietnameseMeaning("nghĩa thử");
        item.setWordType("Nomen");
        item.setLevel(VocabularyItem.Level.A1);
        item.setSource(source);
        return itemRepository.save(item);
    }

    private UserVocabulary state(User user, VocabularyItem item) {
        return userVocabularyRepository.findByUserAndWordKey(user, item.getWordKey()).orElseThrow();
    }

    private void makeDue(User user, VocabularyItem item) {
        UserVocabulary uv = state(user, item);
        uv.setNextReviewDate(LocalDate.now());
        userVocabularyRepository.save(uv);
    }
}
