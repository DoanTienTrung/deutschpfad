package com.deutschpfad.backend.listening;

import com.deutschpfad.backend.vocabulary.VocabAuditInput;
import com.deutschpfad.backend.vocabulary.VocabAuditResult;
import com.deutschpfad.backend.vocabulary.VocabLookupResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Text-only AI helper (translation, IPA annotation, word lookup, content grading) via Groq's
 * OpenAI-compatible chat completions API. Never throws — on any failure (missing key, network
 * error, malformed response) it returns nulls so callers can proceed without blocking on AI
 * availability.
 */
@Service
public class GroqAiService {

    private static final Logger log = LoggerFactory.getLogger(GroqAiService.class);
    private static final String ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
    private static final String MODEL = "openai/gpt-oss-120b";
    private static final Pattern NUMBERED_LINE = Pattern.compile("^\\s*(\\d+)[.)]\\s*(.+?)\\s*\\|\\|\\|\\s*(.+)$");

    private final String apiKey;
    private final GeminiAiService geminiAiService;
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public record SentenceAnnotation(String phonetic, String translation) {
        static SentenceAnnotation empty() {
            return new SentenceAnnotation(null, null);
        }
    }

    public GroqAiService(@Value("${app.groq-api-key}") String apiKey, GeminiAiService geminiAiService) {
        this.apiKey = apiKey;
        this.geminiAiService = geminiAiService;
    }

    // A single chat completion covering the whole transcript works fine for a normal-length
    // exercise, but a long compilation video (a "ganzer Film" cut, hundreds+ of sentences) blows
    // past the model's practical output length and callChat's 30s timeout in one shot -- the call
    // fails outright and every sentence silently ends up with no translation at all. Chunking
    // keeps each request small enough to reliably complete regardless of transcript length.
    private static final int ANNOTATE_BATCH_SIZE = 40;

    /**
     * Groq first; if the key is missing or the call fails (including the free-tier daily token
     * quota, which this project has hit repeatedly), fall back to Gemini so annotation can keep
     * working without a manual retry loop.
     */
    public List<SentenceAnnotation> annotateSentences(List<String> germanSentences) {
        if (germanSentences.isEmpty()) {
            return List.of();
        }
        if (germanSentences.size() <= ANNOTATE_BATCH_SIZE) {
            return annotateSentencesBatch(germanSentences);
        }

        List<SentenceAnnotation> result = new ArrayList<>(germanSentences.size());
        for (int start = 0; start < germanSentences.size(); start += ANNOTATE_BATCH_SIZE) {
            List<String> chunk = germanSentences.subList(start, Math.min(start + ANNOTATE_BATCH_SIZE, germanSentences.size()));
            result.addAll(annotateSentencesBatch(chunk));
        }
        return result;
    }

    private List<SentenceAnnotation> annotateSentencesBatch(List<String> germanSentences) {
        List<SentenceAnnotation> blank = new ArrayList<>();
        germanSentences.forEach(s -> blank.add(SentenceAnnotation.empty()));

        if (apiKey != null && !apiKey.isBlank()) {
            try {
                String content = callChat(buildSentencesPrompt(germanSentences));
                if (content != null) {
                    List<SentenceAnnotation> parsed = parseAnnotatedLines(content, germanSentences.size());
                    if (parsed.stream().anyMatch(a -> a.translation() != null)) {
                        return parsed;
                    }
                }
            } catch (Exception e) {
                log.warn("Groq sentence annotation call failed", e);
            }
        }

        log.warn("Falling back to Gemini for sentence annotation ({} sentences)", germanSentences.size());
        return geminiAiService.annotateSentences(germanSentences);
    }

    public String translateWord(String word, String sentenceContext) {
        if (word == null || word.isBlank()) return null;

        if (apiKey != null && !apiKey.isBlank()) {
            try {
                String content = callChat(buildWordTranslationPrompt(word, sentenceContext));
                if (content != null && !content.isBlank()) return content.strip();
            } catch (Exception e) {
                log.warn("Groq word translation call failed", e);
            }
        }

        log.warn("Falling back to Gemini for word translation ({})", word);
        return geminiAiService.translateWord(word, sentenceContext);
    }

