package com.deutschpfad.backend.common;

import com.deutschpfad.backend.auth.JwtAuthenticationFilter;
import com.deutschpfad.backend.auth.OAuth2SuccessHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final RateLimitFilter rateLimitFilter;

    public SecurityConfig(
        JwtAuthenticationFilter jwtAuthenticationFilter,
        OAuth2SuccessHandler oAuth2SuccessHandler,
        RateLimitFilter rateLimitFilter
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
        this.rateLimitFilter = rateLimitFilter;
    }

    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, ex) -> {
            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(
                "{\"message\":\"Bạn không có quyền truy cập chức năng này\"}"
            );
        };
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                .accessDeniedHandler(accessDeniedHandler())
            )
            .authorizeHttpRequests(auth -> auth
                // Hai endpoint cần người dùng đã đăng nhập nằm trong /api/auth/** (mở cho mọi người): phải chặn
                // trước, nếu không request không có cookie chạy vào controller với authentication = null và
                // nổ 500. Trước đây vẫn ra 401 chỉ nhờ trang /error bị khoá; nay /error mở (để trả 404 thật
                // cho đường dẫn không tồn tại, xem SpaWebConfig) nên phải khai báo rõ ở đây.
                .requestMatchers("/api/auth/me", "/api/auth/change-password").authenticated()
                .requestMatchers("/api/health", "/api/ping", "/api/auth/**", "/oauth2/**", "/login/**").permitAll()
                .requestMatchers("/api/**", "/ws/**").authenticated()
                // Còn lại là giao diện (file tĩnh + các trang của React Router) khi backend tự phục vụ
                // frontend, xem SpaWebConfig. Trang nào cần đăng nhập thì tự gọi /api/** và nhận 401.
                .anyRequest().permitAll()
            )
            .oauth2Login(oauth2 -> oauth2.successHandler(oAuth2SuccessHandler))
            .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

}
