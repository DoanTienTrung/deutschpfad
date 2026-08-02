ALTER TABLE vocab_lookup_cache DROP CONSTRAINT vocab_lookup_cache_word_key;
ALTER TABLE vocab_lookup_cache ADD COLUMN word_type_hint VARCHAR(50) NOT NULL DEFAULT '';
ALTER TABLE vocab_lookup_cache ADD CONSTRAINT vocab_lookup_cache_word_word_type_hint_key UNIQUE (word, word_type_hint);
