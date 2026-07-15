package com.deutschpfad.backend.auth;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.deutschpfad.backend.common.EmailService;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AuthControllerTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private EmailService emailService;

    private String url(String path) {
        return "http://localhost:" + port + path;
    }

    private User createVerifiedUser(String email, String rawPassword) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setFullName("Test User");
        user.setEmailVerified(true);
        return userRepository.save(user);
    }

    @Test
    void register_thanhCong_traVe200() {
        Map<String, String> body = Map.of(
            "email", "test-register@example.com",
            "password", "password123",
            "fullName", "Nguyen Van A"
        );

        ResponseEntity<Map> response = restTemplate.postForEntity(url("/api/auth/register"), body, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("email", "test-register@example.com");
    }

    @Test
    void register_emailTrung_traVe409() {
        Map<String, String> body = Map.of(
            "email", "test-duplicate@example.com",
            "password", "password123",
            "fullName", "Nguyen Van B"
        );

        restTemplate.postForEntity(url("/api/auth/register"), body, Map.class);
        ResponseEntity<Map> secondResponse = restTemplate.postForEntity(url("/api/auth/register"), body, Map.class);

        assertThat(secondResponse.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void register_matKhauQuaNgan_traVe400() {
        Map<String, String> body = Map.of(
            "email", "test-shortpass@example.com",
            "password", "123",
            "fullName", "Nguyen Van C"
        );

        ResponseEntity<Map> response = restTemplate.postForEntity(url("/api/auth/register"), body, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void login_dungMatKhau_traVe200VaCookie() {
        createVerifiedUser("test-login-ok@example.com", "password123");

        Map<String, String> body = Map.of(
            "email", "test-login-ok@example.com",
            "password", "password123"
        );

        ResponseEntity<Map> response = restTemplate.postForEntity(url("/api/auth/login"), body, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getHeaders().get(HttpHeaders.SET_COOKIE)).isNotNull();
    }

    @Test
    void login_saiMatKhau_traVe401() {
        createVerifiedUser("test-login-wrong@example.com", "password123");

        Map<String, String> body = Map.of(
            "email", "test-login-wrong@example.com",
            "password", "sai-mat-khau"
        );

        ResponseEntity<Map> response = restTemplate.postForEntity(url("/api/auth/login"), body, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void login_chuaXacThucEmail_traVe401() {
        User user = new User();
        user.setEmail("test-login-unverified@example.com");
        user.setPasswordHash(passwordEncoder.encode("password123"));
        user.setFullName("Test User");
        user.setEmailVerified(false);
        userRepository.save(user);

        Map<String, String> body = Map.of(
            "email", "test-login-unverified@example.com",
            "password", "password123"
        );

        ResponseEntity<Map> response = restTemplate.postForEntity(url("/api/auth/login"), body, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void me_khongCoCookie_traVe401() {
        ResponseEntity<Map> response = restTemplate.getForEntity(url("/api/auth/me"), Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void me_coCookieHopLe_traVe200() {
        createVerifiedUser("test-me@example.com", "password123");

        Map<String, String> loginBody = Map.of(
            "email", "test-me@example.com",
            "password", "password123"
        );
        ResponseEntity<Map> loginResponse = restTemplate.postForEntity(url("/api/auth/login"), loginBody, Map.class);
        String cookie = loginResponse.getHeaders().getFirst(HttpHeaders.SET_COOKIE);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.COOKIE, cookie);
        HttpEntity<Void> request = new HttpEntity<>(headers);

        ResponseEntity<Map> meResponse = restTemplate.exchange(
            url("/api/auth/me"), org.springframework.http.HttpMethod.GET, request, Map.class
        );

        assertThat(meResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(meResponse.getBody()).containsEntry("email", "test-me@example.com");
    }

    @Test
    void refresh_tokenHopLe_traVeCookieMoi_vaThuHoiTokenCu() {
        createVerifiedUser("test-refresh@example.com", "password123");

        Map<String, String> loginBody = Map.of(
            "email", "test-refresh@example.com",
            "password", "password123"
        );
        ResponseEntity<Map> loginResponse = restTemplate.postForEntity(url("/api/auth/login"), loginBody, Map.class);
        String refreshCookie = extractCookieHeader(loginResponse, CookieUtil.REFRESH_COOKIE_NAME);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.COOKIE, refreshCookie);
        HttpEntity<Void> request = new HttpEntity<>(headers);

        ResponseEntity<Map> refreshResponse = restTemplate.postForEntity(url("/api/auth/refresh"), request, Map.class);
        assertThat(refreshResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(refreshResponse.getHeaders().get(HttpHeaders.SET_COOKIE)).isNotNull();

        // Dùng lại refresh token CŨ (đã bị rotation thu hồi) -> phải bị từ chối
        ResponseEntity<Map> reuseResponse = restTemplate.postForEntity(url("/api/auth/refresh"), request, Map.class);
        assertThat(reuseResponse.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    private String extractCookieHeader(ResponseEntity<?> response, String cookieName) {
        return response.getHeaders().get(HttpHeaders.SET_COOKIE).stream()
            .filter(c -> c.startsWith(cookieName + "="))
            .findFirst()
            .map(c -> c.split(";")[0])
            .orElseThrow(() -> new IllegalStateException("Không tìm thấy cookie " + cookieName));
    }

}
