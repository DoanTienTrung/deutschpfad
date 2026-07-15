package com.deutschpfad.backend.speaking;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class SpeakingWebSocketConfig implements WebSocketConfigurer {

    private final SpeakingLiveWebSocketHandler handler;
    private final SpeakingHandshakeInterceptor interceptor;

    public SpeakingWebSocketConfig(SpeakingLiveWebSocketHandler handler, SpeakingHandshakeInterceptor interceptor) {
        this.handler = handler;
        this.interceptor = interceptor;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Auth is enforced by cookie/JWT (see SpeakingHandshakeInterceptor), not by origin — the
        // browser always connects same-origin through the nginx proxy anyway.
        registry.addHandler(handler, "/ws/speaking-live")
            .addInterceptors(interceptor)
            .setAllowedOrigins("*");
    }
}