    static String buildWordTranslationPrompt(String word, String sentenceContext) {
        return "Trong câu tiếng Đức: \"" + sentenceContext + "\", từ \"" + word + "\" nghĩa là gì? "
            + "Trả lời NGẮN GỌN chỉ nghĩa tiếng Việt CỦA RIÊNG TỪ ĐÓ (tối đa vài từ), không giải thích "
            + "thêm, không lặp lại câu gốc. QUAN TRỌNG: nếu từ đó là giới từ/thành phần nằm trong một cụm "
            + "động từ cố định (vd. \"gehören zu\", \"warten auf\", \"denken an\"...), CHỈ dịch nghĩa gốc "
            + "của riêng từ đó (vd. \"zu\" → \"đến/về phía\"), TUYỆT ĐỐI không gán nghĩa của cả cụm động từ "
            + "(vd. không dịch \"zu\" thành \"thuộc về\" dù cụm \"gehören zu\" có nghĩa đó).";
    }

    /**
     * Grades a free-form spoken answer (already transcribed to text) against a Speaking prompt.
     * Returns Vietnamese feedback on content/grammar, or null if AI grading is unavailable.
     */
    public String gradeSpeakingAnswer(String promptText, String transcript) {
        if (apiKey == null || apiKey.isBlank() || transcript == null || transcript.isBlank()) return null;

        try {
            String prompt = "Đề bài luyện nói tiếng Đức: \"" + promptText + "\"\n"
                + "Học viên đã trả lời (đã chuyển từ giọng nói sang chữ): \"" + transcript + "\"\n"
                + "Hãy nhận xét ngắn gọn bằng tiếng Việt (3-5 câu) về nội dung câu trả lời có đúng yêu cầu đề bài "
                + "không, ngữ pháp có lỗi gì không, và gợi ý cải thiện. Nhận xét mang tính khích lệ, không quá "
                + "khắt khe vì đây là học viên đang luyện tập.";
            String content = callChat(prompt);
            return content == null || content.isBlank() ? null : content.strip();
        } catch (Exception e) {
            log.warn("Groq speaking grading call failed", e);
            return null;
        }
    }

    public record ConversationTurnText(String role, String text) {}

    /**
     * Grades a full real-time Sprechen conversation (AI partner + user, turn by turn) against a
     * Speaking prompt. Returns Vietnamese feedback covering task completion, vocabulary/grammar,
     * and coherence — pronunciation is assessed separately from Deepgram word confidence, not
     * here. Returns null if AI grading is unavailable.
     */
    public String gradeConversation(String promptText, List<ConversationTurnText> turns) {
        if (apiKey == null || apiKey.isBlank() || turns.isEmpty()) return null;

        try {
            StringBuilder transcript = new StringBuilder();
            for (ConversationTurnText turn : turns) {
                String speaker = "USER".equals(turn.role()) ? "Học viên" : "Bạn cùng thi (AI)";
                transcript.append(speaker).append(": ").append(turn.text()).append('\n');
            }

            String prompt = "Đề bài luyện nói tiếng Đức (thi theo cặp, AI đóng vai bạn cùng thi): \""
                + promptText + "\"\n\nToàn bộ cuộc hội thoại:\n" + transcript + "\n"
                + "Hãy nhận xét bằng tiếng Việt cho học viên (không nhận xét về AI) theo đúng 4 tiêu chí "
                + "thi Sprechen: (1) Hoàn thành nhiệm vụ - có đáp ứng đúng yêu cầu đề bài không; "
                + "(2) Từ vựng & ngữ pháp; (3) Sự mạch lạc, tự nhiên trong hội thoại; (4) Gợi ý cải thiện. "
                + "Với mỗi tiêu chí (1)-(3), chấm định tính \"Tốt\", \"Khá\", hoặc \"Cần luyện thêm\" kèm "
                + "1-2 câu giải thích ngắn. Trả lời đúng định dạng:\n"
                + "1. [nhãn] giải thích\n2. [nhãn] giải thích\n3. [nhãn] giải thích\n4. giải thích\n"
                + "Không thêm lời mở đầu/kết luận nào khác. Nhận xét mang tính khích lệ vì đây là học viên "
                + "đang luyện tập.";
            String content = callChat(prompt);
            return content == null || content.isBlank() ? null : content.strip();
        } catch (Exception e) {
            log.warn("Groq conversation grading call failed", e);
            return null;
        }
    }

