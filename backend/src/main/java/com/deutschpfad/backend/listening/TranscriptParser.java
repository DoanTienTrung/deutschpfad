package com.deutschpfad.backend.listening;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Pure logic, no Spring/DB dependency — parses a transcript (with per-line timestamps) into an
 * ordered list of sentences with start/end seconds. Supports two input shapes:
 *  - WEBVTT (as produced by {@code yt-dlp --sub-format vtt})
 *  - YouTube's own "Show transcript" panel text, pasted by a human (timestamp + text, either on
 *    the same line or on alternating lines)
 */
public final class TranscriptParser {

    public record SentenceData(String text, int startSeconds, int endSeconds) {}

    // endSeconds is the cue's own end timestamp — present for VTT (every cue has one), absent
    // for a pasted transcript (only a start-time prefix per line, see parsePasted).
    private record RawEntry(String text, int startSeconds, Integer endSeconds) {}

    private static final Pattern VTT_TIME_LINE =
        Pattern.compile("(\\d{2}:\\d{2}:\\d{2}[.,]\\d{3})\\s*-->\\s*(\\d{2}:\\d{2}:\\d{2}[.,]\\d{3})");
    private static final Pattern PASTED_TIME_PREFIX =
        Pattern.compile("^(\\d{1,2}:\\d{2}(?::\\d{2})?)\\s*(.*)$");

    private TranscriptParser() {
    }

    public static List<SentenceData> parse(String content) {
        if (content == null || content.isBlank()) return List.of();
        String trimmed = content.trim();
        if (trimmed.startsWith("WEBVTT") && INLINE_TIMESTAMP.matcher(trimmed).find()) {
            return parseAutoVtt(trimmed);
        }
        List<RawEntry> raw = trimmed.startsWith("WEBVTT") ? parseVtt(trimmed) : parsePasted(trimmed);
        return finalize(raw);
    }

    // ------------------------------------------------------------------ phụ đề tự động của YouTube

    private static final Pattern INLINE_TIMESTAMP = Pattern.compile("<\\d{2}:\\d{2}:\\d{2}\\.\\d{3}>");
    private static final Pattern TIMED_WORD = Pattern.compile("<(\\d{2}:\\d{2}:\\d{2}\\.\\d{3})><c>(.*?)</c>");
    private static final Pattern SENTENCE_END = Pattern.compile("[.!?…][\"'»“”)]*$");
    private static final Pattern SOUND_ANNOTATION = Pattern.compile("\\[[^\\]]*\\]");
    /** Câu không có dấu câu (phụ đề tự động đời cũ) thì cắt khi đủ số từ này hoặc khi người nói ngừng lâu. */
    private static final int MAX_WORDS_PER_SENTENCE = 30;
    private static final double PAUSE_SPLIT_SECONDS = 2.0;
    /** Từ cuối câu kéo dài tối đa bấy nhiêu giây, để đoạn phát không dính sang khoảng lặng phía sau. */
    private static final double LAST_WORD_MAX_SECONDS = 2.0;

    private record TimedWord(String text, double start) {}

