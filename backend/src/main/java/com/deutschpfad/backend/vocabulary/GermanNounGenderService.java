package com.deutschpfad.backend.vocabulary;

import org.springframework.stereotype.Service;

/**
 * Cross-checks an AI vocab lookup's article against the {@link GermanNounGenderRepository}
 * reference table and corrects it on mismatch. Separate failure mode from the word-type-hint
 * fix in {@code UserDeckController}: the AI can correctly identify a word as a Nomen and still
 * remember the wrong one of der/die/das for it (eg. "das Tisch" instead of "der Tisch") --
 * German noun gender is mostly memorized rather than rule-derived, so no amount of prompt
 * wording reliably fixes it. Words missing from the ~90k-entry reference table are left as the
 * AI returned them.
 */
@Service
public class GermanNounGenderService {

    private final GermanNounGenderRepository repository;

    public GermanNounGenderService(GermanNounGenderRepository repository) {
        this.repository = repository;
    }

    public VocabLookupResult correctArticle(VocabLookupResult result) {
        if (result == null || result.wordType() == null || result.germanWord() == null) {
            return result;
        }
        if (!result.wordType().equalsIgnoreCase("Nomen")) {
            return result;
        }

        String[] parts = result.germanWord().trim().split("\\s+", 2);
        if (parts.length != 2) return result;

        String article = parts[0].toLowerCase();
        String noun = parts[1];
        if (!article.equals("der") && !article.equals("die") && !article.equals("das")) {
            return result;
        }

        return repository.findByLemma(noun.toLowerCase())
            .map(entry -> {
                String correctArticle = switch (entry.getGenus()) {
                    case "m" -> "der";
                    case "f" -> "die";
                    case "n" -> "das";
                    default -> article;
                };
                if (correctArticle.equals(article)) return result;
                return new VocabLookupResult(
                    correctArticle + " " + noun,
                    result.wordType(),
                    result.vietnameseMeaning(),
                    result.englishMeaning(),
                    result.phonetic(),
                    result.exampleSentence(),
                    result.synonyms(),
                    result.antonyms()
                );
            })
            .orElse(result);
    }
}
