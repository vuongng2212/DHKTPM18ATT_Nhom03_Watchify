package fit.iuh.backend.modules.inventory.domain.entity;

import java.time.LocalDateTime;

import fit.iuh.backend.modules.catalog.domain.entity.Product;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing product inventory
 */
@Entity
@Table(name = "inventories")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "reserved_quantity", nullable = false)
    @Builder.Default
    private Integer reservedQuantity = 0;

    @Column
    private String location;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Get available quantity (total - reserved)
     */
    public Integer getAvailableQuantity() {
        return quantity - reservedQuantity;
    }

    /**
     * Check if product is in stock
     */
    public boolean isInStock() {
        return getAvailableQuantity() > 0;
    }

    /**
     * Check if can reserve the requested quantity
     */
    public boolean canReserve(Integer requestedQuantity) {
        return getAvailableQuantity() >= requestedQuantity;
    }

    /**
     * Reserve quantity for order
     */
    public void reserve(Integer quantityToReserve) {
        if (!canReserve(quantityToReserve)) {
            throw new IllegalStateException("Insufficient inventory for reservation");
        }
        this.reservedQuantity += quantityToReserve;
    }

    /**
     * Release reserved quantity
     */
    public void release(Integer quantityToRelease) {
        if (quantityToRelease > reservedQuantity) {
            throw new IllegalArgumentException("Cannot release more than reserved quantity");
        }
        this.reservedQuantity -= quantityToRelease;
    }

    /**
     * Confirm reservation (reduce actual quantity)
     */
    public void confirmReservation(Integer quantityToConfirm) {
        if (quantityToConfirm > reservedQuantity) {
            throw new IllegalArgumentException("Cannot confirm more than reserved quantity");
        }
        this.quantity -= quantityToConfirm;
        this.reservedQuantity -= quantityToConfirm;
    }

    /**
     * Add quantity to inventory
     */
    public void addQuantity(Integer quantityToAdd) {
        this.quantity += quantityToAdd;
    }

    /**
     * Reduce quantity from inventory
     */
    public void reduceQuantity(Integer quantityToReduce) {
        if (quantityToReduce > quantity) {
            throw new IllegalArgumentException("Cannot reduce more than available quantity");
        }
        this.quantity -= quantityToReduce;
    }
}