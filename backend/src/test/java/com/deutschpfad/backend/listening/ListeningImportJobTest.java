package com.deutschpfad.backend.listening;

import com.deutschpfad.backend.TestcontainersConfiguration;
import com.deutschpfad.backend.vocabulary.VocabularyItem;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
class ListeningImportJobTest {

    @Autowired private ListeningImportJob job;
    @Autowired private ListeningImportService importService;
    @Autowired private ListeningExerciseRepository exerciseRepository;
    @Autowired private ListeningSentenceRepository sentenceRepository;
    @Autowired private ListeningController listeningController;
    @MockitoBean private YtDlpService ytDlpService;
    @MockitoBean private GroqAiService aiService;

    private static final List<TranscriptParser.SentenceData> TRANSCRIPT = List.of(
        new TranscriptParser.SentenceData("Hallo, ich bin Nico.", 0, 2),
        new TranscriptParser.SentenceData("Ich komme aus Spanien.", 2, 5),
        new TranscriptParser.SentenceData("Wo ist der Bahnhof?", 5, 8)
    );

    @Test
    void nhapVideo_layPhuDe_dichXong_thiReady_coKenhVaThoiLuong_hienChoNguoiHoc() {
        String videoId = videoId();
        String channelId = "UC" + UUID.randomUUID().toString().replace("-", "").substring(0, 22);
        when(ytDlpService.fetchVideoMeta(videoId)).thenReturn(new YtDlpService.VideoMeta(channelId, "Kênh kiểm thử", "@kiemthu", 125, "x"));
        when(ytDlpService.fetchAutoTranscript(videoId)).thenReturn(TRANSCRIPT);
        translateAll();

        Long id = enqueue(videoId);
        assertThat(libraryIds()).as("chưa dịch xong thì người học chưa thấy").doesNotContain(id);

        assertThat(job.runNow()).isTrue();

        ListeningExercise exercise = exerciseRepository.findById(id).orElseThrow();
        assertThat(exercise.getStatus()).isEqualTo(ListeningExercise.Status.READY);
        assertThat(exercise.getChannel().getName()).isEqualTo("Kênh kiểm thử");
        assertThat(exercise.getSourceLabel()).isEqualTo("Kênh kiểm thử");
        assertThat(exercise.getDurationSeconds()).isEqualTo(125);
        assertThat(sentenceRepository.findByExerciseIdOrderByOrderIndex(id))
            .extracting(ListeningSentence::getTranslation)
            .containsExactly("VI: Hallo, ich bin Nico.", "VI: Ich komme aus Spanien.", "VI: Wo ist der Bahnhof?");

        ListeningController.YoutubeLibraryResponse library = listeningController.youtubeLibrary();
        assertThat(library.exercises()).anySatisfy(e -> {
            assertThat(e.id()).isEqualTo(id);
            assertThat(e.channelName()).isEqualTo("Kênh kiểm thử");
            assertThat(e.sentenceCount()).isEqualTo(3);
        });
        assertThat(library.channels()).anySatisfy(c -> {
            assertThat(c.name()).isEqualTo("Kênh kiểm thử");
            assertThat(c.videoCount()).isEqualTo(1);
        });
    }

    @Test
    void groqHetQuota_thiDungLuot_baiGiuTranslating_luotSauDichTiep() {
        String videoId = videoId();
        when(ytDlpService.fetchVideoMeta(videoId)).thenReturn(new YtDlpService.VideoMeta(null, null, null, 60, "x"));
        when(ytDlpService.fetchAutoTranscript(videoId)).thenReturn(TRANSCRIPT);
        when(aiService.translateSentencesPlainPrimaryOnly(anyList())).thenAnswer(inv -> nulls(inv.getArgument(0)));
        Long id = enqueue(videoId);

        job.runNow();

        assertThat(exerciseRepository.findById(id).orElseThrow().getStatus()).isEqualTo(ListeningExercise.Status.TRANSLATING);
        assertThat(sentenceRepository.countUntranslated(id)).isEqualTo(3);
        assertThat(job.status().get("stopReason")).asString().contains("dừng");

        translateAll();
        job.runNow();

        assertThat(exerciseRepository.findById(id).orElseThrow().getStatus()).isEqualTo(ListeningExercise.Status.READY);
        assertThat(sentenceRepository.countUntranslated(id)).isZero();
    }

    @Test
    void groqQuaTaiMotLan_thuLaiLoDoVaDichTiep_khongDungLuot() {
        String videoId = videoId();
        when(ytDlpService.fetchVideoMeta(videoId)).thenReturn(new YtDlpService.VideoMeta(null, null, null, 60, "x"));
        when(ytDlpService.fetchAutoTranscript(videoId)).thenReturn(TRANSCRIPT);
        AtomicInteger calls = new AtomicInteger();
        when(aiService.translateSentencesPlainPrimaryOnly(anyList())).thenAnswer(inv -> {
            List<String> in = inv.getArgument(0);
            return calls.getAndIncrement() == 0 ? nulls(in) : in.stream().map(s -> "VI: " + s).toList();
        });
        Long id = enqueue(videoId);

        job.runNow();

        assertThat(exerciseRepository.findById(id).orElseThrow().getStatus()).isEqualTo(ListeningExercise.Status.READY);
        assertThat(job.status().get("stopReason")).isNull();
    }

