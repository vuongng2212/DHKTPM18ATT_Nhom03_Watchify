package fit.iuh.backend.modules.order.application.dto;

import fit.iuh.backend.modules.order.domain.entity.OrderStatus;
import fit.iuh.backend.modules.order.domain.entity.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO for Order response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {

    private UUID id;

    private UUID userId;

    private BigDecimal totalAmount;

    private OrderStatus status;

    private PaymentMethod paymentMethod;

    private String shippingAddress;

    private String billingAddress;

    private String notes;

    private LocalDateTime orderDate;

    private List<OrderItemDto> items;
}