package com.deutschpfad.backend.reading;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

/**
 * Fetches a cover photo for a Reading passage from Unsplash's Search Photos API, keyed by the
 * passage's topic (or title as a fallback). Never throws -- returns null on any failure (missing
 * key, network error, no results) so passage save never blocks on image availability.
 */
@Service
public class UnsplashService {

    private static final Logger log = LoggerFactory.getLogger(UnsplashService.class);
    private static final String ENDPOINT = "https://api.unsplash.com/search/photos";

    private final String apiKey;
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public record CoverImage(String imageUrl, String attributionName, String attributionUrl) {}

    public UnsplashService(@Value("${app.unsplash-api-key}") String apiKey) {
        this.apiKey = apiKey;
    }

    public CoverImage findCoverImage(String query) {
        if (apiKey == null || apiKey.isBlank() || query == null || query.isBlank()) return null;

        try {
            String encoded = URLEncoder.encode(query, StandardCharsets.UTF_8);
            URI uri = URI.create(ENDPOINT + "?query=" + encoded + "&per_page=1&orientation=landscape");
            HttpRequest request = HttpRequest.newBuilder(uri)
                .header("Authorization", "Client-ID " + apiKey)
                .header("Accept-Version", "v1")
                .timeout(Duration.ofSeconds(15))
                .GET()
                .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                log.warn("Unsplash request failed: HTTP {} - {}", response.statusCode(), response.body());
                return null;
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode results = root.path("results");
            if (!results.isArray() || results.isEmpty()) return null;

            JsonNode photo = results.get(0);
            String imageUrl = photo.path("urls").path("regular").asText(null);
            if (imageUrl == null) return null;

            JsonNode user = photo.path("user");
            String name = user.path("name").asText("Unsplash");
            // utm params required by Unsplash API guidelines when linking back to a photographer.
            String profileUrl = user.path("links").path("html").asText("https://unsplash.com")
                + "?utm_source=deutschpfad&utm_medium=referral";

            return new CoverImage(imageUrl, name, profileUrl);
        } catch (Exception e) {
            log.warn("Unsplash cover image lookup failed for query \"{}\"", query, e);
            return null;
        }
    }
}
