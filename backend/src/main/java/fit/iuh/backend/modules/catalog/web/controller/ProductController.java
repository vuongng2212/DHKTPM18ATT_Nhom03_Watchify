package fit.iuh.backend.modules.catalog.web.controller;

import fit.iuh.backend.modules.catalog.application.dto.CreateProductRequest;
import fit.iuh.backend.modules.catalog.application.dto.ProductDto;
import fit.iuh.backend.modules.catalog.application.dto.ProductFilterRequest;
import fit.iuh.backend.modules.catalog.application.dto.ProductListResponse;
import fit.iuh.backend.modules.catalog.application.dto.UpdateProductRequest;
import fit.iuh.backend.modules.catalog.application.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    private static final Logger log = LoggerFactory.getLogger(ProductController.class);

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
        log.info("ProductController: getProducts called with page={}, size={}, keyword={}, brandId={}, categoryId={}",
                page, size, keyword, brandId, categoryId);

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

        log.info("ProductController: getProducts returning {} products for page {}",
                response.getProducts().size(), page);

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

    @PostMapping
    @Operation(summary = "Create a new product", description = "Create a new product with optional images")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto> createProduct(
            @Parameter(description = "Product data") @Valid @ModelAttribute CreateProductRequest request,
            @Parameter(description = "Product images") @RequestParam(required = false) MultipartFile[] hinhAnh
    ) {
        ProductDto product = productService.createProduct(request, hinhAnh);
        return ResponseEntity.status(HttpStatus.CREATED).body(product);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a product", description = "Update an existing product with optional new images")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto> updateProduct(
            @Parameter(description = "Product ID") @PathVariable UUID id,
            @Parameter(description = "Product data") @Valid @ModelAttribute UpdateProductRequest request,
            @Parameter(description = "New product images") @RequestParam(required = false) MultipartFile[] hinhAnh
    ) {
        ProductDto product = productService.updateProduct(id, request, hinhAnh);
        return ResponseEntity.ok(product);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a product", description = "Delete a product by ID")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(
            @Parameter(description = "Product ID") @PathVariable UUID id
    ) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
