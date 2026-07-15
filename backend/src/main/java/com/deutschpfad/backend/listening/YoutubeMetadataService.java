package com.deutschpfad.backend.listening;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

/**
 * Looks up a YouTube video's title via the public oEmbed endpoint (no API key needed). Never
 * throws — returns null on any failure so callers can fall back to asking the user for a title.
 */
@Service
public class YoutubeMetadataService {

    private static final Logger log = LoggerFactory.getLogger(YoutubeMetadataService.class);

    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String fetchTitle(String videoId) {
        if (videoId == null || videoId.isBlank()) return null;

        try {
            String watchUrl = "https://www.youtube.com/watch?v=" + videoId;
            String oembedUrl = "https://www.youtube.com/oembed?format=json&url="
                + URLEncoder.encode(watchUrl, StandardCharsets.UTF_8);

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(oembedUrl))
                .timeout(Duration.ofSeconds(10))
                .GET()
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                log.warn("YouTube oEmbed request failed for {}: HTTP {}", videoId, response.statusCode());
                return null;
            }

            String title = objectMapper.readTree(response.body()).path("title").asText("");
            return title.isBlank() ? null : title;
        } catch (Exception e) {
            log.warn("Failed to fetch YouTube title for {}", videoId, e);
            return null;
        }
    }
}
