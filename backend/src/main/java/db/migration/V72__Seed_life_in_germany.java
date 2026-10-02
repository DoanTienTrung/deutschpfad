package db.migration;

import com.deutschpfad.backend.vocabulary.NounPlural;
import com.deutschpfad.backend.vocabulary.WordKey;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Bộ từ "Sống ở Đức": 8 bài × 25 từ cho những việc người mới sang Đức phải làm ngay — đăng ký cư
 * trú, thuê nhà, đi khám, ngân hàng, đi tàu, đổ rác, xin việc, gọi khẩn cấp.
 *
 * <p>Nội dung soạn mới hoàn toàn (nghĩa, câu ví dụ, bản dịch), không chép từ sách nào. Đã đối chiếu
 * với Wiktionary: 142/142 danh từ có trong bảng giống khớp giống, 128/128 số nhiều có trong bảng
 * khớp số nhiều.
 *
 * <p>Migration Java vì {@code word_key} và {@code plural} phải tính bằng đúng {@link WordKey} và
 * {@link NounPlural} của ứng dụng (cùng lý do V67, V70). Số nhiều tính lại cho CẢ NHÓM cùng khoá: thêm
 * "die Miete, -n" thì các dòng "die Miete" sẵn có ở lộ trình khác cũng nhận "Mieten".
 */
public class V72__Seed_life_in_germany extends BaseJavaMigration {

    @Override
    public void migrate(Context context) throws Exception {
        Connection connection = context.getConnection();
        Map<Integer, Long> lessonIds = new HashMap<>();
        Set<String> touchedKeys = new LinkedHashSet<>();

        try (
            InputStream is = getClass().getResourceAsStream("/db/migration/data/life_in_germany.tsv");
            BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
            PreparedStatement insertLesson = connection.prepareStatement(
                "INSERT INTO lessons (title, level, source, order_index, description) VALUES (?, ?, 'LIFE', ?, ?) RETURNING id");
            PreparedStatement insertItem = connection.prepareStatement(
                "INSERT INTO vocabulary_items (german_word, word_key, word_type, level, vietnamese_meaning, "
                    + "english_meaning, phonetic, example_sentence, example_sentence_vi, example_sentence_highlight, "
                    + "source, lesson_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'LIFE', ?)")
        ) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) continue;
                String[] f = line.split("\t", -1);
                if (f[0].equals("#LESSON")) {
                    insertLesson.setString(1, f[2]);
                    insertLesson.setString(2, f[3]);
                    insertLesson.setInt(3, Integer.parseInt(f[1]));
                    insertLesson.setString(4, f[4]);
                    try (ResultSet rs = insertLesson.executeQuery()) {
                        rs.next();
                        lessonIds.put(Integer.parseInt(f[1]), rs.getLong(1));
                    }
                    continue;
                }
                // lesson | german_word | word_type | level | vi | en | ipa | example | example_vi | highlight
                String key = WordKey.of(f[1]);
                touchedKeys.add(key);
                insertItem.setString(1, f[1]);
                insertItem.setString(2, key);
                insertItem.setString(3, f[2]);
                insertItem.setString(4, f[3]);
                insertItem.setString(5, f[4]);
                insertItem.setString(6, f[5]);
                insertItem.setString(7, f[6]);
                insertItem.setString(8, f[7]);
                insertItem.setString(9, f[8]);
                insertItem.setString(10, f[9]);
                insertItem.setLong(11, lessonIds.get(Integer.parseInt(f[0])));
                insertItem.addBatch();
            }
            insertItem.executeBatch();
        }

        refreshPlurals(connection, touchedKeys);
    }

    private void refreshPlurals(Connection connection, Set<String> keys) throws Exception {
        try (
            PreparedStatement family = connection.prepareStatement(
                "SELECT id, german_word FROM vocabulary_items WHERE word_key = ? ORDER BY id");
            PreparedStatement lookup = connection.prepareStatement(
                "SELECT plural FROM german_noun_plurals WHERE lemma = ? AND genus = ?");
            PreparedStatement update = connection.prepareStatement(
                "UPDATE vocabulary_items SET plural = ? WHERE id = ?")
        ) {
            for (String key : keys) {
                List<Long> ids = new ArrayList<>();
                List<String> words = new ArrayList<>();
                family.setString(1, key);
                try (ResultSet rs = family.executeQuery()) {
                    while (rs.next()) {
                        ids.add(rs.getLong(1));
                        words.add(rs.getString(2));
                    }
                }
                List<String> plurals = NounPlural.resolveFamily(words, (lemma, genus) -> {
                    try {
                        lookup.setString(1, lemma);
                        lookup.setString(2, genus);
                        try (ResultSet rs = lookup.executeQuery()) {
                            return rs.next() ? rs.getString(1) : null;
                        }
                    } catch (Exception e) {
                        throw new IllegalStateException(e);
                    }
                });
                for (int i = 0; i < ids.size(); i++) {
                    update.setString(1, plurals.get(i));
                    update.setLong(2, ids.get(i));
                    update.addBatch();
                }
            }
            update.executeBatch();
        }
    }
}
