package fit.iuh.backend.modules.catalog.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for paginated product list
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductListResponse {
    private List<ProductDto> products;
    private Integer currentPage;
    private Integer totalPages;
    private Long totalElements;
    private Integer pageSize;
    private Boolean hasNext;
    private Boolean hasPrevious;
}
