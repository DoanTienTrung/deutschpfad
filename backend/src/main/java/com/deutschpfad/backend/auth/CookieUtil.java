package com.deutschpfad.backend.auth;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class CookieUtil {

    public static final String COOKIE_NAME = "access_token";
    public static final String REFRESH_COOKIE_NAME = "refresh_token";

    private final long expirationMinutes;
    private final long refreshExpirationDays;

    public CookieUtil(
        @Value("${app.jwt.expiration-minutes}") long expirationMinutes,
        @Value("${app.jwt.refresh-expiration-days}") long refreshExpirationDays
    ) {
        this.expirationMinutes = expirationMinutes;
        this.refreshExpirationDays = refreshExpirationDays;
    }

    public void setAuthCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie(COOKIE_NAME, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // dev local qua HTTP; đổi thành true khi có HTTPS ở Phase 8
        cookie.setPath("/");
        cookie.setMaxAge((int) (expirationMinutes * 60));
        cookie.setAttribute("SameSite", "Lax");
        response.addCookie(cookie);
    }

    public void clearAuthCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(COOKIE_NAME, "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    public void setRefreshCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie(REFRESH_COOKIE_NAME, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // dev local qua HTTP; đổi thành true khi có HTTPS ở Phase 8
        cookie.setPath("/api/auth"); // chỉ gửi cookie này cho các endpoint /api/auth/*
        cookie.setMaxAge((int) (refreshExpirationDays * 24 * 60 * 60));
        cookie.setAttribute("SameSite", "Lax");
        response.addCookie(cookie);
    }

    public void clearRefreshCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(REFRESH_COOKIE_NAME, "");
        cookie.setHttpOnly(true);
        cookie.setPath("/api/auth");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    public String extractCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) {
            return null;
        }
        for (Cookie cookie : request.getCookies()) {
            if (name.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
