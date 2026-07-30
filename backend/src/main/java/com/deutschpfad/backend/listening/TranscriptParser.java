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
        List<RawEntry> raw = trimmed.startsWith("WEBVTT") ? parseVtt(trimmed) : parsePasted(trimmed);
        return finalize(raw);
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
        return line.replaceAll("<[^>]+>", "");
    }
}
