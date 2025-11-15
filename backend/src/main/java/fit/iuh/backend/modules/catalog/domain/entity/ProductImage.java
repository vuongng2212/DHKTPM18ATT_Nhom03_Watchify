package fit.iuh.backend.modules.catalog.domain.entity;

import fit.iuh.backend.sharedkernel.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Entity representing product images.
 */
@Entity
@Table(name = "product_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImage extends BaseEntity {

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "alt_text", length = 255)
    private String altText;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "is_main")
    @Builder.Default
    private Boolean isMain = false;  // Main product image

    /**
     * Check if this is the main product image
     */
    public boolean isMainImage() {
        return Boolean.TRUE.equals(isMain);
    }
}
