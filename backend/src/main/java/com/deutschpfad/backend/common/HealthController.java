package com.deutschpfad.backend.common;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.Map;

@RestController
public class HealthController {

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Kiểm tra sống KHÔNG chạm database, cho dịch vụ ping giữ máy thức (Render free tắt service sau
     * 15 phút không có request) và health check của Render. Không dùng /api/health ở đây: mỗi lần
     * ping mở một kết nối DB là Neon không bao giờ được ngủ, tiêu hết giờ compute miễn phí.
     */
    @GetMapping("/api/ping")
    public Map<String, String> ping() {
        return Map.of("status", "OK");
    }

    @GetMapping("/api/health")
    public Map<String, String> health() {
        try (Connection connection = dataSource.getConnection()) {
            boolean valid = connection.isValid(2);
            return Map.of(
                "status", "OK",
                "database", valid ? "CONNECTED" : "UNAVAILABLE"
            );
        } catch (Exception e) {
            return Map.of(
                "status", "OK",
                "database", "ERROR: " + e.getMessage()
            );
        }
    }
}
