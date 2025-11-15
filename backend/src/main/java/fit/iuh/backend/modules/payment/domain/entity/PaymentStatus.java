package fit.iuh.backend.modules.payment.domain.entity;

/**
 * Enum representing the status of a payment.
 */
public enum PaymentStatus {
    PENDING,    // Payment initiated, waiting for confirmation
    SUCCESS,    // Payment successful
    FAILED,     // Payment failed
    REFUNDED    // Payment refunded
}