package fit.iuh.backend.modules.promotion.application.service;

import fit.iuh.backend.modules.promotion.application.dto.*;
import fit.iuh.backend.modules.promotion.domain.entity.Coupon;
import fit.iuh.backend.modules.promotion.domain.entity.CouponUsage;
import fit.iuh.backend.modules.promotion.domain.repository.CouponRepository;
import fit.iuh.backend.modules.promotion.domain.repository.CouponUsageRepository;
import fit.iuh.backend.modules.identity.domain.entity.User;
import fit.iuh.backend.modules.identity.domain.repository.UserRepository;
import fit.iuh.backend.modules.order.domain.entity.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for Coupon business logic
 * 
 * Responsibilities:
 * - Validate coupon codes
 * - Calculate discounts
 * - Manage coupon lifecycle (CRUD)
 * - Track coupon usage
 * - Enforce usage limits
 * 
 * @author Watchify Team
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final UserRepository userRepository;

    // ==================== VALIDATION & CALCULATION ====================

    /**
     * Validate coupon code and calculate discount
     * 
     * Business Rules:
     * 1. Coupon must exist and be active
     * 2. Coupon must be within valid date range
     * 3. Coupon must not be exhausted (usage limit)
     * 4. Order amount must meet minimum requirement
     * 5. User must not exceed per-user limit
     * 
     * @param request Validation request with code and order amount
     * @return Validation response with discount details
     */
    public ValidateCouponResponse validateCoupon(ValidateCouponRequest request) {
        log.info("Validating coupon: {} for order amount: {}", request.getCode(), request.getOrderAmount());

        // Find coupon by code
        Coupon coupon = couponRepository.findByCode(request.getCode())
                .orElse(null);

        if (coupon == null) {
            log.warn("Coupon not found: {}", request.getCode());
            return ValidateCouponResponse.couponNotFound();
        }

        // Check if active
        if (!coupon.getIsActive()) {
            log.warn("Coupon is inactive: {}", request.getCode());
            return ValidateCouponResponse.couponInactive();
        }

        // Check if expired
        if (coupon.isExpired()) {
            log.warn("Coupon is expired: {}", request.getCode());
            return ValidateCouponResponse.couponExpired();
        }

        // Check if not started
        if (coupon.isNotStarted()) {
            log.warn("Coupon has not started yet: {}", request.getCode());
            return ValidateCouponResponse.couponNotStarted();
        }

        // Check if exhausted (global limit)
        if (coupon.hasReachedLimit()) {
            log.warn("Coupon has reached usage limit: {}", request.getCode());
            return ValidateCouponResponse.couponExhausted();
        }

        // Check minimum order amount
        if (!coupon.canApplyToOrder(request.getOrderAmount())) {
            log.warn("Order amount {} is below minimum {} for coupon {}", 
                    request.getOrderAmount(), coupon.getMinOrderAmount(), request.getCode());
            return ValidateCouponResponse.orderBelowMinimum(coupon.getMinOrderAmount());
        }

        // Check per-user limit if user is provided
        if (request.getUserId() != null) {
            UUID userId = UUID.fromString(request.getUserId());
            long userUsageCount = couponUsageRepository.countByUserIdAndCouponId(userId, coupon.getId());
            
            if (coupon.getPerUserLimit() != null && userUsageCount >= coupon.getPerUserLimit()) {
                log.warn("User {} has reached per-user limit for coupon {}", userId, request.getCode());
                return ValidateCouponResponse.userLimitReached();
            }
        }

        // Calculate discount
        BigDecimal discountAmount = coupon.calculateDiscount(request.getOrderAmount());
        BigDecimal finalAmount = request.getOrderAmount().subtract(discountAmount);

        log.info("Coupon {} validated successfully. Discount: {}, Final: {}", 
                request.getCode(), discountAmount, finalAmount);

        return ValidateCouponResponse.success(
                coupon.getId(),
                coupon.getCode(),
                coupon.getDescription(),
                coupon.getDiscountType().name(),
                coupon.getDiscountValue(),
                request.getOrderAmount(),
                discountAmount,
                finalAmount,
                coupon.getMinOrderAmount(),
                coupon.getMaxDiscountAmount(),
                coupon.getRemainingUsage(),
                coupon.getValidTo()
        );
    }

    /**
     * Apply coupon to an order
     * 
     * This method:
     * 1. Validates the coupon
     * 2. Increments usage count
     * 3. Creates usage record
     * 
     * @param userId User ID
     * @param orderId Order ID
     * @param code Coupon code
     * @param orderAmount Order total amount
     * @return Discount amount
     */
    @Transactional
    public BigDecimal applyCoupon(UUID userId, UUID orderId, String code, BigDecimal orderAmount) {
        log.info("Applying coupon {} to order {} for user {}", code, orderId, userId);

        // Validate coupon
        ValidateCouponRequest validateRequest = ValidateCouponRequest.builder()
                .code(code)
                .orderAmount(orderAmount)
                .userId(userId.toString())
                .build();

        ValidateCouponResponse validation = validateCoupon(validateRequest);

        if (!validation.getValid()) {
            throw new IllegalArgumentException(validation.getErrorMessage());
        }

        // Get coupon
        Coupon coupon = couponRepository.findById(validation.getCouponId())
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found"));

        // Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Increment usage count
        coupon.incrementUsageCount();
        couponRepository.save(coupon);

        // Create usage record
        // Note: Order reference will be set when order is created
        // For now, we create a temporary reference
        Order orderRef = new Order();
        orderRef.setId(orderId);
        
        CouponUsage usage = CouponUsage.builder()
                .coupon(coupon)
                .user(user)
                .order(orderRef)
                .discountAmount(validation.getDiscountAmount())
                .orderAmount(orderAmount)
                .usedAt(LocalDateTime.now())
                .build();

        couponUsageRepository.save(usage);

        log.info("Coupon {} applied successfully. Discount: {}", code, validation.getDiscountAmount());

        return validation.getDiscountAmount();
    }

    /**
     * Revert coupon usage (when order is cancelled)
     */
    @Transactional
    public void revertCouponUsage(UUID orderId) {
        log.info("Reverting coupon usage for order {}", orderId);

        couponUsageRepository.findByOrderId(orderId).ifPresent(usage -> {
            Coupon coupon = usage.getCoupon();
            coupon.decrementUsageCount();
            couponRepository.save(coupon);
            couponUsageRepository.delete(usage);
            log.info("Coupon usage reverted for order {}", orderId);
        });
    }

    // ==================== CRUD OPERATIONS ====================

    /**
     * Create a new coupon
     */
    @Transactional
    public CouponDto createCoupon(CouponRequest request, String createdBy) {
        log.info("Creating new coupon: {}", request.getCode());

        // Validate request
        request.validate();

        // Check if code already exists
        if (couponRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new IllegalArgumentException("Coupon code already exists: " + request.getCode());
        }

        // Create entity
        Coupon coupon = request.toEntity();
        coupon.setCreatedBy(createdBy);

        // Save
        Coupon saved = couponRepository.save(coupon);

        log.info("Coupon created successfully: {}", saved.getCode());

        return CouponDto.fromEntity(saved);
    }

    /**
     * Update an existing coupon
     */
    @Transactional
    public CouponDto updateCoupon(UUID id, CouponRequest request) {
        log.info("Updating coupon: {}", id);

        // Validate request
        request.validate();

        // Find existing coupon
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found: " + id));

        // Check if new code conflicts with existing
        if (!coupon.getCode().equalsIgnoreCase(request.getCode())) {
            if (couponRepository.existsByCodeIgnoreCase(request.getCode())) {
                throw new IllegalArgumentException("Coupon code already exists: " + request.getCode());
            }
        }

        // Update fields
        request.updateEntity(coupon);

        // Save
        Coupon updated = couponRepository.save(coupon);

        log.info("Coupon updated successfully: {}", updated.getCode());

        return CouponDto.fromEntity(updated);
    }

    /**
     * Get coupon by ID
     */
    public CouponDto getCouponById(UUID id) {
        log.debug("Getting coupon by ID: {}", id);

        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found: " + id));

        return CouponDto.fromEntity(coupon);
    }

    /**
     * Get coupon by code
     */
    public CouponDto getCouponByCode(String code) {
        log.debug("Getting coupon by code: {}", code);

        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found: " + code));

        return CouponDto.fromEntity(coupon);
    }

    /**
     * Get all coupons (paginated)
     */
    public Page<CouponDto> getAllCoupons(Pageable pageable) {
        log.debug("Getting all coupons, page: {}", pageable.getPageNumber());

        return couponRepository.findAll(pageable)
                .map(CouponDto::fromEntity);
    }

    /**
     * Get active coupons only
     */
    public Page<CouponDto> getActiveCoupons(Pageable pageable) {
        log.debug("Getting active coupons, page: {}", pageable.getPageNumber());

        return couponRepository.findAllActive(pageable)
                .map(CouponDto::fromEntity);
    }

    /**
     * Get currently valid coupons
     */
    public List<CouponDto> getCurrentlyValidCoupons() {
        log.debug("Getting currently valid coupons");

        return couponRepository.findCurrentlyValid(LocalDateTime.now())
                .stream()
                .map(CouponDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Search coupons by keyword
     */
    public Page<CouponDto> searchCoupons(String keyword, Pageable pageable) {
        log.debug("Searching coupons with keyword: {}", keyword);

        return couponRepository.searchByKeyword(keyword, pageable)
                .map(CouponDto::fromEntity);
    }

    /**
     * Delete coupon
     */
    @Transactional
    public void deleteCoupon(UUID id) {
        log.info("Deleting coupon: {}", id);

        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found: " + id));

        // Check if coupon has been used
        long usageCount = couponUsageRepository.countByCouponId(id);
        if (usageCount > 0) {
            throw new IllegalStateException("Cannot delete coupon that has been used. Consider deactivating instead.");
        }

        couponRepository.delete(coupon);

        log.info("Coupon deleted successfully: {}", id);
    }

    /**
     * Toggle coupon active status
     */
    @Transactional
    public CouponDto toggleCouponStatus(UUID id) {
        log.info("Toggling coupon status: {}", id);

        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found: " + id));

        coupon.setIsActive(!coupon.getIsActive());
        Coupon updated = couponRepository.save(coupon);

        log.info("Coupon status toggled. New status: {}", updated.getIsActive());

        return CouponDto.fromEntity(updated);
    }

    // ==================== STATISTICS & ANALYTICS ====================

    /**
     * Get coupon usage statistics
     */
    public CouponUsageStatsDto getCouponUsageStats(UUID couponId) {
        log.debug("Getting usage stats for coupon: {}", couponId);

        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found: " + couponId));

        long totalUsages = couponUsageRepository.countByCouponId(couponId);
        long uniqueUsers = couponUsageRepository.countUniqueUsersByCoupon(couponId);
        BigDecimal totalDiscount = couponUsageRepository.calculateTotalDiscountByCoupon(couponId);

        return CouponUsageStatsDto.builder()
                .couponCode(coupon.getCode())
                .totalUsages(totalUsages)
                .uniqueUsers(uniqueUsers)
                .totalDiscountGiven(totalDiscount)
                .remainingUsage(coupon.getRemainingUsage())
                .usageLimit(coupon.getUsageLimit())
                .build();
    }

    /**
     * Get user's coupon usage history
     */
    public Page<CouponUsage> getUserCouponHistory(UUID userId, Pageable pageable) {
        log.debug("Getting coupon history for user: {}", userId);

        return couponUsageRepository.findByUserId(userId, pageable);
    }

    /**
     * Count active coupons
     */
    public long countActiveCoupons() {
        return couponRepository.countActive();
    }

    /**
     * Count currently valid coupons
     */
    public long countCurrentlyValidCoupons() {
        return couponRepository.countCurrentlyValid(LocalDateTime.now());
    }
}