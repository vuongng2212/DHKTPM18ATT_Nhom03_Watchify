package fit.iuh.backend.modules.order.application.dto;

import fit.iuh.backend.modules.order.domain.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for filtering orders with multiple criteria
 * Used in admin panel to search and filter orders
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderFilterRequest {
    
    /**
     * Keyword to search in order ID, customer name, or email
     */
    private String keyword;
    
    /**
     * Filter by order status
     */
    private OrderStatus status;
    
    /**
     * Filter by payment method (e.g., "COD", "VNPAY", "MOMO")
     */
    private String paymentMethod;
    
    /**
     * Filter orders from this date (inclusive)
     */
    private LocalDate fromDate;
    
    /**
     * Filter orders to this date (inclusive)
     */
    private LocalDate toDate;
    
    /**
     * Sort field (e.g., "orderDate", "totalAmount")
     * Default: "orderDate"
     */
    private String sortBy;
    
    /**
     * Sort direction ("asc" or "desc")
     * Default: "desc"
     */
    private String sortDirection;
}