package fit.iuh.backend.modules.promotion.domain.repository;

import fit.iuh.backend.modules.promotion.domain.entity.Coupon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Coupon entity
 * 
 * Provides methods for:
 * - Finding coupons by code
 * - Validating coupon availability
 * - Managing active/inactive coupons
 * - Filtering by date ranges
 * 
 * @author Watchify Team
 */
@Repository
public interface CouponRepository extends JpaRepository<Coupon, UUID> {

    /**
     * Find coupon by code (case-insensitive)
     */
    @Query("SELECT c FROM Coupon c WHERE UPPER(c.code) = UPPER(:code)")
    Optional<Coupon> findByCode(@Param("code") String code);

    /**
     * Find coupon by code (exact match, case-sensitive)
     */
    Optional<Coupon> findByCodeIgnoreCase(String code);

    /**
     * Check if coupon code exists
     */
    boolean existsByCodeIgnoreCase(String code);

    /**
     * Find all active coupons
     */
    @Query("SELECT c FROM Coupon c WHERE c.isActive = true ORDER BY c.createdAt DESC")
    List<Coupon> findAllActive();

    /**
     * Find all active coupons (paginated)
     */
    @Query("SELECT c FROM Coupon c WHERE c.isActive = true ORDER BY c.createdAt DESC")
    Page<Coupon> findAllActive(Pageable pageable);

    /**
     * Find currently valid coupons (active, within date range, not exhausted)
     */
    @Query("""
        SELECT c FROM Coupon c 
        WHERE c.isActive = true 
        AND c.validFrom <= :now 
        AND c.validTo >= :now 
        AND (c.usageLimit IS NULL OR c.usedCount < c.usageLimit)
        ORDER BY c.discountValue DESC
    """)
    List<Coupon> findCurrentlyValid(@Param("now") LocalDateTime now);

    /**
     * Find valid coupon by code
     */
    @Query("""
        SELECT c FROM Coupon c 
        WHERE UPPER(c.code) = UPPER(:code)
        AND c.isActive = true 
        AND c.validFrom <= :now 
        AND c.validTo >= :now 
        AND (c.usageLimit IS NULL OR c.usedCount < c.usageLimit)
    """)
    Optional<Coupon> findValidByCode(@Param("code") String code, @Param("now") LocalDateTime now);

    /**
     * Find expired coupons
     */
    @Query("SELECT c FROM Coupon c WHERE c.validTo < :now ORDER BY c.validTo DESC")
    List<Coupon> findExpired(@Param("now") LocalDateTime now);

    /**
     * Find expired coupons (paginated)
     */
    @Query("SELECT c FROM Coupon c WHERE c.validTo < :now ORDER BY c.validTo DESC")
    Page<Coupon> findExpired(@Param("now") LocalDateTime now, Pageable pageable);

    /**
     * Find upcoming coupons (not started yet)
     */
    @Query("SELECT c FROM Coupon c WHERE c.validFrom > :now ORDER BY c.validFrom ASC")
    List<Coupon> findUpcoming(@Param("now") LocalDateTime now);

    /**
     * Find coupons expiring soon (within specified days)
     */
    @Query("""
        SELECT c FROM Coupon c 
        WHERE c.isActive = true 
        AND c.validTo BETWEEN :now AND :expiryDate
        ORDER BY c.validTo ASC
    """)
    List<Coupon> findExpiringSoon(@Param("now") LocalDateTime now, @Param("expiryDate") LocalDateTime expiryDate);

    /**
     * Find coupons by discount type
     */
    List<Coupon> findByDiscountType(Coupon.DiscountType discountType);

    /**
     * Find coupons that have reached their usage limit
     */
    @Query("""
        SELECT c FROM Coupon c 
        WHERE c.usageLimit IS NOT NULL 
        AND c.usedCount >= c.usageLimit
        ORDER BY c.updatedAt DESC
    """)
    List<Coupon> findExhausted();

    /**
     * Find coupons with remaining usage
     */
    @Query("""
        SELECT c FROM Coupon c 
        WHERE c.isActive = true 
        AND (c.usageLimit IS NULL OR c.usedCount < c.usageLimit)
        ORDER BY c.createdAt DESC
    """)
    List<Coupon> findWithRemainingUsage();

    /**
     * Search coupons by code or description
     */
    @Query("""
        SELECT c FROM Coupon c 
        WHERE UPPER(c.code) LIKE UPPER(CONCAT('%', :keyword, '%'))
        OR UPPER(c.description) LIKE UPPER(CONCAT('%', :keyword, '%'))
        ORDER BY c.createdAt DESC
    """)
    Page<Coupon> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    /**
     * Find all coupons created by a specific user
     */
    @Query("SELECT c FROM Coupon c WHERE c.createdBy = :createdBy ORDER BY c.createdAt DESC")
    List<Coupon> findByCreatedBy(@Param("createdBy") String createdBy);

    /**
     * Count active coupons
     */
    @Query("SELECT COUNT(c) FROM Coupon c WHERE c.isActive = true")
    long countActive();

    /**
     * Count currently valid coupons
     */
    @Query("""
        SELECT COUNT(c) FROM Coupon c 
        WHERE c.isActive = true 
        AND c.validFrom <= :now 
        AND c.validTo >= :now 
        AND (c.usageLimit IS NULL OR c.usedCount < c.usageLimit)
    """)
    long countCurrentlyValid(@Param("now") LocalDateTime now);

    /**
     * Find coupons within date range
     */
    @Query("""
        SELECT c FROM Coupon c 
        WHERE c.validFrom >= :startDate 
        AND c.validTo <= :endDate
        ORDER BY c.validFrom DESC
    """)
    List<Coupon> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                  @Param("endDate") LocalDateTime endDate);

    /**
     * Find most used coupons (top N)
     */
    @Query("SELECT c FROM Coupon c ORDER BY c.usedCount DESC")
    Page<Coupon> findMostUsed(Pageable pageable);

    /**
     * Get total discount amount given by a specific coupon
     * (requires CouponUsage entity - will be calculated in service layer)
     */
    @Query("SELECT SUM(c.usedCount) FROM Coupon c WHERE c.isActive = true")
    Long getTotalUsageCount();

    /**
     * Find coupons by status (active/inactive)
     */
    Page<Coupon> findByIsActive(Boolean isActive, Pageable pageable);

    /**
     * Delete expired coupons that are not active
     */
    @Query("DELETE FROM Coupon c WHERE c.isActive = false AND c.validTo < :date")
    void deleteExpiredInactive(@Param("date") LocalDateTime date);
}