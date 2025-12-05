package fit.iuh.backend.modules.order.domain.repository;

import fit.iuh.backend.modules.order.domain.entity.Order;
import fit.iuh.backend.modules.order.domain.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository for Order entity.
 */

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    Page<Order> findByUserIdOrderByOrderDateDesc(UUID userId, Pageable pageable);

    List<Order> findByUserIdOrderByOrderDateDesc(UUID userId);

    List<Order> findByStatus(OrderStatus status);

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND o.status = :status ORDER BY o.orderDate DESC")
    List<Order> findByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") OrderStatus status);

    /**
     * Search and filter orders with multiple criteria for admin panel
     * 
     * @param keyword Search in order ID, customer name, or email (case-insensitive)
     * @param status Filter by order status
     * @param paymentMethod Filter by payment method
     * @param fromDateTime Filter orders from this date/time (inclusive)
     * @param toDateTime Filter orders to this date/time (inclusive)
     * @param pageable Pagination and sorting parameters
     * @return Page of filtered orders
     */
    @Query("SELECT o FROM Order o " +
           "LEFT JOIN o.user u " +
           "WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "  LOWER(CAST(o.id AS string)) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "  LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "  LOWER(u.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "  LOWER(u.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "  LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:status IS NULL OR o.status = :status) " +
           "AND (:paymentMethod IS NULL OR :paymentMethod = '' OR LOWER(o.paymentMethod) = LOWER(:paymentMethod)) " +
           "AND (:fromDateTime IS NULL OR o.orderDate >= :fromDateTime) " +
           "AND (:toDateTime IS NULL OR o.orderDate <= :toDateTime)")
    Page<Order> searchOrders(
        @Param("keyword") String keyword,
        @Param("status") OrderStatus status,
        @Param("paymentMethod") String paymentMethod,
        @Param("fromDateTime") LocalDateTime fromDateTime,
        @Param("toDateTime") LocalDateTime toDateTime,
        Pageable pageable
    );
}