package fit.iuh.backend.modules.catalog.web.controller;

import fit.iuh.backend.modules.catalog.application.dto.BrandDto;
import fit.iuh.backend.modules.catalog.application.dto.CreateBrandRequest;
import fit.iuh.backend.modules.catalog.application.dto.UpdateBrandRequest;
import fit.iuh.backend.modules.catalog.application.service.BrandService;
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

import java.util.List;
import java.util.UUID;

/**
 * REST controller for Brand operations
 */
@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
@Tag(name = "Brands", description = "Brand management APIs")
public class BrandController {

    private static final Logger log = LoggerFactory.getLogger(BrandController.class);

    private final BrandService brandService;

    @GetMapping
    @Operation(summary = "Get all brands", description = "Get list of all brands ordered by display order")
    public ResponseEntity<List<BrandDto>> getAllBrands() {
        log.info("BrandController: getAllBrands called");
        List<BrandDto> brands = brandService.getAllBrands();
        log.info("BrandController: getAllBrands returning {} brands", brands.size());
        return ResponseEntity.ok(brands);
    }

    @GetMapping("/active")
    @Operation(summary = "Get active brands", description = "Get list of active brands only")
    public ResponseEntity<List<BrandDto>> getActiveBrands() {
        List<BrandDto> brands = brandService.getActiveBrands();
        return ResponseEntity.ok(brands);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get brand by ID", description = "Get brand details by ID")
    public ResponseEntity<BrandDto> getBrandById(
            @Parameter(description = "Brand ID") @PathVariable UUID id
    ) {
        BrandDto brand = brandService.getBrandById(id);
        return ResponseEntity.ok(brand);
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get brand by slug", description = "Get brand details by slug")
    public ResponseEntity<BrandDto> getBrandBySlug(
            @Parameter(description = "Brand slug") @PathVariable String slug
    ) {
        BrandDto brand = brandService.getBrandBySlug(slug);
        return ResponseEntity.ok(brand);
    }

    @PostMapping
    @Operation(summary = "Create a new brand", description = "Create a new brand")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BrandDto> createBrand(@Valid @RequestBody CreateBrandRequest request) {
        BrandDto brand = brandService.createBrand(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(brand);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a brand", description = "Update an existing brand")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BrandDto> updateBrand(
            @Parameter(description = "Brand ID") @PathVariable UUID id,
            @Valid @RequestBody UpdateBrandRequest request
    ) {
        BrandDto brand = brandService.updateBrand(id, request);
        return ResponseEntity.ok(brand);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a brand", description = "Delete a brand by ID")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBrand(@Parameter(description = "Brand ID") @PathVariable UUID id) {
        brandService.deleteBrand(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-visibility")
    @Operation(summary = "Toggle brand visibility", description = "Toggle the active status of a brand")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BrandDto> toggleBrandVisibility(@Parameter(description = "Brand ID") @PathVariable UUID id) {
        BrandDto brand = brandService.toggleVisibility(id);
        return ResponseEntity.ok(brand);
    }
}
