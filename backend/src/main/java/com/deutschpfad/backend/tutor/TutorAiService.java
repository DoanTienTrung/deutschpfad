package com.deutschpfad.backend.tutor;

import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.memory.ChatMemory;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.rag.content.retriever.ContentRetriever;
import dev.langchain4j.service.AiServices;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class TutorAiService {

    private final ChatModel fallbackChatModel;
    private final ContentRetriever contentRetriever;
    private final TutorTools tutorTools;

    public TutorAiService(ChatModel fallbackChatModel, ContentRetriever contentRetriever, TutorTools tutorTools) {
        this.fallbackChatModel = fallbackChatModel;
        this.contentRetriever = contentRetriever;
        this.tutorTools = tutorTools;
    }

    public String ask(String question, List<TutorHistoryTurn> history) {
        ChatMemory memory = MessageWindowChatMemory.builder()
                .id(UUID.randomUUID())
                .maxMessages(20)
                .build();

        for (TutorHistoryTurn turn : history) {
            if ("user".equals(turn.role())) {
                memory.add(new UserMessage(turn.text()));
            } else {
                memory.add(new AiMessage(turn.text()));
            }
        }

        TutorAssistant assistant = AiServices.builder(TutorAssistant.class)
                .chatModel(fallbackChatModel)
                .contentRetriever(contentRetriever)
                .tools(tutorTools)
                .chatMemory(memory)
                .build();

        return assistant.chat(question);
    }
}
