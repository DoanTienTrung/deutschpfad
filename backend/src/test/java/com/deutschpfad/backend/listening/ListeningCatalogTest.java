package com.deutschpfad.backend.listening;

import com.deutschpfad.backend.vocabulary.VocabularyItem;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

class ListeningCatalogTest {

    private final ListeningCatalog catalog = new ListeningCatalog();

    @Test
    void danhSachDeXuat_hopLe_khongTrung_kenhDeuKhaiBao() {
        Set<String> channelKeys = catalog.channels().stream().map(ListeningCatalog.Channel::key).collect(Collectors.toSet());
        Set<String> ids = new HashSet<>();

        assertThat(catalog.videos()).isNotEmpty().allSatisfy(v -> {
            assertThat(v.videoId()).matches("[A-Za-z0-9_-]{11}");
            assertThat(ids.add(v.videoId())).as("video trùng: %s", v.videoId()).isTrue();
            assertThat(channelKeys).contains(v.channel());
            assertThat(v.title()).isNotBlank().doesNotContain("—");
            assertThat(v.levelMin().ordinal()).isLessThanOrEqualTo(v.levelMax().ordinal());
        });
    }

    @Test
    void moiCapA1DenC1_coItNhat20Video() {
        for (VocabularyItem.Level level : List.of(VocabularyItem.Level.A1, VocabularyItem.Level.A2,
            VocabularyItem.Level.B1, VocabularyItem.Level.B2, VocabularyItem.Level.C1)) {
            long count = catalog.videos().stream()
                .filter(v -> v.levelMin().ordinal() <= level.ordinal() && level.ordinal() <= v.levelMax().ordinal())
                .count();
            assertThat(count).as("số video cấp %s", level).isGreaterThanOrEqualTo(20);
        }
    }
}
