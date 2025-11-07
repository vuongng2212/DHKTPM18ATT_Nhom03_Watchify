package fit.iuh.backend.modules.catalog.web.controller;

import fit.iuh.backend.modules.catalog.application.dto.ProductDto;
import fit.iuh.backend.modules.catalog.application.dto.ProductFilterRequest;
import fit.iuh.backend.modules.catalog.application.dto.ProductListResponse;
import fit.iuh.backend.modules.catalog.application.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for Product operations
 */
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Product management APIs")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Get all products", description = "Get paginated list of products with optional filtering and sorting")
    public ResponseEntity<ProductListResponse> getProducts(
            @Parameter(description = "Search keyword") @RequestParam(required = false) String keyword,
            @Parameter(description = "Category ID") @RequestParam(required = false) UUID categoryId,
            @Parameter(description = "Brand ID") @RequestParam(required = false) UUID brandId,
            @Parameter(description = "Minimum price") @RequestParam(required = false) BigDecimal minPrice,
            @Parameter(description = "Maximum price") @RequestParam(required = false) BigDecimal maxPrice,
            @Parameter(description = "Product status") @RequestParam(required = false) String status,
            @Parameter(description = "Is featured") @RequestParam(required = false) Boolean isFeatured,
            @Parameter(description = "Is new") @RequestParam(required = false) Boolean isNew,
            @Parameter(description = "Sort by field (price, name, createdAt, viewCount)") @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction (asc, desc)") @RequestParam(required = false, defaultValue = "desc") String sortDirection,
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "12") int size
    ) {
        ProductFilterRequest filter = ProductFilterRequest.builder()
                .keyword(keyword)
                .categoryId(categoryId)
                .brandId(brandId)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .status(status)
                .isFeatured(isFeatured)
                .isNew(isNew)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();

        ProductListResponse response = productService.getProducts(filter, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID", description = "Get detailed information about a specific product")
    public ResponseEntity<ProductDto> getProductById(
            @Parameter(description = "Product ID") @PathVariable UUID id
    ) {
        productService.incrementViewCount(id); // Track view
        ProductDto product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get product by slug", description = "Get product information by URL-friendly slug")
    public ResponseEntity<ProductDto> getProductBySlug(
            @Parameter(description = "Product slug") @PathVariable String slug
    ) {
        ProductDto product = productService.getProductBySlug(slug);
        productService.incrementViewCount(product.getId()); // Track view
        return ResponseEntity.ok(product);
    }

    @GetMapping("/search")
    @Operation(summary = "Search products", description = "Search products by keyword in name or description")
    public ResponseEntity<List<ProductDto>> searchProducts(
            @Parameter(description = "Search keyword") @RequestParam String keyword
    ) {
        List<ProductDto> products = productService.searchProducts(keyword);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured products", description = "Get list of featured products")
    public ResponseEntity<List<ProductDto>> getFeaturedProducts(
            @Parameter(description = "Limit number of results") @RequestParam(required = false, defaultValue = "8") int limit
    ) {
        List<ProductDto> products = productService.getFeaturedProducts(limit);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/new")
    @Operation(summary = "Get new products", description = "Get list of new products")
    public ResponseEntity<List<ProductDto>> getNewProducts(
            @Parameter(description = "Limit number of results") @RequestParam(required = false, defaultValue = "8") int limit
    ) {
        List<ProductDto> products = productService.getNewProducts(limit);
        return ResponseEntity.ok(products);
    }
}
