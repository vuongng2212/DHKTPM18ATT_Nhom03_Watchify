package fit.iuh.backend.modules.catalog.domain.repository;

import fit.iuh.backend.modules.catalog.domain.entity.Wishlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Wishlist entity.
 * Provides custom query methods for wishlist operations.
 */
@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, UUID> {

    /**
     * Find all wishlist items for a specific user
     *
     * @param userId the user ID
     * @return list of wishlist items
     */
    @Query("SELECT w FROM Wishlist w " +
           "JOIN FETCH w.product p " +
           "WHERE w.user.id = :userId " +
           "ORDER BY w.createdAt DESC")
    List<Wishlist> findByUserId(@Param("userId") UUID userId);

    /**
     * Find all wishlist items for a specific user with pagination
     *
     * @param userId   the user ID
     * @param pageable pagination parameters
     * @return page of wishlist items
     */
    @Query("SELECT w FROM Wishlist w " +
           "WHERE w.user.id = :userId " +
           "ORDER BY w.createdAt DESC")
    Page<Wishlist> findByUserId(@Param("userId") UUID userId, Pageable pageable);

    /**
     * Find a wishlist item by user ID and product ID
     *
     * @param userId    the user ID
     * @param productId the product ID
     * @return optional wishlist item
     */
    @Query("SELECT w FROM Wishlist w " +
           "WHERE w.user.id = :userId AND w.product.id = :productId")
    Optional<Wishlist> findByUserIdAndProductId(
            @Param("userId") UUID userId,
            @Param("productId") UUID productId
    );

    /**
     * Check if a product exists in user's wishlist
     *
     * @param userId    the user ID
     * @param productId the product ID
     * @return true if exists, false otherwise
     */
    @Query("SELECT CASE WHEN COUNT(w) > 0 THEN true ELSE false END " +
           "FROM Wishlist w " +
           "WHERE w.user.id = :userId AND w.product.id = :productId")
    boolean existsByUserIdAndProductId(
            @Param("userId") UUID userId,
            @Param("productId") UUID productId
    );

    /**
     * Delete a wishlist item by user ID and product ID
     *
     * @param userId    the user ID
     * @param productId the product ID
     */
    @Modifying
    @Query("DELETE FROM Wishlist w " +
           "WHERE w.user.id = :userId AND w.product.id = :productId")
    void deleteByUserIdAndProductId(
            @Param("userId") UUID userId,
            @Param("productId") UUID productId
    );

    /**
     * Count wishlist items for a user
     *
     * @param userId the user ID
     * @return count of wishlist items
     */
    @Query("SELECT COUNT(w) FROM Wishlist w WHERE w.user.id = :userId")
    long countByUserId(@Param("userId") UUID userId);

    /**
     * Find all users who have a specific product in their wishlist
     * Useful for notifications when product goes on sale or back in stock
     *
     * @param productId the product ID
     * @return list of wishlist items
     */
    @Query("SELECT w FROM Wishlist w " +
           "JOIN FETCH w.user " +
           "WHERE w.product.id = :productId")
    List<Wishlist> findByProductId(@Param("productId") UUID productId);

    /**
     * Find all wishlist items where user wants to be notified on sale
     *
     * @param productId the product ID
     * @return list of wishlist items
     */
    @Query("SELECT w FROM Wishlist w " +
           "JOIN FETCH w.user " +
           "WHERE w.product.id = :productId AND w.notifyOnSale = true")
    List<Wishlist> findByProductIdAndNotifyOnSaleTrue(@Param("productId") UUID productId);

    /**
     * Find all wishlist items where user wants to be notified when back in stock
     *
     * @param productId the product ID
     * @return list of wishlist items
     */
    @Query("SELECT w FROM Wishlist w " +
           "JOIN FETCH w.user " +
           "WHERE w.product.id = :productId AND w.notifyOnStock = true")
    List<Wishlist> findByProductIdAndNotifyOnStockTrue(@Param("productId") UUID productId);

    /**
     * Delete all wishlist items for a specific product
     * Useful when a product is permanently deleted
     *
     * @param productId the product ID
     */
    @Modifying
    @Query("DELETE FROM Wishlist w WHERE w.product.id = :productId")
    void deleteByProductId(@Param("productId") UUID productId);

    /**
     * Delete all wishlist items for a specific user
     * Useful when a user account is deleted
     *
     * @param userId the user ID
     */
    @Modifying
    @Query("DELETE FROM Wishlist w WHERE w.user.id = :userId")
    void deleteByUserId(@Param("userId") UUID userId);

    /**
     * Get wishlist items with product details for a user
     *
     * @param userId the user ID
     * @return list of wishlist items with full product details
     */
    @Query("SELECT w FROM Wishlist w " +
           "JOIN FETCH w.product p " +
           "WHERE w.user.id = :userId " +
           "ORDER BY w.priority ASC NULLS LAST, w.createdAt DESC")
    List<Wishlist> findByUserIdWithProductDetails(@Param("userId") UUID userId);
}