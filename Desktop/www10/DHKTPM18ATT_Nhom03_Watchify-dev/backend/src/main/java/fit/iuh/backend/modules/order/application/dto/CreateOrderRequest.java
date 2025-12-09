package fit.iuh.backend.modules.order.application.dto;

import fit.iuh.backend.modules.order.domain.entity.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * DTO for creating an order (mock cart data).
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    @NotNull(message = "Shipping address is required")
    private String shippingAddress;

    @NotNull(message = "Billing address is required")
    private String billingAddress;

    private String notes;

    // Mock cart items: list of productId and quantity
    private List<OrderItemRequest> items;
}