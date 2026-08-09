package com.deutschpfad.backend.tutor;

public record TutorKnowledgeBatchAdmin(
        String batchId,
        String title,
        String level,
        String topic,
        int chunkCount,
        String createdAt
) {}
