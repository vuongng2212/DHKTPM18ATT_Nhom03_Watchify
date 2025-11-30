package fit.iuh.backend.modules.promotion.application.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;

/**
 * DTO for Coupon Usage Statistics
 * 
 * Used for analytics and reporting
 * 
 * @author Watchify Team
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CouponUsageStatsDto {

    private String couponCode;

    private Long totalUsages;

    private Long uniqueUsers;

    private BigDecimal totalDiscountGiven;

    private Integer remainingUsage;

    private Integer usageLimit;

    private BigDecimal averageDiscountPerUse;

    private Double usageRate; // Percentage of usage vs limit

    /**
     * Calculate usage rate percentage
     */
    public Double calculateUsageRate() {
        if (usageLimit == null || usageLimit == 0) {
            return null; // Unlimited
        }
        if (totalUsages == null) {
            return 0.0;
        }
        return (totalUsages.doubleValue() / usageLimit.doubleValue()) * 100.0;
    }

    /**
     * Calculate average discount per use
     */
    public BigDecimal calculateAverageDiscount() {
        if (totalUsages == null || totalUsages == 0) {
            return BigDecimal.ZERO;
        }
        if (totalDiscountGiven == null) {
            return BigDecimal.ZERO;
        }
        return totalDiscountGiven.divide(
            BigDecimal.valueOf(totalUsages), 
            2, 
            java.math.RoundingMode.HALF_UP
        );
    }

    /**
     * Check if coupon is exhausted
     */
    public Boolean isExhausted() {
        if (usageLimit == null) {
            return false; // Unlimited
        }
        if (totalUsages == null) {
            return false;
        }
        return totalUsages >= usageLimit;
    }

    /**
     * Get remaining usage count
     */
    public Integer calculateRemainingUsage() {
        if (usageLimit == null) {
            return null; // Unlimited
        }
        if (totalUsages == null) {
            return usageLimit;
        }
        return Math.max(0, usageLimit - totalUsages.intValue());
    }
}