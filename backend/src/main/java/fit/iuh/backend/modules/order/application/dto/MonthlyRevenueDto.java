package fit.iuh.backend.modules.order.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyRevenueDto {
    private Integer month;
    private Integer year;
    private BigDecimal totalRevenue;
    private Long orderCount;
    private BigDecimal averageOrderValue;
}
