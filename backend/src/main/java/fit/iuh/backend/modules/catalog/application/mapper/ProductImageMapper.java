package fit.iuh.backend.modules.catalog.application.mapper;

import fit.iuh.backend.modules.catalog.application.dto.ProductImageDto;
import fit.iuh.backend.modules.catalog.domain.entity.ProductImage;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for ProductImage entity and DTO
 */
@Component
public class ProductImageMapper {

    public ProductImageDto toDto(ProductImage image) {
        if (image == null) {
            return null;
        }

        return ProductImageDto.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .altText(image.getAltText())
                .displayOrder(image.getDisplayOrder())
                .isMain(image.getIsMain())
                .build();
    }

    public List<ProductImageDto> toDtoList(List<ProductImage> images) {
        if (images == null) {
            return null;
        }
        return images.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ProductImage toEntity(ProductImageDto dto) {
        if (dto == null) {
            return null;
        }

        ProductImage image = ProductImage.builder()
                .imageUrl(dto.getImageUrl())
                .altText(dto.getAltText())
                .displayOrder(dto.getDisplayOrder())
                .isMain(dto.getIsMain())
                .build();
        
        // Set ID separately if exists (for updates)
        if (dto.getId() != null) {
            image.setId(dto.getId());
        }
        
        return image;
    }
}
