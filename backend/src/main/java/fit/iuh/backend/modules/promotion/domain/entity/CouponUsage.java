package fit.iuh.backend.modules.promotion.domain.entity;

import fit.iuh.backend.modules.identity.domain.entity.User;
import fit.iuh.backend.modules.order.domain.entity.Order;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * CouponUsage Entity - Tracks each redemption of a coupon by users
 * 
 * Purpose:
 * - Track which users used which coupons
 * - Enforce per-user usage limits
 * - Audit trail for coupon redemptions
 * - Calculate total savings per coupon
 * 
 * @author Watchify Team
 */
@Entity
@Table(name = "coupon_usages", indexes = {
    @Index(name = "idx_coupon_usage_coupon", columnList = "coupon_id"),
    @Index(name = "idx_coupon_usage_user", columnList = "user_id"),
    @Index(name = "idx_coupon_usage_order", columnList = "order_id"),
    @Index(name = "idx_coupon_usage_used_at", columnList = "used_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponUsage {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "CHAR(36)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id", nullable = false)
    @NotNull(message = "Coupon is required")
    private Coupon coupon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "User is required")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @NotNull(message = "Order is required")
    private Order order;

    @Column(name = "discount_amount", nullable = false, precision = 15, scale = 2)
    @NotNull(message = "Discount amount is required")
    @DecimalMin(value = "0.00", message = "Discount amount cannot be negative")
    private BigDecimal discountAmount;

    @Column(name = "order_amount", nullable = false, precision = 15, scale = 2)
    @NotNull(message = "Order amount is required")
    @DecimalMin(value = "0.00", message = "Order amount cannot be negative")
    private BigDecimal orderAmount;

    @Column(name = "used_at", nullable = false)
    @Builder.Default
    private LocalDateTime usedAt = LocalDateTime.now();

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    // ==================== Lifecycle Callbacks ====================

    @PrePersist
    protected void onCreate() {
        if (this.usedAt == null) {
            this.usedAt = LocalDateTime.now();
        }
    }

    // ==================== Helper Methods ====================

    /**
     * Get coupon code (convenience method)
     */
    public String getCouponCode() {
        return coupon != null ? coupon.getCode() : null;
    }

    /**
     * Get user email (convenience method)
     */
    public String getUserEmail() {
        return user != null ? user.getEmail() : null;
    }

    /**
     * Get order ID (convenience method)
     */
    public UUID getOrderId() {
        return order != null ? order.getId() : null;
    }

    /**
     * Calculate discount percentage applied
     */
    public BigDecimal getDiscountPercentage() {
        if (orderAmount == null || orderAmount.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return discountAmount.multiply(BigDecimal.valueOf(100))
                .divide(orderAmount, 2, java.math.RoundingMode.HALF_UP);
    }

    // ==================== Equals & HashCode ====================

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CouponUsage)) return false;
        CouponUsage that = (CouponUsage) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "CouponUsage{" +
                "id=" + id +
                ", couponCode=" + getCouponCode() +
                ", userEmail=" + getUserEmail() +
                ", discountAmount=" + discountAmount +
                ", orderAmount=" + orderAmount +
                ", usedAt=" + usedAt +
                '}';
    }
}