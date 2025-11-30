package fit.iuh.backend.sharedkernel.event;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Event fired when inventory is reserved for an order.
 * This event notifies other modules that stock has been reserved
 * and should not be available for other orders.
 */
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class InventoryReservedEvent {

    private UUID orderId;
    private UUID userId;
    private List<ReservedItem> reservedItems;
    private LocalDateTime reservedAt;

    /**
     * Constructor with essential fields
     */
    public InventoryReservedEvent(UUID orderId, List<ReservedItem> reservedItems) {
        this.orderId = orderId;
        this.reservedItems = reservedItems;
        this.reservedAt = LocalDateTime.now();
    }

    /**
     * Represents a single reserved item in the inventory
     */
    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ReservedItem {
        private UUID productId;
        private Integer quantity;
        private String inventoryId;

        public ReservedItem(UUID productId, Integer quantity) {
            this.productId = productId;
            this.quantity = quantity;
        }
    }
}