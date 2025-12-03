package fit.iuh.backend.modules.catalog.application.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Data Transfer Object for Wishlist.
 * Used for API responses when retrieving wishlist items.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistDto {

    /**
     * Wishlist item ID
     */
    private UUID id;

    /**
     * User ID who owns this wishlist item
     */
    private UUID userId;

    /**
     * Product information
     */
    private ProductDto product;

    /**
     * Optional notes from the user
     */
    private String notes;

    /**
     * Priority level (1-5, where 1 is highest)
     */
    private Integer priority;

    /**
     * Whether user wants notification when product goes on sale
     */
    private Boolean notifyOnSale;

    /**
     * Whether user wants notification when product is back in stock
     */
    private Boolean notifyOnStock;

    /**
     * When this item was added to wishlist
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * When this item was last updated
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    /**
     * Simplified constructor for basic wishlist item
     */
    public WishlistDto(UUID id, UUID userId, ProductDto product, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.product = product;
        this.createdAt = createdAt;
        this.notifyOnSale = false;
        this.notifyOnStock = false;
    }

    /**
     * Nested DTO for basic product info in wishlist
     * This can be used to avoid circular references
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SimpleProductDto {
        private UUID id;
        private String name;
        private String slug;
        private String sku;
        private String shortDescription;
        private java.math.BigDecimal price;
        private java.math.BigDecimal originalPrice;
        private Integer discountPercentage;
        private String status;
        private Boolean isFeatured;
        private Boolean isNew;
        private String mainImageUrl;
        private String brandName;
        private String categoryName;
        private Integer stockQuantity;
        private Boolean inStock;
    }
}