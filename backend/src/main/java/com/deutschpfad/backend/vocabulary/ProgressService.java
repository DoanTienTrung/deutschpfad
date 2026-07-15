package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.auth.User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProgressService {

    private static final long HEATMAP_DAYS = 371;

    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;

    public ProgressService(LessonRepository lessonRepository, LessonProgressRepository lessonProgressRepository) {
        this.lessonRepository = lessonRepository;
        this.lessonProgressRepository = lessonProgressRepository;
    }

    public List<ProgressSummaryResponse> getSummary(User user) {
        Map<String, Long> completedByGroup = new HashMap<>();
        for (SourceLevelCount row : lessonProgressRepository.countCompletedLessonsBySourceAndLevel(user, PracticeMode.LESSON_COMPLETE)) {
            completedByGroup.put(key(row.getSource(), row.getLevel()), row.getCount());
        }

        return lessonRepository.countLessonsBySourceAndLevel().stream()
            .map(row -> new ProgressSummaryResponse(
                row.getSource(),
                row.getLevel(),
                completedByGroup.getOrDefault(key(row.getSource(), row.getLevel()), 0L),
                row.getCount()
            ))
            .sorted(
                Comparator.comparing(ProgressSummaryResponse::source)
                    .thenComparing(r -> r.level().ordinal())
            )
            .toList();
    }

    public List<HeatmapDayResponse> getHeatmap(User user) {
        LocalDateTime since = LocalDateTime.now().minusDays(HEATMAP_DAYS);
        return lessonProgressRepository.countCompletedLessonsByDay(user, PracticeMode.LESSON_COMPLETE, since).stream()
            .map(row -> new HeatmapDayResponse(row.getDay(), row.getCount()))
            .toList();
    }

    private String key(VocabularyItem.Source source, VocabularyItem.Level level) {
        return source.name() + "|" + level.name();
    }
}
