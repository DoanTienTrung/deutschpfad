package com.deutschpfad.backend.speaking;

import com.deutschpfad.backend.auth.User;
import com.deutschpfad.backend.auth.UserRepository;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

/**
 * The WebSocket handshake request still passes through the normal Spring Security filter chain
 * first (it's a regular HTTP GET with an Upgrade header), so {@code JwtAuthenticationFilter} has
 * already populated {@link SecurityContextHolder} by the time this runs — no need to re-parse the
 * JWT cookie here, just resolve the {@link User} and the {@code promptId} query param.
 */
@Component
public class SpeakingHandshakeInterceptor implements HandshakeInterceptor {

    private final UserRepository userRepository;
    private final SpeakingPromptRepository promptRepository;

    public SpeakingHandshakeInterceptor(UserRepository userRepository, SpeakingPromptRepository promptRepository) {
        this.userRepository = userRepository;
        this.promptRepository = promptRepository;
    }

    @Override
    public boolean beforeHandshake(
        ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) return false;

        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) return false;

        if (!(request instanceof ServletServerHttpRequest servletRequest)) return false;
        String promptIdParam = servletRequest.getServletRequest().getParameter("promptId");
        if (promptIdParam == null) return false;

        SpeakingPrompt prompt;
        try {
            prompt = promptRepository.findById(Long.valueOf(promptIdParam)).orElse(null);
        } catch (NumberFormatException e) {
            return false;
        }
        if (prompt == null) return false;

        attributes.put("user", user);
        attributes.put("prompt", prompt);
        return true;
    }

    @Override
    public void afterHandshake(
        ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception exception
    ) {
    }
}
