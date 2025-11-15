package fit.iuh.backend.sharedkernel.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Event fired when an order is created.
 */
@Getter
@AllArgsConstructor
public class OrderCreatedEvent {

    private UUID orderId;
    private UUID userId;
    private BigDecimal totalAmount;
}