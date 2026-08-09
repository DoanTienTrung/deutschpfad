package com.deutschpfad.backend.tutor;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/tutor-knowledge")
@PreAuthorize("hasRole('ADMIN')")
public class TutorKnowledgeAdminController {

    private final TutorKnowledgeIngestionService ingestionService;
    private final JdbcTemplate jdbcTemplate;

    public TutorKnowledgeAdminController(
            TutorKnowledgeIngestionService ingestionService,
            JdbcTemplate jdbcTemplate) {
        this.ingestionService = ingestionService;
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/grammar-notes")
    public List<TutorKnowledgeBatchAdmin> listGrammarNotes() {
        String sql = """
                SELECT metadata->>'batchId' AS batch_id,
                       MIN(metadata->>'title') AS title,
                       MIN(metadata->>'level') AS level,
                       MIN(metadata->>'topic') AS topic,
                       COUNT(*) AS chunk_count,
                       MIN(metadata->>'createdAt') AS created_at
                FROM tutor_knowledge_chunk
                WHERE metadata->>'sourceType' = 'GRAMMAR_NOTE'
                GROUP BY metadata->>'batchId'
                ORDER BY MIN(metadata->>'createdAt') DESC
                """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new TutorKnowledgeBatchAdmin(
                rs.getString("batch_id"),
                rs.getString("title"),
                rs.getString("level"),
                rs.getString("topic"),
                rs.getInt("chunk_count"),
                rs.getString("created_at")
        ));
    }

    @PostMapping("/grammar-notes")
    public TutorIngestResult createGrammarNote(@Valid @RequestBody TutorGrammarNoteRequest request) {
        return ingestionService.ingestGrammarNote(request.title(), request.content(), request.level(), request.topic());
    }

    @PostMapping("/grammar-notes/upload")
    public TutorIngestResult uploadGrammarFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "level", required = false) String level,
            @RequestParam(value = "topic", required = false) String topic) {
        return ingestionService.ingestGrammarFile(file, title, level, topic);
    }

    @DeleteMapping("/grammar-notes/{batchId}")
    public void deleteGrammarNote(@PathVariable String batchId) {
        jdbcTemplate.update(
                "DELETE FROM tutor_knowledge_chunk WHERE metadata->>'sourceType' = 'GRAMMAR_NOTE' AND metadata->>'batchId' = ?",
                batchId
        );
    }

    @PostMapping("/sync-vocabulary")
    public Map<String, Integer> syncVocabulary() {
        return Map.of("chunksCreated", ingestionService.syncVocabulary());
    }
}
