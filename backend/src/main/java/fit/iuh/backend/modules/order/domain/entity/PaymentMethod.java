package fit.iuh.backend.modules.order.domain.entity;

/**
 * Enum representing payment methods.
 */
public enum PaymentMethod {
    CASH_ON_DELIVERY,  // Thanh toán khi nhận hàng
    CREDIT_CARD,       // Thẻ tín dụng
    BANK_TRANSFER,     // Chuyển khoản ngân hàng
    E_WALLET           // Ví điện tử
}