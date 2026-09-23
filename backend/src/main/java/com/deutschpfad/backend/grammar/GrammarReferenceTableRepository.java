package com.deutschpfad.backend.grammar;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GrammarReferenceTableRepository extends JpaRepository<GrammarReferenceTable, Long> {
    List<GrammarReferenceTable> findAllByOrderByCategoryAscOrderIndexAsc();

    boolean existsBySlug(String slug);
}
