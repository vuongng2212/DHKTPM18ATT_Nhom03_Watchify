package fit.iuh.backend.modules.ai.application.service;

import fit.iuh.backend.modules.ai.application.dto.AiChatRequest;
import fit.iuh.backend.modules.ai.application.dto.AiChatResponse;
import fit.iuh.backend.modules.ai.config.AiChatProperties;
import fit.iuh.backend.modules.catalog.application.dto.ProductDto;
import fit.iuh.backend.modules.catalog.application.service.ProductService;
import fit.iuh.backend.sharedkernel.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.ChatResponse;
import org.springframework.ai.chat.Generation;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.googleai.GoogleAiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * AI chat orchestration powered by Spring AI and Google Gemini.
 */
@Service
@Slf4j
public class AiChatService {

    private final ProductService productService;
    private final GoogleAiChatModel chatModel;
    private final AiChatProperties aiChatProperties;
    private final String modelName;

    public AiChatService(
            ProductService productService,
            GoogleAiChatModel chatModel,
            AiChatProperties aiChatProperties,
            @Value("${spring.ai.googleai.chat.options.model:gemini-1.5-flash-latest}") String modelName
    ) {
        this.productService = productService;
        this.chatModel = chatModel;
        this.aiChatProperties = aiChatProperties;
        this.modelName = modelName;
    }

    public AiChatResponse chat(AiChatRequest request) {
        List<ProductDto> products = productService.getAllActiveProducts();
        String catalogSnapshot = renderCatalog(products);

        Prompt prompt = new Prompt(
                new SystemMessage(aiChatProperties.getSystemPrompt()),
                new UserMessage(buildUserPayload(request.getMessage(), catalogSnapshot))
        );

        ChatResponse response;
        try {
            response = chatModel.call(prompt);
        } catch (Exception ex) {
            log.error("Gemini call failed", ex);
            throw new BusinessException("Unable to call Gemini through Spring AI", "AI_SPRING_ERROR", ex);
        }

        Generation generation = response.getResult();
        if (generation == null || generation.getOutput() == null) {
            throw new BusinessException("Gemini did not return a completion", "AI_EMPTY_RESPONSE");
        }

        String reply = generation.getOutput().getContent();
        return AiChatResponse.builder()
                .reply(reply)
                .model(modelName)
                .productCount(products.size())
                .build();
    }

    private String buildUserPayload(String message, String catalogSnapshot) {
        return """
                Khách hàng hỏi: %s

                Danh mục sản phẩm (tối đa %d items):
                %s
                """.formatted(message, aiChatProperties.getCatalogLimit(), catalogSnapshot);
    }

    private String renderCatalog(List<ProductDto> products) {
        if (CollectionUtils.isEmpty(products)) {
            return "Hiện chưa có sản phẩm nào trong kho.";
        }

        return products.stream()
                .limit(aiChatProperties.getCatalogLimit())
                .map(this::formatProduct)
                .collect(Collectors.joining("\n"));
    }

    private String formatProduct(ProductDto product) {
        String brand = product.getBrand() != null ? product.getBrand().getName() : "Không rõ thương hiệu";
        String category = product.getCategory() != null ? product.getCategory().getName() : "Không rõ danh mục";
        String price = formatPrice(product.getPrice());
        String description = chooseDescription(product);

        return "%s | Brand: %s | Category: %s | Price: %s | Slug: %s | Mô tả: %s"
                .formatted(product.getName(), brand, category, price, product.getSlug(), description);
    }

    private String chooseDescription(ProductDto product) {
        if (product.getShortDescription() != null && !product.getShortDescription().isBlank()) {
            return truncate(product.getShortDescription(), 180);
        }
        if (product.getDescription() != null && !product.getDescription().isBlank()) {
            return truncate(product.getDescription(), 180);
        }
        return "Chưa có mô tả.";
    }

    private String truncate(String input, int maxLength) {
        if (input.length() <= maxLength) {
            return input;
        }
        return input.substring(0, maxLength) + "...";
    }

    private String formatPrice(BigDecimal price) {
        if (price == null) {
            return "Liên hệ";
        }
        return "%s VND".formatted(price.stripTrailingZeros().toPlainString());
    }
}
