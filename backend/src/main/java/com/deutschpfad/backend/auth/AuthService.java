package com.deutschpfad.backend.auth;

import com.deutschpfad.backend.common.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository tokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final String frontendUrl;

    public AuthService(
        UserRepository userRepository,
        EmailVerificationTokenRepository tokenRepository,
        PasswordResetTokenRepository passwordResetTokenRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService,
        EmailService emailService,
        @Value("${app.frontend-url}") String frontendUrl
    ) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.frontendUrl = frontendUrl;
    }

    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email đã được sử dụng");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user = userRepository.save(user);

        // Gửi mail KHÔNG được phép làm hỏng việc đăng ký: tài khoản đã lưu vào DB ở dòng trên, nếu
        // để exception bay lên thì người dùng thấy "đăng ký thất bại" nhưng email đã bị chiếm chỗ
        // — đăng ký lại sẽ báo "Email đã được sử dụng", thành ngõ cụt. Lỗi gửi mail đã có đường
        // cứu riêng là nút "Gửi lại email xác thực".
        try {
            sendVerificationEmail(user);
        } catch (Exception e) {
            log.error("Không gửi được email xác thực tới {}: {}", user.getEmail(), e.getMessage());
        }

        return user;
    }

    /**
     * Gửi lại email xác thực.
     *
     * <p>Không cho phía gọi biết email có tồn tại hay không (cùng cách với {@link #forgotPassword})
     * — nếu không, endpoint này thành công cụ dò xem địa chỉ nào đã đăng ký.
     */
    @Transactional
    public void resendVerification(ResendVerificationRequest request) {
        userRepository.findByEmail(request.email()).ifPresent(user -> {
            if (user.isEmailVerified()) return;
            tokenRepository.deleteByUser(user);
            sendVerificationEmail(user);
        });
    }

    private void sendVerificationEmail(User user) {
        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setUser(user);
        verificationToken.setToken(UUID.randomUUID().toString());
        verificationToken.setExpiresAt(LocalDateTime.now().plusHours(24));
        tokenRepository.save(verificationToken);

        String link = frontendUrl + "/verify-email?token=" + verificationToken.getToken();
        emailService.send(
            user.getEmail(),
            "Xác thực tài khoản DeutschPfad",
            "Chào " + user.getFullName() + ",\n\n"
                + "Bấm vào link sau để kích hoạt tài khoản DeutschPfad của bạn:\n" + link
                + "\n\nLink có hiệu lực trong 24 giờ. Nếu đã hết hạn, vào trang đăng nhập của"
                + " DeutschPfad và bấm \"Gửi lại email xác thực\".\n\n"
                + "Nếu bạn không đăng ký DeutschPfad, hãy bỏ qua email này."
        );
    }

    @Transactional
    public void verifyEmail(String token) {
        EmailVerificationToken verificationToken = tokenRepository.findByToken(token)
            .orElseThrow(() -> new IllegalArgumentException("Token không hợp lệ"));

        if (verificationToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token đã hết hạn");
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        // Link xác thực là dùng một lần. Token nằm nguyên trong hộp thư người dùng (và trong log
        // của mọi máy chủ mail thư đi qua), nên để nó sống tiếp chỉ kéo dài thời gian một chuỗi
        // bí mật còn dùng được, mà không đổi lại được gì.
        tokenRepository.delete(verificationToken);
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.email()).ifPresent(user -> {
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUser(user);
            resetToken.setToken(UUID.randomUUID().toString());
            resetToken.setExpiresAt(LocalDateTime.now().plusHours(1));
            passwordResetTokenRepository.save(resetToken);

            String link = frontendUrl + "/reset-password?token=" + resetToken.getToken();
            emailService.send(
                user.getEmail(),
                "Đặt lại mật khẩu DeutschPfad",
                "Chào " + user.getFullName() + ",\n\nBấm vào link sau để đặt lại mật khẩu:\n" + link
                    + "\n\nLink có hiệu lực trong 1 giờ. Nếu bạn không yêu cầu, hãy bỏ qua email này."
            );
        });
    }

    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.token())
            .orElseThrow(() -> new IllegalArgumentException("Token không hợp lệ"));

        if (resetToken.isUsed()) {
            throw new IllegalArgumentException("Token đã được sử dụng");
        }
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token đã hết hạn");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    // For an already-authenticated user changing their own password -- confirms identity via the
    // current password (no email round-trip needed, unlike forgotPassword/resetPassword above).
    public void changePassword(User user, ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Mật khẩu hiện tại không đúng");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    public User updateProfile(User user, UpdateProfileRequest request) {
        user.setFullName(request.fullName());
        user.setGoal(request.goal());
        user.setTargetCertificate(request.targetCertificate());
        user.setCurrentLevel(request.currentLevel());
        return userRepository.save(user);
    }

    public LoginResult login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new InvalidCredentialsException("Email hoặc mật khẩu không đúng"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Email hoặc mật khẩu không đúng");
        }

        if (!user.isEmailVerified()) {
            throw new InvalidCredentialsException("Vui lòng xác thực email trước khi đăng nhập");
        }

        String token = jwtService.generateToken(user);
        return new LoginResult(token, user);
    }

}
