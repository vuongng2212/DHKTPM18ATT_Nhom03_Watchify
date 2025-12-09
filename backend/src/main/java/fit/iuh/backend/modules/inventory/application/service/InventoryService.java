package fit.iuh.backend.modules.inventory.application.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fit.iuh.backend.modules.inventory.application.dto.InventoryDto;
import fit.iuh.backend.modules.inventory.domain.entity.Inventory;
import fit.iuh.backend.modules.inventory.domain.repository.InventoryRepository;
import fit.iuh.backend.modules.order.domain.entity.Order;
import fit.iuh.backend.modules.order.domain.entity.OrderItem;
import fit.iuh.backend.modules.order.domain.repository.OrderRepository;
import fit.iuh.backend.sharedkernel.event.OrderCreatedEvent;
import fit.iuh.backend.sharedkernel.event.PaymentSuccessEvent;
import fit.iuh.backend.sharedkernel.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for Inventory operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final OrderRepository orderRepository;

    /**
     * Get all inventories
     */
    public List<InventoryDto> getAllInventories() {
        List<Inventory> inventories = inventoryRepository.findAll();
        return inventories.stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    /**
     * Get inventory by product ID
     */
    public InventoryDto getInventoryByProductId(UUID productId) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product: " + productId));

        return mapToDto(inventory);
    }

    /**
     * Check if product is in stock
     */
    public boolean isInStock(UUID productId) {
        return inventoryRepository.getAvailableQuantity(productId)
            .map(available -> available > 0)
            .orElse(false);
    }

    /**
     * Get available quantity for product
     */
    public Integer getAvailableQuantity(UUID productId) {
        return inventoryRepository.getAvailableQuantity(productId)
            .orElse(0);
    }

    /**
     * Reserve quantity for order
     */
    @Transactional
    public boolean reserveQuantity(UUID productId, Integer quantity) {
        int updatedRows = inventoryRepository.reserveQuantity(productId, quantity);
        if (updatedRows > 0) {
            log.info("Reserved {} units for product {}", quantity, productId);
            return true;
        }
        log.warn("Failed to reserve {} units for product {} - insufficient inventory", quantity, productId);
        return false;
    }

    /**
     * Release reserved quantity
     */
    @Transactional
    public boolean releaseQuantity(UUID productId, Integer quantity) {
        int updatedRows = inventoryRepository.releaseQuantity(productId, quantity);
        if (updatedRows > 0) {
            log.info("Released {} reserved units for product {}", quantity, productId);
            return true;
        }
        log.warn("Failed to release {} units for product {}", quantity, productId);
        return false;
    }

    /**
     * Confirm reservation (reduce actual quantity)
     */
    @Transactional
    public boolean confirmReservation(UUID productId, Integer quantity) {
        int updatedRows = inventoryRepository.confirmReservation(productId, quantity);
        if (updatedRows > 0) {
            log.info("Confirmed reservation of {} units for product {}", quantity, productId);
            return true;
        }
        log.warn("Failed to confirm reservation of {} units for product {}", quantity, productId);
        return false;
    }

    /**
     * Add quantity to inventory
     */
    @Transactional
    public boolean addQuantity(UUID productId, Integer quantity) {
        int updatedRows = inventoryRepository.addQuantity(productId, quantity);
        if (updatedRows > 0) {
            log.info("Added {} units to inventory for product {}", quantity, productId);
            return true;
        }
        log.warn("Failed to add {} units to inventory for product {}", quantity, productId);
        return false;
    }

    /**
     * Reduce quantity from inventory
     */
    @Transactional
    public boolean reduceQuantity(UUID productId, Integer quantity) {
        int updatedRows = inventoryRepository.reduceQuantity(productId, quantity);
        if (updatedRows > 0) {
            log.info("Reduced {} units from inventory for product {}", quantity, productId);
            return true;
        }
        log.warn("Failed to reduce {} units from inventory for product {}", quantity, productId);
        return false;
    }

    /**
     * Create or update inventory for product
     */
    @Transactional
    public InventoryDto createOrUpdateInventory(UUID productId, Integer quantity, String location) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
            .orElse(Inventory.builder()
                .product(null) // Will be set by controller
                .quantity(0)
                .reservedQuantity(0)
                .location(location)
                .build());

        inventory.setQuantity(quantity);
        inventory.setLocation(location);

        Inventory saved = inventoryRepository.save(inventory);
        log.info("Created/updated inventory for product {}: {} units", productId, quantity);

        return mapToDto(saved);
    }

    /**
     * Reserve stock for an order (used by InventoryEventListener)
     * Returns the inventory ID if successful
     *
     * @param productId Product ID
     * @param quantity Quantity to reserve
     * @param orderId Order ID for tracking
     * @return Inventory UUID
     */
    @Transactional
    public String reserveStock(UUID productId, Integer quantity, UUID orderId) {
        log.info("Reserving {} units of product {} for order {}", quantity, productId, orderId);
        
        Inventory inventory = inventoryRepository.findByProductId(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product: " + productId));

        // Check if enough stock available
        if (inventory.getAvailableQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock for product " + productId + 
                ". Available: " + inventory.getAvailableQuantity() + ", Requested: " + quantity);
        }

        // Reserve the stock
        boolean reserved = reserveQuantity(productId, quantity);
        if (!reserved) {
            throw new RuntimeException("Failed to reserve stock for product: " + productId);
        }

        log.info("Successfully reserved {} units of product {} for order {}", quantity, productId, orderId);
        return inventory.getId();
    }

    /**
     * Confirm reservation after payment success (deduct from actual quantity)
     *
     * @param productId Product ID
     * @param quantity Quantity to confirm
     * @param orderId Order ID for tracking
     */
    @Transactional
    public void confirmReservation(UUID productId, Integer quantity, UUID orderId) {
        log.info("Confirming reservation of {} units of product {} for order {}", quantity, productId, orderId);
        
        boolean confirmed = confirmReservation(productId, quantity);
        if (!confirmed) {
            throw new RuntimeException("Failed to confirm reservation for product: " + productId);
        }

        log.info("Successfully confirmed reservation of {} units of product {} for order {}", 
            quantity, productId, orderId);
    }

    /**
     * Release reserved stock (used when payment fails or order is cancelled)
     *
     * @param productId Product ID
     * @param quantity Quantity to release
     * @param orderId Order ID for tracking
     */
    @Transactional
    public void releaseReservedStock(UUID productId, Integer quantity, UUID orderId) {
        log.info("Releasing reserved {} units of product {} for order {}", quantity, productId, orderId);
        
        boolean released = releaseQuantity(productId, quantity);
        if (!released) {
            log.error("Failed to release reserved stock for product {}", productId);
            throw new RuntimeException("Failed to release reserved stock for product: " + productId);
        }

        log.info("Successfully released {} units of product {} for order {}", quantity, productId, orderId);
    }

    /**
     * Handle OrderCreatedEvent: Reserve stock for order items
     */
    @EventListener
    @Transactional
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Handling OrderCreatedEvent for order: {}", event.getOrderId());

        Order order = orderRepository.findById(event.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + event.getOrderId()));

        boolean allReserved = true;
        for (OrderItem item : order.getItems()) {
            UUID productId = item.getProduct().getId();
            Integer quantity = item.getQuantity();

            if (!reserveQuantity(productId, quantity)) {
                allReserved = false;
                log.error("Failed to reserve stock for product {} in order {}", productId, event.getOrderId());
                // TODO: Handle reservation failure - could cancel order or notify
            }
        }

        if (allReserved) {
            log.info("Successfully reserved stock for all items in order {}", event.getOrderId());
        } else {
            log.warn("Partial reservation failure for order {}", event.getOrderId());
        }
    }

    /**
     * Handle PaymentSuccessEvent: Confirm reservations and deduct stock
     */
    @EventListener
    @Transactional
    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        log.info("Handling PaymentSuccessEvent for order: {}", event.getOrderId());

        Order order = orderRepository.findById(event.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + event.getOrderId()));

        boolean allConfirmed = true;
        for (OrderItem item : order.getItems()) {
            UUID productId = item.getProduct().getId();
            Integer quantity = item.getQuantity();

            if (!confirmReservation(productId, quantity)) {
                allConfirmed = false;
                log.error("Failed to confirm reservation for product {} in order {}", productId, event.getOrderId());
            }
        }

        if (allConfirmed) {
            log.info("Successfully confirmed reservations and deducted stock for order {}", event.getOrderId());
        } else {
            log.warn("Partial confirmation failure for order {}", event.getOrderId());
        }
    }

    private InventoryDto mapToDto(Inventory inventory) {
        return InventoryDto.builder()
            .id(inventory.getId())
            .productId(inventory.getProduct() != null ? inventory.getProduct().getId() : null)
            .productName(inventory.getProduct() != null ? inventory.getProduct().getName() : "Unknown")
            .quantity(inventory.getQuantity())
            .reservedQuantity(inventory.getReservedQuantity())
            .availableQuantity(inventory.getAvailableQuantity())
            .location(inventory.getLocation())
            .createdAt(inventory.getCreatedAt())
            .updatedAt(inventory.getUpdatedAt())
            .build();
    }
}