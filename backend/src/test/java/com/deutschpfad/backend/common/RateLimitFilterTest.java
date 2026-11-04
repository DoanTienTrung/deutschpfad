package com.deutschpfad.backend.common;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimitFilterTest {

    @Test
    void xRealIp_doClientTuGui_khongDuocTin() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("203.0.113.9");
        request.addHeader("X-Real-IP", "10.9.9.9");

        assertThat(RateLimitFilter.extractClientIp(request)).isEqualTo("203.0.113.9");
    }

    @Test
    void cfConnectingIp_doCloudflareGhiDe_duocUuTien() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("203.0.113.9");
        request.addHeader("CF-Connecting-IP", " 198.51.100.7 ");

        assertThat(RateLimitFilter.extractClientIp(request)).isEqualTo("198.51.100.7");
    }
}
