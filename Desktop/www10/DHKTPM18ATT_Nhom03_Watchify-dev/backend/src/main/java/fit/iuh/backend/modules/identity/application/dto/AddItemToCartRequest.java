package fit.iuh.backend.modules.identity.application.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddItemToCartRequest {

    @NotNull(message = "Product ID is required")
    @Schema(format = "uuid")
    private UUID productId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
}