    /**
     * Looks up a brand-new German word (typed/pasted by a user into their custom deck) and
     * generates the full set of vocab fields from scratch: word type, VI/EN meaning, IPA,
     * an example sentence, and synonyms/antonyms (left blank rather than invented if none fit).
     * Also normalizes the word itself (e.g. adds the correct article for a noun typed without
     * one). {@code wordTypeHint} is the type the user already picked in the form (or null to let
     * the AI determine it) -- passing it prevents the AI from mis-guessing and mangling the word
     * (eg. nominalizing an adjective). Returns null if AI lookup is unavailable or unparseable.
     */
    public VocabLookupResult lookupNewWord(String germanWord, String wordTypeHint) {
        if (germanWord == null || germanWord.isBlank()) return null;

        if (apiKey != null && !apiKey.isBlank()) {
            try {
                String content = callChat(buildVocabLookupPrompt(germanWord, wordTypeHint));
                if (content != null) {
                    VocabLookupResult result = parseVocabLookupLine(content);
                    if (result != null) return result;
                }
            } catch (Exception e) {
                log.warn("Groq vocab lookup call failed", e);
            }
        }

        log.warn("Falling back to Gemini for vocab lookup ({})", germanWord);
        return geminiAiService.lookupNewWord(germanWord, wordTypeHint);
    }

    static String buildVocabLookupPrompt(String germanWord, String wordTypeHint) {
        boolean hasHint = wordTypeHint != null && !wordTypeHint.isBlank();
        // The AI otherwise sometimes over-applies the "nouns get an article" rule to non-nouns
        // (eg. turning the adjective "freundlich" into the nominalized "der Freundliche") -- when
        // the caller already knows the type, pin it down instead of asking the AI to guess.
        String hintLine = hasHint
            ? "Từ loại của từ này ĐÃ được xác định trước là: " + wordTypeHint + ". Giữ NGUYÊN từ loại này, "
                + "không tự đổi hay suy luận lại.\n"
            : "";
        return "Bạn là chuyên gia tiếng Đức. Cho từ tiếng Đức (có thể người dùng gõ thiếu mạo từ hoặc sai "
            + "chính tả nhẹ): \"" + germanWord + "\"\n"
            + hintLine
            + "Hãy cung cấp đầy đủ thông tin từ vựng cho từ này:\n"
            + "1. Từ tiếng Đức chuẩn (chỉ thêm mạo từ der/die/das ở đầu NẾU từ loại là Nomen; các từ loại "
            + "khác giữ nguyên dạng gốc, không thêm mạo từ, không danh từ hóa; sửa lỗi chính tả nếu có).\n"
            + "2. Loại từ" + (hasHint ? " (xác nhận lại đúng là " + wordTypeHint + ")" : "")
            + ": Nomen/Verb/Adjektiv/Adverb/Präposition/Konjunktion/Pronomen/Zahl/Interjektion...\n"
            + "3. Nghĩa tiếng Việt (ngắn gọn, tự nhiên).\n"
            + "4. Nghĩa tiếng Anh (ngắn gọn).\n"
            + "5. Phiên âm IPA chuẩn (không có dấu / hay [ ] bao quanh; PHẢI là ký hiệu IPA thật, KHÔNG "
            + "được chép lại nguyên văn chữ viết của từ).\n"
            + "6. Một câu ví dụ tiếng Đức tự nhiên, đúng ngữ pháp, có dùng từ này.\n"
            + "7. Từ đồng nghĩa tiếng Đức (1-3 từ, cách nhau bởi dấu phẩy; để trống nếu không có từ nào "
            + "thực sự phù hợp, không bịa ra).\n"
            + "8. Từ trái nghĩa tiếng Đức (1-3 từ, cách nhau bởi dấu phẩy; để trống nếu không có từ nào "
            + "thực sự phù hợp, không bịa ra).\n\n"
            + "Trả lời đúng 1 dòng duy nhất, các trường cách nhau bởi \" ||| \" theo đúng thứ tự trên "
            + "(8 trường). Không thêm giải thích, ghi chú, hay dòng nào khác.";
    }

    static VocabLookupResult parseVocabLookupLine(String text) {
        String line = text.strip();
        int newline = line.indexOf('\n');
        if (newline != -1) line = line.substring(0, newline);

        String[] parts = line.split("\\s*\\|\\|\\|\\s*", -1);
        if (parts.length < 8) return null;

        return new VocabLookupResult(
            parts[0].trim(),
            parts[1].trim(),
            parts[2].trim(),
            parts[3].trim().isEmpty() ? null : parts[3].trim(),
            parts[4].trim(),
            parts[5].trim(),
            parts[6].trim().isEmpty() ? null : parts[6].trim(),
            parts[7].trim().isEmpty() ? null : parts[7].trim()
        );
    }

