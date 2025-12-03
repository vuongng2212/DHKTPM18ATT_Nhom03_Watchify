package fit.iuh.backend.modules.catalog.application.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a new brand
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBrandRequest {
    
    @NotBlank(message = "Brand name is required")
    @Size(max = 100, message = "Brand name must not exceed 100 characters")
    private String name;
    
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;
    
    @Size(max = 500, message = "Logo URL must not exceed 500 characters")
    private String logoUrl;
    
    @Size(max = 500, message = "Website URL must not exceed 500 characters")
    private String websiteUrl;
    
    private Integer displayOrder;
}