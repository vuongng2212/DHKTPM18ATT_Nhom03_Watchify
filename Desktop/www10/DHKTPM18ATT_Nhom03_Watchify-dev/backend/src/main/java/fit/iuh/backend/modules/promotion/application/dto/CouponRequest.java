package fit.iuh.backend.modules.promotion.application.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import fit.iuh.backend.modules.promotion.domain.entity.Coupon;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Request DTO for creating and updating coupons
 * 
 * Contains validation rules for coupon creation
 * 
 * @author Watchify Team
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponRequest {

    @NotBlank(message = "Coupon code is required")
    @Pattern(regexp = "^[A-Z0-9_-]+$", message = "Coupon code must contain only uppercase letters, numbers, underscores, and hyphens")
    @Size(min = 3, max = 50, message = "Coupon code must be between 3 and 50 characters")
    private String code;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotNull(message = "Discount type is required")
    private String discountType; // PERCENTAGE or FIXED_AMOUNT

    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.01", message = "Discount value must be greater than 0")
    @DecimalMax(value = "100.00", message = "Percentage discount cannot exceed 100%")
    private BigDecimal discountValue;

    @DecimalMin(value = "0.00", message = "Minimum order amount cannot be negative")
    private BigDecimal minOrderAmount;

    @DecimalMin(value = "0.00", message = "Maximum discount amount cannot be negative")
    private BigDecimal maxDiscountAmount;

    @Min(value = 1, message = "Usage limit must be at least 1")
    private Integer usageLimit;

    @Min(value = 1, message = "Per user limit must be at least 1")
    private Integer perUserLimit;

    @NotNull(message = "Valid from date is required")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime validFrom;

    @NotNull(message = "Valid to date is required")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime validTo;

    private Boolean isActive = true;

    /**
     * Convert DTO to Entity
     */
    public Coupon toEntity() {
        return Coupon.builder()
                .code(this.code != null ? this.code.trim().toUpperCase() : null)
                .description(this.description)
                .discountType(Coupon.DiscountType.valueOf(this.discountType.toUpperCase()))
                .discountValue(this.discountValue)
                .minOrderAmount(this.minOrderAmount)
                .maxDiscountAmount(this.maxDiscountAmount)
                .usageLimit(this.usageLimit)
                .perUserLimit(this.perUserLimit)
                .usedCount(0)
                .validFrom(this.validFrom)
                .validTo(this.validTo)
                .isActive(this.isActive != null ? this.isActive : true)
                .build();
    }

    /**
     * Update existing entity with request data
     */
    public void updateEntity(Coupon coupon) {
        if (this.code != null) {
            coupon.setCode(this.code.trim().toUpperCase());
        }
        if (this.description != null) {
            coupon.setDescription(this.description);
        }
        if (this.discountType != null) {
            coupon.setDiscountType(Coupon.DiscountType.valueOf(this.discountType.toUpperCase()));
        }
        if (this.discountValue != null) {
            coupon.setDiscountValue(this.discountValue);
        }
        if (this.minOrderAmount != null) {
            coupon.setMinOrderAmount(this.minOrderAmount);
        }
        if (this.maxDiscountAmount != null) {
            coupon.setMaxDiscountAmount(this.maxDiscountAmount);
        }
        if (this.usageLimit != null) {
            coupon.setUsageLimit(this.usageLimit);
        }
        if (this.perUserLimit != null) {
            coupon.setPerUserLimit(this.perUserLimit);
        }
        if (this.validFrom != null) {
            coupon.setValidFrom(this.validFrom);
        }
        if (this.validTo != null) {
            coupon.setValidTo(this.validTo);
        }
        if (this.isActive != null) {
            coupon.setIsActive(this.isActive);
        }
    }

    /**
     * Validate business rules
     */
    public void validate() {
        // Validate date range
        if (validFrom != null && validTo != null && validFrom.isAfter(validTo)) {
            throw new IllegalArgumentException("Valid from date must be before valid to date");
        }

        // Validate discount type and value
        if ("PERCENTAGE".equalsIgnoreCase(discountType)) {
            if (discountValue.compareTo(BigDecimal.ZERO) <= 0 || discountValue.compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new IllegalArgumentException("Percentage discount must be between 0 and 100");
            }
        } else if ("FIXED_AMOUNT".equalsIgnoreCase(discountType)) {
            if (discountValue.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Fixed discount amount must be greater than 0");
            }
        } else {
            throw new IllegalArgumentException("Discount type must be PERCENTAGE or FIXED_AMOUNT");
        }

        // Validate max discount for percentage type
        if ("PERCENTAGE".equalsIgnoreCase(discountType) && maxDiscountAmount == null) {
            throw new IllegalArgumentException("Maximum discount amount is required for percentage discounts");
        }

        // Validate min order amount
        if (minOrderAmount != null && minOrderAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Minimum order amount cannot be negative");
        }
    }
}