package com.deutschpfad.backend.listening;

import com.deutschpfad.backend.vocabulary.VocabularyItem;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.List;

/**
 * Danh sách video YouTube đề xuất ({@code listening/youtube-catalog.json}): kênh + videoId + cấp độ, đã kiểm
 * tra bằng yt-dlp là nói tiếng Đức, có phụ đề tiếng Đức và cho nhúng. Chỉ chứa metadata, không chứa phụ đề
 * (phụ đề do job lấy trên server lúc nhập), nên để trong repo không vướng bản quyền.
 */
@Component
public class ListeningCatalog {

    public record Channel(String key, String youtubeChannelId, String name, String handle, int orderIndex) {}

    public record Video(
        String channel,
        String videoId,
        String title,
        VocabularyItem.Level levelMin,
        VocabularyItem.Level levelMax,
        Integer durationSeconds
    ) {}

    public record Catalog(List<Channel> channels, List<Video> videos) {}

    private final Catalog catalog;

    public ListeningCatalog() {
        this("/listening/youtube-catalog.json");
    }

    ListeningCatalog(String resource) {
        ObjectMapper mapper = new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        try (InputStream in = getClass().getResourceAsStream(resource)) {
            catalog = in == null ? new Catalog(List.of(), List.of()) : mapper.readValue(in, Catalog.class);
        } catch (IOException e) {
            throw new UncheckedIOException("Không đọc được " + resource, e);
        }
    }

    public List<Channel> channels() {
        return catalog.channels();
    }

    public List<Video> videos() {
        return catalog.videos();
    }
}
