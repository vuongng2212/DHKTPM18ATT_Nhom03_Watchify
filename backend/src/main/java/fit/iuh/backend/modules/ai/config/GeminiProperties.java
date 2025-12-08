package fit.iuh.backend.modules.ai.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration holder for Gemini API integration.
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "gemini")
public class GeminiProperties {
    /**
     * Server API key. Use the GEMINI_API_KEY environment variable in production.
     */
    private String apiKey;

    /**
     * Target model, e.g. gemini-1.5-flash.
     */
    private String model = "gemini-1.5-flash";

    /**
     * Base URL for Gemini REST API.
     */
    private String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models";

    /**
     * Default instruction that steers the chatbot behaviour.
     */
    private String systemPrompt =
            "You are Watchify's AI shopping assistant. Answer concisely, use Vietnamese when responding, and only " +
            "recommend products that exist in the provided catalog.";
}
