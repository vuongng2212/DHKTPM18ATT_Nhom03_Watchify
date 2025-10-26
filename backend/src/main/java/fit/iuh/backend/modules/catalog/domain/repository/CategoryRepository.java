package fit.iuh.backend.modules.catalog.domain.repository;

import fit.iuh.backend.modules.catalog.domain.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Category entity.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    /**
     * Find category by slug
     */
    Optional<Category> findBySlug(String slug);

    /**
     * Find all root categories (no parent)
     */
    List<Category> findByParentIdIsNull();

    /**
     * Find all child categories of a parent
     */
    List<Category> findByParentId(UUID parentId);

    /**
     * Find all active categories
     */
    List<Category> findByIsActiveTrue();

    /**
     * Find all active root categories
     */
    List<Category> findByParentIdIsNullAndIsActiveTrue();

    /**
     * Check if slug exists
     */
    boolean existsBySlug(String slug);
}
