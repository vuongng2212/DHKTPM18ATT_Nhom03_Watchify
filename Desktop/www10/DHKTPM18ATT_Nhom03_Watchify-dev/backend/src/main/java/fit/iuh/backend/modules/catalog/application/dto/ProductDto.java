package fit.iuh.backend.modules.catalog.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO for Product with full details
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private UUID id;
    private String name;
    private String slug;
    private String sku;
    private String description;
    private String shortDescription;
    
    private BigDecimal price;
    private BigDecimal originalPrice;
    private BigDecimal discountPercentage;
    private BigDecimal discountAmount;
    
    private String status;
    private Boolean isAvailable;
    private Boolean isOnSale;
    
    private CategoryDto category;
    private BrandDto brand;
    
    private Integer viewCount;
    private Boolean isFeatured;
    private Boolean isNew;
    private Integer displayOrder;
    
    private List<ProductImageDto> images;
    private ProductDetailDto detail;
    
    private Double averageRating;
    private Long reviewCount;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
