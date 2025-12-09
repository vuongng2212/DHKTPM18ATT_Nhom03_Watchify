package fit.iuh.backend.modules.promotion.application.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

/**
 * Request DTO for validating coupon codes
 * 
 * Used when user enters a coupon code at checkout
 * 
 * @author Watchify Team
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidateCouponRequest {

    @NotBlank(message = "Coupon code is required")
    private String code;

    @NotNull(message = "Order amount is required")
    @DecimalMin(value = "0.01", message = "Order amount must be greater than 0")
    private BigDecimal orderAmount;

    private String userId; // Optional for guest checkout
}