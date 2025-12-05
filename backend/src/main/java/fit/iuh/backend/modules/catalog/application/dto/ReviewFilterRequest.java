package fit.iuh.backend.modules.catalog.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for filtering reviews
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewFilterRequest {
    private String keyword;
    private UUID productId;
    private UUID userId;
    private String status;
    private Integer rating;
    private String sortBy;
    private String sortDirection;
}