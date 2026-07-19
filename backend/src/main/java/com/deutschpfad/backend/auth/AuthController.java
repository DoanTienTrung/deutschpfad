package com.deutschpfad.backend.auth;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final CookieUtil cookieUtil;
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;

    public AuthController(
        AuthService authService,
        CookieUtil cookieUtil,
        UserRepository userRepository,
        RefreshTokenService refreshTokenService,
        JwtService jwtService
    ) {
        this.authService = authService;
        this.cookieUtil = cookieUtil;
        this.userRepository = userRepository;
        this.refreshTokenService = refreshTokenService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.register(request);
        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "email", user.getEmail(),
            "fullName", user.getFullName()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
        @Valid @RequestBody LoginRequest request,
        HttpServletResponse response
    ) {
        LoginResult result = authService.login(request);
        cookieUtil.setAuthCookie(response, result.token());

        RefreshToken refreshToken = refreshTokenService.generate(result.user());
        cookieUtil.setRefreshCookie(response, refreshToken.getToken());

        return ResponseEntity.ok(Map.of(
            "id", result.user().getId(),
            "email", result.user().getEmail(),
            "fullName", result.user().getFullName(),
            "role", result.user().getRole().name()
        ));
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh(
        HttpServletRequest request,
        HttpServletResponse response
    ) {
        String refreshTokenValue = cookieUtil.extractCookie(request, CookieUtil.REFRESH_COOKIE_NAME);
        if (refreshTokenValue == null) {
            throw new InvalidCredentialsException("Thiếu refresh token");
        }

        RefreshToken newRefreshToken = refreshTokenService.validateAndRotate(refreshTokenValue);
        String newAccessToken = jwtService.generateToken(newRefreshToken.getUser());

        cookieUtil.setAuthCookie(response, newAccessToken);
        cookieUtil.setRefreshCookie(response, newRefreshToken.getToken());

        return ResponseEntity.ok(Map.of("message", "Làm mới token thành công"));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new InvalidCredentialsException("Không tìm thấy user"));
        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "email", user.getEmail(),
            "fullName", user.getFullName(),
            "role", user.getRole().name()
        ));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(Map.of("message", "Xác thực email thành công"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(Map.of("message", "Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Đặt lại mật khẩu thành công"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
        @Valid @RequestBody ChangePasswordRequest request, Authentication authentication
    ) {
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new InvalidCredentialsException("Không tìm thấy user"));
        authService.changePassword(user, request);
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        String refreshTokenValue = cookieUtil.extractCookie(request, CookieUtil.REFRESH_COOKIE_NAME);
        if (refreshTokenValue != null) {
            refreshTokenService.revoke(refreshTokenValue);
        }
        cookieUtil.clearAuthCookie(response);
        cookieUtil.clearRefreshCookie(response);
        return ResponseEntity.noContent().build();
    }

}
