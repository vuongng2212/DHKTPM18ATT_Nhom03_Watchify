package fit.iuh.backend.modules.catalog.application.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO for creating a new product
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductRequest {
    
    @NotBlank(message = "Product name is required")
    @Size(max = 255, message = "Product name must not exceed 255 characters")
    private String name;
    
    @Size(max = 500, message = "Short description must not exceed 500 characters")
    private String shortDescription;
    
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Original price must be greater than 0")
    private BigDecimal originalPrice;
    
    @Min(value = 0, message = "Discount percentage must be at least 0")
    @Max(value = 100, message = "Discount percentage must not exceed 100")
    private Integer discountPercentage;
    
    @NotNull(message = "Brand is required")
    private UUID brandId;
    
    private UUID categoryId;
    
    @Builder.Default
    private Boolean isFeatured = false;
    
    @Builder.Default
    private Boolean isNew = false;
    
    private Integer displayOrder;
    
    // Note: Images will be handled as MultipartFile in the controller
}