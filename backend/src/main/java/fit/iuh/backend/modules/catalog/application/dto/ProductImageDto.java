package fit.iuh.backend.modules.catalog.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for ProductImage
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductImageDto {
    private UUID id;
    private String imageUrl;
    private String altText;
    private Integer displayOrder;
    private Boolean isMain;
}
