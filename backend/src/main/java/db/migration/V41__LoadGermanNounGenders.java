package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;

/**
 * Loads the ~90k-entry German noun gender reference table (lemma -> genus) from the bundled CSV.
 * A Java migration instead of a giant generated SQL file, since 90k INSERT statements would bloat
 * the migration history for no benefit -- batched JDBC inserts do the same job in a few seconds.
 * Source: WiktionaryDE, compiled by https://github.com/gambolputty/german-nouns (CC-BY-SA 4.0).
 */
public class V41__LoadGermanNounGenders extends BaseJavaMigration {

    private static final int BATCH_SIZE = 2000;

    @Override
    public void migrate(Context context) throws Exception {
        Connection connection = context.getConnection();
        try (
            InputStream is = getClass().getResourceAsStream("/db/migration/data/german_noun_genders.csv");
            BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
            PreparedStatement ps = connection.prepareStatement(
                "INSERT INTO german_noun_genders (lemma, genus) VALUES (?, ?)")
        ) {
            String line;
            int pending = 0;
            while ((line = reader.readLine()) != null) {
                int comma = line.lastIndexOf(',');
                if (comma < 0) continue;
                ps.setString(1, line.substring(0, comma));
                ps.setString(2, line.substring(comma + 1));
                ps.addBatch();
                pending++;
                if (pending >= BATCH_SIZE) {
                    ps.executeBatch();
                    pending = 0;
                }
            }
            if (pending > 0) {
                ps.executeBatch();
            }
        }
    }
}
