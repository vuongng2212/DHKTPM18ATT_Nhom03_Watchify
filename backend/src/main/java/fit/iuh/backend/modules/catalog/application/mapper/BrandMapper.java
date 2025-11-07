package fit.iuh.backend.modules.catalog.application.mapper;

import fit.iuh.backend.modules.catalog.application.dto.BrandDto;
import fit.iuh.backend.modules.catalog.domain.entity.Brand;
import org.springframework.stereotype.Component;

/**
 * Mapper for Brand entity and DTO
 */
@Component
public class BrandMapper {

    public BrandDto toDto(Brand brand) {
        if (brand == null) {
            return null;
        }

        return BrandDto.builder()
                .id(brand.getId())
                .name(brand.getName())
                .slug(brand.getSlug())
                .description(brand.getDescription())
                .logoUrl(brand.getLogoUrl())
                .websiteUrl(brand.getWebsiteUrl())
                .isActive(brand.getIsActive())
                .displayOrder(brand.getDisplayOrder())
                .build();
    }

    public Brand toEntity(BrandDto dto) {
        if (dto == null) {
            return null;
        }

        Brand brand = Brand.builder()
                .name(dto.getName())
                .slug(dto.getSlug())
                .description(dto.getDescription())
                .logoUrl(dto.getLogoUrl())
                .websiteUrl(dto.getWebsiteUrl())
                .isActive(dto.getIsActive())
                .displayOrder(dto.getDisplayOrder())
                .build();
        
        // Set ID separately if exists (for updates)
        if (dto.getId() != null) {
            brand.setId(dto.getId());
        }
        
        return brand;
    }
}
