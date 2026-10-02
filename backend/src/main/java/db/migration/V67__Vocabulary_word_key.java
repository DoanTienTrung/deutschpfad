package db.migration;

import com.deutschpfad.backend.vocabulary.WordKey;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

/**
 * Thêm cột {@code vocabulary_items.word_key} và tính sẵn cho mọi từ đang có.
 *
 * <p><b>Vì sao là migration Java, không phải SQL:</b> khoá được tính bằng {@link WordKey#of}, và từ
 * nay mỗi lần thêm/sửa từ qua JPA cũng gọi đúng hàm đó. Viết lại cùng quy tắc bằng SQL (regex trong
 * Postgres) là có hai bản cài đặt song song — sớm muộn sẽ lệch nhau, và khi lệch thì từ cũ (khoá
 * tính bằng SQL) với từ mới (khoá tính bằng Java) không gộp được với nhau mà không ai hay.
 *
 * <p>Flyway tự tìm class này vì nó nằm trong package {@code db.migration} — trùng với
 * {@code spring.flyway.locations: classpath:db/migration}.
 */
public class V67__Vocabulary_word_key extends BaseJavaMigration {

    @Override
    public void migrate(Context context) throws Exception {
        Connection connection = context.getConnection();

        try (Statement ddl = connection.createStatement()) {
            ddl.execute("ALTER TABLE vocabulary_items ADD COLUMN word_key VARCHAR(255)");
        }

        try (Statement select = connection.createStatement();
             ResultSet rows = select.executeQuery("SELECT id, german_word FROM vocabulary_items");
             PreparedStatement update = connection.prepareStatement(
                 "UPDATE vocabulary_items SET word_key = ? WHERE id = ?")) {
            while (rows.next()) {
                update.setString(1, WordKey.of(rows.getString("german_word")));
                update.setLong(2, rows.getLong("id"));
                update.addBatch();
            }
            update.executeBatch();
        }

        try (Statement ddl = connection.createStatement()) {
            ddl.execute("ALTER TABLE vocabulary_items ALTER COLUMN word_key SET NOT NULL");
            ddl.execute("CREATE INDEX idx_vocabulary_items_word_key ON vocabulary_items (word_key)");
        }
    }
}
