package com.deutschpfad.backend.listening;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Generates IPA phonetic transcriptions for German sentences via the {@code espeak-ng} CLI, a
 * rule/dictionary-based grapheme-to-phoneme engine — used instead of asking an LLM to guess IPA,
 * which was unreliable (hallucinated or dropped digit-written numbers, e.g. "114" being skipped
 * entirely or read as an unrelated word). Digit numbers and clock times are spelled out as German
 * words first via {@link GermanNumberSpeller}, since espeak-ng does not reliably read digits on
 * its own. Never throws — returns null on any failure so callers can fall back to the AI-provided
 * phonetic instead.
 */
@Service
public class EspeakPhoneticService {

    private static final Logger log = LoggerFactory.getLogger(EspeakPhoneticService.class);
    private static final Duration TIMEOUT = Duration.ofSeconds(10);

    // "08.45" / "08:45" (optionally followed by "Uhr") -> read as a clock time
    private static final Pattern TIME = Pattern.compile("\\b(\\d{1,2})[.:](\\d{2})\\b");
    // "12,78" (German decimal comma)
    private static final Pattern DECIMAL = Pattern.compile("\\b(\\d+),(\\d+)\\b");
    private static final Pattern PLAIN_INT = Pattern.compile("\\b\\d+\\b");

    public String phonetic(String germanText) {
        if (germanText == null || germanText.isBlank()) return null;
        try {
            String normalized = normalizeNumbers(germanText);
            ProcessBuilder pb = new ProcessBuilder("espeak-ng", "-v", "de", "--ipa", "-q", normalized);
            pb.redirectErrorStream(true);
            Process process = pb.start();

            String output;
            try (var in = process.getInputStream()) {
                output = new String(in.readAllBytes(), StandardCharsets.UTF_8);
            }
            boolean finished = process.waitFor(TIMEOUT.toSeconds(), TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                log.warn("espeak-ng timed out");
                return null;
            }
            // espeak-ng emits a line break per clause and inline "(en)"/"(de)" markers whenever it
            // auto-switches voice for a detected loanword (e.g. "Intercity") -- collapse to a
            // single line and strip those markers so they don't leak into the displayed IPA.
            String ipa = output.strip()
                .replaceAll("\\(\\p{Alpha}{2,3}\\)", "")
                .replaceAll("\\s+", " ")
                .strip();
            return ipa.isBlank() ? null : ipa;
        } catch (Exception e) {
            log.warn("espeak-ng phonetic generation failed", e);
            return null;
        }
    }

    /** Package-private for tests. */
    String normalizeNumbers(String text) {
        text = replaceAll(text, TIME, m -> {
            int hour = Integer.parseInt(m.group(1));
            int minute = Integer.parseInt(m.group(2));
            String spelled = GermanNumberSpeller.spellCardinal(hour) + " Uhr";
            if (minute != 0) spelled += " " + GermanNumberSpeller.spellCardinal(minute);
            return spelled;
        });
        text = replaceAll(text, DECIMAL, m ->
            GermanNumberSpeller.spellCardinal(Long.parseLong(m.group(1))) + " Komma "
                + GermanNumberSpeller.spellCardinal(Long.parseLong(m.group(2))));
        text = replaceAll(text, PLAIN_INT, m -> GermanNumberSpeller.spellCardinal(Long.parseLong(m.group())));
        return text;
    }

    private String replaceAll(String text, Pattern pattern, java.util.function.Function<Matcher, String> replacer) {
        Matcher matcher = pattern.matcher(text);
        StringBuilder sb = new StringBuilder();
        while (matcher.find()) {
            matcher.appendReplacement(sb, Matcher.quoteReplacement(replacer.apply(matcher)));
        }
        matcher.appendTail(sb);
        return sb.toString();
    }
}
