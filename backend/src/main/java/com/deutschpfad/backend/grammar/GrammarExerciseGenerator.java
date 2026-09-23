package com.deutschpfad.backend.grammar;

import com.deutschpfad.backend.vocabulary.GermanNounGender;
import com.deutschpfad.backend.vocabulary.GermanNounGenderRepository;
import com.deutschpfad.backend.vocabulary.VocabularyItem;
import com.deutschpfad.backend.vocabulary.VocabularyItemRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

/**
 * Sinh bài tập ngữ pháp <b>deterministic</b> — không gọi AI, không tốn quota, và quan trọng nhất
 * là <b>đáp án đúng 100%</b> vì suy ra từ dữ liệu tra cứu chứ không phải model đoán:
 * <ul>
 *   <li>Mạo từ / biến cách: giống danh từ tra từ bảng {@code german_noun_genders} (91k dòng, nguồn
 *       WiktionaryDE), dạng mạo từ suy ra từ {@link GermanDeclension}</li>
 *   <li>Chia động từ: quy tắc thân + đuôi trong {@link WeakVerbConjugator}</li>
 * </ul>
 *
 * <p>Vì đáp án chắc chắn đúng nên bài sinh ở đây được đánh dấu {@code reviewed = true} ngay, khác
 * với bài AI soạn (phải qua bước admin duyệt).
 *
 * <p>Kho từ lấy từ {@code vocabulary_items} lọc theo level — để bài tập chỉ dùng từ người học đã
 * gặp, thay vì bốc bừa trong 91k danh từ (bảng đó chứa cả hậu tố kiểu "-chen", "-ant" và vô số từ
 * chuyên ngành không hợp trình A1).
 */
@Service
public class GrammarExerciseGenerator {

    /** Dạng bài sinh được bằng dữ liệu, không cần AI. */
    public enum Kind { ARTICLE, VERB_CONJUGATION }

    private final VocabularyItemRepository vocabularyItemRepository;
    private final GermanNounGenderRepository nounGenderRepository;

    public GrammarExerciseGenerator(
        VocabularyItemRepository vocabularyItemRepository,
        GermanNounGenderRepository nounGenderRepository
    ) {
        this.vocabularyItemRepository = vocabularyItemRepository;
        this.nounGenderRepository = nounGenderRepository;
    }

    public record Options(
        Kind kind,
        int count,
        GermanDeclension.Kasus kasus,
        GermanDeclension.ArticleKind articleKind
    ) {}

    public List<GrammarExercise> generate(GrammarTopic topic, Options options) {
        return switch (options.kind()) {
            case ARTICLE -> generateArticleExercises(topic, options);
            case VERB_CONJUGATION -> generateVerbExercises(topic, options);
        };
    }

    // ---- Mạo từ / biến cách ----

    /**
     * Dạng bài là bảng biến cách trần ("___ Tisch" + nêu rõ cách cần điền), <b>cố ý không bọc vào
     * câu ví dụ</b>. Lý do: một khung câu cố định kiểu "Ich sehe ___ X" ghép với danh từ bất kỳ sẽ
     * đẻ ra câu vô nghĩa ("Ich sehe den Hunger"). Bài sinh ở đây được duyệt sẵn nên phải đúng
     * tuyệt đối cả ngữ pháp lẫn ngữ nghĩa — bỏ khung câu là cách duy nhất bảo đảm được điều đó.
     * Bài có ngữ cảnh để AI soạn rồi admin duyệt.
     */
    private List<GrammarExercise> generateArticleExercises(GrammarTopic topic, Options options) {
        GermanDeclension.Kasus kasus =
            options.kasus() != null ? options.kasus() : GermanDeclension.Kasus.NOMINATIV;
        GermanDeclension.ArticleKind articleKind =
            options.articleKind() != null ? options.articleKind() : GermanDeclension.ArticleKind.DEFINITE;

        List<VocabularyItem> nouns = new ArrayList<>(
            vocabularyItemRepository.findByWordTypeIgnoreCaseAndLevelIn("Nomen", levelsUpTo(topic.getLevel()))
        );
        Collections.shuffle(nouns);

        List<GrammarExercise> generated = new ArrayList<>();
        for (VocabularyItem item : nouns) {
            if (generated.size() >= options.count()) break;

            String bareNoun = stripArticle(item.getGermanWord());
            if (bareNoun == null) continue;

            GermanDeclension.Genus genus = nounGenderRepository.findByLemma(bareNoun.toLowerCase(Locale.ROOT))
                .map(GermanNounGender::getGenus)
                .map(GermanDeclension.Genus::fromCode)
                .orElse(null);
            // Không tra được giống thì bỏ qua — thà ít bài còn hơn đoán bừa der/die/das.
            if (genus == null) continue;

            String answer = GermanDeclension.article(articleKind, kasus, genus);

            GrammarExercise exercise = new GrammarExercise();
            exercise.setTopic(topic);
            exercise.setExerciseType(GrammarExercise.ExerciseType.FILL_BLANK);
            exercise.setPromptDe("___ " + bareNoun);
            exercise.setHintVi(
                kasus.germanName + " (" + kasus.vietnameseName + "), " + articleKind.vietnameseName
                    + " — nghĩa: " + item.getVietnameseMeaning()
            );
            exercise.setCorrectAnswer(answer);
            exercise.setExplanationVi(
                bareNoun + " là giống " + genusVi(genus) + " (" + genus.nominativDefinite + " " + bareNoun
                    + "), ở " + kasus.germanName + " thì " + articleKind.vietnameseName + " là \""
                    + answer + "\"."
            );
            exercise.setGeneratedBy(GrammarExercise.GeneratedBy.DATA);
            exercise.setReviewed(true);
            generated.add(exercise);
        }
        return generated;
    }

