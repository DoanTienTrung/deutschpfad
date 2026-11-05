package com.deutschpfad.backend.auth;

import com.deutschpfad.backend.TestcontainersConfiguration;
import com.deutschpfad.backend.common.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tài khoản khách của nút "Dùng thử": tạo và đăng nhập được, bị chặn đúng chỗ, và bị xoá sạch cùng dữ
 * liệu sau 24 giờ. Chạy trên Postgres thật vì phần xoá dựa vào ON DELETE CASCADE của V78.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
class GuestAccountTest {

    @LocalServerPort
    private int port;

    @Autowired private TestRestTemplate restTemplate;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private GuestAccountService guestAccountService;
    @Autowired private JdbcTemplate jdbcTemplate;

    @MockitoBean
    private EmailService emailService;

    @Test
    void taoKhach_dangNhapLuon_vaMeTraVeGuest() {
        ResponseEntity<Map> created = createGuest();

        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(created.getBody()).containsEntry("guest", true);

        ResponseEntity<Map> me = restTemplate.exchange(
            url("/api/auth/me"), HttpMethod.GET, new HttpEntity<>(authCookie(created)), Map.class
        );
        assertThat(me.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(me.getBody()).containsEntry("guest", true).containsEntry("role", "USER");
    }

    @Test
    void khach_khongDoiDuocMatKhau() {
        HttpHeaders headers = authCookie(createGuest());

        ResponseEntity<Map> response = restTemplate.postForEntity(
            url("/api/auth/change-password"),
            new HttpEntity<>(Map.of("currentPassword", "x", "newPassword", "password123"), headers),
            Map.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void khachQua24Gio_biXoaCungDuLieu_taiKhoanThuongThiGiuLai() {
        ResponseEntity<Map> created = createGuest();
        long guestId = ((Number) created.getBody().get("id")).longValue();
        // user_decks và refresh_tokens là hai bảng có khoá ngoại tới users từ trước khi có CASCADE.
        jdbcTemplate.update("INSERT INTO user_decks (user_id, name) VALUES (?, 'Bộ thử')", guestId);

        User regular = new User();
        regular.setEmail("guest-cleanup-regular@example.com");
        regular.setPasswordHash(passwordEncoder.encode("password123"));
        regular.setFullName("Người học thật");
        regular.setEmailVerified(true);
        regular = userRepository.save(regular);

        jdbcTemplate.update(
            "UPDATE users SET created_at = now() - interval '25 hours' WHERE id IN (?, ?)", guestId, regular.getId()
        );

        guestAccountService.deleteExpiredGuests();

        assertThat(userRepository.findById(guestId)).isEmpty();
        assertThat(count("user_decks", guestId)).isZero();
        assertThat(count("refresh_tokens", guestId)).isZero();
        assertThat(userRepository.findById(regular.getId())).isPresent();
    }

    @Test
    void quotaAi_tinhRiengTungKhach_vaCoTranChung() {
        GuestAccessFilter filter = new GuestAccessFilter(2, 3);

        assertThat(filter.tryConsume("a")).isTrue();
        assertThat(filter.tryConsume("a")).isTrue();
        assertThat(filter.tryConsume("a")).isFalse();
        assertThat(filter.tryConsume("b")).isTrue();
        assertThat(filter.tryConsume("c")).as("đã chạm trần chung của mọi khách").isFalse();
    }

    private ResponseEntity<Map> createGuest() {
        // Mỗi lần một IP riêng: /api/auth/guest bị giới hạn theo IP (RateLimitFilter).
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-Forwarded-For", "10.1." + (int) (Math.random() * 250) + "." + (int) (Math.random() * 250));
        return restTemplate.postForEntity(url("/api/auth/guest"), new HttpEntity<>(headers), Map.class);
    }

    private HttpHeaders authCookie(ResponseEntity<?> response) {
        String prefix = CookieUtil.COOKIE_NAME + "=";
        String value = response.getHeaders().get(HttpHeaders.SET_COOKIE).stream()
            .filter(c -> c.startsWith(prefix))
            .map(c -> c.substring(prefix.length(), c.indexOf(';') > 0 ? c.indexOf(';') : c.length()))
            .findFirst()
            .orElseThrow(() -> new AssertionError("Response không đặt cookie đăng nhập"));
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.COOKIE, prefix + value);
        return headers;
    }

    private int count(String table, long userId) {
        // Tên bảng chỉ đến từ code test.
        return jdbcTemplate.queryForObject("SELECT count(*) FROM " + table + " WHERE user_id = ?", Integer.class, userId);
    }

    private String url(String path) {
        return "http://localhost:" + port + path;
    }
}