    /**
     * Reads a German passage (news article, book excerpt) and generates 5-7 multiple-choice
     * comprehension questions from scratch -- used for the "Sách, Báo" / "Bài đọc của tôi" Reading
     * tracks, which (unlike the Goethe exam passages) have no official answer key to transcribe
     * against, so the questions are AI-authored rather than hand-verified. Returns an empty list
     * if AI generation is unavailable or unparseable, so passage creation never blocks on it.
     */
    public List<com.deutschpfad.backend.reading.ReadingQuestionInput> generateReadingQuestions(String content) {
        if (content == null || content.isBlank()) return List.of();

        if (apiKey != null && !apiKey.isBlank()) {
            try {
                String response = callChat(buildReadingQuestionsPrompt(content));
                if (response != null) {
                    List<com.deutschpfad.backend.reading.ReadingQuestionInput> parsed = parseReadingQuestions(response);
                    if (!parsed.isEmpty()) return parsed;
                }
            } catch (Exception e) {
                log.warn("Groq reading question generation failed", e);
            }
        }

        log.warn("Falling back to Gemini for reading question generation");
        return geminiAiService.generateReadingQuestions(content);
    }

    static String buildReadingQuestionsPrompt(String content) {
        return "Bạn là giáo viên tiếng Đức. Đọc kỹ đoạn văn tiếng Đức sau và soạn 5 đến 7 câu hỏi "
            + "trắc nghiệm đọc hiểu (mỗi câu 3 đáp án), kiểm tra đúng nội dung đoạn văn:\n\n"
            + "\"\"\"" + content + "\"\"\"\n\n"
            + "Với mỗi câu hỏi, trả lời đúng 1 dòng theo định dạng:\n"
            + "SỐ. câu hỏi (tiếng Đức) ||| đáp án A ||| đáp án B ||| đáp án C ||| chữ cái đúng "
            + "(A/B/C) ||| giải thích ngắn bằng tiếng Việt có trích dẫn câu gốc chứng minh đáp án\n\n"
            + "Chỉ trả về các dòng câu hỏi theo đúng định dạng trên, không thêm lời mở đầu/kết luận "
            + "nào khác. Câu hỏi và đáp án viết bằng tiếng Đức, chỉ phần giải thích viết bằng tiếng Việt.";
    }

    private static final Pattern SENTENCE_BOUNDARY = Pattern.compile("(?<=[.!?])\\s+");

    /**
     * Translates a whole Reading passage into Vietnamese, paragraph by paragraph, for the
     * side-by-side bilingual practice layout. Splits on paragraph breaks (blank lines) then
     * sentence boundaries, uses {@link #translateSentencesPlain} (a Reading-specific translator --
     * NOT {@link #annotateSentences}, which is built for Listening audio and spells digits out as
     * words for correct pronunciation, e.g. "13" -> "mười ba"; Reading is written text where exam
     * item numbers like "13." must stay as digits), and reassembles paragraphs from the translated
     * sentences. Returns null if translation is unavailable, so passage save/read never blocks.
     */
    public String translatePassage(String content) {
        if (content == null || content.isBlank()) return null;

        String[] paragraphs = content.split("\n\\s*\n");
        List<String> allSentences = new ArrayList<>();
        List<Integer> sentencesPerParagraph = new ArrayList<>();
        for (String paragraph : paragraphs) {
            String trimmed = paragraph.strip();
            if (trimmed.isEmpty()) {
                sentencesPerParagraph.add(0);
                continue;
            }
            String[] sentences = SENTENCE_BOUNDARY.split(trimmed);
            sentencesPerParagraph.add(sentences.length);
            allSentences.addAll(List.of(sentences));
        }
        if (allSentences.isEmpty()) return null;

        List<String> translations = translateSentencesPlain(allSentences);
        if (translations.stream().noneMatch(java.util.Objects::nonNull)) return null;

        StringBuilder result = new StringBuilder();
        int cursor = 0;
        for (int count : sentencesPerParagraph) {
            if (count == 0) continue;
            List<String> translatedSentences = new ArrayList<>();
            for (int i = cursor; i < cursor + count; i++) {
                String t = translations.get(i);
                translatedSentences.add(t != null ? t : allSentences.get(i));
            }
            cursor += count;
            if (!result.isEmpty()) result.append("\n\n");
            result.append(String.join(" ", translatedSentences));
        }
        return result.toString();
    }

