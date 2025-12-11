package fit.iuh.backend.modules.order.domain.repository;

import fit.iuh.backend.modules.order.domain.entity.Order;
import fit.iuh.backend.modules.order.domain.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for Order entity.
 */
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    Page<Order> findByUserIdOrderByOrderDateDesc(UUID userId, Pageable pageable);

    List<Order> findByUserIdOrderByOrderDateDesc(UUID userId);

    List<Order> findByStatus(OrderStatus status);

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND o.status = :status ORDER BY o.orderDate DESC")
    List<Order> findByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") OrderStatus status);

    /**
     * Get monthly revenue data for a specific year.
     * Returns: month, year, totalRevenue, orderCount, averageOrderValue
     */
    @Query(value = """
        SELECT 
            MONTH(o.order_date) as month,
            YEAR(o.order_date) as year,
            CAST(SUM(CASE WHEN o.status != 'CANCELLED' THEN o.total_amount ELSE 0 END) AS DECIMAL(15,2)) as totalRevenue,
            COUNT(*) as orderCount,
            CAST(AVG(CASE WHEN o.status != 'CANCELLED' THEN o.total_amount ELSE 0 END) AS DECIMAL(15,2)) as averageOrderValue
        FROM orders o
        WHERE YEAR(o.order_date) = :year
        GROUP BY YEAR(o.order_date), MONTH(o.order_date)
        ORDER BY YEAR(o.order_date), MONTH(o.order_date)
        """, nativeQuery = true)
    List<Object[]> findMonthlyRevenueByYear(@Param("year") Integer year);

    /**
     * Get yearly revenue statistics for a specific year.
     * Returns: totalRevenue, totalOrders
     */
    @Query(value = """
        SELECT 
            CAST(SUM(CASE WHEN o.status != 'CANCELLED' THEN o.total_amount ELSE 0 END) AS DECIMAL(15,2)) as totalRevenue,
            COUNT(*) as totalOrders
        FROM orders o
        WHERE YEAR(o.order_date) = :year
        """, nativeQuery = true)
    Object[] findYearlyRevenueStats(@Param("year") Integer year);
}