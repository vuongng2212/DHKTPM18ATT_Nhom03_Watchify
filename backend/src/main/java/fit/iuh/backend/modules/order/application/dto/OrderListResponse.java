package fit.iuh.backend.modules.order.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * DTO for paginated order list response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderListResponse {

    private List<OrderDto> orders;

    private int currentPage;

    private int totalPages;

    private long totalElements;

    private boolean hasNext;

    private boolean hasPrevious;
}