    /**
     * Reading-specific sentence translator: plain Vietnamese translation only (no IPA), and
     * explicitly keeps digits as digits rather than spelling them out -- unlike
     * {@link #annotateSentences}, which is for Listening audio pronunciation. Same
     * Groq -> Gemini -> OpenRouter fallback chain and position-based parsing as the rest of this
     * service. Returns a list the same length as the input, with null entries where translation
     * for that sentence failed/is unavailable.
     */
    public List<String> translateSentencesPlain(List<String> sentences) {
        List<String> blank = new ArrayList<>();
        sentences.forEach(s -> blank.add(null));
        if (sentences.isEmpty()) return blank;

        if (apiKey != null && !apiKey.isBlank()) {
            try {
                String content = callChat(buildPlainTranslationPrompt(sentences));
                if (content != null) {
                    List<String> parsed = parsePlainTranslations(content, sentences.size());
                    if (parsed.stream().anyMatch(java.util.Objects::nonNull)) return parsed;
                }
            } catch (Exception e) {
                log.warn("Groq plain sentence translation call failed", e);
            }
        }

        log.warn("Falling back to Gemini for plain sentence translation ({} sentences)", sentences.size());
        return geminiAiService.translateSentencesPlain(sentences);
    }

    static String buildPlainTranslationPrompt(List<String> sentences) {
        StringBuilder sb = new StringBuilder(
            "Dịch mỗi câu tiếng Đức sau sang tiếng Việt tự nhiên, sát nghĩa. Trả lời đúng định dạng "
                + "\"SỐ. bản dịch tiếng Việt\" mỗi câu một dòng duy nhất, không thêm giải thích hay ghi "
                + "chú nào khác, không xuống dòng giữa chừng dù bản dịch dài. QUAN TRỌNG VỀ SỐ: đây là "
                + "văn bản viết (không phải văn bản đọc thành tiếng), nên PHẢI giữ nguyên mọi chữ số y "
                + "hệt như trong câu gốc (vd \"13\" giữ nguyên là \"13\", TUYỆT ĐỐI không đọc/viết thành "
                + "chữ như \"mười ba\").\n\n"
        );
        for (int i = 0; i < sentences.size(); i++) {
            sb.append(i + 1).append(". ").append(sentences.get(i)).append('\n');
        }
        return sb.toString();
    }

    private static final Pattern PLAIN_TRANSLATION_LINE = Pattern.compile("^\\s*(\\d+)[.)]\\s*(.+)$");

    static List<String> parsePlainTranslations(String text, int expectedCount) {
        String[] result = new String[expectedCount];
        // Position-based, same rationale as parseAnnotatedLines: never trust the model's own
        // printed line number as the array index.
        int position = -1;
        for (String line : text.strip().split("\n")) {
            Matcher matcher = PLAIN_TRANSLATION_LINE.matcher(line);
            if (!matcher.matches()) {
                if (position >= 0 && !line.isBlank() && result[position] != null) {
                    result[position] = result[position] + " " + line.trim();
                }
                continue;
            }
            position++;
            if (position >= expectedCount) break;
            result[position] = matcher.group(2).trim();
        }
        List<String> parsed = new ArrayList<>();
        for (String r : result) parsed.add(r);
        return parsed;
    }

    /**
     * Drafts an original German passage (never a copy of a real article) for the "Sách, Báo"
     * Reading track, so the admin has a starting draft to review/edit instead of pasting real
     * copyrighted news text. Returns null if AI generation is unavailable.
     */
    public String generateReadingPassage(String topic, String level) {
        if (topic == null || topic.isBlank()) return null;

        if (apiKey != null && !apiKey.isBlank()) {
            try {
                String response = callChat(buildReadingPassagePrompt(topic, level));
                if (response != null && !response.isBlank()) return response.strip();
            } catch (Exception e) {
                log.warn("Groq reading passage generation failed", e);
            }
        }

        log.warn("Falling back to Gemini for reading passage generation");
        return geminiAiService.generateReadingPassage(topic, level);
    }

    static String buildReadingPassagePrompt(String topic, String level) {
        return "Bạn là giáo viên tiếng Đức. Hãy TỰ VIẾT MỚI HOÀN TOÀN (không sao chép từ bất kỳ bài "
            + "báo hay nguồn nào có sẵn) một đoạn văn tiếng Đức nguyên bản, khoảng 150-300 từ, "
            + "chủ đề \"" + topic + "\", phù hợp trình độ " + level + " theo khung CEFR.\n\n"
            + "Chỉ trả về đúng nội dung đoạn văn tiếng Đức (có thể có tiêu đề ngắn ở dòng đầu), "
            + "không thêm lời giải thích, không thêm ghi chú, không dùng markdown.";
    }

    // ===== Ngữ pháp (Phase 5, Đợt 2) — prompt/parser dùng chung ở GrammarAiPrompts =====

