package com.deutschpfad.backend.listening;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class TranscriptParserTest {

    @Test
    void vtt_usesCueOwnEndTime_notNextCueStart() {
        // Regression test: a gap (silence/pause) between cue 1's end (13.0) and cue 2's start
        // (21.0) used to stretch cue 1 all the way to 21 — bleeding audibly into cue 2's own
        // opening word once played back. It must stop at its own end time instead.
        String vtt = """
            WEBVTT

            00:00:10.000 --> 00:00:13.000
            Guten Morgen, Frau Schneider.

            00:00:21.000 --> 00:00:24.000
            Guten Tag, Frau Kamp.
            """;

        List<TranscriptParser.SentenceData> result = TranscriptParser.parse(vtt);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).startSeconds()).isEqualTo(10);
        assertThat(result.get(0).endSeconds()).isEqualTo(13);
        assertThat(result.get(1).startSeconds()).isEqualTo(21);
        assertThat(result.get(1).endSeconds()).isEqualTo(24);
    }

    @Test
    void vtt_cuesOwnEndTime_isCappedAtNextCueStart_whenTheyOverlap() {
        // If a cue's own end time somehow runs past where the next cue already starts (rolling
        // auto-captions do this), never let it bleed into the next cue's start.
        String vtt = """
            WEBVTT

            00:00:10.000 --> 00:00:16.000
            Erste Zeile.

            00:00:14.000 --> 00:00:18.000
            Zweite Zeile.
            """;

        List<TranscriptParser.SentenceData> result = TranscriptParser.parse(vtt);

        assertThat(result.get(0).endSeconds()).isEqualTo(14);
    }

    @Test
    void pastedTranscript_withoutEndTimes_stillFallsBackToNextLineStart() {
        String pasted = """
            0:10
            Guten Morgen, Frau Schneider.
            0:21
            Guten Tag, Frau Kamp.
            """;

        List<TranscriptParser.SentenceData> result = TranscriptParser.parse(pasted);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).startSeconds()).isEqualTo(10);
        assertThat(result.get(0).endSeconds()).isEqualTo(21);
        assertThat(result.get(1).startSeconds()).isEqualTo(21);
        assertThat(result.get(1).endSeconds()).isEqualTo(26);
    }
}
