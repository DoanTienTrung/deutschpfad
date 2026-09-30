package com.deutschpfad.backend.grammar;

import com.deutschpfad.backend.TestcontainersConfiguration;
import com.deutschpfad.backend.auth.CookieUtil;
import com.deutschpfad.backend.auth.JwtService;
import com.deutschpfad.backend.auth.User;
import com.deutschpfad.backend.auth.UserRepository;
import com.deutschpfad.backend.common.EmailService;
import com.deutschpfad.backend.vocabulary.LearningStreakService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

/**
 * Kiểm chứng ranh giới transaction của endpoint nộp bài ngữ pháp.
 *
 * <p>Endpoint ghi ba lần theo thứ tự: lượt làm bài → tiến độ → streak. Trước đây không có
 * {@code @Transactional}, mỗi lệnh ghi tự commit riêng: lệnh cuối lỗi thì hai lệnh đầu vẫn nằm
 * lại trong DB — người học thấy báo lỗi nhưng lượt làm bài đã bị tính.
 *
 * <p>Cách tái hiện: cho lệnh ghi CUỐI CÙNG (streak) ném lỗi, rồi kiểm xem hai lệnh trước có bị
 * huỷ theo không.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
class GrammarSubmitTransactionTest {

    // Chủ điểm có sẵn trong dữ liệu seed của migration (V45/V47).
    private static final String TOPIC_SLUG = "a1-verb-konjugation";

    @LocalServerPort private int port;
    @Autowired private TestRestTemplate restTemplate;
    @Autowired private UserRepository userRepository;
    @Autowired private JwtService jwtService;
    @Autowired private JdbcTemplate jdbcTemplate;

    @MockitoSpyBean private LearningStreakService learningStreakService;
    @MockitoBean private EmailService emailService;

    @Test
    void lenhGhiCuoiCungLoi_haiLenhGhiTruocDoCungBiHuy() {
        User user = createUser();
        doThrow(new IllegalStateException("giả lập lỗi khi ghi streak"))
            .when(learningStreakService).recordActivity(any(User.class));

        ResponseEntity<Map> response = submitEmptyAnswers(user);

        // Chốt chặn: phải chắc request CHẠY TỚI lệnh ghi cuối — tức hai lệnh ghi trước đã được
        // thực thi. Thiếu dòng này thì test có thể pass sai: request chết sớm vì lý do khác (sai
        // slug, thiếu đăng nhập...) cũng cho ra 0 dòng trong DB.
        verify(learningStreakService).recordActivity(any(User.class));
        // Chỉ khẳng định "không thành công", KHÔNG khẳng định mã cụ thể. Thực tế hiện trả về 401
        // thay vì 500: lỗi không được xử lý bị chuyển tới /error, mà /error lại bị Spring Security
        // chặn. Đó là một lỗi riêng (ghi trong docs) — khẳng định 401 ở đây là đóng băng lỗi đó vào
        // test, sau này sửa đúng thành 500 thì test lại đỏ oan.
        assertThat(response.getStatusCode().is2xxSuccessful()).isFalse();

        assertThat(countFor("grammar_exercise_attempts", user)).as("lượt làm bài phải bị huỷ").isZero();
        assertThat(countFor("user_grammar_progress", user)).as("tiến độ phải bị huỷ").isZero();
    }

    @Test
    void khongCoLoi_caBaLenhGhiDeuDuocLuu() {
        // Đối chứng: đường bình thường vẫn ghi đủ. Nếu test trên pass chỉ vì endpoint vốn không
        // ghi gì cả thì test này sẽ đỏ.
        User user = createUser();

        ResponseEntity<Map> response = submitEmptyAnswers(user);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(countFor("grammar_exercise_attempts", user)).isPositive();
        assertThat(countFor("user_grammar_progress", user)).isEqualTo(1);
    }

    private User createUser() {
        User user = new User();
        user.setEmail("tx-" + UUID.randomUUID() + "@example.com");
        user.setPasswordHash("khong-dung-toi");
        user.setFullName("Người Test");
        user.setEmailVerified(true);
        return userRepository.save(user);
    }

    private ResponseEntity<Map> submitEmptyAnswers(User user) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.COOKIE, CookieUtil.COOKIE_NAME + "=" + jwtService.generateToken(user));
        // Không trả lời câu nào: endpoint vẫn chấm (và ghi một lượt làm) cho MỌI bài của chủ điểm.
        Map<String, Object> body = Map.of("answers", List.of());
        return restTemplate.postForEntity(
            "http://localhost:" + port + "/api/grammar/" + TOPIC_SLUG + "/submit",
            new HttpEntity<>(body, headers),
            Map.class
        );
    }

    private int countFor(String table, User user) {
        return jdbcTemplate.queryForObject(
            "SELECT count(*) FROM " + table + " WHERE user_id = ?", Integer.class, user.getId()
        );
    }
}
