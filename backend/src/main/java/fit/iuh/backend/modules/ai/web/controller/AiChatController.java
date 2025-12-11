package fit.iuh.backend.modules.ai.web.controller;

import fit.iuh.backend.modules.ai.application.dto.AiChatRequest;
import fit.iuh.backend.modules.ai.application.dto.AiChatResponse;
import fit.iuh.backend.modules.ai.application.service.AiChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST endpoint that exposes the AI chatbot powered by Gemini.
 */
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Assistant", description = "Conversational commerce assistant endpoints")
@Slf4j
public class AiChatController {

    private final AiChatService aiChatService;

    @PostMapping("/chat")
    @Operation(summary = "Query the Watchify AI assistant")
    public ResponseEntity<AiChatResponse> chat(@Valid @RequestBody AiChatRequest request) {
        log.info("AI chat request received");
        AiChatResponse response = aiChatService.chat(request);
        return ResponseEntity.ok(response);
    }
}
