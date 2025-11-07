package fit.iuh.backend.modules.catalog.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for ProductDetail
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDetailDto {
    private UUID id;
    private String movement;
    private String caseMaterial;
    private String caseDiameter;
    private String caseThickness;
    private String dialColor;
    private String strapMaterial;
    private String strapColor;
    private String waterResistance;
    private String crystal;
    private String weight;
    private String powerReserve;
    private String warranty;
    private String origin;
    private String gender;
    private String additionalFeatures;
}
