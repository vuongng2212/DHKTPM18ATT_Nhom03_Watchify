package fit.iuh.backend.modules.catalog.application.specification;

import fit.iuh.backend.modules.catalog.application.dto.ProductFilterRequest;
import fit.iuh.backend.modules.catalog.domain.entity.Product;
import fit.iuh.backend.modules.catalog.domain.entity.ProductStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * Specification for dynamic Product queries
 */
public class ProductSpecification {

    /**
     * Build specification from filter request
     */
    public static Specification<Product> filterBy(ProductFilterRequest filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Keyword search (name or description)
            if (filter.getKeyword() != null && !filter.getKeyword().trim().isEmpty()) {
                String likePattern = "%" + filter.getKeyword().toLowerCase() + "%";
                Predicate namePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("name")), likePattern
                );
                Predicate descPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("description")), likePattern
                );
                predicates.add(criteriaBuilder.or(namePredicate, descPredicate));
            }

            // Category filter
            if (filter.getCategoryId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("categoryId"), filter.getCategoryId()));
            }

            // Brand filter
            if (filter.getBrandId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("brandId"), filter.getBrandId()));
            }

            // Price range filter
            if (filter.getMinPrice() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("price"), filter.getMinPrice()));
            }
            if (filter.getMaxPrice() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("price"), filter.getMaxPrice()));
            }

            // Status filter
            if (filter.getStatus() != null && !filter.getStatus().trim().isEmpty()) {
                try {
                    ProductStatus status = ProductStatus.valueOf(filter.getStatus().toUpperCase());
                    predicates.add(criteriaBuilder.equal(root.get("status"), status));
                } catch (IllegalArgumentException e) {
                    // Invalid status, ignore filter
                }
            }

            // Featured filter
            if (filter.getIsFeatured() != null) {
                predicates.add(criteriaBuilder.equal(root.get("isFeatured"), filter.getIsFeatured()));
            }

            // New products filter
            if (filter.getIsNew() != null) {
                predicates.add(criteriaBuilder.equal(root.get("isNew"), filter.getIsNew()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
