package fit.iuh.backend.modules.catalog.domain.entity;

import fit.iuh.backend.sharedkernel.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Entity representing a watch product.
 */
@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product extends BaseEntity {

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "slug", unique = true, nullable = false, length = 255)
    private String slug;

    @Column(name = "sku", unique = true, nullable = false, length = 100)
    private String sku;  // Stock Keeping Unit

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "short_description", length = 500)
    private String shortDescription;

    @Column(name = "price", nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "original_price", precision = 15, scale = 2)
    private BigDecimal originalPrice;  // For displaying discount

    @Column(name = "discount_percentage")
    private Integer discountPercentage;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ProductStatus status = ProductStatus.ACTIVE;

    @Column(name = "category_id")
    private UUID categoryId;

    @Column(name = "brand_id")
    private UUID brandId;

    @Column(name = "view_count")
    @Builder.Default
    private Long viewCount = 0L;

    @Column(name = "is_featured")
    @Builder.Default
    private Boolean isFeatured = false;

    @Column(name = "is_new")
    @Builder.Default
    private Boolean isNew = false;

    @Column(name = "display_order")
    private Integer displayOrder;

    /**
     * Check if product is available for purchase
     */
    public boolean isAvailable() {
        return status == ProductStatus.ACTIVE;
    }

    /**
     * Check if product is on sale (has discount)
     */
    public boolean isOnSale() {
        return originalPrice != null && 
               originalPrice.compareTo(price) > 0;
    }

    /**
     * Get the discount amount
     */
    public BigDecimal getDiscountAmount() {
        if (isOnSale()) {
            return originalPrice.subtract(price);
        }
        return BigDecimal.ZERO;
    }

    /**
     * Increment view count
     */
    public void incrementViewCount() {
        this.viewCount++;
    }
}
