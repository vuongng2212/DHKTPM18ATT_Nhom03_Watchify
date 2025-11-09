package fit.iuh.backend.modules.order.domain.entity;

/**
 * Enum representing the status of an order.
 */
public enum OrderStatus {
    PENDING,      // Order created, waiting for payment
    CONFIRMED,    // Payment successful, order confirmed
    PROCESSING,   // Order being prepared
    SHIPPED,      // Order shipped
    DELIVERED,    // Order delivered
    CANCELLED     // Order cancelled
}