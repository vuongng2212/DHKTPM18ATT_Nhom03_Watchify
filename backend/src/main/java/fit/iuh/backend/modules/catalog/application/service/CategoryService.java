package fit.iuh.backend.modules.catalog.application.service;

import fit.iuh.backend.modules.catalog.application.dto.CategoryDto;
import fit.iuh.backend.modules.catalog.application.mapper.CategoryMapper;
import fit.iuh.backend.modules.catalog.domain.entity.Category;
import fit.iuh.backend.modules.catalog.domain.repository.CategoryRepository;
import fit.iuh.backend.sharedkernel.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service for Category operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    /**
     * Get all root categories (no parent)
     */
    public List<CategoryDto> getRootCategories() {
        return categoryRepository.findByParentIdIsNull()
            .stream()
            .map(categoryMapper::toDto)
            .toList();
    }

    /**
     * Get all active root categories
     */
    public List<CategoryDto> getActiveRootCategories() {
        return categoryRepository.findByParentIdIsNullAndIsActiveTrue()
            .stream()
            .map(categoryMapper::toDto)
            .toList();
    }

    /**
     * Get child categories of a parent
     */
    public List<CategoryDto> getChildCategories(UUID parentId) {
        return categoryRepository.findByParentId(parentId)
            .stream()
            .map(categoryMapper::toDto)
            .toList();
    }

    /**
     * Get category by ID
     */
    public CategoryDto getCategoryById(UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        
        // Get parent name if exists
        String parentName = null;
        if (category.getParentId() != null) {
            parentName = categoryRepository.findById(category.getParentId())
                .map(Category::getName)
                .orElse(null);
        }
        
        return categoryMapper.toDtoWithParent(category, parentName);
    }

    /**
     * Get category by slug
     */
    public CategoryDto getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug: " + slug));
        
        return getCategoryById(category.getId());
    }

    /**
     * Get all categories
     */
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll()
            .stream()
            .map(categoryMapper::toDto)
            .toList();
    }

    /**
     * Get all active categories
     */
    public List<CategoryDto> getActiveCategories() {
        return categoryRepository.findByIsActiveTrue()
            .stream()
            .map(categoryMapper::toDto)
            .toList();
    }
}
