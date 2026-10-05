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
    void phuDeTuDongDangCuon_khongLapCau_ghepTuThanhCauTheoDauCau() {
        // Trích từ phụ đề tự động thật (Easy German): mỗi cue lặp dòng trước + một dòng mới có mốc từng
        // từ, xen giữa là cue 10ms. Đọc theo cue như phụ đề thường thì mỗi câu ra hai lần.
        String vtt = """
            WEBVTT
            Kind: captions
            Language: de

            00:00:00.599 --> 00:00:04.910 align:start position:0%
            \s
            Hallo<00:00:01.199><c> Leute,</c><00:00:02.440><c> wir</c><00:00:02.879><c> stehen</c><00:00:03.439><c> gerade</c><00:00:04.080><c> vor</c><00:00:04.400><c> einem</c>

            00:00:04.910 --> 00:00:04.920 align:start position:0%
            Hallo Leute, wir stehen gerade vor einem
            \s

            00:00:04.920 --> 00:00:09.750 align:start position:0%
            Hallo Leute, wir stehen gerade vor einem
            Supermarkt<00:00:05.960><c> und</c><00:00:06.440><c> Janusch</c><00:00:07.399><c> kauft</c><00:00:08.120><c> jetzt</c><00:00:08.760><c> ein.</c>

            00:00:09.750 --> 00:00:09.760 align:start position:0%
            Supermarkt und Janusch kauft jetzt ein.
            \s

            00:00:09.760 --> 00:00:14.270 align:start position:0%
            Supermarkt und Janusch kauft jetzt ein.
            Janusch,<00:00:10.559><c> was</c><00:00:11.120><c> wirst</c><00:00:11.440><c> du</c><00:00:11.840><c> einkaufen?</c><00:00:12.900><c> [Musik]</c>
            """;

        List<TranscriptParser.SentenceData> result = TranscriptParser.parse(vtt);

        assertThat(result).extracting(TranscriptParser.SentenceData::text).containsExactly(
            "Hallo Leute, wir stehen gerade vor einem Supermarkt und Janusch kauft jetzt ein.",
            "Janusch, was wirst du einkaufen?");
        assertThat(result.get(0).startSeconds()).isEqualTo(1);
        assertThat(result.get(0).endSeconds()).isEqualTo(10);
        assertThat(result.get(1).startSeconds()).isEqualTo(10);
        assertThat(result.get(1).endSeconds()).as("từ cuối kéo dài tối đa 2 giây").isEqualTo(14);
        assertThat(TranscriptParser.lacksPunctuation(result)).isFalse();
    }

    @Test
    void phuDeKhongDauCau_thiCatTheoSoTu_vaBiDanhDau() {
        // Mỗi cue cách nhau một phút (người nói ngừng lâu) nên mỗi cue thành một câu, không câu nào có dấu.
        StringBuilder vtt = new StringBuilder("WEBVTT\n\n");
        for (int minute = 0; minute < 12; minute++) {
            String m = String.format("00:%02d:", minute);
            vtt.append(m).append("00.000 --> ").append(m).append("03.900\n")
                .append("wort<").append(m).append("00.500><c> und</c><").append(m).append("01.000><c> noch</c><")
                .append(m).append("02.000><c> eins</c>\n\n");
        }

        List<TranscriptParser.SentenceData> result = TranscriptParser.parse(vtt.toString());

        assertThat(result).hasSizeGreaterThanOrEqualTo(5)
            .allSatisfy(s -> assertThat(s.text().split(" ")).hasSizeLessThanOrEqualTo(30));
        assertThat(TranscriptParser.lacksPunctuation(result)).isTrue();
    }

    @Test
    void phuDeGoTay_khongBiCoiLaThieuDauCau() {
        List<TranscriptParser.SentenceData> manual = List.of(
            new TranscriptParser.SentenceData("Hallo, ich bin Nico.", 0, 2),
            new TranscriptParser.SentenceData("Ich komme aus", 2, 3),
            new TranscriptParser.SentenceData("Spanien.", 3, 4),
            new TranscriptParser.SentenceData("Und du?", 4, 5),
            new TranscriptParser.SentenceData("Ich heiße Emma.", 5, 6));

        assertThat(TranscriptParser.lacksPunctuation(manual)).isFalse();
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
