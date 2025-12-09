package fit.iuh.backend.modules.order.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO for OrderItem response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDto {

    private UUID id;

    private UUID productId;

    private String productName;

    private Integer quantity;

    private BigDecimal unitPrice;

    private BigDecimal totalPrice;
}