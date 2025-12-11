package fit.iuh.backend.modules.ai.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * AI assistant behaviour tuning.
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "ai.chat")
public class AiChatProperties {

    /**
     * System instruction provided to Gemini.
     */
    private String systemPrompt =
            "You are Watchify's AI assistant. Answer in Vietnamese, be concise, and cite product names, prices, and slugs when recommending items.";

    /**
     * Max number of products to send in the context window.
     */
    private int catalogLimit = 20;
}
