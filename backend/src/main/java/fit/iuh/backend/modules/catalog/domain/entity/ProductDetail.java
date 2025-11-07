package fit.iuh.backend.modules.catalog.domain.entity;

import fit.iuh.backend.sharedkernel.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Entity representing detailed specifications of a watch product.
 */
@Entity
@Table(name = "product_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDetail extends BaseEntity {

    @Column(name = "product_id", nullable = false, unique = true)
    private UUID productId;

    @Column(name = "movement", length = 100)
    private String movement;  // Quartz, Automatic, Manual, etc.

    @Column(name = "case_material", length = 100)
    private String caseMaterial;  // Stainless Steel, Gold, Titanium, etc.

    @Column(name = "case_diameter", length = 50)
    private String caseDiameter;  // e.g., "40mm"

    @Column(name = "case_thickness", length = 50)
    private String caseThickness;  // e.g., "12mm"

    @Column(name = "dial_color", length = 50)
    private String dialColor;  // Black, White, Blue, etc.

    @Column(name = "strap_material", length = 100)
    private String strapMaterial;  // Leather, Stainless Steel, Rubber, etc.

    @Column(name = "strap_color", length = 50)
    private String strapColor;

    @Column(name = "water_resistance", length = 50)
    private String waterResistance;  // e.g., "50m", "100m", "200m"

    @Column(name = "crystal", length = 100)
    private String crystal;  // Sapphire, Mineral, Acrylic

    @Column(name = "weight", length = 50)
    private String weight;  // e.g., "150g"

    @Column(name = "power_reserve", length = 50)
    private String powerReserve;  // For automatic watches

    @Column(name = "warranty", length = 100)
    private String warranty;  // e.g., "2 years international warranty"

    @Column(name = "origin", length = 100)
    private String origin;  // Country of manufacture

    @Column(name = "gender", length = 20)
    private String gender;  // Men, Women, Unisex

    @Column(name = "additional_features", columnDefinition = "TEXT")
    private String additionalFeatures;  // Chronograph, Date display, etc.
}
