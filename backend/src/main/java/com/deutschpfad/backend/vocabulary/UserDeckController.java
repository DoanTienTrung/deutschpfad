package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.auth.User;
import com.deutschpfad.backend.auth.UserRepository;
import com.deutschpfad.backend.listening.GroqAiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/decks")
public class UserDeckController {

    private final UserDeckRepository deckRepository;
    private final UserDeckItemRepository itemRepository;
    private final UserRepository userRepository;
    private final GroqAiService aiService;
    private final VocabLookupCacheRepository lookupCacheRepository;
    private final GermanNounGenderService genderService;

    public UserDeckController(
        UserDeckRepository deckRepository,
        UserDeckItemRepository itemRepository,
        UserRepository userRepository,
        GroqAiService aiService,
        VocabLookupCacheRepository lookupCacheRepository,
        GermanNounGenderService genderService
    ) {
        this.deckRepository = deckRepository;
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
        this.aiService = aiService;
        this.lookupCacheRepository = lookupCacheRepository;
        this.genderService = genderService;
    }

    @PostMapping("/lookup")
    public ResponseEntity<VocabLookupResult> lookup(
        @Valid @RequestBody VocabLookupRequest request,
        Authentication authentication
    ) {
        currentUser(authentication);
        String normalizedWord = request.germanWord().trim().toLowerCase();
        String wordTypeHint = request.wordType() == null ? "" : request.wordType().trim();

        var cached = lookupCacheRepository.findByWordAndWordTypeHint(normalizedWord, wordTypeHint);
        if (cached.isPresent()) {
            return ResponseEntity.ok(cached.get().toResult());
        }

        VocabLookupResult result = aiService.lookupNewWord(request.germanWord(), wordTypeHint.isEmpty() ? null : wordTypeHint);
        if (result == null) {
            return ResponseEntity.unprocessableEntity().build();
        }
        result = genderService.correctArticle(result);
        lookupCacheRepository.save(VocabLookupCache.from(normalizedWord, wordTypeHint, result));
        return ResponseEntity.ok(result);
    }

    @GetMapping
    public List<DeckResponse> list(Authentication authentication) {
        User user = currentUser(authentication);
        return deckRepository.findByUser(user).stream()
            .map(deck -> DeckResponse.from(deck, itemRepository.findByDeckId(deck.getId()).size()))
            .toList();
    }

    @PostMapping
    public ResponseEntity<DeckResponse> create(@Valid @RequestBody DeckRequest request, Authentication authentication) {
        UserDeck deck = new UserDeck();
        deck.setUser(currentUser(authentication));
        deck.setName(request.name());
        deck.setDescription(request.description());
        deckRepository.save(deck);
        return ResponseEntity.ok(DeckResponse.from(deck, 0));
    }

    @PutMapping("/{deckId}")
    public ResponseEntity<DeckResponse> update(
        @PathVariable Long deckId,
        @Valid @RequestBody DeckRequest request,
        Authentication authentication
    ) {
        UserDeck deck = getOwnedDeck(deckId, currentUser(authentication));
        deck.setName(request.name());
        deck.setDescription(request.description());
        deckRepository.save(deck);
        return ResponseEntity.ok(DeckResponse.from(deck, itemRepository.findByDeckId(deck.getId()).size()));
    }

    @DeleteMapping("/{deckId}")
    public ResponseEntity<Void> delete(@PathVariable Long deckId, Authentication authentication) {
        UserDeck deck = getOwnedDeck(deckId, currentUser(authentication));
        deckRepository.delete(deck);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{deckId}/items")
    public List<DeckItemResponse> listItems(@PathVariable Long deckId, Authentication authentication) {
        getOwnedDeck(deckId, currentUser(authentication));
        return itemRepository.findByDeckId(deckId).stream()
            .map(DeckItemResponse::from)
            .toList();
    }

    @PostMapping("/{deckId}/items")
    public ResponseEntity<DeckItemResponse> addItem(
        @PathVariable Long deckId,
        @Valid @RequestBody DeckItemRequest request,
        Authentication authentication
    ) {
        UserDeck deck = getOwnedDeck(deckId, currentUser(authentication));
        UserDeckItem item = new UserDeckItem();
        item.setDeck(deck);
        item.setGermanWord(request.germanWord());
        item.setVietnameseMeaning(request.vietnameseMeaning());
        item.setWordType(request.wordType());
        item.setExampleSentence(request.exampleSentence());
        item.setPhonetic(request.phonetic());
        item.setEnglishMeaning(request.englishMeaning());
        item.setSynonyms(request.synonyms());
        item.setAntonyms(request.antonyms());
        itemRepository.save(item);
        return ResponseEntity.ok(DeckItemResponse.from(item));
    }

    @PutMapping("/{deckId}/items/{itemId}")
    public ResponseEntity<DeckItemResponse> updateItem(
        @PathVariable Long deckId,
        @PathVariable Long itemId,
        @Valid @RequestBody DeckItemRequest request,
        Authentication authentication
    ) {
        UserDeck deck = getOwnedDeck(deckId, currentUser(authentication));
        UserDeckItem item = itemRepository.findById(itemId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy từ trong bộ từ"));
        if (!item.getDeck().getId().equals(deck.getId())) {
            throw new IllegalArgumentException("Không tìm thấy từ trong bộ từ");
        }
        item.setGermanWord(request.germanWord());
        item.setVietnameseMeaning(request.vietnameseMeaning());
        item.setWordType(request.wordType());
        item.setExampleSentence(request.exampleSentence());
        item.setPhonetic(request.phonetic());
        item.setEnglishMeaning(request.englishMeaning());
        item.setSynonyms(request.synonyms());
        item.setAntonyms(request.antonyms());
        itemRepository.save(item);
        return ResponseEntity.ok(DeckItemResponse.from(item));
    }

    @DeleteMapping("/{deckId}/items/{itemId}")
    public ResponseEntity<Void> deleteItem(
        @PathVariable Long deckId,
        @PathVariable Long itemId,
        Authentication authentication
    ) {
        UserDeck deck = getOwnedDeck(deckId, currentUser(authentication));
        UserDeckItem item = itemRepository.findById(itemId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy từ trong bộ từ"));
        if (!item.getDeck().getId().equals(deck.getId())) {
            throw new IllegalArgumentException("Không tìm thấy từ trong bộ từ");
        }
        itemRepository.delete(item);
        return ResponseEntity.noContent().build();
    }

    private UserDeck getOwnedDeck(Long deckId, User user) {
        UserDeck deck = deckRepository.findById(deckId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bộ từ"));
        if (!deck.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Bạn không có quyền truy cập bộ từ này");
        }
        return deck;
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user"));
    }
}
