package fit.iuh.backend.modules.promotion.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Coupon Entity - Represents discount coupons/vouchers
 * 
 * Business Rules:
 * - Code must be unique and uppercase
 * - Discount can be PERCENTAGE or FIXED_AMOUNT
 * - Valid date range must be checked
 * - Usage limit prevents over-redemption
 * - Minimum order amount ensures profitability
 * 
 * @author Watchify Team
 */
@Entity
@Table(name = "coupons", indexes = {
    @Index(name = "idx_coupon_code", columnList = "code"),
    @Index(name = "idx_coupon_valid_dates", columnList = "valid_from, valid_to"),
    @Index(name = "idx_coupon_active", columnList = "is_active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "CHAR(36)")
    private UUID id;

    @Column(name = "code", unique = true, nullable = false, length = 50)
    @NotBlank(message = "Coupon code is required")
    @Pattern(regexp = "^[A-Z0-9_-]+$", message = "Coupon code must contain only uppercase letters, numbers, underscores, and hyphens")
    @Size(min = 3, max = 50, message = "Coupon code must be between 3 and 50 characters")
    private String code;

    @Column(name = "description", length = 500)
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 20)
    @NotNull(message = "Discount type is required")
    private DiscountType discountType;

    @Column(name = "discount_value", nullable = false, precision = 15, scale = 2)
    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.01", message = "Discount value must be greater than 0")
    private BigDecimal discountValue;

    @Column(name = "min_order_amount", precision = 15, scale = 2)
    @DecimalMin(value = "0.00", message = "Minimum order amount cannot be negative")
    private BigDecimal minOrderAmount;

    @Column(name = "max_discount_amount", precision = 15, scale = 2)
    @DecimalMin(value = "0.00", message = "Maximum discount amount cannot be negative")
    private BigDecimal maxDiscountAmount;

    @Column(name = "usage_limit")
    @Min(value = 1, message = "Usage limit must be at least 1")
    private Integer usageLimit;

    @Column(name = "used_count", nullable = false)
    @Min(value = 0, message = "Used count cannot be negative")
    @Builder.Default
    private Integer usedCount = 0;

    @Column(name = "per_user_limit")
    @Min(value = 1, message = "Per user limit must be at least 1")
    private Integer perUserLimit;

    @Column(name = "valid_from", nullable = false)
    @NotNull(message = "Valid from date is required")
    private LocalDateTime validFrom;

    @Column(name = "valid_to", nullable = false)
    @NotNull(message = "Valid to date is required")
    private LocalDateTime validTo;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    // ==================== Enums ====================

    public enum DiscountType {
        PERCENTAGE,      // e.g., 10% off
        FIXED_AMOUNT     // e.g., $10 off
    }

    // ==================== Business Logic Methods ====================

    /**
     * Check if coupon is currently valid
     */
    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        return isActive 
            && !now.isBefore(validFrom) 
            && !now.isAfter(validTo)
            && (usageLimit == null || usedCount < usageLimit);
    }

    /**
     * Check if coupon can be applied to an order amount
     */
    public boolean canApplyToOrder(BigDecimal orderAmount) {
        if (!isValid()) {
            return false;
        }
        
        if (minOrderAmount != null && orderAmount.compareTo(minOrderAmount) < 0) {
            return false;
        }
        
        return true;
    }

    /**
     * Calculate discount amount for given order total
     */
    public BigDecimal calculateDiscount(BigDecimal orderAmount) {
        if (!canApplyToOrder(orderAmount)) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount;

        if (discountType == DiscountType.PERCENTAGE) {
            // Calculate percentage discount
            discount = orderAmount.multiply(discountValue).divide(BigDecimal.valueOf(100));
        } else {
            // Fixed amount discount
            discount = discountValue;
        }

        // Apply maximum discount cap if exists
        if (maxDiscountAmount != null && discount.compareTo(maxDiscountAmount) > 0) {
            discount = maxDiscountAmount;
        }

        // Discount cannot exceed order amount
        if (discount.compareTo(orderAmount) > 0) {
            discount = orderAmount;
        }

        return discount;
    }

    /**
     * Increment usage count (called when coupon is applied)
     */
    public void incrementUsageCount() {
        this.usedCount++;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Decrement usage count (called when order is cancelled)
     */
    public void decrementUsageCount() {
        if (this.usedCount > 0) {
            this.usedCount--;
            this.updatedAt = LocalDateTime.now();
        }
    }

    /**
     * Check if coupon has reached usage limit
     */
    public boolean hasReachedLimit() {
        return usageLimit != null && usedCount >= usageLimit;
    }

    /**
     * Get remaining usage count
     */
    public Integer getRemainingUsage() {
        if (usageLimit == null) {
            return null; // Unlimited
        }
        return Math.max(0, usageLimit - usedCount);
    }

    /**
     * Check if coupon is expired
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(validTo);
    }

    /**
     * Check if coupon has not started yet
     */
    public boolean isNotStarted() {
        return LocalDateTime.now().isBefore(validFrom);
    }

    /**
     * Get human-readable discount description
     */
    public String getDiscountDescription() {
        if (discountType == DiscountType.PERCENTAGE) {
            return discountValue + "% OFF";
        } else {
            return "$" + discountValue + " OFF";
        }
    }

    // ==================== Lifecycle Callbacks ====================

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.usedCount == null) {
            this.usedCount = 0;
        }
        if (this.isActive == null) {
            this.isActive = true;
        }
        // Normalize code to uppercase
        if (this.code != null) {
            this.code = this.code.trim().toUpperCase();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ==================== Equals & HashCode ====================

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Coupon)) return false;
        Coupon coupon = (Coupon) o;
        return id != null && id.equals(coupon.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Coupon{" +
                "id=" + id +
                ", code='" + code + '\'' +
                ", discountType=" + discountType +
                ", discountValue=" + discountValue +
                ", isActive=" + isActive +
                ", validFrom=" + validFrom +
                ", validTo=" + validTo +
                '}';
    }
}