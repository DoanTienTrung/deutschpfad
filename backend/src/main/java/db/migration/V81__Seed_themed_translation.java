package db.migration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

/**
 * Luyện dịch theo chủ đề, đợt đầu ({@code data/translation_themed.json}): 6 bộ collocation A2-B2 (10 câu, có từ
 * khoét cho chế độ "Điền từ"), 6 đoạn văn A2-B2 (6 câu nối nhau), 4 bài essay B2-C1 (10 câu chia Einleitung,
 * Hauptteil, Schluss). Câu soạn mới hoàn toàn.
 *
 * <p>Bài đã có cùng dạng và cùng tên thì bỏ qua (admin có thể đã tự tạo trước).
 */
public class V81__Seed_themed_translation extends BaseJavaMigration {

    @Override
    public void migrate(Context context) throws Exception {
        Connection connection = context.getConnection();
        JsonNode sets;
        try (InputStream is = getClass().getResourceAsStream("/db/migration/data/translation_themed.json")) {
            sets = new ObjectMapper().readTree(is);
        }

        try (
            PreparedStatement exists = connection.prepareStatement(
                "SELECT 1 FROM translation_sets WHERE type = ? AND title = ?");
            PreparedStatement insertSet = connection.prepareStatement(
                "INSERT INTO translation_sets (type, level, title, theme, structure_note, status, order_index) "
                    + "VALUES (?, ?, ?, ?, ?, 'PUBLISHED', ?) RETURNING id");
            PreparedStatement insertItem = connection.prepareStatement(
                "INSERT INTO translation_items (set_id, order_index, part_label, vi_text, de_reference, accepted_answers, "
                    + "hint_keywords, focus, gap) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
        ) {
            int setOrder = 0;
            for (JsonNode set : sets) {
                setOrder++;
                exists.setString(1, set.get("type").asText());
                exists.setString(2, set.get("title").asText());
                try (ResultSet rs = exists.executeQuery()) {
                    if (rs.next()) continue;
                }
                insertSet.setString(1, set.get("type").asText());
                insertSet.setString(2, set.get("level").asText());
                insertSet.setString(3, set.get("title").asText());
                insertSet.setString(4, set.get("theme").asText());
                insertSet.setString(5, set.get("note").asText());
                insertSet.setInt(6, setOrder);
                long setId;
                try (ResultSet rs = insertSet.executeQuery()) {
                    rs.next();
                    setId = rs.getLong(1);
                }

                int order = 0;
                for (JsonNode item : set.get("items")) {
                    String reference = item.get(1).asText().strip();
                    List<String> alternatives = new ArrayList<>();
                    for (String alt : item.get(2).asText().split("\\|")) {
                        String a = alt.strip();
                        if (!a.isEmpty() && !a.equals(reference)) alternatives.add(a);
                    }
                    insertItem.setLong(1, setId);
                    insertItem.setInt(2, ++order);
                    insertItem.setString(3, blankToNull(item.get(6).asText()));
                    insertItem.setString(4, item.get(0).asText().strip());
                    insertItem.setString(5, reference);
                    insertItem.setString(6, alternatives.isEmpty() ? null : String.join("\n", alternatives));
                    insertItem.setString(7, blankToNull(item.get(3).asText()));
                    insertItem.setString(8, blankToNull(item.get(4).asText()));
                    insertItem.setString(9, blankToNull(item.get(5).asText()));
                    insertItem.addBatch();
                }
                insertItem.executeBatch();
            }
        }
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.strip();
    }
}
