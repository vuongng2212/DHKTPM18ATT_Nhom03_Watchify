package fit.iuh.backend.modules.catalog.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for Brand
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandDto {
    private UUID id;
    private String name;
    private String slug;
    private String description;
    private String logoUrl;
    private String websiteUrl;
    private Boolean isActive;
    private Integer displayOrder;
}
