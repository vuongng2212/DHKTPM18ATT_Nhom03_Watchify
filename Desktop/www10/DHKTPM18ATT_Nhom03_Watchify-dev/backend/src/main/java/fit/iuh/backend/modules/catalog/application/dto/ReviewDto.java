package fit.iuh.backend.modules.catalog.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for Review
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDto {
    private UUID id;
    private UUID productId;
    private UUID userId;
    private String userFullName;
    private Integer rating;
    private String title;
    private String content;
    private String status;
    private Integer helpfulCount;
    private LocalDateTime createdAt;
}
