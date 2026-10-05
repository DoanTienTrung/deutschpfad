package com.deutschpfad.backend.translation;

import com.deutschpfad.backend.TestcontainersConfiguration;
import com.deutschpfad.backend.auth.User;
import com.deutschpfad.backend.auth.UserRepository;
import com.deutschpfad.backend.listening.GroqAiService;
import com.deutschpfad.backend.vocabulary.VocabularyItem;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
class TranslationServiceTest {

    @Autowired private TranslationService service;
    @Autowired private TranslationSetRepository setRepository;
    @Autowired private TranslationItemRepository itemRepository;
    @Autowired private TranslationAttemptRepository attemptRepository;
    @Autowired private UserRepository userRepository;
    @MockitoBean private GroqAiService aiService;

    private static final String AI_ALMOST = """
        {"verdict":"ALMOST","corrected":"Gestern habe ich Reis gekocht.","errors":[{"wrong":"hat","right":"habe","explain":"ich đi với habe."}],"note":"Gần đúng."}""";

    @Test
    void duLieuSeed_37ChuDiemA1A2_moiChuDiem10Cau_coCongThuc() {
        List<TranslationService.SetSummary> a1 = service.listSets(user(User.Role.USER), TranslationSet.Type.GRAMMAR, VocabularyItem.Level.A1);
        List<TranslationService.SetSummary> a2 = service.listSets(user(User.Role.USER), TranslationSet.Type.GRAMMAR, VocabularyItem.Level.A2);

        assertThat(a1).filteredOn(s -> s.grammarSlug() != null).hasSize(20);
        assertThat(a2).filteredOn(s -> s.grammarSlug() != null).hasSize(17);
        assertThat(a1).filteredOn(s -> s.grammarSlug() != null).allSatisfy(s -> assertThat(s.itemCount()).isEqualTo(10));
        TranslationService.SetSummary perfekt = a1.stream().filter(s -> "a1-perfekt".equals(s.grammarSlug())).findFirst().orElseThrow();
        assertThat(perfekt.subtitle()).isEqualTo("Perfekt");
        assertThat(service.getSet(user(User.Role.USER), perfekt.id()).structureNote()).contains("Partizip II");
        assertThat(service.publishedSetIdForGrammar("a1-perfekt")).isEqualTo(perfekt.id());
    }

    @Test
    void khopCauMauHoacCachKhac_chamTaiCho_khongGoiAI() {
        User user = user(User.Role.USER);
        TranslationItem item = perfektItem("Gestern habe ich Reis gekocht.");

        TranslationService.CheckResponse exact = check(user, item, "Gestern habe ich Reis gekocht.");
        TranslationService.CheckResponse alt = check(user, item, "ich habe gestern reis gekocht");

        assertThat(exact.verdict()).isEqualTo(TranslationAttempt.Verdict.CORRECT);
        assertThat(exact.judgedBy()).isEqualTo(TranslationAttempt.JudgedBy.LOCAL);
        assertThat(alt.verdict()).as("cách dịch khác, chỉ sai viết hoa").isEqualTo(TranslationAttempt.Verdict.ALMOST);
        verify(aiService, never()).completeValidated(anyString(), any());
    }

    @Test
    void khacCauMau_AIcham_lanSauCungCauTraLoi_dungCache() {
        when(aiService.completeValidated(anyString(), any())).thenReturn(AI_ALMOST);
        TranslationItem item = perfektItem("Gestern habe ich Reis gekocht.");
        String answer = "Gestern hat ich Reis gekocht " + UUID.randomUUID().toString().substring(0, 4);

        TranslationService.CheckResponse first = check(user(User.Role.USER), item, answer);
        TranslationService.CheckResponse second = check(user(User.Role.USER), item, answer + ".");

        assertThat(first.judgedBy()).isEqualTo(TranslationAttempt.JudgedBy.AI);
        assertThat(first.verdict()).isEqualTo(TranslationAttempt.Verdict.ALMOST);
        assertThat(first.errors()).singleElement().satisfies(e -> assertThat(e.right()).isEqualTo("habe"));
        assertThat(second.judgedBy()).as("chỉ khác dấu chấm cuối câu: cùng khoá cache").isEqualTo(TranslationAttempt.JudgedBy.CACHE);
        assertThat(second.corrected()).isEqualTo("Gestern habe ich Reis gekocht.");
        verify(aiService, times(1)).completeValidated(anyString(), any());
    }

