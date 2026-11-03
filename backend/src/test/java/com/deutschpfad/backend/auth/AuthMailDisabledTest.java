package com.deutschpfad.backend.auth;

import com.deutschpfad.backend.TestcontainersConfiguration;
import com.deutschpfad.backend.common.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

/** MAIL_ENABLED=false (máy chủ không gửi được thư, ví dụ Render free). */
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = "app.mail-enabled=false"
)
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
class AuthMailDisabledTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @MockitoBean
    private EmailService emailService;

    private String url(String path) {
        return "http://localhost:" + port + path;
    }

    @Test
    void dangKy_xacThucLuon_vaDangNhapDuocNgay() {
        Map<String, String> body = Map.of(
            "email", "no-mail-register@example.com",
            "password", "password123",
            "fullName", "Nguyen Van C"
        );

        ResponseEntity<Map> register = restTemplate.postForEntity(url("/api/auth/register"), body, Map.class);
        assertThat(register.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(register.getBody()).containsEntry("emailVerified", true);
        verify(emailService, never()).sendHtml(anyString(), anyString(), anyString(), anyString());

        ResponseEntity<Map> login = restTemplate.postForEntity(
            url("/api/auth/login"),
            Map.of("email", "no-mail-register@example.com", "password", "password123"),
            Map.class
        );
        assertThat(login.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void quenMatKhau_bao503_khongTaoToken() {
        ResponseEntity<Map> response = restTemplate.postForEntity(
            url("/api/auth/forgot-password"), Map.of("email", "ai-do@example.com"), Map.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat((String) response.getBody().get("message")).contains("Google");
    }
}
