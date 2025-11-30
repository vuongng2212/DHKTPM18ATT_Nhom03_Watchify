package fit.iuh.backend.sharedkernel.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event fired when a payment fails.
 * This event triggers order cancellation and inventory release.
 */
@Getter
@AllArgsConstructor
public class PaymentFailedEvent {

    private UUID paymentId;
    private UUID orderId;
    private UUID userId;
    private BigDecimal amount;
    private String paymentMethod;
    private String failureReason;
    private String errorCode;
    private LocalDateTime failedAt;

    /**
     * Constructor for basic payment failure
     */
    public PaymentFailedEvent(UUID paymentId, UUID orderId, String failureReason) {
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.failureReason = failureReason;
        this.failedAt = LocalDateTime.now();
    }

    /**
     * Constructor with essential fields
     */
    public PaymentFailedEvent(UUID paymentId, UUID orderId, UUID userId, String failureReason) {
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.userId = userId;
        this.failureReason = failureReason;
        this.failedAt = LocalDateTime.now();
    }

    /**
     * Constructor with error details
     */
    public PaymentFailedEvent(UUID paymentId, UUID orderId, String failureReason, String errorCode) {
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.failureReason = failureReason;
        this.errorCode = errorCode;
        this.failedAt = LocalDateTime.now();
    }
}