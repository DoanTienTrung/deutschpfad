package com.deutschpfad.backend.vocabulary;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GermanNounGenderRepository extends JpaRepository<GermanNounGender, String> {
    Optional<GermanNounGender> findByLemma(String lemma);
}
