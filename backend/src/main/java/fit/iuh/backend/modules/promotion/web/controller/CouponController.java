package fit.iuh.backend.modules.promotion.web.controller;

import fit.iuh.backend.modules.promotion.application.dto.*;
import fit.iuh.backend.modules.promotion.application.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for Coupon Management
 * 
 * Public Endpoints:
 * - POST /api/v1/coupons/validate - Validate coupon code
 * - GET /api/v1/coupons/valid - Get currently valid coupons
 * 
 * Admin Endpoints:
 * - GET /api/v1/admin/coupons - List all coupons
 * - POST /api/v1/admin/coupons - Create coupon
 * - PUT /api/v1/admin/coupons/{id} - Update coupon
 * - DELETE /api/v1/admin/coupons/{id} - Delete coupon
 * - PATCH /api/v1/admin/coupons/{id}/toggle - Toggle status
 * 
 * @author Watchify Team
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Coupons", description = "Coupon and discount management APIs")
public class CouponController {

    private final CouponService couponService;

    // ==================== PUBLIC ENDPOINTS ====================

    /**
     * Validate coupon code
     * 
     * POST /api/v1/coupons/validate
     */
    @PostMapping("/coupons/validate")
    @Operation(summary = "Validate coupon code", description = "Validate a coupon code and calculate discount")
    public ResponseEntity<ValidateCouponResponse> validateCoupon(
            @Valid @RequestBody ValidateCouponRequest request) {
        
        log.info("Validating coupon code: {}", request.getCode());
        
        try {
            ValidateCouponResponse response = couponService.validateCoupon(request);
            
            if (response.getValid()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            log.error("Error validating coupon: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ValidateCouponResponse.error("VALIDATION_ERROR", e.getMessage()));
        }
    }

    /**
     * Get currently valid coupons
     * 
     * GET /api/v1/coupons/valid
     */
    @GetMapping("/coupons/valid")
    @Operation(summary = "Get valid coupons", description = "Get list of currently valid and active coupons")
    public ResponseEntity<List<CouponDto>> getValidCoupons() {
        log.info("Getting currently valid coupons");
        
        List<CouponDto> coupons = couponService.getCurrentlyValidCoupons();
        return ResponseEntity.ok(coupons);
    }

    /**
     * Get active coupons (paginated)
     * 
     * GET /api/v1/coupons/active
     */
    @GetMapping("/coupons/active")
    @Operation(summary = "Get active coupons", description = "Get paginated list of active coupons")
    public ResponseEntity<Page<CouponDto>> getActiveCoupons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {
        
        log.info("Getting active coupons - page: {}, size: {}", page, size);
        
        Sort.Direction sortDirection = direction.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        
        Page<CouponDto> coupons = couponService.getActiveCoupons(pageable);
        return ResponseEntity.ok(coupons);
    }

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * Get all coupons (Admin only)
     * 
     * GET /api/v1/admin/coupons
     */
    @GetMapping("/admin/coupons")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Get all coupons", description = "Get paginated list of all coupons (admin only)")
    public ResponseEntity<Map<String, Object>> getAllCoupons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction,
            @RequestParam(required = false) String search) {
        
        log.info("Admin: Getting all coupons - page: {}, size: {}, search: {}", page, size, search);
        
        Sort.Direction sortDirection = direction.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        
        Page<CouponDto> coupons;
        if (search != null && !search.isBlank()) {
            coupons = couponService.searchCoupons(search, pageable);
        } else {
            coupons = couponService.getAllCoupons(pageable);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("coupons", coupons.getContent());
        response.put("currentPage", coupons.getNumber());
        response.put("totalItems", coupons.getTotalElements());
        response.put("totalPages", coupons.getTotalPages());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get coupon by ID (Admin only)
     * 
     * GET /api/v1/admin/coupons/{id}
     */
    @GetMapping("/admin/coupons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Get coupon by ID", description = "Get detailed information about a specific coupon")
    public ResponseEntity<CouponDto> getCouponById(@PathVariable UUID id) {
        log.info("Admin: Getting coupon by ID: {}", id);
        
        CouponDto coupon = couponService.getCouponById(id);
        return ResponseEntity.ok(coupon);
    }

    /**
     * Get coupon by code (Admin only)
     * 
     * GET /api/v1/admin/coupons/code/{code}
     */
    @GetMapping("/admin/coupons/code/{code}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Get coupon by code", description = "Get coupon details by code")
    public ResponseEntity<CouponDto> getCouponByCode(@PathVariable String code) {
        log.info("Admin: Getting coupon by code: {}", code);
        
        CouponDto coupon = couponService.getCouponByCode(code);
        return ResponseEntity.ok(coupon);
    }

    /**
     * Create new coupon (Admin only)
     * 
     * POST /api/v1/admin/coupons
     */
    @PostMapping("/admin/coupons")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Create coupon", description = "Create a new discount coupon")
    public ResponseEntity<CouponDto> createCoupon(
            @Valid @RequestBody CouponRequest request,
            Authentication authentication) {
        
        log.info("Admin: Creating new coupon: {}", request.getCode());
        
        String createdBy = authentication != null ? authentication.getName() : "ADMIN";
        CouponDto coupon = couponService.createCoupon(request, createdBy);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(coupon);
    }

    /**
     * Update coupon (Admin only)
     * 
     * PUT /api/v1/admin/coupons/{id}
     */
    @PutMapping("/admin/coupons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Update coupon", description = "Update an existing coupon")
    public ResponseEntity<CouponDto> updateCoupon(
            @PathVariable UUID id,
            @Valid @RequestBody CouponRequest request) {
        
        log.info("Admin: Updating coupon: {}", id);
        
        CouponDto coupon = couponService.updateCoupon(id, request);
        return ResponseEntity.ok(coupon);
    }

    /**
     * Delete coupon (Admin only)
     * 
     * DELETE /api/v1/admin/coupons/{id}
     */
    @DeleteMapping("/admin/coupons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Delete coupon", description = "Delete a coupon (only if not used)")
    public ResponseEntity<Map<String, String>> deleteCoupon(@PathVariable UUID id) {
        log.info("Admin: Deleting coupon: {}", id);
        
        try {
            couponService.deleteCoupon(id);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Coupon deleted successfully");
            response.put("couponId", id.toString());
            
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            log.warn("Cannot delete coupon: {}", e.getMessage());
            
            Map<String, String> response = new HashMap<>();
            response.put("error", "Cannot delete coupon");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Toggle coupon status (Admin only)
     * 
     * PATCH /api/v1/admin/coupons/{id}/toggle
     */
    @PatchMapping("/admin/coupons/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Toggle coupon status", description = "Activate or deactivate a coupon")
    public ResponseEntity<CouponDto> toggleCouponStatus(@PathVariable UUID id) {
        log.info("Admin: Toggling coupon status: {}", id);
        
        CouponDto coupon = couponService.toggleCouponStatus(id);
        return ResponseEntity.ok(coupon);
    }

    /**
     * Get coupon usage statistics (Admin only)
     * 
     * GET /api/v1/admin/coupons/{id}/stats
     */
    @GetMapping("/admin/coupons/{id}/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Get coupon statistics", description = "Get usage statistics for a specific coupon")
    public ResponseEntity<CouponUsageStatsDto> getCouponStats(@PathVariable UUID id) {
        log.info("Admin: Getting stats for coupon: {}", id);
        
        CouponUsageStatsDto stats = couponService.getCouponUsageStats(id);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get coupon counts (Admin only)
     * 
     * GET /api/v1/admin/coupons/counts
     */
    @GetMapping("/admin/coupons/counts")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Get coupon counts", description = "Get counts of active and valid coupons")
    public ResponseEntity<Map<String, Long>> getCouponCounts() {
        log.info("Admin: Getting coupon counts");
        
        Map<String, Long> counts = new HashMap<>();
        counts.put("activeCoupons", couponService.countActiveCoupons());
        counts.put("validCoupons", couponService.countCurrentlyValidCoupons());
        
        return ResponseEntity.ok(counts);
    }

    // ==================== ERROR HANDLING ====================

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException e) {
        log.error("Validation error: {}", e.getMessage());
        
        Map<String, String> error = new HashMap<>();
        error.put("error", "Validation Error");
        error.put("message", e.getMessage());
        
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericError(Exception e) {
        log.error("Unexpected error: {}", e.getMessage(), e);
        
        Map<String, String> error = new HashMap<>();
        error.put("error", "Internal Server Error");
        error.put("message", "An unexpected error occurred");
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}