    /**
     * Phụ đề tự động của YouTube là dạng "cuộn": mỗi cue lặp lại dòng trước rồi thêm một dòng mới có mốc
     * thời gian từng từ ({@code Hallo<00:00:01.199><c> Leute,</c>...}), xen giữa là các cue 10ms chỉ để giữ
     * chữ trên màn hình. Đọc theo cue như phụ đề thường sẽ ra mỗi câu hai lần, dài ngắn chồng lên nhau.
     * Ở đây chỉ lấy dòng mới của mỗi cue, tách ra từng từ kèm thời điểm, rồi ghép lại thành câu theo dấu câu.
     */
    private static List<SentenceData> parseAutoVtt(String content) {
        String[] lines = content.split("\\r?\\n");
        List<TimedWord> words = new ArrayList<>();
        double lastCueEnd = 0;
        int i = 0;
        while (i < lines.length) {
            Matcher m = VTT_TIME_LINE.matcher(lines[i]);
            if (!m.find()) {
                i++;
                continue;
            }
            double start = toExactSeconds(m.group(1));
            double end = toExactSeconds(m.group(2));
            i++;
            String newLine = null;
            // Thân cue kết thúc ở dòng rỗng thật sự; dòng chỉ có dấu cách vẫn thuộc cue (YouTube hay để vậy).
            while (i < lines.length && !lines[i].isEmpty() && !VTT_TIME_LINE.matcher(lines[i]).find()) {
                if (!lines[i].isBlank()) newLine = lines[i];
                i++;
            }
            if (newLine == null || end - start < 0.05) continue; // cue 10ms chỉ lặp lại chữ đã có
            lastCueEnd = Math.max(lastCueEnd, end);

            int firstTag = newLine.indexOf('<');
            String head = SOUND_ANNOTATION.matcher(firstTag < 0 ? newLine : newLine.substring(0, firstTag)).replaceAll("").trim();
            if (!head.isEmpty()) words.add(new TimedWord(head, start));
            Matcher w = TIMED_WORD.matcher(newLine);
            while (w.find()) {
                String text = SOUND_ANNOTATION.matcher(w.group(2)).replaceAll("").trim();
                if (!text.isEmpty()) words.add(new TimedWord(text, toExactSeconds(w.group(1))));
            }
        }

        List<SentenceData> result = new ArrayList<>();
        List<TimedWord> current = new ArrayList<>();
        int wordCount = 0;
        for (int k = 0; k < words.size(); k++) {
            TimedWord word = words.get(k);
            if (!current.isEmpty()) {
                TimedWord previous = current.get(current.size() - 1);
                if (word.start() - previous.start() >= PAUSE_SPLIT_SECONDS + LAST_WORD_MAX_SECONDS || wordCount >= MAX_WORDS_PER_SENTENCE) {
                    addSentence(result, current, word.start());
                    current = new ArrayList<>();
                    wordCount = 0;
                }
            }
            current.add(word);
            wordCount += word.text().split("\\s+").length;
            if (SENTENCE_END.matcher(word.text()).find()) {
                addSentence(result, current, k + 1 < words.size() ? words.get(k + 1).start() : lastCueEnd);
                current = new ArrayList<>();
                wordCount = 0;
            }
        }
        if (!current.isEmpty()) addSentence(result, current, lastCueEnd);
        return result;
    }

    private static void addSentence(List<SentenceData> result, List<TimedWord> words, double nextStart) {
        String text = String.join(" ", words.stream().map(TimedWord::text).toList()).replaceAll("\\s+", " ").trim();
        if (text.isEmpty()) return;
        double startExact = words.get(0).start();
        double lastWord = words.get(words.size() - 1).start();
        double endExact = Math.min(Math.max(nextStart, lastWord + 0.3), lastWord + LAST_WORD_MAX_SECONDS);
        int start = (int) Math.round(startExact);
        int end = Math.max(start + 1, (int) Math.round(endExact));
        result.add(new SentenceData(text, start, end));
    }

    /**
     * Phụ đề gần như không có dấu câu (phụ đề tự động đời cũ: chữ thường, không chấm phẩy) thì câu chỉ là
     * các đoạn cắt theo số từ, khó dùng để luyện chép chính tả. Job nhập hàng loạt bỏ qua những video này.
     */
    public static boolean lacksPunctuation(List<SentenceData> sentences) {
        if (sentences.size() < 5) return false;
        long punctuated = sentences.stream().filter(s -> SENTENCE_END.matcher(s.text().trim()).find()).count();
        return punctuated * 10 < sentences.size() * 3; // dưới 30% số câu kết thúc bằng dấu câu
    }

    private static double toExactSeconds(String timestamp) {
        String[] parts = timestamp.replace(',', '.').split(":");
        return Integer.parseInt(parts[0]) * 3600.0 + Integer.parseInt(parts[1]) * 60.0 + Double.parseDouble(parts[2]);
    }

