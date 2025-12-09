package fit.iuh.backend.modules.catalog.domain.repository;

import fit.iuh.backend.modules.catalog.domain.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Brand entity.
 */
@Repository
public interface BrandRepository extends JpaRepository<Brand, UUID> {

    /**
     * Find brand by slug
     */
    Optional<Brand> findBySlug(String slug);

    /**
     * Find brand by name
     */
    Optional<Brand> findByName(String name);

    /**
     * Find all active brands
     */
    List<Brand> findByIsActiveTrue();

    /**
     * Find all brands ordered by display order
     */
    List<Brand> findAllByOrderByDisplayOrderAsc();

    /**
     * Check if slug exists
     */
    boolean existsBySlug(String slug);

    /**
     * Check if name exists
     */
    boolean existsByName(String name);
}
