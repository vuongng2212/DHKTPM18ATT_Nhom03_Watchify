package fit.iuh.backend.modules.promotion.application.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for coupon validation
 * 
 * Returns validation result and discount calculation details
 * 
 * @author Watchify Team
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ValidateCouponResponse {

    private Boolean valid;

    private String message;

    // Coupon details
    private UUID couponId;

    private String code;

    private String description;

    private String discountType; // PERCENTAGE or FIXED_AMOUNT

    private BigDecimal discountValue;

    // Calculation details
    private BigDecimal orderAmount;

    private BigDecimal discountAmount;

    private BigDecimal finalAmount;

    private BigDecimal minOrderAmount;

    private BigDecimal maxDiscountAmount;

    // Usage information
    private Integer remainingUsage;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime validTo;

    // Validation errors
    private String errorCode;

    private String errorMessage;

    /**
     * Create success response
     */
    public static ValidateCouponResponse success(
            UUID couponId,
            String code,
            String description,
            String discountType,
            BigDecimal discountValue,
            BigDecimal orderAmount,
            BigDecimal discountAmount,
            BigDecimal finalAmount,
            BigDecimal minOrderAmount,
            BigDecimal maxDiscountAmount,
            Integer remainingUsage,
            LocalDateTime validTo) {
        
        return ValidateCouponResponse.builder()
                .valid(true)
                .message("Coupon is valid and applied successfully")
                .couponId(couponId)
                .code(code)
                .description(description)
                .discountType(discountType)
                .discountValue(discountValue)
                .orderAmount(orderAmount)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .minOrderAmount(minOrderAmount)
                .maxDiscountAmount(maxDiscountAmount)
                .remainingUsage(remainingUsage)
                .validTo(validTo)
                .build();
    }

    /**
     * Create error response
     */
    public static ValidateCouponResponse error(String errorCode, String errorMessage) {
        return ValidateCouponResponse.builder()
                .valid(false)
                .message("Coupon validation failed")
                .errorCode(errorCode)
                .errorMessage(errorMessage)
                .build();
    }

    /**
     * Common error responses
     */
    public static ValidateCouponResponse couponNotFound() {
        return error("COUPON_NOT_FOUND", "Coupon code does not exist");
    }

    public static ValidateCouponResponse couponExpired() {
        return error("COUPON_EXPIRED", "This coupon has expired");
    }

    public static ValidateCouponResponse couponNotStarted() {
        return error("COUPON_NOT_STARTED", "This coupon is not yet active");
    }

    public static ValidateCouponResponse couponInactive() {
        return error("COUPON_INACTIVE", "This coupon is no longer active");
    }

    public static ValidateCouponResponse couponExhausted() {
        return error("COUPON_EXHAUSTED", "This coupon has reached its usage limit");
    }

    public static ValidateCouponResponse orderBelowMinimum(BigDecimal minAmount) {
        return error("ORDER_BELOW_MINIMUM", 
                String.format("Order amount must be at least $%.2f to use this coupon", minAmount));
    }

    public static ValidateCouponResponse userLimitReached() {
        return error("USER_LIMIT_REACHED", "You have already used this coupon the maximum number of times");
    }

    public static ValidateCouponResponse invalidCoupon() {
        return error("INVALID_COUPON", "This coupon cannot be applied to your order");
    }

    /**
     * Get discount percentage (for display)
     */
    public BigDecimal getDiscountPercentage() {
        if (orderAmount == null || orderAmount.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        if (discountAmount == null) {
            return BigDecimal.ZERO;
        }
        return discountAmount.multiply(BigDecimal.valueOf(100))
                .divide(orderAmount, 2, java.math.RoundingMode.HALF_UP);
    }

    /**
     * Get savings amount (same as discountAmount, for clarity)
     */
    public BigDecimal getSavings() {
        return discountAmount != null ? discountAmount : BigDecimal.ZERO;
    }
}