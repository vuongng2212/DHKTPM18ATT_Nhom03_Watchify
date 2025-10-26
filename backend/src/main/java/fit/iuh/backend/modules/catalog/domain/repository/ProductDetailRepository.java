package fit.iuh.backend.modules.catalog.domain.repository;

import fit.iuh.backend.modules.catalog.domain.entity.ProductDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for ProductDetail entity.
 */
@Repository
public interface ProductDetailRepository extends JpaRepository<ProductDetail, UUID> {

    /**
     * Find product detail by product ID
     */
    Optional<ProductDetail> findByProductId(UUID productId);

    /**
     * Delete product detail by product ID
     */
    void deleteByProductId(UUID productId);

    /**
     * Check if product detail exists for a product
     */
    boolean existsByProductId(UUID productId);
}
