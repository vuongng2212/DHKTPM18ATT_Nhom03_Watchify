package fit.iuh.backend.modules.catalog.application.mapper;

import fit.iuh.backend.modules.catalog.application.dto.CategoryDto;
import fit.iuh.backend.modules.catalog.domain.entity.Category;
import org.springframework.stereotype.Component;

/**
 * Mapper for Category entity and DTO
 */
@Component
public class CategoryMapper {

    public CategoryDto toDto(Category category) {
        if (category == null) {
            return null;
        }

        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .parentId(category.getParentId())
                .displayOrder(category.getDisplayOrder())
                .isActive(category.getIsActive())
                .build();
    }

    public CategoryDto toDtoWithParent(Category category, String parentName) {
        CategoryDto dto = toDto(category);
        if (dto != null) {
            dto.setParentName(parentName);
        }
        return dto;
    }

    public Category toEntity(CategoryDto dto) {
        if (dto == null) {
            return null;
        }

        Category category = Category.builder()
                .name(dto.getName())
                .slug(dto.getSlug())
                .description(dto.getDescription())
                .parentId(dto.getParentId())
                .displayOrder(dto.getDisplayOrder())
                .isActive(dto.getIsActive())
                .build();
        
        // Set ID separately if exists (for updates)
        if (dto.getId() != null) {
            category.setId(dto.getId());
        }
        
        return category;
    }
}
