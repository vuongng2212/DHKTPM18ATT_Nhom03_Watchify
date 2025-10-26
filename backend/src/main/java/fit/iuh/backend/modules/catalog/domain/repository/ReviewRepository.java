package fit.iuh.backend.modules.catalog.domain.repository;

import fit.iuh.backend.modules.catalog.domain.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for Review entity.
 */
@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    /**
     * Find all reviews for a product
     */
    List<Review> findByProductId(UUID productId);

    /**
     * Find all approved reviews for a product
     */
    List<Review> findByProductIdAndStatus(UUID productId, String status);

    /**
     * Find all reviews by a user
     */
    List<Review> findByUserId(UUID userId);

    /**
     * Find pending reviews (for admin)
     */
    List<Review> findByStatus(String status);

    /**
     * Get average rating for a product
     */
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.productId = :productId AND r.status = 'APPROVED'")
    Double getAverageRating(@Param("productId") UUID productId);

    /**
     * Count approved reviews for a product
     */
    long countByProductIdAndStatus(UUID productId, String status);

    /**
     * Check if user has reviewed a product
     */
    boolean existsByProductIdAndUserId(UUID productId, UUID userId);
}
