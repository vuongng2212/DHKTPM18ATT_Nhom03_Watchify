package fit.iuh.backend.modules.catalog.application.mapper;

import fit.iuh.backend.modules.catalog.application.dto.*;
import fit.iuh.backend.modules.catalog.domain.entity.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Mapper for Product entity and DTO
 */
@Component
@RequiredArgsConstructor
public class ProductMapper {

    private final CategoryMapper categoryMapper;
    private final BrandMapper brandMapper;
    private final ProductImageMapper productImageMapper;
    private final ProductDetailMapper productDetailMapper;

    public ProductDto toDto(Product product) {
        if (product == null) {
            return null;
        }

        return ProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .sku(product.getSku())
                .description(product.getDescription())
                .shortDescription(product.getShortDescription())
                .price(product.getPrice())
                .originalPrice(product.getOriginalPrice())
                .discountPercentage(product.getDiscountPercentage() != null ? 
                    java.math.BigDecimal.valueOf(product.getDiscountPercentage()) : null)
                .discountAmount(product.getDiscountAmount())
                .status(product.getStatus().name())
                .isAvailable(product.isAvailable())
                .isOnSale(product.isOnSale())
                .viewCount(product.getViewCount() != null ? product.getViewCount().intValue() : 0)
                .isFeatured(product.getIsFeatured())
                .isNew(product.getIsNew())
                .displayOrder(product.getDisplayOrder())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    public ProductDto toDtoWithDetails(Product product, 
                                       CategoryDto category,
                                       BrandDto brand,
                                       List<ProductImageDto> images,
                                       ProductDetailDto detail,
                                       Double avgRating,
                                       Long reviewCount) {
        ProductDto dto = toDto(product);
        if (dto != null) {
            dto.setCategory(category);
            dto.setBrand(brand);
            dto.setImages(images);
            dto.setDetail(detail);
            dto.setAverageRating(avgRating);
            dto.setReviewCount(reviewCount);
        }
        return dto;
    }

    public ProductListResponse toListResponse(Page<ProductDto> page) {
        return ProductListResponse.builder()
                .products(page.getContent())
                .currentPage(page.getNumber())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .pageSize(page.getSize())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}
