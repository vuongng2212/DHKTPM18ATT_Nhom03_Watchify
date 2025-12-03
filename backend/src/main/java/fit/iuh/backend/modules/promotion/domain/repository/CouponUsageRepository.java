package fit.iuh.backend.modules.promotion.domain.repository;

import fit.iuh.backend.modules.promotion.domain.entity.Coupon;
import fit.iuh.backend.modules.promotion.domain.entity.CouponUsage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for CouponUsage entity
 * 
 * Provides methods for:
 * - Tracking coupon redemptions per user
 * - Enforcing per-user usage limits
 * - Analytics and reporting
 * - Audit trail
 * 
 * @author Watchify Team
 */
@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, UUID> {

    /**
     * Find all usages of a specific coupon
     */
    @Query("SELECT cu FROM CouponUsage cu WHERE cu.coupon.id = :couponId ORDER BY cu.usedAt DESC")
    List<CouponUsage> findByCouponId(@Param("couponId") UUID couponId);

    /**
     * Find all usages of a specific coupon (paginated)
     */
    @Query("SELECT cu FROM CouponUsage cu WHERE cu.coupon.id = :couponId ORDER BY cu.usedAt DESC")
    Page<CouponUsage> findByCouponId(@Param("couponId") UUID couponId, Pageable pageable);

    /**
     * Find all coupons used by a specific user
     */
    @Query("SELECT cu FROM CouponUsage cu WHERE cu.user.id = :userId ORDER BY cu.usedAt DESC")
    List<CouponUsage> findByUserId(@Param("userId") UUID userId);

    /**
     * Find all coupons used by a specific user (paginated)
     */
    @Query("SELECT cu FROM CouponUsage cu WHERE cu.user.id = :userId ORDER BY cu.usedAt DESC")
    Page<CouponUsage> findByUserId(@Param("userId") UUID userId, Pageable pageable);

    /**
     * Find coupon usage for a specific order
     */
    @Query("SELECT cu FROM CouponUsage cu WHERE cu.order.id = :orderId")
    Optional<CouponUsage> findByOrderId(@Param("orderId") UUID orderId);

    /**
     * Count how many times a user has used a specific coupon
     */
    @Query("SELECT COUNT(cu) FROM CouponUsage cu WHERE cu.user.id = :userId AND cu.coupon.id = :couponId")
    long countByUserIdAndCouponId(@Param("userId") UUID userId, @Param("couponId") UUID couponId);

    /**
     * Count how many times a specific coupon has been used
     */
    @Query("SELECT COUNT(cu) FROM CouponUsage cu WHERE cu.coupon.id = :couponId")
    long countByCouponId(@Param("couponId") UUID couponId);

    /**
     * Check if user has already used a specific coupon
     */
    @Query("SELECT CASE WHEN COUNT(cu) > 0 THEN true ELSE false END FROM CouponUsage cu WHERE cu.user.id = :userId AND cu.coupon.id = :couponId")
    boolean hasUserUsedCoupon(@Param("userId") UUID userId, @Param("couponId") UUID couponId);

    /**
     * Find usage by user and coupon
     */
    @Query("SELECT cu FROM CouponUsage cu WHERE cu.user.id = :userId AND cu.coupon.id = :couponId ORDER BY cu.usedAt DESC")
    List<CouponUsage> findByUserIdAndCouponId(@Param("userId") UUID userId, @Param("couponId") UUID couponId);

    /**
     * Calculate total discount amount for a specific coupon
     */
    @Query("SELECT COALESCE(SUM(cu.discountAmount), 0) FROM CouponUsage cu WHERE cu.coupon.id = :couponId")
    BigDecimal calculateTotalDiscountByCoupon(@Param("couponId") UUID couponId);

    /**
     * Calculate total discount amount for a specific user
     */
    @Query("SELECT COALESCE(SUM(cu.discountAmount), 0) FROM CouponUsage cu WHERE cu.user.id = :userId")
    BigDecimal calculateTotalDiscountByUser(@Param("userId") UUID userId);

    /**
     * Find recent coupon usages (last N days)
     */
    @Query("SELECT cu FROM CouponUsage cu WHERE cu.usedAt >= :startDate ORDER BY cu.usedAt DESC")
    List<CouponUsage> findRecentUsages(@Param("startDate") LocalDateTime startDate);

    /**
     * Find recent coupon usages (paginated)
     */
    @Query("SELECT cu FROM CouponUsage cu WHERE cu.usedAt >= :startDate ORDER BY cu.usedAt DESC")
    Page<CouponUsage> findRecentUsages(@Param("startDate") LocalDateTime startDate, Pageable pageable);

    /**
     * Find usages within date range
     */
    @Query("SELECT cu FROM CouponUsage cu WHERE cu.usedAt BETWEEN :startDate AND :endDate ORDER BY cu.usedAt DESC")
    List<CouponUsage> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                       @Param("endDate") LocalDateTime endDate);

    /**
     * Find usages within date range (paginated)
     */
    @Query("SELECT cu FROM CouponUsage cu WHERE cu.usedAt BETWEEN :startDate AND :endDate ORDER BY cu.usedAt DESC")
    Page<CouponUsage> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                       @Param("endDate") LocalDateTime endDate,
                                       Pageable pageable);

    /**
     * Get most popular coupons (by usage count)
     */
    @Query("""
        SELECT cu.coupon, COUNT(cu) as usageCount 
        FROM CouponUsage cu 
        GROUP BY cu.coupon 
        ORDER BY usageCount DESC
    """)
    Page<Object[]> findMostPopularCoupons(Pageable pageable);

    /**
     * Get top users by total savings
     */
    @Query("""
        SELECT cu.user, SUM(cu.discountAmount) as totalSavings 
        FROM CouponUsage cu 
        GROUP BY cu.user 
        ORDER BY totalSavings DESC
    """)
    Page<Object[]> findTopUsersBySavings(Pageable pageable);

    /**
     * Calculate total discount given in a date range
     */
    @Query("SELECT COALESCE(SUM(cu.discountAmount), 0) FROM CouponUsage cu WHERE cu.usedAt BETWEEN :startDate AND :endDate")
    BigDecimal calculateTotalDiscountInRange(@Param("startDate") LocalDateTime startDate, 
                                              @Param("endDate") LocalDateTime endDate);

    /**
     * Count total usages in a date range
     */
    @Query("SELECT COUNT(cu) FROM CouponUsage cu WHERE cu.usedAt BETWEEN :startDate AND :endDate")
    long countUsagesInRange(@Param("startDate") LocalDateTime startDate, 
                            @Param("endDate") LocalDateTime endDate);

    /**
     * Get average discount amount
     */
    @Query("SELECT AVG(cu.discountAmount) FROM CouponUsage cu")
    BigDecimal getAverageDiscountAmount();

    /**
     * Get average discount amount for a specific coupon
     */
    @Query("SELECT AVG(cu.discountAmount) FROM CouponUsage cu WHERE cu.coupon.id = :couponId")
    BigDecimal getAverageDiscountByCoupon(@Param("couponId") UUID couponId);

    /**
     * Find usages by IP address (fraud detection)
     */
    @Query("SELECT cu FROM CouponUsage cu WHERE cu.ipAddress = :ipAddress ORDER BY cu.usedAt DESC")
    List<CouponUsage> findByIpAddress(@Param("ipAddress") String ipAddress);

    /**
     * Count usages from same IP in date range (fraud detection)
     */
    @Query("SELECT COUNT(cu) FROM CouponUsage cu WHERE cu.ipAddress = :ipAddress AND cu.usedAt >= :startDate")
    long countByIpAddressSince(@Param("ipAddress") String ipAddress, @Param("startDate") LocalDateTime startDate);

    /**
     * Delete usages for a specific order (when order is cancelled)
     */
    @Query("DELETE FROM CouponUsage cu WHERE cu.order.id = :orderId")
    void deleteByOrderId(@Param("orderId") UUID orderId);

    /**
     * Find all usages by coupon code
     */
    @Query("SELECT cu FROM CouponUsage cu WHERE cu.coupon.code = :code ORDER BY cu.usedAt DESC")
    List<CouponUsage> findByCouponCode(@Param("code") String code);

    /**
     * Get total number of unique users who used coupons
     */
    @Query("SELECT COUNT(DISTINCT cu.user.id) FROM CouponUsage cu")
    long countUniqueUsers();

    /**
     * Get total number of unique users who used a specific coupon
     */
    @Query("SELECT COUNT(DISTINCT cu.user.id) FROM CouponUsage cu WHERE cu.coupon.id = :couponId")
    long countUniqueUsersByCoupon(@Param("couponId") UUID couponId);

    /**
     * Check if order has coupon applied
     */
    @Query("SELECT CASE WHEN COUNT(cu) > 0 THEN true ELSE false END FROM CouponUsage cu WHERE cu.order.id = :orderId")
    boolean orderHasCoupon(@Param("orderId") UUID orderId);
}