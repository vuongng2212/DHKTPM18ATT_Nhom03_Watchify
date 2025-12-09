package fit.iuh.backend.modules.promotion.application.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import fit.iuh.backend.modules.promotion.domain.entity.Coupon;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Data Transfer Object for Coupon
 * 
 * Used for API responses and requests
 * 
 * @author Watchify Team
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CouponDto {

    private UUID id;

    private String code;

    private String description;

    private String discountType; // PERCENTAGE or FIXED_AMOUNT

    private BigDecimal discountValue;

    private BigDecimal minOrderAmount;

    private BigDecimal maxDiscountAmount;

    private Integer usageLimit;

    private Integer usedCount;

    private Integer perUserLimit;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime validFrom;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime validTo;

    private Boolean isActive;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    private String createdBy;

    // Computed fields
    private Integer remainingUsage;

    private String discountDescription;

    private String status; // VALID, EXPIRED, NOT_STARTED, EXHAUSTED, INACTIVE

    private Boolean canUse;

    /**
     * Static factory method to create from Entity
     */
    public static CouponDto fromEntity(Coupon coupon) {
        if (coupon == null) {
            return null;
        }

        return CouponDto.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .discountType(coupon.getDiscountType() != null ? coupon.getDiscountType().name() : null)
                .discountValue(coupon.getDiscountValue())
                .minOrderAmount(coupon.getMinOrderAmount())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .usageLimit(coupon.getUsageLimit())
                .usedCount(coupon.getUsedCount())
                .perUserLimit(coupon.getPerUserLimit())
                .validFrom(coupon.getValidFrom())
                .validTo(coupon.getValidTo())
                .isActive(coupon.getIsActive())
                .createdAt(coupon.getCreatedAt())
                .updatedAt(coupon.getUpdatedAt())
                .createdBy(coupon.getCreatedBy())
                .remainingUsage(coupon.getRemainingUsage())
                .discountDescription(coupon.getDiscountDescription())
                .status(determineStatus(coupon))
                .canUse(coupon.isValid())
                .build();
    }

    /**
     * Determine coupon status
     */
    private static String determineStatus(Coupon coupon) {
        if (!coupon.getIsActive()) {
            return "INACTIVE";
        }
        if (coupon.hasReachedLimit()) {
            return "EXHAUSTED";
        }
        if (coupon.isExpired()) {
            return "EXPIRED";
        }
        if (coupon.isNotStarted()) {
            return "NOT_STARTED";
        }
        if (coupon.isValid()) {
            return "VALID";
        }
        return "UNKNOWN";
    }

    /**
     * Create DTO with minimal info for public API
     */
    public static CouponDto forPublic(Coupon coupon) {
        if (coupon == null) {
            return null;
        }

        return CouponDto.builder()
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .discountDescription(coupon.getDiscountDescription())
                .minOrderAmount(coupon.getMinOrderAmount())
                .validTo(coupon.getValidTo())
                .canUse(coupon.isValid())
                .build();
    }
}