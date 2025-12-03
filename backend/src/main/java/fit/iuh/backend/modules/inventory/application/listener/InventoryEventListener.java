package fit.iuh.backend.modules.inventory.application.listener;

import fit.iuh.backend.modules.inventory.application.service.InventoryService;
import fit.iuh.backend.modules.order.domain.entity.Order;
import fit.iuh.backend.modules.order.domain.entity.OrderItem;
import fit.iuh.backend.modules.order.domain.repository.OrderRepository;
import fit.iuh.backend.modules.payment.domain.entity.PaymentStatus;
import fit.iuh.backend.sharedkernel.event.InventoryReservedEvent;
import fit.iuh.backend.sharedkernel.event.OrderCreatedEvent;
import fit.iuh.backend.sharedkernel.event.PaymentCompletedEvent;
import fit.iuh.backend.sharedkernel.event.PaymentFailedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Event listener for inventory-related events.
 * Handles stock reservation and deduction based on order and payment events.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryEventListener {

    private final InventoryService inventoryService;
    private final OrderRepository orderRepository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Handle OrderCreatedEvent - Reserve stock for order items
     * This prevents other customers from purchasing the same items
     * while the payment is being processed.
     *
     * @param event OrderCreatedEvent containing order details
     */
    @EventListener
    @Transactional
    @Async
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Received OrderCreatedEvent for order: {}", event.getOrderId());

        try {
            // Fetch order with items
            Order order = orderRepository.findById(event.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Order not found: " + event.getOrderId()));

            List<OrderItem> orderItems = order.getItems();

            if (orderItems == null || orderItems.isEmpty()) {
                log.warn("Order {} has no items, skipping inventory reservation", event.getOrderId());
                return;
            }

            log.info("Reserving inventory for {} items in order {}", orderItems.size(), event.getOrderId());

            // Reserve stock for each item
            List<InventoryReservedEvent.ReservedItem> reservedItems = orderItems.stream()
                    .map(item -> {
                        try {
                            // Reserve inventory
                            String inventoryId = inventoryService.reserveStock(
                                    item.getProduct().getId(),
                                    item.getQuantity(),
                                    event.getOrderId()
                            );

                            log.debug("Reserved {} units of product {} (inventory: {})",
                                    item.getQuantity(), item.getProduct().getId(), inventoryId);

                            return new InventoryReservedEvent.ReservedItem(
                                    item.getProduct().getId(),
                                    item.getQuantity(),
                                    inventoryId
                            );
                        } catch (Exception e) {
                            log.error("Failed to reserve stock for product {}: {}",
                                    item.getProduct().getId(), e.getMessage());
                            throw new RuntimeException("Stock reservation failed for product: "
                                    + item.getProduct().getName(), e);
                        }
                    })
                    .collect(Collectors.toList());

            // Publish InventoryReservedEvent
            InventoryReservedEvent reservedEvent = new InventoryReservedEvent(
                    event.getOrderId(),
                    event.getUserId(),
                    reservedItems,
                    java.time.LocalDateTime.now()
            );

            eventPublisher.publishEvent(reservedEvent);
            log.info("Successfully reserved inventory for order {} - published InventoryReservedEvent",
                    event.getOrderId());

        } catch (Exception e) {
            log.error("Error handling OrderCreatedEvent for order {}: {}",
                    event.getOrderId(), e.getMessage(), e);

            // In production, you might want to:
            // 1. Update order status to FAILED
            // 2. Send notification to admin
            // 3. Rollback partial reservations
            throw new RuntimeException("Failed to reserve inventory for order: " + event.getOrderId(), e);
        }
    }

    /**
     * Handle PaymentCompletedEvent - Deduct reserved stock from inventory
     * This confirms the stock allocation and makes it permanent.
     *
     * @param event PaymentCompletedEvent containing payment details
     */
    @EventListener
    @Transactional
    @Async
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        log.info("Received PaymentCompletedEvent for order: {}", event.getOrderId());

        try {
            // Fetch order with items
            Order order = orderRepository.findById(event.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Order not found: " + event.getOrderId()));

            List<OrderItem> orderItems = order.getItems();

            if (orderItems == null || orderItems.isEmpty()) {
                log.warn("Order {} has no items, skipping inventory deduction", event.getOrderId());
                return;
            }

            log.info("Deducting inventory for {} items in order {}", orderItems.size(), event.getOrderId());

            // Deduct stock for each item (this confirms the reservation)
            for (OrderItem item : orderItems) {
                try {
                    inventoryService.confirmReservation(
                            item.getProduct().getId(),
                            item.getQuantity(),
                            event.getOrderId()
                    );

                    log.debug("Deducted {} units of product {}",
                            item.getQuantity(), item.getProduct().getId());

                } catch (Exception e) {
                    log.error("Failed to deduct stock for product {}: {}",
                            item.getProduct().getId(), e.getMessage());
                    // Continue with other items, but log the error
                }
            }

            log.info("Successfully deducted inventory for order {} after payment completion",
                    event.getOrderId());

        } catch (Exception e) {
            log.error("Error handling PaymentCompletedEvent for order {}: {}",
                    event.getOrderId(), e.getMessage(), e);

            // In production, this is critical - payment succeeded but inventory not updated
            // You should:
            // 1. Alert admin immediately
            // 2. Queue for retry
            // 3. Manual intervention may be needed
        }
    }

    /**
     * Handle PaymentFailedEvent - Release reserved stock back to inventory
     * This makes the stock available again for other customers.
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
            // Fetch order with items
            Order order = orderRepository.findById(event.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Order not found: " + event.getOrderId()));

            List<OrderItem> orderItems = order.getItems();

            if (orderItems == null || orderItems.isEmpty()) {
                log.warn("Order {} has no items, skipping inventory release", event.getOrderId());
                return;
            }

            log.info("Releasing reserved inventory for {} items in order {}",
                    orderItems.size(), event.getOrderId());

            // Release reserved stock for each item
            for (OrderItem item : orderItems) {
                try {
                    inventoryService.releaseReservedStock(
                            item.getProduct().getId(),
                            item.getQuantity(),
                            event.getOrderId()
                    );

                    log.debug("Released {} units of product {} back to inventory",
                            item.getQuantity(), item.getProduct().getId());

                } catch (Exception e) {
                    log.error("Failed to release stock for product {}: {}",
                            item.getProduct().getId(), e.getMessage());
                    // Continue with other items
                }
            }

            log.info("Successfully released reserved inventory for failed order {}",
                    event.getOrderId());

        } catch (Exception e) {
            log.error("Error handling PaymentFailedEvent for order {}: {}",
                    event.getOrderId(), e.getMessage(), e);

            // In production:
            // 1. Queue for retry
            // 2. Alert admin if retry fails
            // 3. Stock may be stuck in reserved state
        }
    }

    /**
     * Handle order cancellation - Release reserved stock
     * Similar to payment failed, but triggered by user cancellation
     *
     * @param orderId Order ID that was cancelled
     */
    @Transactional
    public void handleOrderCancelled(UUID orderId) {
        log.info("Handling order cancellation for order: {}", orderId);

        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

            List<OrderItem> orderItems = order.getItems();

            if (orderItems == null || orderItems.isEmpty()) {
                log.warn("Order {} has no items, skipping inventory release", orderId);
                return;
            }

            // Release reserved stock
            for (OrderItem item : orderItems) {
                try {
                    inventoryService.releaseReservedStock(
                            item.getProduct().getId(),
                            item.getQuantity(),
                            orderId
                    );

                    log.debug("Released {} units of product {} for cancelled order",
                            item.getQuantity(), item.getProduct().getId());

                } catch (Exception e) {
                    log.error("Failed to release stock for product {}: {}",
                            item.getProduct().getId(), e.getMessage());
                }
            }

            log.info("Successfully released inventory for cancelled order {}", orderId);

        } catch (Exception e) {
            log.error("Error handling order cancellation for order {}: {}",
                    orderId, e.getMessage(), e);
        }
    }
}