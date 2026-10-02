package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.TestcontainersConfiguration;
import com.deutschpfad.backend.auth.User;
import com.deutschpfad.backend.auth.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static com.deutschpfad.backend.vocabulary.ReviewQuality.REMEMBERED;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Nguồn TEXTBOOK ("Bộ từ của Giang") ẩn với người học, admin vẫn thấy; lịch ôn cũ vẫn chạy. */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
class VocabularyVisibilityTest {

    private static final Authentication LEARNER = auth("USER");
    private static final Authentication ADMIN = auth("ADMIN");

    @Autowired private LessonController lessonController;
    @Autowired private VocabularyReviewService reviewService;
    @Autowired private LessonRepository lessonRepository;
    @Autowired private VocabularyItemRepository itemRepository;
    @Autowired private UserVocabularyRepository userVocabularyRepository;
    @Autowired private UserRepository userRepository;

    @Test
    void baiGiaoTrinh_anVoiNguoiHoc_adminVanThay() {
        Lesson lesson = textbookLesson();
        item("die Kiste, -n", VocabularyItem.Source.TEXTBOOK, lesson, "Die Kiste ist schwer.");

        assertThat(lessonController.list(VocabularyItem.Level.A1, null, VocabularyItem.Source.TEXTBOOK, LEARNER))
            .noneMatch(l -> l.id().equals(lesson.getId()));
        assertThat(lessonController.list(VocabularyItem.Level.A1, null, VocabularyItem.Source.TEXTBOOK, ADMIN))
            .anyMatch(l -> l.id().equals(lesson.getId()));

        // Người đã lưu link /app/practice/{id} cũng không mở được.
        assertThatThrownBy(() -> lessonController.vocabularyItems(lesson.getId(), LEARNER))
            .isInstanceOf(ResponseStatusException.class);
        assertThat(lessonController.vocabularyItems(lesson.getId(), ADMIN)).hasSize(1);
    }

    @Test
    void lichOnCu_cuaTuGiaoTrinh_hienBangDongCungTuONguonKhac() {
        User user = user();
        VocabularyItem textbook = item("der Korb, ¨e", VocabularyItem.Source.TEXTBOOK, textbookLesson(), "Der Korb ist voll.");
        VocabularyItem frequency = item("der Korb", VocabularyItem.Source.FREQUENCY, null, "Ich trage einen Korb.");
        reviewService.submitReview(user, textbook.getId(), REMEMBERED);
        makeDue(user, textbook);

        List<VocabularyItemResponse> cards = reviewService.getDueCards(user);

        assertThat(cards).hasSize(1);
        assertThat(cards.get(0).id()).as("thẻ ôn hiện bằng dòng ở nguồn đang mở").isEqualTo(frequency.getId());
        assertThat(cards.get(0).exampleSentence()).isEqualTo("Ich trage einen Korb.");
    }

    @Test
    void lichOnCu_khongCoDongThayThe_vanOnDuoc_nhungBoCauViDu() {
        User user = user();
        VocabularyItem textbook = item("der Schwager, ¨", VocabularyItem.Source.TEXTBOOK, textbookLesson(), "Das ist mein Schwager.");
        reviewService.submitReview(user, textbook.getId(), REMEMBERED);
        makeDue(user, textbook);

        VocabularyItemResponse card = reviewService.getDueCards(user).get(0);

        assertThat(card.id()).isEqualTo(textbook.getId());
        assertThat(card.vietnameseMeaning()).isNotBlank();
        assertThat(card.exampleSentence()).as("câu ví dụ chép từ sách không được hiện").isNull();
        assertThat(card.lessonTitle()).isNull();
    }

    // ------------------------------------------------------------------------------------------

    private static Authentication auth(String role) {
        return new UsernamePasswordAuthenticationToken("x", null, List.of(new SimpleGrantedAuthority("ROLE_" + role)));
    }

    private Lesson textbookLesson() {
        Lesson lesson = new Lesson();
        lesson.setTitle("Lektion (kiểm thử)");
        lesson.setLevel(VocabularyItem.Level.A1);
        lesson.setSource(VocabularyItem.Source.TEXTBOOK);
        lesson.setOrderIndex(1);
        return lessonRepository.save(lesson);
    }

    private VocabularyItem item(String germanWord, VocabularyItem.Source source, Lesson lesson, String example) {
        VocabularyItem item = new VocabularyItem();
        item.setGermanWord(germanWord);
        item.setVietnameseMeaning("(kiểm thử)");
        item.setLevel(VocabularyItem.Level.A1);
        item.setSource(source);
        item.setLesson(lesson);
        item.setExampleSentence(example);
        return itemRepository.save(item);
    }

    private User user() {
        User user = new User();
        user.setEmail("vis-" + UUID.randomUUID() + "@example.com");
        user.setPasswordHash("khong-dung-toi");
        user.setFullName("Người Test");
        user.setEmailVerified(true);
        return userRepository.save(user);
    }

    private void makeDue(User user, VocabularyItem item) {
        UserVocabulary uv = userVocabularyRepository.findByUserAndWordKey(user, item.getWordKey()).orElseThrow();
        uv.setNextReviewDate(LocalDate.now());
        userVocabularyRepository.save(uv);
    }
}