    @Test
    void AIloi_thiChuaCham_khongLuuCache() {
        when(aiService.completeValidated(anyString(), any())).thenReturn(null);
        TranslationItem item = perfektItem("Gestern habe ich Reis gekocht.");

        TranslationService.CheckResponse r = check(user(User.Role.USER), item, "Ich koche Reis " + UUID.randomUUID());

        assertThat(r.verdict()).isEqualTo(TranslationAttempt.Verdict.UNGRADED);
        assertThat(r.judgedBy()).isEqualTo(TranslationAttempt.JudgedBy.NONE);
        assertThat(r.reference()).isEqualTo("Gestern habe ich Reis gekocht.");
        assertThat(r.note()).contains("Chưa chấm được");
    }

    @Test
    void hetLuotAITrongNgay_thiTuSoVoiCauMau() {
        User user = user(User.Role.USER);
        TranslationItem item = perfektItem("Gestern habe ich Reis gekocht.");
        for (int i = 0; i < 100; i++) {
            TranslationAttempt a = new TranslationAttempt();
            a.setUserId(user.getId());
            a.setItemId(item.getId());
            a.setAnswer("x");
            a.setMode(TranslationAttempt.Mode.TYPING);
            a.setVerdict(TranslationAttempt.Verdict.WRONG);
            a.setJudgedBy(TranslationAttempt.JudgedBy.AI);
            attemptRepository.save(a);
        }

        TranslationService.CheckResponse r = check(user, item, "Ganz andere Antwort " + UUID.randomUUID());

        assertThat(r.verdict()).isEqualTo(TranslationAttempt.Verdict.UNGRADED);
        assertThat(r.note()).contains("hết 100 lượt");
        verify(aiService, never()).completeValidated(anyString(), any());
    }

    @Test
    void xemDapAn_ghiLaiVaHienLanLamGanNhat_tienDoChiTinhCauDung() {
        User user = user(User.Role.USER);
        TranslationItem item = perfektItem("Gestern habe ich Reis gekocht.");
        Long setId = item.getSet().getId();

        TranslationService.CheckResponse revealed = service.check(user, item.getId(),
            new TranslationService.CheckRequest(null, TranslationAttempt.Mode.REVEAL));
        assertThat(revealed.verdict()).isEqualTo(TranslationAttempt.Verdict.REVEALED);
        assertThat(lastVerdict(user, setId, item)).isEqualTo(TranslationAttempt.Verdict.REVEALED);
        assertThat(passed(user, setId)).isZero();

        check(user, item, "Gestern habe ich Reis gekocht.");
        assertThat(lastVerdict(user, setId, item)).isEqualTo(TranslationAttempt.Verdict.CORRECT);
        assertThat(passed(user, setId)).isEqualTo(1);
    }

    @Test
    void baiNhap_chiAdminXemDuoc() {
        TranslationSet draft = new TranslationSet();
        draft.setType(TranslationSet.Type.GRAMMAR);
        draft.setLevel(VocabularyItem.Level.B1);
        draft.setTitle("Nháp kiểm thử");
        draft = setRepository.save(draft);
        Long id = draft.getId();

        assertThatThrownBy(() -> service.getSet(user(User.Role.USER), id)).isInstanceOf(IllegalArgumentException.class);
        assertThat(service.getSet(user(User.Role.ADMIN), id).title()).isEqualTo("Nháp kiểm thử");
        assertThat(service.listSets(user(User.Role.USER), TranslationSet.Type.GRAMMAR, VocabularyItem.Level.B1))
            .extracting(TranslationService.SetSummary::id).doesNotContain(id);
    }

    // ------------------------------------------------------------------------------------------

    private TranslationService.CheckResponse check(User user, TranslationItem item, String answer) {
        return service.check(user, item.getId(), new TranslationService.CheckRequest(answer, TranslationAttempt.Mode.TYPING));
    }

    private TranslationItem perfektItem(String reference) {
        Long setId = service.publishedSetIdForGrammar("a1-perfekt");
        return itemRepository.findBySetIdOrderByOrderIndexAscIdAsc(setId).stream()
            .filter(i -> i.getDeReference().equals(reference)).findFirst().orElseThrow();
    }

    private TranslationAttempt.Verdict lastVerdict(User user, Long setId, TranslationItem item) {
        return service.getSet(user, setId).items().stream().filter(i -> i.id().equals(item.getId()))
            .findFirst().orElseThrow().lastVerdict();
    }

    private int passed(User user, Long setId) {
        return service.listSets(user, TranslationSet.Type.GRAMMAR, VocabularyItem.Level.A1).stream()
            .filter(s -> s.id().equals(setId)).findFirst().orElseThrow().passedCount();
    }

    private User user(User.Role role) {
        User user = new User();
        user.setEmail("tr-" + UUID.randomUUID() + "@example.com");
        user.setPasswordHash("khong-dung-toi");
        user.setFullName("Người Test");
        user.setEmailVerified(true);
        user.setRole(role);
        return userRepository.save(user);
    }
}
