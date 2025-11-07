package fit.iuh.backend.modules.catalog.domain.repository;

import fit.iuh.backend.modules.catalog.domain.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for ProductImage entity.
 */
@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, UUID> {

    /**
     * Find all images for a product
     */
    List<ProductImage> findByProductId(UUID productId);

    /**
     * Find all images for a product ordered by display order
     */
    List<ProductImage> findByProductIdOrderByDisplayOrderAsc(UUID productId);

    /**
     * Find main image for a product
     */
    Optional<ProductImage> findByProductIdAndIsMainTrue(UUID productId);

    /**
     * Delete all images for a product
     */
    void deleteByProductId(UUID productId);

    /**
     * Count images for a product
     */
    long countByProductId(UUID productId);
}
