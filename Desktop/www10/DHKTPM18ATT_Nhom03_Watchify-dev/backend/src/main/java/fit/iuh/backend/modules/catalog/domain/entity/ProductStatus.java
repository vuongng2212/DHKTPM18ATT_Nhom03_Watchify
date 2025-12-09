package fit.iuh.backend.modules.catalog.domain.entity;

/**
 * Enum representing product status.
 */
public enum ProductStatus {
    ACTIVE,      // Product is available for sale
    INACTIVE,    // Product is temporarily unavailable
    OUT_OF_STOCK,// Product is out of stock
    DISCONTINUED // Product is no longer sold
}
