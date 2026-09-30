package com.deutschpfad.backend.auth;

import com.deutschpfad.backend.TestcontainersConfiguration;
import com.deutschpfad.backend.auth.RefreshToken.RevokeReason;
import com.deutschpfad.backend.common.EmailService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

/**
 * Kiểm chứng các lỗ hổng token đã được sửa. Mỗi test ứng với đúng một lỗi cụ thể.
 *
 * <p>Chạy trên Postgres thật (Testcontainers) chứ không mock repository: phần lớn các lỗi ở đây
 * nằm ở hành vi của chính database — khoá dòng, mức cô lập transaction, rollback — thứ mà mock
 * không tái hiện được.
 *
 * <p>Test lấy phiên đăng nhập qua {@link RefreshTokenService#startSession} thay vì gọi
 * {@code /api/auth/login}: endpoint đăng nhập bị giới hạn 5 lần/phút, gọi nhiều là dính 429.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
class TokenSecurityTest {

    private static final Pattern TOKEN_IN_LINK = Pattern.compile("token=([A-Za-z0-9_-]+)");

    @LocalServerPort
    private int port;

    @Autowired private TestRestTemplate restTemplate;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private RefreshTokenService refreshTokenService;
    @Autowired private RefreshTokenRepository refreshTokenRepository;
    @Autowired private JwtService jwtService;
    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private PlatformTransactionManager transactionManager;

    @MockitoBean
    private EmailService emailService;

    // ------------------------------------------------------------------------------------------
    // Lỗi 1: token lưu dạng thô trong database
    // ------------------------------------------------------------------------------------------

    @Test
    void refreshToken_databaseChiLuuHash_khongLuuGiaTriGoc() {
        String raw = refreshTokenService.startSession(createVerifiedUser());

        assertThat(countRows("refresh_tokens", raw)).as("giá trị gốc không được nằm trong DB").isZero();
        assertThat(countRows("refresh_tokens", SecureTokens.hash(raw))).isEqualTo(1);
    }

    /**
     * Migration V65 băm TẠI CHỖ các token đang còn hạn bằng SQL. Nếu cách băm của SQL lệch với
     * {@link SecureTokens#hash} dù chỉ một byte, mọi người dùng đang đăng nhập bị đá ra và mọi link
     * xác thực đã gửi đi đều chết — mà không có lỗi nào báo ra.
     */
    @Test
    void hashCuaJava_khopTungByteVoiHashCuaMigrationSql() {
        List<String> samples = List.of(
            "0f8fad5b-d9cb-469f-a165-70867728950e",  // định dạng token cũ (UUID) — thứ migration sẽ gặp
            SecureTokens.newToken(),                  // định dạng token mới
            "Tiếng Việt có dấu ✓"                    // ký tự nhiều byte: bắt lỗi lệch bảng mã
        );
        for (String sample : samples) {
            String sqlHash = jdbcTemplate.queryForObject(
                "SELECT encode(sha256(convert_to(?, 'UTF8')), 'hex')", String.class, sample
            );
            assertThat(SecureTokens.hash(sample)).as("mẫu: %s", sample).isEqualTo(sqlHash);
        }
    }

    // ------------------------------------------------------------------------------------------
    // Lỗi 2: phát hiện dùng lại nhưng không thu hồi gì
    // ------------------------------------------------------------------------------------------

    /**
     * Code cũ chỉ từ chối token bị dùng lại. Nếu kẻ trộm dùng token TRƯỚC chủ tài khoản, chúng giữ
     * được token kế tiếp mãi mãi. Giờ dùng lại → thu hồi cả họ, nên token kế tiếp cũng chết.
     *
     * <p>Test này đồng thời canh {@code noRollbackFor}: lệnh thu hồi cả họ được ghi rồi mới ném lỗi
     * 401. Thiếu {@code noRollbackFor} thì Spring rollback, token kế tiếp vẫn sống, test này đỏ.
     */
    @Test
    void dungLaiTokenDaXoay_thuHoiCaHo_nenTokenKeTiepCungBiTuChoi() {
        String t1 = refreshTokenService.startSession(createVerifiedUser());

        ResponseEntity<Map> rotated = refresh(t1);
        assertThat(rotated.getStatusCode()).isEqualTo(HttpStatus.OK);
        String t2 = refreshCookieValue(rotated);

        assertThat(refresh(t1).getStatusCode()).as("dùng lại token cũ").isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(refresh(t2).getStatusCode()).as("token kế tiếp cũng phải chết").isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(revokeReasonOf(t2)).isEqualTo(RevokeReason.REUSE_DETECTED.name());
    }

    // ------------------------------------------------------------------------------------------
    // Lỗi 3: race condition khi xoay vòng
    // ------------------------------------------------------------------------------------------

    /**
     * Bằng chứng trực tiếp cho cơ chế chống race: nhiều luồng cùng lúc cố thu hồi CÙNG MỘT token,
     * mỗi luồng trong transaction riêng. Kiểm tra-và-ghi nằm trong một câu UPDATE, nên luôn đúng
     * một luồng thắng — không phụ thuộc thời điểm, không chập chờn.
     */
    @Test
    void revokeIfActive_nhieuLuongCungLuc_luonChiDungMotLuongThang() throws Exception {
        String raw = refreshTokenService.startSession(createVerifiedUser());
        Long id = refreshTokenRepository.findByTokenHash(SecureTokens.hash(raw)).orElseThrow().getId();
        TransactionTemplate tx = new TransactionTemplate(transactionManager);

        List<Integer> results = runConcurrently(10, () ->
            tx.execute(status -> refreshTokenRepository.revokeIfActive(id, LocalDateTime.now(), RevokeReason.ROTATED))
        );

        assertThat(results.stream().mapToInt(Integer::intValue).sum()).isEqualTo(1);
    }

    /**
     * Cùng kịch bản nhưng đi qua HTTP thật. Code cũ: nhiều request cùng đổi được token, mỗi request
     * nhận một token mới hợp lệ. Giờ: đúng một request thành công, các request còn lại bị coi là
     * dùng lại → thu hồi cả họ, kể cả token vừa phát cho request thắng.
     */
    @Test
    void nhieuRequestRefreshCungLuc_chiMotRequestThanhCong_vaCaHoBiThuHoi() throws Exception {
        String t1 = refreshTokenService.startSession(createVerifiedUser());

        List<ResponseEntity<Map>> responses = runConcurrently(8, () -> refresh(t1));

        List<ResponseEntity<Map>> winners = responses.stream()
            .filter(r -> r.getStatusCode() == HttpStatus.OK).toList();
        assertThat(winners).as("số request đổi được token").hasSize(1);
        assertThat(responses).filteredOn(r -> r.getStatusCode() == HttpStatus.UNAUTHORIZED).hasSize(7);

        String winnerToken = refreshCookieValue(winners.get(0));
        assertThat(refresh(winnerToken).getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    // ------------------------------------------------------------------------------------------
    // Đăng xuất, đổi / đặt lại mật khẩu
    // ------------------------------------------------------------------------------------------

    @Test
    void dangXuat_ketThucCaPhien() {
        String t1 = refreshTokenService.startSession(createVerifiedUser());
        String t2 = refreshCookieValue(refresh(t1));

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.COOKIE, CookieUtil.REFRESH_COOKIE_NAME + "=" + t2);
        ResponseEntity<Void> logout = restTemplate.postForEntity(url("/api/auth/logout"), new HttpEntity<>(headers), Void.class);

        assertThat(logout.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(refresh(t2).getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    /**
     * Code cũ: đặt lại mật khẩu KHÔNG thu hồi phiên nào — kẻ đã chiếm được phiên vẫn tiếp tục dùng
     * refresh token để lấy access token mới, dù nạn nhân đã đổi mật khẩu.
     */
    @Test
    void datLaiMatKhau_dangXuatMoiThietBi_vaTokenDatLaiChiLuuHash() {
        User user = createVerifiedUser();
        String hijackedSession = refreshTokenService.startSession(user);

        ResponseEntity<Map> forgot = restTemplate.postForEntity(
            url("/api/auth/forgot-password"),
            new HttpEntity<>(Map.of("email", user.getEmail()), uniqueClientHeaders()),
            Map.class
        );
        assertThat(forgot.getStatusCode()).isEqualTo(HttpStatus.OK);

        String resetToken = rawTokenFromEmailSentTo(user.getEmail());
        assertThat(countRows("password_reset_tokens", resetToken)).isZero();
        assertThat(countRows("password_reset_tokens", SecureTokens.hash(resetToken))).isEqualTo(1);

        Map<String, String> body = Map.of("token", resetToken, "newPassword", "mat-khau-moi-456");
        ResponseEntity<Map> reset = restTemplate.postForEntity(url("/api/auth/reset-password"), body, Map.class);
        assertThat(reset.getStatusCode()).isEqualTo(HttpStatus.OK);

        assertThat(refresh(hijackedSession).getStatusCode())
            .as("phiên của kẻ chiếm tài khoản phải bị đá ra").isEqualTo(HttpStatus.UNAUTHORIZED);

        ResponseEntity<Map> reuse = restTemplate.postForEntity(url("/api/auth/reset-password"), body, Map.class);
        assertThat(reuse.getStatusCode()).as("link đặt lại chỉ dùng được một lần").isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void doiMatKhau_dangXuatThietBiKhac_nhungGiuPhienCuaThietBiDangDung() {
        User user = createVerifiedUser();
        String thisDevice = refreshTokenService.startSession(user);
        String otherDevice = refreshTokenService.startSession(user);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.COOKIE, CookieUtil.COOKIE_NAME + "=" + jwtService.generateToken(user));
        Map<String, String> body = Map.of("currentPassword", "mat-khau-cu-123", "newPassword", "mat-khau-moi-456");
        ResponseEntity<Map> change = restTemplate.postForEntity(
            url("/api/auth/change-password"), new HttpEntity<>(body, headers), Map.class
        );
        assertThat(change.getStatusCode()).isEqualTo(HttpStatus.OK);

        assertThat(refresh(otherDevice).getStatusCode()).as("máy khác bị đá ra").isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(refresh(thisDevice).getStatusCode()).as("token cũ của máy này cũng hết hiệu lực").isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(refresh(refreshCookieValue(change)).getStatusCode())
            .as("máy đang dùng được cấp phiên mới, vẫn dùng tiếp được").isEqualTo(HttpStatus.OK);
    }

    @Test
    void xacThucEmail_tokenChiLuuHash_vaLinkTrongEmailVanDungDuoc() {
        String email = uniqueEmail();
        Map<String, String> body = Map.of("email", email, "password", "mat-khau-123", "fullName", "Người Test");
        ResponseEntity<Map> register = restTemplate.postForEntity(
            url("/api/auth/register"), new HttpEntity<>(body, uniqueClientHeaders()), Map.class
        );
        assertThat(register.getStatusCode()).isEqualTo(HttpStatus.OK);

        String token = rawTokenFromEmailSentTo(email);
        assertThat(countRows("email_verification_tokens", token)).isZero();
        assertThat(countRows("email_verification_tokens", SecureTokens.hash(token))).isEqualTo(1);

        ResponseEntity<Map> verify = restTemplate.postForEntity(url("/api/auth/verify-email?token=" + token), null, Map.class);
        assertThat(verify.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(userRepository.findByEmail(email).orElseThrow().isEmailVerified()).isTrue();
    }

    // ------------------------------------------------------------------------------------------

    private String url(String path) {
        return "http://localhost:" + port + path;
    }

    private String uniqueEmail() {
        return "token-sec-" + UUID.randomUUID() + "@example.com";
    }

    private User createVerifiedUser() {
        User user = new User();
        user.setEmail(uniqueEmail());
        user.setPasswordHash(passwordEncoder.encode("mat-khau-cu-123"));
        user.setFullName("Người Test");
        user.setEmailVerified(true);
        return userRepository.save(user);
    }

    /**
     * RateLimitFilter phân biệt client theo header X-Real-IP. Mỗi request một địa chỉ riêng để các
     * test không ăn chung hạn mức của register/forgot-password và dính 429 ngẫu nhiên.
     */
    private HttpHeaders uniqueClientHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-Real-IP", "10.0." + (int) (Math.random() * 250) + "." + (int) (Math.random() * 250));
        return headers;
    }

    private ResponseEntity<Map> refresh(String rawRefreshToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.COOKIE, CookieUtil.REFRESH_COOKIE_NAME + "=" + rawRefreshToken);
        return restTemplate.postForEntity(url("/api/auth/refresh"), new HttpEntity<>(headers), Map.class);
    }

    private String refreshCookieValue(ResponseEntity<?> response) {
        String prefix = CookieUtil.REFRESH_COOKIE_NAME + "=";
        return response.getHeaders().get(HttpHeaders.SET_COOKIE).stream()
            .filter(c -> c.startsWith(prefix))
            .map(c -> c.substring(prefix.length(), c.indexOf(';') > 0 ? c.indexOf(';') : c.length()))
            .findFirst()
            .orElseThrow(() -> new AssertionError("Response không đặt cookie refresh_token"));
    }

    private int countRows(String table, String tokenHashValue) {
        // Tên bảng chỉ đến từ code test, không phải dữ liệu người dùng — nối chuỗi là an toàn.
        return jdbcTemplate.queryForObject(
            "SELECT count(*) FROM " + table + " WHERE token_hash = ?", Integer.class, tokenHashValue
        );
    }

    private String revokeReasonOf(String rawRefreshToken) {
        return jdbcTemplate.queryForObject(
            "SELECT revoke_reason FROM refresh_tokens WHERE token_hash = ?", String.class,
            SecureTokens.hash(rawRefreshToken)
        );
    }

    /** Lấy token gốc từ link trong email — cách duy nhất có được nó, vì DB chỉ còn giữ hash. */
    private String rawTokenFromEmailSentTo(String email) {
        ArgumentCaptor<String> textBody = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendHtml(eq(email), anyString(), textBody.capture(), anyString());
        Matcher matcher = TOKEN_IN_LINK.matcher(textBody.getValue());
        assertThat(matcher.find()).as("email phải chứa link có token").isTrue();
        return matcher.group(1);
    }

    /** Thả tất cả luồng chạy cùng một lúc, để chúng thật sự tranh nhau thay vì chạy lần lượt. */
    private <T> List<T> runConcurrently(int threads, java.util.concurrent.Callable<T> task) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        try {
            CountDownLatch ready = new CountDownLatch(threads);
            CountDownLatch go = new CountDownLatch(1);
            List<Future<T>> futures = new ArrayList<>();
            for (int i = 0; i < threads; i++) {
                futures.add(pool.submit(() -> {
                    ready.countDown();
                    go.await();
                    return task.call();
                }));
            }
            ready.await();
            go.countDown();

            List<T> results = new ArrayList<>();
            for (Future<T> f : futures) {
                results.add(f.get());
            }
            return results;
        } finally {
            pool.shutdownNow();
        }
    }
}
