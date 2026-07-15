package com.deutschpfad.backend.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
    @NotBlank String token,
    @NotBlank @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự") String newPassword
) {
}
