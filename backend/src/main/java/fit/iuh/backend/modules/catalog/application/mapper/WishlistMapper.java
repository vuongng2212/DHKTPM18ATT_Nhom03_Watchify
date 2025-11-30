package fit.iuh.backend.modules.catalog.application.mapper;

import fit.iuh.backend.modules.catalog.application.dto.ProductDto;
import fit.iuh.backend.modules.catalog.application.dto.WishlistDto;
import fit.iuh.backend.modules.catalog.domain.entity.Product;
import fit.iuh.backend.modules.catalog.domain.entity.Wishlist;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between Wishlist entity and WishlistDto.
 */
@Component
public class WishlistMapper {

    private final ProductMapper productMapper;

    public WishlistMapper(ProductMapper productMapper) {
        this.productMapper = productMapper;
    }

    /**
     * Convert Wishlist entity to WishlistDto
     *
     * @param wishlist the wishlist entity
     * @return wishlist DTO
     */
    public WishlistDto toDto(Wishlist wishlist) {
        if (wishlist == null) {
            return null;
        }

        ProductDto productDto = null;
        if (wishlist.getProduct() != null) {
            productDto = productMapper.toDto(wishlist.getProduct());
        }

        return WishlistDto.builder()
                .id(wishlist.getId())
                .userId(wishlist.getUser() != null ? wishlist.getUser().getId() : null)
                .product(productDto)
                .notes(wishlist.getNotes())
                .priority(wishlist.getPriority())
                .notifyOnSale(wishlist.getNotifyOnSale())
                .notifyOnStock(wishlist.getNotifyOnStock())
                .createdAt(wishlist.getCreatedAt())
                .updatedAt(wishlist.getUpdatedAt())
                .build();
    }

    /**
     * Convert Wishlist entity to WishlistDto with simple product info
     * This is useful for list views where full product details are not needed
     *
     * @param wishlist the wishlist entity
     * @return wishlist DTO with simplified product info
     */
    public WishlistDto toDtoSimple(Wishlist wishlist) {
        if (wishlist == null) {
            return null;
        }

        WishlistDto.SimpleProductDto simpleProduct = null;
        if (wishlist.getProduct() != null) {
            simpleProduct = toSimpleProductDto(wishlist.getProduct());
        }

        // Note: Using ProductDto in the builder, but you could modify WishlistDto
        // to have a SimpleProductDto field instead if preferred
        ProductDto productDto = null;
        if (wishlist.getProduct() != null) {
            productDto = productMapper.toDto(wishlist.getProduct());
        }

        return WishlistDto.builder()
                .id(wishlist.getId())
                .userId(wishlist.getUser() != null ? wishlist.getUser().getId() : null)
                .product(productDto)
                .notes(wishlist.getNotes())
                .priority(wishlist.getPriority())
                .notifyOnSale(wishlist.getNotifyOnSale())
                .notifyOnStock(wishlist.getNotifyOnStock())
                .createdAt(wishlist.getCreatedAt())
                .updatedAt(wishlist.getUpdatedAt())
                .build();
    }

    /**
     * Convert Product entity to SimpleProductDto
     *
     * @param product the product entity
     * @return simple product DTO
     */
    private WishlistDto.SimpleProductDto toSimpleProductDto(Product product) {
        if (product == null) {
            return null;
        }

        // Note: Product uses UUID references, not actual relationships
        // mainImageUrl, brandName, categoryName, stockQuantity would need to be fetched separately
        // For now, we'll use placeholder/null values
        
        return WishlistDto.SimpleProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .sku(product.getSku())
                .shortDescription(product.getShortDescription())
                .price(product.getPrice())
                .originalPrice(product.getOriginalPrice())
                .discountPercentage(product.getDiscountPercentage())
                .status(product.getStatus() != null ? product.getStatus().toString() : null)
                .isFeatured(product.getIsFeatured())
                .isNew(product.getIsNew())
                .mainImageUrl(null) // TODO: Fetch from ProductImage repository
                .brandName(null) // TODO: Fetch from Brand repository using brandId
                .categoryName(null) // TODO: Fetch from Category repository using categoryId
                .stockQuantity(null) // TODO: Fetch from Inventory repository
                .inStock(true) // Default to true for now
                .build();
    }

    /**
     * Batch convert list of Wishlist entities to list of WishlistDto
     *
     * @param wishlists list of wishlist entities
     * @return list of wishlist DTOs
     */
    public java.util.List<WishlistDto> toDtoList(java.util.List<Wishlist> wishlists) {
        if (wishlists == null || wishlists.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        return wishlists.stream()
                .map(this::toDto)
                .collect(java.util.stream.Collectors.toList());
    }
}