    @Test
    void docDuocMetadataMaKhongCoPhuDe_vanThuLai_quaBaLanMoiFailed() {
        // YouTube chặn bot / thiếu PO token thì vẫn đọc được tiêu đề, kênh nhưng phụ đề trống: không được
        // kết luận ngay là video không có phụ đề.
        String videoId = videoId();
        when(ytDlpService.fetchVideoMeta(videoId)).thenReturn(new YtDlpService.VideoMeta(null, null, null, 60, "x"));
        when(ytDlpService.fetchAutoTranscript(videoId)).thenReturn(List.of());
        Long id = enqueue(videoId);

        job.runNow();
        assertThat(exerciseRepository.findById(id).orElseThrow().getStatus()).isEqualTo(ListeningExercise.Status.PENDING);

        job.runNow();
        job.runNow();
        ListeningExercise exercise = exerciseRepository.findById(id).orElseThrow();
        assertThat(exercise.getStatus()).isEqualTo(ListeningExercise.Status.FAILED);
        assertThat(exercise.getImportError()).contains("Không lấy được phụ đề");
    }

    @Test
    void ytDlpKhongDocDuoc_thuLaiCacLuotSau_quaBaLanMoiFailed() {
        String videoId = videoId();
        when(ytDlpService.fetchVideoMeta(anyString())).thenReturn(null);
        when(ytDlpService.fetchAutoTranscript(anyString())).thenReturn(List.of());
        Long id = enqueue(videoId);

        job.runNow();
        ListeningExercise afterFirst = exerciseRepository.findById(id).orElseThrow();
        assertThat(afterFirst.getStatus()).isEqualTo(ListeningExercise.Status.PENDING);
        assertThat(afterFirst.getImportAttempts()).isEqualTo(1);

        job.runNow();
        job.runNow();
        assertThat(exerciseRepository.findById(id).orElseThrow().getStatus()).isEqualTo(ListeningExercise.Status.FAILED);
    }

    @Test
    void motCauGroqThuHaiLanVanBoTrong_vanReady_vaGhiChu() {
        String videoId = videoId();
        when(ytDlpService.fetchVideoMeta(videoId)).thenReturn(new YtDlpService.VideoMeta(null, null, null, 60, "x"));
        when(ytDlpService.fetchAutoTranscript(videoId)).thenReturn(TRANSCRIPT);
        when(aiService.translateSentencesPlainPrimaryOnly(anyList())).thenAnswer(inv -> {
            List<String> in = inv.getArgument(0);
            return in.stream().map(s -> s.startsWith("Wo ist") ? null : "VI: " + s).toList();
        });
        Long id = enqueue(videoId);

        job.runNow();

        ListeningExercise exercise = exerciseRepository.findById(id).orElseThrow();
        assertThat(exercise.getStatus()).isEqualTo(ListeningExercise.Status.READY);
        assertThat(exercise.getImportError()).isEqualTo("1 câu chưa dịch được");
    }

    @Test
    void videoDaCo_khongNhapLanHai() {
        String videoId = videoId();
        List<ListeningImportService.NewVideo> videos = List.of(new ListeningImportService.NewVideo(videoId, "Video", 90));

        assertThat(importService.enqueue(videos, null, VocabularyItem.Level.B1, VocabularyItem.Level.B1)).isEqualTo(1);
        assertThat(importService.enqueue(videos, null, VocabularyItem.Level.B1, VocabularyItem.Level.B1)).isZero();
    }

    @Test
    void parsePlaylistLines_boQuaCanhBao_thoiLuongNA_tieuDeCoTab() {
        String output = """
            WARNING: [youtube] Some warning about formats
            dQw4w9WgXcQ\t212.0\tNever Gonna Give You Up
            abcdefghijk\tNA\tLive\tmit Tab
            kurz\t10\tkhông phải id
            """;

        List<YtDlpService.PlaylistEntry> entries = YtDlpService.parsePlaylistLines(output);

        assertThat(entries).containsExactly(
            new YtDlpService.PlaylistEntry("dQw4w9WgXcQ", 212, "Never Gonna Give You Up"),
            new YtDlpService.PlaylistEntry("abcdefghijk", null, "Live\tmit Tab"));
    }

    @Test
    void parseVideoMeta_layDongDauCoMaKenh() {
        String output = "WARNING: x\nUCbxb2fqe9oNgglAoYqsYOtQ\tDW Deutsch lernen\t@dwlearngerman\t185.0\tNicos Weg\n";

        assertThat(YtDlpService.parseVideoMeta(output)).isEqualTo(
            new YtDlpService.VideoMeta("UCbxb2fqe9oNgglAoYqsYOtQ", "DW Deutsch lernen", "@dwlearngerman", 185, "Nicos Weg"));
        assertThat(YtDlpService.parseVideoMeta("ERROR: Video unavailable")).isNull();
    }

    // ------------------------------------------------------------------------------------------

    private Long enqueue(String videoId) {
        importService.enqueue(List.of(new ListeningImportService.NewVideo(videoId, "Video " + videoId, null)),
            null, VocabularyItem.Level.A1, VocabularyItem.Level.A2);
        return exerciseRepository.findByStatusOrderByIdAsc(ListeningExercise.Status.PENDING).stream()
            .filter(e -> videoId.equals(e.getYoutubeVideoId()))
            .findFirst().orElseThrow().getId();
    }

    private void translateAll() {
        when(aiService.translateSentencesPlainPrimaryOnly(anyList())).thenAnswer(inv -> {
            List<String> in = inv.getArgument(0);
            return in.stream().map(s -> "VI: " + s).toList();
        });
    }

    private List<Long> libraryIds() {
        return listeningController.youtubeLibrary().exercises().stream().map(ListeningExerciseSummaryResponse::id).toList();
    }

    private static List<String> nulls(List<String> in) {
        List<String> out = new ArrayList<>();
        in.forEach(s -> out.add(null));
        return out;
    }

    /** Mã 11 ký tự ngẫu nhiên: DB dùng chung giữa các lớp test, không được trùng video đã có. */
    private static String videoId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 11);
    }
}
