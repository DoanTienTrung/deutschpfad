package db.migration;

/**
 * Luyện dịch theo chủ điểm ngữ pháp, đợt 2: 40 chủ điểm còn thiếu (4 chủ điểm A1, toàn bộ B1 và B2) × 10 câu
 * ({@code data/translation_grammar_2.json}). Cùng cách nạp với đợt 1: gắn theo slug, chủ điểm đã có bài luyện
 * dịch (kể cả bài admin tự soạn trong lúc chờ) thì bỏ qua, không ghi đè.
 */
public class V79__Seed_grammar_translation_b1_b2 extends V77__Seed_grammar_translation {

    @Override
    protected String dataResource() {
        return "/db/migration/data/translation_grammar_2.json";
    }
}
