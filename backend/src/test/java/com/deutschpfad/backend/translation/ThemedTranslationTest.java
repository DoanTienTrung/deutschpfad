package com.deutschpfad.backend.translation;

import com.deutschpfad.backend.TestcontainersConfiguration;
import com.deutschpfad.backend.auth.User;
import com.deutschpfad.backend.auth.UserRepository;
import com.deutschpfad.backend.listening.GroqAiService;
import com.deutschpfad.backend.vocabulary.VocabularyItem;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Luyện dịch theo chủ đề (V81): collocation có chế độ điền từ, đoạn văn và essay chấm có ngữ cảnh. */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
class ThemedTranslationTest {

    @Autowired private TranslationService service;
    @Autowired private TranslationAdminService adminService;
    @Autowired private TranslationItemRepository itemRepository;
    @Autowired private UserRepository userRepository;
    @MockitoBean private GroqAiService aiService;

    @Test
    void duLieuSeed_duBaDang_collocationNaoCungCoTuKhoetTrongCau() {
        User user = user();
        assertThat(sets(user, TranslationSet.Type.COLLOCATION, "A2", "B1", "B2")).hasSize(6);
        assertThat(sets(user, TranslationSet.Type.PARAGRAPH, "A2", "B1", "B2")).hasSize(6);
        assertThat(sets(user, TranslationSet.Type.ESSAY, "B2", "C1")).hasSize(4);

        for (TranslationService.SetSummary s : sets(user, TranslationSet.Type.COLLOCATION, "A2", "B1", "B2")) {
            assertThat(service.getSet(user, s.id()).items()).allSatisfy(i -> {
                assertThat(i.gap()).isNotBlank();
                assertThat(i.deReference()).contains(i.gap());
                assertThat(i.focus()).isNotBlank();
            });
        }
        TranslationService.SetSummary essay = sets(user, TranslationSet.Type.ESSAY, "B2").get(0);
        assertThat(service.getSet(user, essay.id()).items()).extracting(TranslationService.ItemView::partLabel)
            .startsWith("Einleitung").endsWith("Schluss");
    }

    @Test
    void dienTu_chamTaiCho_saiHoaThuongLaGanDung() {
        User user = user();
        TranslationItem item = collocationItem("eine Entscheidung treffen");

        assertThat(cloze(user, item, "getroffen").verdict()).isEqualTo(TranslationAttempt.Verdict.CORRECT);
        assertThat(cloze(user, item, "Getroffen").verdict()).isEqualTo(TranslationAttempt.Verdict.ALMOST);
        TranslationService.CheckResponse wrong = cloze(user, item, "gemacht");
        assertThat(wrong.verdict()).isEqualTo(TranslationAttempt.Verdict.WRONG);
        assertThat(wrong.judgedBy()).isEqualTo(TranslationAttempt.JudgedBy.LOCAL);
        assertThat(wrong.errors()).singleElement().satisfies(e -> assertThat(e.right()).isEqualTo("getroffen"));
    }

    @Test
    void dichCauTrongDoanVan_AIDuocGuiCacCauTruoc() {
        when(aiService.completeValidated(anyString(), any())).thenReturn("""
            {"verdict":"CORRECT","corrected":"x","errors":[],"note":"Tốt."}""");
        User user = user();
        TranslationService.SetSummary paragraph = sets(user, TranslationSet.Type.PARAGRAPH, "A2").get(0);
        List<TranslationService.ItemView> items = service.getSet(user, paragraph.id()).items();

        service.check(user, items.get(2).id(), new TranslationService.CheckRequest(
            "Ich fahre um halb acht mit dem Bus in die Arbeit " + UUID.randomUUID(), TranslationAttempt.Mode.TYPING));

        ArgumentCaptor<String> prompt = ArgumentCaptor.forClass(String.class);
        verify(aiService).completeValidated(prompt.capture(), any());
        assertThat(prompt.getValue()).contains(items.get(0).deReference()).contains(items.get(1).deReference())
            .doesNotContain(items.get(3).deReference());
    }

    @Test
    void adminAISoanBaiTheoChuDe_docDuFocusTuKhoetVaPhan() {
        when(aiService.completeValidated(anyString(), any())).thenReturn("""
            CÔNG THỨC: Cụm từ khi đi chợ
            1. Tôi trả tiền mặt. ||| Ich zahle bar. ||| - ||| bar zahlen ||| bar zahlen ||| zahle ||| -
            2. Tôi xếp hàng. ||| Ich stehe Schlange. ||| - ||| die Schlange ||| Schlange stehen ||| sitze ||| -
            """);

        TranslationAdminService.SetData set = adminService.generateThemed(
            TranslationSet.Type.COLLOCATION, VocabularyItem.Level.A2, "Einkaufen " + UUID.randomUUID(), 2);

        assertThat(set.status()).isEqualTo(TranslationSet.Status.DRAFT);
        assertThat(set.structureNote()).isEqualTo("Cụm từ khi đi chợ");
        assertThat(set.items()).hasSize(2);
        assertThat(set.items().get(0).focus()).isEqualTo("bar zahlen");
        assertThat(set.items().get(0).gap()).isEqualTo("zahle");
        assertThat(set.items().get(1).gap()).as("từ khoét không có trong câu thì bỏ").isNull();
    }

    // ------------------------------------------------------------------------------------------

    private List<TranslationService.SetSummary> sets(User user, TranslationSet.Type type, String... levels) {
        return java.util.Arrays.stream(levels)
            .flatMap(l -> service.listSets(user, type, VocabularyItem.Level.valueOf(l)).stream())
            .toList();
    }

    private TranslationItem collocationItem(String focus) {
        return itemRepository.findAll().stream().filter(i -> focus.equals(i.getFocus())).findFirst().orElseThrow();
    }

    private TranslationService.CheckResponse cloze(User user, TranslationItem item, String answer) {
        return service.check(user, item.getId(), new TranslationService.CheckRequest(answer, TranslationAttempt.Mode.CLOZE));
    }

    private User user() {
        User user = new User();
        user.setEmail("tt-" + UUID.randomUUID() + "@example.com");
        user.setPasswordHash("khong-dung-toi");
        user.setFullName("Người học");
        user.setEmailVerified(true);
        return userRepository.save(user);
    }
}
