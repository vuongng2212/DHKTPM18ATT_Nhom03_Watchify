package fit.iuh.backend.modules.ai.application.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fit.iuh.backend.modules.ai.application.dto.AiChatRequest;
import fit.iuh.backend.modules.ai.application.dto.AiChatResponse;
import fit.iuh.backend.modules.ai.config.GeminiProperties;
import fit.iuh.backend.modules.catalog.application.dto.ProductDto;
import fit.iuh.backend.modules.catalog.application.service.ProductService;
import fit.iuh.backend.sharedkernel.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Chat service that sends Watchify product data to Gemini for conversational answers.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiChatService {

    private final ProductService productService;
    private final GeminiProperties geminiProperties;
    private final ObjectMapper objectMapper;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Execute a chat completion for the provided request.
     */
    public AiChatResponse chat(AiChatRequest request) {
        validateConfiguration();

        List<ProductDto> products = productService.getAllActiveProducts();
        String catalog = buildProductCatalog(products);
        String composedPrompt = buildPrompt(request.getMessage(), catalog);

        String reply = callGemini(composedPrompt);

        return AiChatResponse.builder()
                .reply(reply)
                .model(geminiProperties.getModel())
                .productCount(products.size())
                .build();
    }

    private void validateConfiguration() {
        if (!StringUtils.hasText(geminiProperties.getApiKey())) {
            throw new BusinessException("Gemini API key is not configured", "AI_CONFIG_MISSING");
        }
    }

    private String buildPrompt(String userMessage, String catalog) {
        return """
                Customer question:
                %s

                Product catalog snapshot:
                %s

                Use the catalog to recommend watches, mention brand, key specs, and current price in VND.
                """.formatted(userMessage, catalog);
    }

    private String buildProductCatalog(List<ProductDto> products) {
        if (products.isEmpty()) {
            return "Kho sản phẩm hiện đang trống.";
        }

        return products.stream()
                .map(this::formatProductLine)
                .collect(Collectors.joining("\n"));
    }

    private String formatProductLine(ProductDto product) {
        String brandName = product.getBrand() != null ? product.getBrand().getName() : "No brand";
        String categoryName = product.getCategory() != null ? product.getCategory().getName() : "Uncategorized";
        String description = selectDescription(product);
        String price = formatPrice(product.getPrice());

        return "%s | Brand: %s | Category: %s | Price: %s | Slug: %s | Summary: %s"
                .formatted(product.getName(), brandName, categoryName, price, product.getSlug(), description);
    }

    private String selectDescription(ProductDto product) {
        String candidate = product.getShortDescription();
        if (!StringUtils.hasText(candidate)) {
            candidate = product.getDescription();
        }
        if (!StringUtils.hasText(candidate)) {
            return "Không có mô tả.";
        }
        return truncate(candidate, 180);
    }

    private String truncate(String value, int maxLength) {
        if (!StringUtils.hasText(value) || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength) + "...";
    }

    private String formatPrice(BigDecimal price) {
        if (price == null) {
            return "Liên hệ";
        }
        return "%s VND".formatted(price.stripTrailingZeros().toPlainString());
    }

    private String callGemini(String prompt) {
        Map<String, Object> body = new HashMap<>();
        Map<String, Object> userContent = Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", prompt))
        );
        body.put("contents", List.of(userContent));

        if (StringUtils.hasText(geminiProperties.getSystemPrompt())) {
            body.put("system_instruction", Map.of(
                    "parts", List.of(Map.of("text", geminiProperties.getSystemPrompt()))
            ));
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String url = buildGeminiUrl();

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    url,
                    new HttpEntity<>(body, headers),
                    String.class
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.error("Gemini API returned non-success status: {}", response.getStatusCode());
                throw new BusinessException("Gemini API call failed", "AI_UPSTREAM_ERROR");
            }

            return extractReply(response.getBody());
        } catch (RestClientException ex) {
            log.error("Failed to call Gemini API", ex);
            throw new BusinessException("Unable to reach Gemini API", "AI_UPSTREAM_ERROR", ex);
        } catch (JsonProcessingException ex) {
            log.error("Failed to parse Gemini response", ex);
            throw new BusinessException("Invalid response from Gemini API", "AI_RESPONSE_PARSE_ERROR", ex);
        }
    }

    private String buildGeminiUrl() {
        String apiUrl = geminiProperties.getApiUrl();
        if (!apiUrl.endsWith("/")) {
            apiUrl = apiUrl + "/";
        }
        return apiUrl + geminiProperties.getModel() + ":generateContent?key=" + geminiProperties.getApiKey();
    }

    private String extractReply(String responseBody) throws JsonProcessingException {
        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode candidates = root.path("candidates");

        if (candidates.isArray()) {
            for (JsonNode candidate : candidates) {
                JsonNode parts = candidate.path("content").path("parts");
                if (parts.isArray()) {
                    for (JsonNode part : parts) {
                        JsonNode textNode = part.path("text");
                        if (textNode.isTextual()) {
                            return textNode.asText();
                        }
                    }
                }
            }
        }

        throw new BusinessException("Gemini API returned an empty response", "AI_RESPONSE_EMPTY");
    }
}
