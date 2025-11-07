package fit.iuh.backend.modules.catalog.web.controller;

import fit.iuh.backend.modules.catalog.application.dto.CategoryDto;
import fit.iuh.backend.modules.catalog.application.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for Category operations
 */
@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Category management APIs")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Get all categories", description = "Get list of all categories")
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        List<CategoryDto> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/active")
    @Operation(summary = "Get active categories", description = "Get list of active categories only")
    public ResponseEntity<List<CategoryDto>> getActiveCategories() {
        List<CategoryDto> categories = categoryService.getActiveCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/roots")
    @Operation(summary = "Get root categories", description = "Get list of root categories (no parent)")
    public ResponseEntity<List<CategoryDto>> getRootCategories() {
        List<CategoryDto> categories = categoryService.getRootCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/roots/active")
    @Operation(summary = "Get active root categories", description = "Get list of active root categories")
    public ResponseEntity<List<CategoryDto>> getActiveRootCategories() {
        List<CategoryDto> categories = categoryService.getActiveRootCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID", description = "Get category details by ID")
    public ResponseEntity<CategoryDto> getCategoryById(
            @Parameter(description = "Category ID") @PathVariable UUID id
    ) {
        CategoryDto category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(category);
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get category by slug", description = "Get category details by slug")
    public ResponseEntity<CategoryDto> getCategoryBySlug(
            @Parameter(description = "Category slug") @PathVariable String slug
    ) {
        CategoryDto category = categoryService.getCategoryBySlug(slug);
        return ResponseEntity.ok(category);
    }

    @GetMapping("/{parentId}/children")
    @Operation(summary = "Get child categories", description = "Get child categories of a parent category")
    public ResponseEntity<List<CategoryDto>> getChildCategories(
            @Parameter(description = "Parent category ID") @PathVariable UUID parentId
    ) {
        List<CategoryDto> categories = categoryService.getChildCategories(parentId);
        return ResponseEntity.ok(categories);
    }
}