    /** Soạn nháp lý thuyết ngữ pháp tiếng Việt cho 1 chủ điểm; luôn phải admin duyệt trước khi lưu. */
    public String generateGrammarTheory(String titleDe, String titleVi, String level) {
        if (titleDe == null || titleDe.isBlank()) return null;

        if (apiKey != null && !apiKey.isBlank()) {
            try {
                String response = callChat(
                    com.deutschpfad.backend.grammar.GrammarAiPrompts.theory(titleDe, titleVi, level)
                );
                if (response != null && !response.isBlank()) return response.strip();
            } catch (Exception e) {
                log.warn("Groq grammar theory generation failed", e);
            }
        }

        log.warn("Falling back to Gemini for grammar theory generation");
        return geminiAiService.generateGrammarTheory(titleDe, titleVi, level);
    }

    /** Soạn nháp bài tập cho các dạng cần ngữ cảnh; kết quả luôn vào DB với reviewed = false. */
    public List<com.deutschpfad.backend.grammar.GrammarExerciseDraft> generateGrammarExercises(
        String titleDe, String level, String theoryMd, int count
    ) {
        if (titleDe == null || titleDe.isBlank()) return List.of();

        if (apiKey != null && !apiKey.isBlank()) {
            try {
                String response = callChat(
                    com.deutschpfad.backend.grammar.GrammarAiPrompts.exercises(titleDe, level, theoryMd, count)
                );
                if (response != null) {
                    List<com.deutschpfad.backend.grammar.GrammarExerciseDraft> parsed =
                        com.deutschpfad.backend.grammar.GrammarAiPrompts.parseExercises(response);
                    if (!parsed.isEmpty()) return parsed;
                }
            } catch (Exception e) {
                log.warn("Groq grammar exercise generation failed", e);
            }
        }

        log.warn("Falling back to Gemini for grammar exercise generation");
        return geminiAiService.generateGrammarExercises(titleDe, level, theoryMd, count);
    }

    private static final Pattern READING_QUESTION_LINE =
        Pattern.compile("^\\s*\\d+[.)]\\s*(.+?)\\s*\\|\\|\\|\\s*(.+?)\\s*\\|\\|\\|\\s*(.+?)\\s*\\|\\|\\|\\s*(.+?)\\s*\\|\\|\\|\\s*([ABCabc])\\s*\\|\\|\\|\\s*(.+)$");

    static List<com.deutschpfad.backend.reading.ReadingQuestionInput> parseReadingQuestions(String text) {
        List<com.deutschpfad.backend.reading.ReadingQuestionInput> result = new ArrayList<>();
        for (String line : text.strip().split("\n")) {
            Matcher matcher = READING_QUESTION_LINE.matcher(line);
            if (!matcher.matches()) continue;
            result.add(new com.deutschpfad.backend.reading.ReadingQuestionInput(
                matcher.group(1).trim(),
                com.deutschpfad.backend.reading.ReadingQuestion.QuestionType.MULTIPLE_CHOICE,
                matcher.group(2).trim(),
                matcher.group(3).trim(),
                matcher.group(4).trim(),
                null,
                matcher.group(5).trim().toUpperCase(),
                matcher.group(6).trim()
            ));
        }
        return result;
    }

    /**
     * Audits a batch of vocabulary entries: verifies Vietnamese/English meaning and IPA are
     * accurate (corrects if wrong), and verifies the example sentence actually and correctly uses
     * the German word (rewrites it if not — e.g. missing the word entirely, wrong grammar, or
     * using the word in a way that doesn't demonstrate its meaning). Always returns the exact
     * substring in the (possibly rewritten) sentence that is the word, in whatever inflected form
     * it appears, for client-side highlighting — German conjugates/declines so this often isn't
     * the dictionary form verbatim (gelten -> gilt).
     */
    public List<VocabAuditResult> auditVocabularyItems(List<VocabAuditInput> items) {
        List<VocabAuditResult> unchanged = items.stream().map(VocabAuditResult::unchanged).toList();
        if (apiKey == null || apiKey.isBlank() || items.isEmpty()) return unchanged;

        try {
            String content = callChat(buildVocabAuditPrompt(items));
            if (content == null) return unchanged;
            return parseVocabAuditLines(content, items);
        } catch (Exception e) {
            log.warn("Groq vocabulary audit call failed", e);
            return unchanged;
        }
    }

