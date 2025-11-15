package fit.iuh.backend.modules.catalog.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Request DTO for filtering products
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductFilterRequest {
    private String keyword;
    private UUID categoryId;
    private UUID brandId;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String status;
    private Boolean isFeatured;
    private Boolean isNew;
    private String sortBy; // price, name, createdAt, viewCount
    private String sortDirection; // asc, desc
}
