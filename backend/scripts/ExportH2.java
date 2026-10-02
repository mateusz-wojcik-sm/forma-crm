// One-time, read-only migration bridge. The NestJS server does not use Java.
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.DriverManager;

class ExportH2 {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:h2:file:" + Path.of(args[0]).toAbsolutePath().toString().replace('\\', '/')
            + ";IFEXISTS=TRUE;ACCESS_MODE_DATA=r";
        try (var connection = DriverManager.getConnection(url, "sa", "forma-local");
             var statement = connection.createStatement()) {
            String records;
            try (var result = statement.executeQuery("""
                SELECT JSON_ARRAYAGG(JSON_OBJECT(
                  'id': ID, 'type': TYPE, 'name': NAME, 'company': COMPANY,
                  'email': EMAIL, 'status': STATUS, 'amount': AMOUNT,
                  'date': CAST(DATE AS VARCHAR), 'owner': OWNER,
                  'quantity': QUANTITY, 'notes': NOTES NULL ON NULL
                ) ORDER BY ID) FROM BUSINESS_RECORD
                """)) {
                result.next();
                records = result.getString(1);
            }
            long nextId;
            try (var result = statement.executeQuery("""
                SELECT IDENTITY_BASE FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = 'PUBLIC' AND TABLE_NAME = 'BUSINESS_RECORD' AND COLUMN_NAME = 'ID'
                """)) {
                if (!result.next()) throw new IllegalStateException("H2 identity column not found");
                nextId = result.getLong(1);
            }
            Files.writeString(Path.of(args[1]), "{\"nextId\":" + nextId + ",\"records\":"
                + (records == null ? "[]" : records) + "}", StandardCharsets.UTF_8);
        }
    }
}
