package fit.iuh.backend.modules.ai.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request body for the AI chatbot endpoint.
 */
@Data
public class AiChatRequest {

    /**
     * Message provided by the end user.
     */
    @NotBlank(message = "Message must not be empty")
    private String message;
}
