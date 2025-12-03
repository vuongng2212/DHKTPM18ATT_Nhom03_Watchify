package fit.iuh.backend.sharedkernel.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event fired when a payment is completed successfully.
 * This event triggers order confirmation and inventory deduction.
 */
@Getter
@AllArgsConstructor
public class PaymentCompletedEvent {

    private UUID paymentId;
    private UUID orderId;
    private UUID userId;
    private BigDecimal amount;
    private String paymentMethod;
    private String transactionId;
    private LocalDateTime completedAt;

    /**
     * Constructor for basic payment completion
     */
    public PaymentCompletedEvent(UUID paymentId, UUID orderId) {
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.completedAt = LocalDateTime.now();
    }

    /**
     * Constructor with essential fields
     */
    public PaymentCompletedEvent(UUID paymentId, UUID orderId, UUID userId, BigDecimal amount) {
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.userId = userId;
        this.amount = amount;
        this.completedAt = LocalDateTime.now();
    }
}