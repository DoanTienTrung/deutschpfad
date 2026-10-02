package db.migration;

import com.deutschpfad.backend.vocabulary.NounPlural;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Nạp bảng số nhiều Wiktionary rồi tính {@code vocabulary_items.plural} cho mọi từ đang có.
 *
 * <p>Tính bằng {@link NounPlural#resolveFamily} — đúng hàm ứng dụng gọi mỗi khi admin lưu một từ —
 * cùng lý do V67 là migration Java: hai bản cài đặt (SQL và Java) sớm muộn sẽ lệch nhau.
 *
 * <p>Tính theo NHÓM cùng {@code word_key}: "die Mutter" ở lộ trình tần suất không có ký hiệu số
 * nhiều, nhưng "die Mutter, ¨" ở giáo trình có, nên cả hai cùng ra "Mütter" — trong khi bảng
 * Wiktionary cố ý không có "Mutter" (Mütter / Muttern).
 */
public class V70__Load_noun_plurals extends BaseJavaMigration {

    private static final int BATCH_SIZE = 2000;

    @Override
    public void migrate(Context context) throws Exception {
        Connection connection = context.getConnection();
        Map<String, String> plurals = loadTable(connection);

        Map<String, List<Long>> idsByKey = new LinkedHashMap<>();
        Map<String, List<String>> wordsByKey = new HashMap<>();
        try (Statement select = connection.createStatement();
             ResultSet rows = select.executeQuery("SELECT id, german_word, word_key FROM vocabulary_items ORDER BY id")) {
            while (rows.next()) {
                String key = rows.getString("word_key");
                idsByKey.computeIfAbsent(key, k -> new ArrayList<>()).add(rows.getLong("id"));
                wordsByKey.computeIfAbsent(key, k -> new ArrayList<>()).add(rows.getString("german_word"));
            }
        }

        try (PreparedStatement update = connection.prepareStatement(
            "UPDATE vocabulary_items SET plural = ? WHERE id = ?")) {
            int pending = 0;
            for (Map.Entry<String, List<Long>> family : idsByKey.entrySet()) {
                List<String> resolved = NounPlural.resolveFamily(
                    wordsByKey.get(family.getKey()), (lemma, genus) -> plurals.get(lemma + "\t" + genus));
                for (int i = 0; i < resolved.size(); i++) {
                    if (resolved.get(i) == null) continue;
                    update.setString(1, resolved.get(i));
                    update.setLong(2, family.getValue().get(i));
                    update.addBatch();
                    if (++pending >= BATCH_SIZE) {
                        update.executeBatch();
                        pending = 0;
                    }
                }
            }
            if (pending > 0) update.executeBatch();
        }
    }

    /** Nạp file TSV (từ, giống, số nhiều) vào bảng, đồng thời giữ một bản trong bộ nhớ để tra. */
    private Map<String, String> loadTable(Connection connection) throws Exception {
        Map<String, String> plurals = new HashMap<>();
        try (
            InputStream is = getClass().getResourceAsStream("/db/migration/data/german_noun_plurals.tsv");
            BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
            PreparedStatement insert = connection.prepareStatement(
                "INSERT INTO german_noun_plurals (lemma, genus, plural) VALUES (?, ?, ?)")
        ) {
            String line;
            int pending = 0;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split("\t");
                if (parts.length != 3) continue;
                plurals.put(parts[0] + "\t" + parts[1], parts[2]);
                insert.setString(1, parts[0]);
                insert.setString(2, parts[1]);
                insert.setString(3, parts[2]);
                insert.addBatch();
                if (++pending >= BATCH_SIZE) {
                    insert.executeBatch();
                    pending = 0;
                }
            }
            if (pending > 0) insert.executeBatch();
        }
        return plurals;
    }
}
