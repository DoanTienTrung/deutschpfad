package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.listening.GroqAiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Dịch câu ví dụ còn thiếu sang tiếng Việt, chạy nền theo lô (admin bấm chạy).
 *
 * <p>Dùng {@link GroqAiService#translateSentencesPlain} — chuỗi Groq → Gemini → OpenRouter sẵn có,
 * bản dịch thường (không kèm IPA, giữ nguyên chữ số). Hai cách tiết kiệm lượt gọi AI:
 * <ul>
 *   <li>Câu đã dịch ở dòng khác (cùng từ ở nhiều lộ trình thường dùng chung câu) thì chép lại.</li>
 *   <li>Trong một lô, câu trùng chỉ gửi một lần.</li>
 * </ul>
 * Cả chuỗi AI đều lỗi/hết lượt (một lô không dịch được câu nào) thì DỪNG, không đốt tiếp — admin
 * chạy lại sau, job chỉ lấy những câu còn thiếu.
 */
@Service
public class ExampleTranslationJob {

    private static final Logger log = LoggerFactory.getLogger(ExampleTranslationJob.class);
    private static final int BATCH_SIZE = 40;
    private static final long BATCH_DELAY_MS = 8000;

    private final VocabularyItemRepository vocabularyItemRepository;
    private final GroqAiService aiService;

    private volatile boolean running = false;
    private volatile String stopReason = null;
    private final AtomicInteger processed = new AtomicInteger(0);
    private final AtomicInteger total = new AtomicInteger(0);
    private final AtomicInteger translated = new AtomicInteger(0);
    private final AtomicInteger reused = new AtomicInteger(0);

    public ExampleTranslationJob(VocabularyItemRepository vocabularyItemRepository, GroqAiService aiService) {
        this.vocabularyItemRepository = vocabularyItemRepository;
        this.aiService = aiService;
    }

    /** @return số câu sẽ dịch, hoặc -1 nếu đang có một lượt chạy */
    public synchronized int start() {
        if (running) return -1;
        List<Long> ids = vocabularyItemRepository.findIdsMissingExampleTranslation();
        running = true;
        stopReason = null;
        processed.set(0);
        total.set(ids.size());
        translated.set(0);
        reused.set(0);
        new Thread(() -> run(ids), "example-translation").start();
        return ids.size();
    }

    public Map<String, Object> status() {
        Map<String, Object> status = new HashMap<>();
        status.put("running", running);
        status.put("processed", processed.get());
        status.put("total", total.get());
        status.put("translated", translated.get());
        status.put("reused", reused.get());
        status.put("remaining", vocabularyItemRepository.findIdsMissingExampleTranslation().size());
        status.put("stopReason", stopReason);
        return status;
    }

    private void run(List<Long> ids) {
        try {
            Map<String, String> known = new HashMap<>();
            for (Object[] row : vocabularyItemRepository.findTranslatedExamples()) {
                known.put((String) row[0], (String) row[1]);
            }

            for (int start = 0; start < ids.size(); start += BATCH_SIZE) {
                List<VocabularyItem> batch = vocabularyItemRepository.findAllById(
                    ids.subList(start, Math.min(start + BATCH_SIZE, ids.size())));

                List<String> toTranslate = new ArrayList<>(new LinkedHashSet<>(batch.stream()
                    .map(VocabularyItem::getExampleSentence)
                    .filter(s -> s != null && !s.isBlank() && !known.containsKey(s))
                    .toList()));
                boolean calledAi = !toTranslate.isEmpty();
                int newlyTranslated = 0;
                if (calledAi) {
                    List<String> results = aiService.translateSentencesPlain(toTranslate);
                    for (int i = 0; i < toTranslate.size(); i++) {
                        String vi = results.get(i);
                        if (vi != null && !vi.isBlank()) {
                            known.put(toTranslate.get(i), vi.trim());
                            newlyTranslated++;
                        }
                    }
                }

                for (VocabularyItem item : batch) {
                    String vi = known.get(item.getExampleSentence());
                    if (vi != null && item.getExampleSentenceVi() == null) {
                        item.setExampleSentenceVi(vi);
                        if (toTranslate.contains(item.getExampleSentence())) translated.incrementAndGet();
                        else reused.incrementAndGet();
                    }
                }
                vocabularyItemRepository.saveAll(batch);
                processed.addAndGet(batch.size());
                log.info("Example translation progress: {}/{}", processed.get(), ids.size());

                if (calledAi && newlyTranslated == 0) {
                    stopReason = "AI không dịch được câu nào trong lô vừa rồi (lỗi hoặc hết lượt miễn phí) — "
                        + "dừng để không gọi tiếp. Chạy lại sau.";
                    log.warn("Example translation stopped: {}", stopReason);
                    return;
                }
                boolean lastBatch = start + BATCH_SIZE >= ids.size();
                if (calledAi && !lastBatch) Thread.sleep(BATCH_DELAY_MS);
            }
        } catch (Exception e) {
            stopReason = "Lỗi: " + Objects.toString(e.getMessage(), e.getClass().getSimpleName());
            log.warn("Example translation job failed", e);
        } finally {
            running = false;
        }
    }
}