    private String buildVocabAuditPrompt(List<VocabAuditInput> items) {
        StringBuilder sb = new StringBuilder(
            "Bạn là chuyên gia tiếng Đức. Với mỗi từ vựng tiếng Đức sau (kèm loại từ, nghĩa tiếng Việt, "
                + "nghĩa tiếng Anh, phiên âm IPA, câu ví dụ hiện có), hãy:\n"
                + "1. Kiểm tra nghĩa tiếng Việt có chính xác không, sửa lại nếu sai (nếu đúng thì giữ nguyên).\n"
                + "2. Kiểm tra nghĩa tiếng Anh có chính xác không (nếu ô này trống thì để trống, không tự bịa "
                + "thêm), sửa lại nếu sai.\n"
                + "3. Kiểm tra phiên âm IPA có đúng không, sửa lại nếu sai.\n"
                + "4. Kiểm tra câu ví dụ có đúng ngữ pháp tiếng Đức VÀ có thực sự dùng đúng từ đó (ở dạng "
                + "chia/biến đổi phù hợp) hay không — nếu câu sai hoặc không dùng từ đó, HÃY VIẾT LẠI câu ví "
                + "dụ mới hoàn toàn đúng ngữ pháp và tự nhiên; nếu câu đã đúng thì giữ nguyên y hệt.\n"
                + "5. QUAN TRỌNG: trường cuối PHẢI là 1 chuỗi ký tự COPY Y HỆT (character-by-character, "
                + "không đổi 1 chữ nào) từ câu_ví_dụ ở trên (câu đã sửa nếu có) — không thêm mạo từ "
                + "(der/die/das/ein...), không đưa về dạng nguyên mẫu/từ điển, không thêm dấu câu. Nếu từ đó "
                + "là động từ tách (như \"aufwachen\" → \"wache ... auf\" trong câu), chỉ copy đúng phần gốc "
                + "liền nhau xuất hiện trong câu (vd \"wache\"), KHÔNG ghép 2 phần rời rạc lại với nhau. Nếu "
                + "không copy được chính xác 1 cụm liên tục nào trong câu, để trống trường này thay vì đoán.\n\n"
                + "Trả lời đúng định dạng, mỗi từ 1 dòng, các trường cách nhau bởi \" ||| \" theo đúng thứ tự: "
                + "SỐ. nghĩa_tiếng_việt ||| nghĩa_tiếng_anh ||| phiên_âm_IPA ||| câu_ví_dụ ||| từ_được_gạch_chân\n"
                + "Không thêm giải thích hay ghi chú nào khác ngoài các dòng đúng định dạng trên.\n\n"
        );
        for (int i = 0; i < items.size(); i++) {
            VocabAuditInput item = items.get(i);
            sb.append(i + 1).append(". Từ: ").append(item.germanWord())
                .append(" (").append(item.wordType() == null ? "?" : item.wordType()).append(")")
                .append(" | Nghĩa VI: ").append(item.vietnameseMeaning())
                .append(" | Nghĩa EN: ").append(item.englishMeaning() == null ? "" : item.englishMeaning())
                .append(" | IPA: ").append(item.phonetic() == null ? "" : item.phonetic())
                .append(" | Câu ví dụ: ").append(item.exampleSentence() == null ? "" : item.exampleSentence())
                .append('\n');
        }
        return sb.toString();
    }

    private List<VocabAuditResult> parseVocabAuditLines(String text, List<VocabAuditInput> items) {
        VocabAuditResult[] result = new VocabAuditResult[items.size()];
        Pattern linePattern = Pattern.compile("^\\s*(\\d+)[.)]\\s*(.+)$");
        for (String line : text.strip().split("\n")) {
            Matcher matcher = linePattern.matcher(line);
            if (!matcher.matches()) continue;
            int index = Integer.parseInt(matcher.group(1)) - 1;
            if (index < 0 || index >= items.size()) continue;

            String[] parts = matcher.group(2).split("\\s*\\|\\|\\|\\s*", -1);
            if (parts.length < 5) continue;

            String sentence = parts[3].trim();
            String highlight = parts[4].trim();
            // Guard against the model returning a dictionary/infinitive form that doesn't
            // literally appear in the sentence (e.g. "das Geheimnis" when the sentence has just
            // "Geheimnis", or a separable verb's infinitive when the sentence has it split apart)
            // — an unverifiable highlight is worse than none, since it would silently fail to
            // render client-side anyway.
            boolean verified = !highlight.isEmpty() && sentence.toLowerCase().contains(highlight.toLowerCase());

            result[index] = new VocabAuditResult(
                parts[0].trim(),
                parts[1].trim().isEmpty() ? null : parts[1].trim(),
                parts[2].trim(),
                sentence,
                verified ? highlight : null
            );
        }
        List<VocabAuditResult> parsed = new ArrayList<>();
        for (int i = 0; i < items.size(); i++) {
            parsed.add(result[i] == null ? VocabAuditResult.unchanged(items.get(i)) : result[i]);
        }
        return parsed;
    }

