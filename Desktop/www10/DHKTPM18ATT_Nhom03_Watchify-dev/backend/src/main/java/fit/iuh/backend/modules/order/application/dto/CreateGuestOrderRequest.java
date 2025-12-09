package fit.iuh.backend.modules.order.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * DTO for creating an order as a guest user.
 * Extends CreateOrderRequest with additional guest information fields.
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class CreateGuestOrderRequest extends CreateOrderRequest {

    @NotBlank(message = "Guest name is required")
    private String guestName;

    @NotBlank(message = "Guest phone is required")
    @Pattern(regexp = "^(\\+84|0)[0-9]{9,10}$", message = "Invalid phone number format")
    private String guestPhone;

    @NotBlank(message = "Guest email is required")
    @Email(message = "Invalid email format")
    private String guestEmail;
}