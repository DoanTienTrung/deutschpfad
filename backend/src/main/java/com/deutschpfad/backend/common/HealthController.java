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
