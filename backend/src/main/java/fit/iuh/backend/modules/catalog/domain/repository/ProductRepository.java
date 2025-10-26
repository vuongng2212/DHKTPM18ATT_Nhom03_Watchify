package fit.iuh.backend.modules.catalog.domain.repository;

import fit.iuh.backend.modules.catalog.domain.entity.Product;
import fit.iuh.backend.modules.catalog.domain.entity.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Product entity.
 * Extends JpaSpecificationExecutor for dynamic query support.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {

    /**
     * Find product by slug
     */
    Optional<Product> findBySlug(String slug);

    /**
     * Find product by SKU
     */
    Optional<Product> findBySku(String sku);

    /**
     * Find all products by status
     */
    List<Product> findByStatus(ProductStatus status);

    /**
     * Find all products by category
     */
    List<Product> findByCategoryId(UUID categoryId);

    /**
     * Find all products by brand
     */
    List<Product> findByBrandId(UUID brandId);

    /**
     * Find featured products
     */
    List<Product> findByIsFeaturedTrueAndStatus(ProductStatus status);

    /**
     * Find new products
     */
    List<Product> findByIsNewTrueAndStatus(ProductStatus status);

    /**
     * Search products by name or description
     */
    @Query("SELECT p FROM Product p WHERE " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "p.status = :status")
    List<Product> searchByKeyword(@Param("keyword") String keyword, @Param("status") ProductStatus status);

    /**
     * Check if SKU exists
     */
    boolean existsBySku(String sku);
}