    private String callChat(String prompt) throws Exception {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("model", MODEL);
        root.put("temperature", 0.3);
        ArrayNode messages = root.putArray("messages");
        ObjectNode userMessage = messages.addObject();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(ENDPOINT))
            .header("Authorization", "Bearer " + apiKey)
            .header("Content-Type", "application/json")
            .timeout(Duration.ofSeconds(30))
            .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(root)))
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            log.warn("Groq request failed: HTTP {} - {}", response.statusCode(), response.body());
            return null;
        }

        return objectMapper.readTree(response.body()).at("/choices/0/message/content").asText("");
    }

    static String buildSentencesPrompt(List<String> sentences) {
        StringBuilder sb = new StringBuilder(
            "Với mỗi câu tiếng Đức sau, cho phiên âm quốc tế IPA và bản dịch tiếng Việt tự nhiên, sát "
                + "nghĩa. Trả lời đúng định dạng \"SỐ. phiên âm IPA ||| bản dịch tiếng Việt\" mỗi câu một "
                + "dòng duy nhất, không thêm giải thích hay ghi chú nào khác. QUAN TRỌNG: một số câu "
                + "tiếng Đức bên dưới có thể chứa nhiều dấu chấm câu bên trong (ví dụ do gộp từ 2 câu "
                + "gốc) — dù vậy vẫn phải trả lời TRỌN VẸN cả câu đó trên đúng MỘT dòng, tuyệt đối "
                + "không xuống dòng giữa chừng dù bản dịch dài. QUAN TRỌNG VỀ SỐ: nếu câu có số viết "
                + "dạng chữ số (vd \"13\", \"114\", \"08.45\"), trước tiên phải đọc thành lời tiếng Đức "
                + "đúng ngữ cảnh (vd \"13\" → \"dreizehn\", \"114\" → \"einhundertvierzehn\", \"08.45\" "
                + "giờ → \"acht Uhr fünfundvierzig\"), rồi mới phiên âm IPA của cách đọc đó — không được "
                + "bỏ sót số, không được phiên âm thành từ khác không liên quan:\n\n"
        );
        for (int i = 0; i < sentences.size(); i++) {
            sb.append(i + 1).append(". ").append(sentences.get(i)).append('\n');
        }
        return sb.toString();
    }

    static List<SentenceAnnotation> parseAnnotatedLines(String text, int expectedCount) {
        SentenceAnnotation[] result = new SentenceAnnotation[expectedCount];
        // Assign by the order lines are matched, NOT by the leading number the model printed --
        // the model's own count can drift from the true input index (e.g. it silently merges two
        // input sentences' worth of content into one translation line), and trusting a drifted
        // declared number cascades a wrong-translation shift across every following sentence.
        // Line order is the reliable signal since we always send exactly one input per line.
        int position = -1;
        for (String line : text.strip().split("\n")) {
            Matcher matcher = NUMBERED_LINE.matcher(line);
            if (!matcher.matches()) {
                // the model wrapped a translation onto a continuation line instead of keeping it
                // on one line as instructed -- append it to the previous item rather than
                // silently dropping it (this happened whenever the German sentence itself
                // contained an embedded period, e.g. a merged sentence).
                if (position >= 0 && !line.isBlank()) {
                    SentenceAnnotation prev = result[position];
                    if (prev != null) {
                        // if the stray line itself looks like a malformed "phonetic ||| translation"
                        // pair (missing only its leading "N."), keep just the translation half --
                        // otherwise the leftover IPA/phonetic text ends up glued into the
                        // translation shown to users.
                        String addition = line.trim();
                        int sep = addition.lastIndexOf("|||");
                        if (sep >= 0) addition = addition.substring(sep + 3).trim();
                        if (!addition.isEmpty()) {
                            result[position] = new SentenceAnnotation(prev.phonetic(), prev.translation() + " " + addition);
                        }
                    }
                }
                continue;
            }
            position++;
            if (position < expectedCount) {
                result[position] = new SentenceAnnotation(matcher.group(2).trim(), matcher.group(3).trim());
            }
        }
        List<SentenceAnnotation> parsed = new ArrayList<>();
        for (SentenceAnnotation value : result) parsed.add(value == null ? SentenceAnnotation.empty() : value);
        return parsed;
    }
}
