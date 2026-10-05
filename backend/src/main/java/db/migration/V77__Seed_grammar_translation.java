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
 * Luyện dịch Việt → Đức theo chủ điểm ngữ pháp, đợt đầu: 37 chủ điểm A1-A2 × 10 câu
 * ({@code data/translation_grammar.json}). Câu soạn mới hoàn toàn, mỗi câu bắt buộc dùng cấu trúc của chủ
 * điểm; kèm các cách dịch đúng khác (trật tự từ khác, từ đồng nghĩa) để chấm tại chỗ không cần AI.
 *
 * <p>Gắn theo slug chủ điểm: slug nào không có trong {@code grammar_topics} thì bỏ qua; chủ điểm đã có bài
 * luyện dịch thì không thêm lần hai.
 */
public class V77__Seed_grammar_translation extends BaseJavaMigration {

    @Override
    public void migrate(Context context) throws Exception {
        Connection connection = context.getConnection();
        JsonNode topics;
        try (InputStream is = getClass().getResourceAsStream("/db/migration/data/translation_grammar.json")) {
            topics = new ObjectMapper().readTree(is);
        }

        try (
            PreparedStatement findTopic = connection.prepareStatement(
                "SELECT t.id, t.level, t.title_vi, t.order_index FROM grammar_topics t WHERE t.slug = ? "
                    + "AND NOT EXISTS (SELECT 1 FROM translation_sets s WHERE s.grammar_topic_id = t.id)");
            PreparedStatement insertSet = connection.prepareStatement(
                "INSERT INTO translation_sets (type, level, title, grammar_topic_id, structure_note, status, order_index) "
                    + "VALUES ('GRAMMAR', ?, ?, ?, ?, 'PUBLISHED', ?) RETURNING id");
            PreparedStatement insertItem = connection.prepareStatement(
                "INSERT INTO translation_items (set_id, order_index, vi_text, de_reference, accepted_answers, hint_keywords) "
                    + "VALUES (?, ?, ?, ?, ?, ?)")
        ) {
            for (JsonNode topic : topics) {
                findTopic.setString(1, topic.get("slug").asText());
                long topicId;
                try (ResultSet rs = findTopic.executeQuery()) {
                    if (!rs.next()) continue;
                    topicId = rs.getLong("id");
                    insertSet.setString(1, rs.getString("level"));
                    insertSet.setString(2, rs.getString("title_vi"));
                    insertSet.setLong(3, topicId);
                    insertSet.setString(4, topic.get("note").asText());
                    insertSet.setInt(5, rs.getInt("order_index"));
                }
                long setId;
                try (ResultSet rs = insertSet.executeQuery()) {
                    rs.next();
                    setId = rs.getLong(1);
                }

                int order = 0;
                for (JsonNode item : topic.get("items")) {
                    String reference = item.get(1).asText().strip();
                    List<String> alternatives = new ArrayList<>();
                    for (String alt : item.get(2).asText().split("\\|")) {
                        String a = alt.strip();
                        if (!a.isEmpty() && !a.equals(reference)) alternatives.add(a);
                    }
                    insertItem.setLong(1, setId);
                    insertItem.setInt(2, ++order);
                    insertItem.setString(3, item.get(0).asText().strip());
                    insertItem.setString(4, reference);
                    insertItem.setString(5, alternatives.isEmpty() ? null : String.join("\n", alternatives));
                    insertItem.setString(6, item.get(3).asText().strip());
                    insertItem.addBatch();
                }
                insertItem.executeBatch();
            }
        }
    }
}
