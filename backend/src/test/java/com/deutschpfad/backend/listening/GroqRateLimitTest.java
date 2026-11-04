package com.deutschpfad.backend.listening;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class GroqRateLimitTest {

    @Test
    void gioiHanTheoPhut_choVaiGiay_thiChoRoiGuiLai() {
        String body = "{\"error\":{\"message\":\"Rate limit reached for model `openai/gpt-oss-120b` ... on tokens per "
            + "minute (TPM): Limit 8000, Used 6092, Requested 2453. Please try again in 4.0875s.\"}}";

        assertThat(GroqAiService.shortRateLimitWaitSeconds(null, body)).isEqualTo(4.0875);
        assertThat(GroqAiService.shortRateLimitWaitSeconds("5", body)).isEqualTo(5.0);
    }

    @Test
    void hetQuotaNgay_phaiChoLau_thiKhongCho() {
        String body = "{\"error\":{\"message\":\"Rate limit reached ... on tokens per day (TPD): Limit 200000, "
            + "Used 199500, Requested 2453. Please try again in 7m12.5s.\"}}";

        assertThat(GroqAiService.shortRateLimitWaitSeconds(null, body)).isNull();
        assertThat(GroqAiService.shortRateLimitWaitSeconds("433", body)).isNull();
        assertThat(GroqAiService.shortRateLimitWaitSeconds(null, "{}")).isNull();
    }
}