    // ---- Chia động từ ----

    private List<GrammarExercise> generateVerbExercises(GrammarTopic topic, Options options) {
        List<VocabularyItem> verbs = new ArrayList<>(
            vocabularyItemRepository.findByWordTypeIgnoreCaseAndLevelIn("Verb", levelsUpTo(topic.getLevel()))
        );
        Collections.shuffle(verbs);

        WeakVerbConjugator.Person[] persons = WeakVerbConjugator.Person.values();
        List<GrammarExercise> generated = new ArrayList<>();
        int personIndex = 0;

        for (VocabularyItem item : verbs) {
            if (generated.size() >= options.count()) break;

            String infinitive = item.getGermanWord().trim().toLowerCase(Locale.ROOT);
            if (!WeakVerbConjugator.isRegularAndSeparable(infinitive)) continue;

            // Xoay vòng qua 6 ngôi để một lần sinh không ra toàn bài ngôi "ich".
            WeakVerbConjugator.Person person = persons[personIndex++ % persons.length];
            String answer = WeakVerbConjugator.conjugate(infinitive, person);

            GrammarExercise exercise = new GrammarExercise();
            exercise.setTopic(topic);
            exercise.setExerciseType(GrammarExercise.ExerciseType.CONJUGATE);
            exercise.setPromptDe(person.label + " ___ (" + infinitive + ")");
            exercise.setHintVi("Chia động từ ở thì hiện tại — nghĩa: " + item.getVietnameseMeaning());
            exercise.setCorrectAnswer(answer);
            exercise.setExplanationVi(
                "Thân từ \"" + WeakVerbConjugator.stem(infinitive) + "-\" ghép đuôi của ngôi "
                    + person.label + " thành \"" + answer + "\"."
            );
            exercise.setGeneratedBy(GrammarExercise.GeneratedBy.DATA);
            exercise.setReviewed(true);
            generated.add(exercise);
        }
        return generated;
    }

    // ---- Helper ----

    /** Mọi level từ A1 tới level của chủ điểm — bài A2 dùng được cả từ A1. */
    static List<VocabularyItem.Level> levelsUpTo(VocabularyItem.Level level) {
        List<VocabularyItem.Level> levels = new ArrayList<>();
        for (VocabularyItem.Level candidate : VocabularyItem.Level.values()) {
            if (candidate.ordinal() <= level.ordinal()) levels.add(candidate);
        }
        return levels;
    }

    /**
     * {@code vocabulary_items.german_word} lưu danh từ kèm mạo từ ("der Tisch"), nhưng bảng tra
     * giống đánh khoá theo lemma trần ("tisch") — nên phải bóc mạo từ ra trước khi tra. Trả về
     * null nếu không phải dạng "mạo từ + 1 danh từ" (từ ghép nhiều chữ, thiếu mạo từ...).
     */
    static String stripArticle(String germanWord) {
        if (germanWord == null) return null;
        String[] parts = germanWord.trim().split("\\s+");
        if (parts.length != 2) return null;
        String article = parts[0].toLowerCase(Locale.ROOT);
        if (!article.equals("der") && !article.equals("die") && !article.equals("das")) return null;
        return parts[1];
    }

    private static String genusVi(GermanDeclension.Genus genus) {
        return switch (genus) {
            case MASKULIN -> "đực";
            case FEMININ -> "cái";
            case NEUTRUM -> "trung";
        };
    }
}
