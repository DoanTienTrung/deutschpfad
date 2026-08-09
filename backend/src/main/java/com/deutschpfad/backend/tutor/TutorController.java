package com.deutschpfad.backend.tutor;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tutor")
public class TutorController {

    private final TutorAiService tutorAiService;

    public TutorController(TutorAiService tutorAiService) {
        this.tutorAiService = tutorAiService;
    }

    @PostMapping("/ask")
    public TutorAnswerResponse ask(@Valid @RequestBody TutorAskRequest request) {
        String answer = tutorAiService.ask(request.question(), request.history());
        return new TutorAnswerResponse(answer);
    }
}
