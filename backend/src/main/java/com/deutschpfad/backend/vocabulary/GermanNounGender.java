package com.deutschpfad.backend.vocabulary;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

// ~90k-entry gender reference table (lemma -> genus m/f/n), loaded once from a bundled CSV by the
// V41 Flyway Java migration. Source: WiktionaryDE via gambolputty/german-nouns (CC-BY-SA 4.0).
@Entity
@Table(name = "german_noun_genders")
@Getter
@Setter
public class GermanNounGender {

    @Id
    private String lemma;

    @Column(nullable = false, length = 1)
    private String genus;
}
