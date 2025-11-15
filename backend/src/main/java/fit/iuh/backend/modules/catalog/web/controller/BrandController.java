package fit.iuh.backend.modules.catalog.web.controller;

import fit.iuh.backend.modules.catalog.application.dto.BrandDto;
import fit.iuh.backend.modules.catalog.application.service.BrandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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

    private final BrandService brandService;

    @GetMapping
    @Operation(summary = "Get all brands", description = "Get list of all brands ordered by display order")
    public ResponseEntity<List<BrandDto>> getAllBrands() {
        List<BrandDto> brands = brandService.getAllBrands();
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
}
