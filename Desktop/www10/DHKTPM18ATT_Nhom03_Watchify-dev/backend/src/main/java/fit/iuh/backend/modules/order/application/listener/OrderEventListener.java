package fit.iuh.backend.modules.order.application.listener;

import fit.iuh.backend.modules.order.domain.entity.Order;
import fit.iuh.backend.modules.order.domain.entity.OrderStatus;
import fit.iuh.backend.modules.order.domain.repository.OrderRepository;
import fit.iuh.backend.sharedkernel.event.PaymentCompletedEvent;
import fit.iuh.backend.sharedkernel.event.PaymentFailedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Event listener for order-related events.
 * Handles order status updates based on payment events.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventListener {

    private final OrderRepository orderRepository;

    /**
     * Handle PaymentCompletedEvent - Update order status to CONFIRMED
     * When payment is successful, the order is confirmed and ready for processing.
     *
     * @param event PaymentCompletedEvent containing payment details
     */
    @EventListener
    @Transactional
    @Async
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        log.info("Received PaymentCompletedEvent for order: {}", event.getOrderId());

        try {
            // Fetch order
            Order order = orderRepository.findById(event.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Order not found: " + event.getOrderId()));

            // Check current status
            if (order.getStatus() == OrderStatus.CANCELLED) {
                log.warn("Cannot confirm cancelled order: {}", event.getOrderId());
                return;
            }

            if (order.getStatus() == OrderStatus.CONFIRMED) {
                log.info("Order {} is already confirmed, skipping update", event.getOrderId());
                return;
            }

            // Update order status to CONFIRMED
            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);

            log.info("Successfully updated order {} status to CONFIRMED after payment completion",
                    event.getOrderId());

            // In production, you might also:
            // 1. Send confirmation email to customer
            // 2. Notify warehouse/fulfillment team
            // 3. Update customer's order history
            // 4. Trigger shipping workflow

        } catch (Exception e) {
            log.error("Error handling PaymentCompletedEvent for order {}: {}",
                    event.getOrderId(), e.getMessage(), e);

            // In production:
            // 1. Alert admin - critical issue
            // 2. Queue for retry
            // 3. Manual intervention may be required
            throw new RuntimeException("Failed to update order status after payment completion", e);
        }
    }

    /**
     * Handle PaymentFailedEvent - Update order status to CANCELLED
     * When payment fails, the order is automatically cancelled.
     *
     * @param event PaymentFailedEvent containing failure details
     */
    @EventListener
    @Transactional
    @Async
    public void handlePaymentFailed(PaymentFailedEvent event) {
        log.info("Received PaymentFailedEvent for order: {} - Reason: {}",
                event.getOrderId(), event.getFailureReason());

        try {
            // Fetch order
            Order order = orderRepository.findById(event.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Order not found: " + event.getOrderId()));

            // Check current status
            if (order.getStatus() == OrderStatus.CANCELLED) {
                log.info("Order {} is already cancelled, skipping update", event.getOrderId());
                return;
            }

            if (order.getStatus() == OrderStatus.CONFIRMED) {
                log.warn("Order {} is already confirmed, cannot cancel due to payment failure", 
                        event.getOrderId());
                return;
            }

            // Update order status to CANCELLED
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);

            log.info("Successfully updated order {} status to CANCELLED after payment failure",
                    event.getOrderId());

            // In production, you might also:
            // 1. Send payment failure notification to customer
            // 2. Suggest alternative payment methods
            // 3. Log reason for analytics
            // 4. Offer to retry payment

        } catch (Exception e) {
            log.error("Error handling PaymentFailedEvent for order {}: {}",
                    event.getOrderId(), e.getMessage(), e);

            // In production:
            // 1. Queue for retry
            // 2. Alert admin if critical
            // 3. Ensure inventory gets released (handled by InventoryEventListener)
        }
    }

    /**
     * Manual method to update order status
     * Can be used by admin or other services
     *
     * @param orderId Order ID to update
     * @param newStatus New status to set
     */
    @Transactional
    public void updateOrderStatus(java.util.UUID orderId, OrderStatus newStatus) {
        log.info("Manually updating order {} status to {}", orderId, newStatus);

        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

            OrderStatus oldStatus = order.getStatus();
            order.setStatus(newStatus);
            orderRepository.save(order);

            log.info("Successfully updated order {} status from {} to {}",
                    orderId, oldStatus, newStatus);

        } catch (Exception e) {
            log.error("Error updating order {} status to {}: {}",
                    orderId, newStatus, e.getMessage(), e);
            throw new RuntimeException("Failed to update order status", e);
        }
    }

    /**
     * Handle order shipped event (for future use)
     *
     * @param orderId Order ID that was shipped
     */
    @Transactional
    public void handleOrderShipped(java.util.UUID orderId) {
        log.info("Handling order shipped for order: {}", orderId);

        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

            if (order.getStatus() != OrderStatus.CONFIRMED) {
                log.warn("Cannot ship order {} with status {}", orderId, order.getStatus());
                return;
            }

            order.setStatus(OrderStatus.PROCESSING);
            orderRepository.save(order);

            log.info("Successfully updated order {} status to PROCESSING (shipped)", orderId);

            // In production:
            // 1. Send tracking number to customer
            // 2. Update delivery estimate
            // 3. Trigger delivery tracking

        } catch (Exception e) {
            log.error("Error handling order shipped for order {}: {}",
                    orderId, e.getMessage(), e);
        }
    }

    /**
     * Handle order delivered event (for future use)
     *
     * @param orderId Order ID that was delivered
     */
    @Transactional
    public void handleOrderDelivered(java.util.UUID orderId) {
        log.info("Handling order delivered for order: {}", orderId);

        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

            if (order.getStatus() != OrderStatus.PROCESSING) {
                log.warn("Cannot mark order {} as delivered with status {}", orderId, order.getStatus());
                return;
            }

            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);

            log.info("Successfully marked order {} as delivered", orderId);

            // In production:
            // 1. Send delivery confirmation to customer
            // 2. Request review/rating
            // 3. Update customer loyalty points
            // 4. Mark as completed in accounting

        } catch (Exception e) {
            log.error("Error handling order delivered for order {}: {}",
                    orderId, e.getMessage(), e);
        }
    }
}