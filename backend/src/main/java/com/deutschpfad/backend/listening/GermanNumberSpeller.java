package com.deutschpfad.backend.listening;

/**
 * Spells out a cardinal number as German words (e.g. 114 -> "einhundertvierzehn"). Used to
 * normalize digit-written numbers in a transcript before handing the sentence to espeak-ng —
 * digits on their own are not reliably pronounceable by a rule-based phonemizer.
 */
final class GermanNumberSpeller {

    private static final String[] ONES = {
        "", "ein", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun"
    };
    private static final String[] ONES_STANDALONE = {
        "null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun"
    };
    private static final String[] TEENS = {
        "zehn", "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn"
    };
    private static final String[] TENS = {
        "", "", "zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig"
    };

    private GermanNumberSpeller() {
    }

    static String spellCardinal(long n) {
        if (n == 0) return "null";
        if (n < 0) return "minus " + spellCardinal(-n);

        // Hyphens are inserted at every morpheme boundary (not just written like the standard
        // closed-up spelling) because espeak-ng's German voice mis-derives a few consonants
        // across a compound-word boundary when there's no separator -- most notably it renders
        // "vier"/"vierzig" with a voiced [v] instead of the correct [f] whenever it's glued onto
        // a preceding "-hundert"/"-tausend"/"und-", e.g. "einhundertvierzehn" -> wrong [v], but
        // "einhundert-vierzehn" -> correct [f]. Verified directly against espeak-ng's --ipa
        // output for both the standalone and glued forms before adding this workaround.
        StringBuilder sb = new StringBuilder();
        if (n >= 1000) {
            long thousands = n / 1000;
            sb.append(thousands == 1 ? "ein" : spellCardinal(thousands)).append("tausend");
            n %= 1000;
            if (n > 0) sb.append("-");
        }
        if (n >= 100) {
            long hundreds = n / 100;
            sb.append(hundreds == 1 ? "ein" : ONES_STANDALONE[(int) hundreds]).append("hundert");
            n %= 100;
            if (n > 0) sb.append("-");
        }
        if (n == 0) return sb.toString();

        if (n < 10) {
            sb.append(sb.length() == 0 ? ONES_STANDALONE[(int) n] : ONES[(int) n]);
        } else if (n < 20) {
            sb.append(TEENS[(int) (n - 10)]);
        } else {
            long tens = n / 10;
            long ones = n % 10;
            if (ones > 0) sb.append(ones == 1 ? "ein" : ONES[(int) ones]).append("und-");
            sb.append(TENS[(int) tens]);
        }
        return sb.toString();
    }
}