    private static List<RawEntry> parseVtt(String content) {
        List<RawEntry> entries = new ArrayList<>();
        String[] lines = content.split("\\r?\\n");
        int i = 0;
        while (i < lines.length) {
            Matcher m = VTT_TIME_LINE.matcher(lines[i]);
            if (m.find()) {
                int start = toSeconds(m.group(1));
                int end = toSeconds(m.group(2));
                StringBuilder text = new StringBuilder();
                i++;
                while (i < lines.length && !lines[i].isBlank() && !VTT_TIME_LINE.matcher(lines[i]).find()) {
                    if (!text.isEmpty()) text.append(' ');
                    text.append(stripVttTags(lines[i].trim()));
                    i++;
                }
                if (!text.isEmpty()) entries.add(new RawEntry(text.toString(), start, end));
            } else {
                i++;
            }
        }
        return entries;
    }

    private static List<RawEntry> parsePasted(String content) {
        List<RawEntry> entries = new ArrayList<>();
        String[] lines = content.split("\\r?\\n");
        Integer pendingStart = null;
        StringBuilder pendingText = new StringBuilder();

        for (String rawLine : lines) {
            String line = rawLine.trim();
            if (line.isEmpty()) continue;

            Matcher m = PASTED_TIME_PREFIX.matcher(line);
            if (m.matches()) {
                String rest = m.group(2).trim();
                if (!rest.isEmpty()) {
                    // timestamp and text on the same line
                    flushPending(entries, pendingStart, pendingText);
                    pendingStart = null;
                    pendingText.setLength(0);
                    entries.add(new RawEntry(rest, toSeconds(m.group(1)), null));
                } else {
                    // pure timestamp line — text follows on next line(s)
                    flushPending(entries, pendingStart, pendingText);
                    pendingStart = toSeconds(m.group(1));
                    pendingText.setLength(0);
                }
            } else if (pendingStart != null) {
                if (!pendingText.isEmpty()) pendingText.append(' ');
                pendingText.append(line);
            }
        }
        flushPending(entries, pendingStart, pendingText);
        return entries;
    }

    private static void flushPending(List<RawEntry> entries, Integer start, StringBuilder text) {
        if (start != null && !text.isEmpty()) {
            entries.add(new RawEntry(text.toString(), start, null));
        }
    }

    private static List<SentenceData> finalize(List<RawEntry> raw) {
        List<SentenceData> result = new ArrayList<>();
        for (int i = 0; i < raw.size(); i++) {
            RawEntry current = raw.get(i);
            Integer nextStart = i + 1 < raw.size() ? raw.get(i + 1).startSeconds() : null;
            int end;
            if (current.endSeconds() != null) {
                // VTT gives every cue its own end time — trust it over guessing from the next
                // cue's start, which used to stretch a sentence across any silence/pause before
                // the next one begins (reported bug: a sentence's audio "bled" into the next
                // sentence's opening word because of exactly this). Still capped at nextStart
                // so a cue can never run past where the next one actually starts.
                end = nextStart != null ? Math.min(current.endSeconds(), nextStart) : current.endSeconds();
            } else {
                // Pasted transcript: no end timestamp per line, only next-start is available.
                end = nextStart != null ? nextStart : current.startSeconds() + 5;
            }
            if (end <= current.startSeconds()) end = current.startSeconds() + 1;
            result.add(new SentenceData(current.text(), current.startSeconds(), end));
        }
        return result;
    }

    private static int toSeconds(String timestamp) {
        String normalized = timestamp.replace(',', '.');
        String[] parts = normalized.split(":");
        double seconds;
        if (parts.length == 3) {
            seconds = Integer.parseInt(parts[0]) * 3600.0 + Integer.parseInt(parts[1]) * 60.0 + Double.parseDouble(parts[2]);
        } else {
            seconds = Integer.parseInt(parts[0]) * 60.0 + Double.parseDouble(parts[1]);
        }
        return (int) Math.round(seconds);
    }

    private static String stripVttTags(String line) {
        // Gạch đầu dòng "– " trong phụ đề gõ tay chỉ đánh dấu đổi người nói, không phải chữ được đọc.
        return line.replaceAll("<[^>]+>", "").replaceFirst("^[–—-]\\s+", "");
    }
}
