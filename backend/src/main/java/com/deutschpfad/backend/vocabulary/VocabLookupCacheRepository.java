package com.deutschpfad.backend.vocabulary;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VocabLookupCacheRepository extends JpaRepository<VocabLookupCache, Long> {
    Optional<VocabLookupCache> findByWord(String word);
}
