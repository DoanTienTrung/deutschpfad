package com.deutschpfad.backend.listening;

import com.deutschpfad.backend.vocabulary.VocabularyItem;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Đưa video YouTube vào hàng chờ nhập (bài nghe ở trạng thái PENDING) và quản lý kênh. */
@Service
public class ListeningImportService {

    /** Kênh tự nhận từ YouTube lúc nhập (không có trong danh sách đề xuất) xếp sau các kênh đề xuất. */
    static final int AUTO_CHANNEL_ORDER = 100;

    private final ListeningExerciseRepository exerciseRepository;
    private final ListeningChannelRepository channelRepository;
    private final ListeningCatalog catalog;

    public ListeningImportService(
        ListeningExerciseRepository exerciseRepository,
        ListeningChannelRepository channelRepository,
        ListeningCatalog catalog
    ) {
        this.exerciseRepository = exerciseRepository;
        this.channelRepository = channelRepository;
        this.catalog = catalog;
    }

    public record NewVideo(String videoId, String title, Integer durationSeconds) {}

    public record CatalogVideoView(
        String channelName, String videoId, String title, VocabularyItem.Level levelMin,
        VocabularyItem.Level levelMax, Integer durationSeconds, boolean exists
    ) {}

    public Set<String> existingVideoIds() {
        return new HashSet<>(exerciseRepository.findYoutubeVideoIds());
    }

    public List<CatalogVideoView> catalogView() {
        Map<String, ListeningCatalog.Channel> channels = catalog.channels().stream()
            .collect(Collectors.toMap(ListeningCatalog.Channel::key, Function.identity()));
        Set<String> existing = existingVideoIds();
        return catalog.videos().stream()
            .map(v -> new CatalogVideoView(
                channels.containsKey(v.channel()) ? channels.get(v.channel()).name() : v.channel(),
                v.videoId(), v.title(), v.levelMin(), v.levelMax(), v.durationSeconds(), existing.contains(v.videoId())))
            .toList();
    }

    /** Nạp danh sách đề xuất: tạo/cập nhật kênh, đưa video chưa có vào hàng chờ. Chạy lại nhiều lần vẫn an toàn. */
    @Transactional
    public int applyCatalog() {
        Map<String, ListeningChannel> channelsByKey = catalog.channels().stream().collect(Collectors.toMap(
            ListeningCatalog.Channel::key,
            c -> {
                ListeningChannel channel = channelRepository.findByYoutubeChannelId(c.youtubeChannelId()).orElseGet(ListeningChannel::new);
                channel.setYoutubeChannelId(c.youtubeChannelId());
                channel.setName(c.name());
                channel.setHandle(c.handle());
                channel.setOrderIndex(c.orderIndex());
                return channelRepository.save(channel);
            }));

        Set<String> existing = existingVideoIds();
        Map<String, Integer> positionInChannel = new java.util.HashMap<>();
        int created = 0;
        for (ListeningCatalog.Video v : catalog.videos()) {
            int position = positionInChannel.merge(v.channel(), 1, Integer::sum);
            if (!existing.add(v.videoId())) continue;
            ListeningChannel channel = channelsByKey.get(v.channel());
            exerciseRepository.save(pending(v.videoId(), v.title(), v.durationSeconds(), v.levelMin(), v.levelMax(), channel, position));
            created++;
        }
        return created;
    }

    /** Video admin chọn từ một playlist/kênh. {@code channel} null = để job tự nhận kênh từ YouTube. */
    @Transactional
    public int enqueue(List<NewVideo> videos, ListeningChannel channel, VocabularyItem.Level levelMin, VocabularyItem.Level levelMax) {
        if (levelMin.ordinal() > levelMax.ordinal()) {
            throw new IllegalArgumentException("Cấp độ bắt đầu phải thấp hơn hoặc bằng cấp độ kết thúc");
        }
        Set<String> existing = existingVideoIds();
        int created = 0;
        int position = 0;
        for (NewVideo v : videos) {
            position++;
            if (v.videoId() == null || !existing.add(v.videoId())) continue;
            String title = v.title() == null || v.title().isBlank() ? v.videoId() : v.title().strip();
            exerciseRepository.save(pending(v.videoId(), title, v.durationSeconds(), levelMin, levelMax, channel, 1000 + position));
            created++;
        }
        return created;
    }

    /** Kênh theo mã kênh YouTube; chưa có thì tạo (xếp sau các kênh đề xuất). */
    @Transactional
    public ListeningChannel ensureChannel(String youtubeChannelId, String name, String handle) {
        return channelRepository.findByYoutubeChannelId(youtubeChannelId).orElseGet(() -> {
            ListeningChannel channel = new ListeningChannel();
            channel.setYoutubeChannelId(youtubeChannelId);
            channel.setName(name != null ? name : youtubeChannelId);
            channel.setHandle(handle);
            channel.setOrderIndex(AUTO_CHANNEL_ORDER);
            return channelRepository.save(channel);
        });
    }

    private static ListeningExercise pending(
        String videoId, String title, Integer durationSeconds, VocabularyItem.Level levelMin,
        VocabularyItem.Level levelMax, ListeningChannel channel, int orderIndex
    ) {
        ListeningExercise exercise = new ListeningExercise();
        exercise.setTitle(title);
        exercise.setYoutubeVideoId(videoId);
        exercise.setLevelMin(levelMin);
        exercise.setLevelMax(levelMax);
        exercise.setDurationSeconds(durationSeconds);
        exercise.setChannel(channel);
        exercise.setSourceLabel(channel != null ? channel.getName() : null);
        exercise.setSourceUrl("https://www.youtube.com/watch?v=" + videoId);
        exercise.setOrderIndex(orderIndex);
        exercise.setKind(ListeningExercise.Kind.YOUTUBE);
        exercise.setStatus(ListeningExercise.Status.PENDING);
        return exercise;
    }
}
