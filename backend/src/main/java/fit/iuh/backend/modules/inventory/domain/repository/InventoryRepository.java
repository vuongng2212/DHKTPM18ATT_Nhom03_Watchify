package fit.iuh.backend.modules.inventory.domain.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import fit.iuh.backend.modules.inventory.domain.entity.Inventory;

/**
 * Repository for Inventory operations
 */
@Repository
public interface InventoryRepository extends JpaRepository<Inventory, String> {

    /**
     * Find inventory by product ID
     */
    Optional<Inventory> findByProductId(UUID productId);

    /**
     * Check if inventory exists for product
     */
    boolean existsByProductId(UUID productId);

    /**
     * Reserve quantity for a product
     */
    @Modifying
    @Query("UPDATE Inventory i SET i.reservedQuantity = i.reservedQuantity + :quantity WHERE i.product.id = :productId AND (i.quantity - i.reservedQuantity) >= :quantity")
    int reserveQuantity(@Param("productId") UUID productId, @Param("quantity") Integer quantity);

    /**
     * Release reserved quantity for a product
     */
    @Modifying
    @Query("UPDATE Inventory i SET i.reservedQuantity = i.reservedQuantity - :quantity WHERE i.product.id = :productId AND i.reservedQuantity >= :quantity")
    int releaseQuantity(@Param("productId") UUID productId, @Param("quantity") Integer quantity);

    /**
     * Confirm reservation (reduce actual quantity and reserved quantity)
     */
    @Modifying
    @Query("UPDATE Inventory i SET i.quantity = i.quantity - :quantity, i.reservedQuantity = i.reservedQuantity - :quantity WHERE i.product.id = :productId AND i.reservedQuantity >= :quantity")
    int confirmReservation(@Param("productId") UUID productId, @Param("quantity") Integer quantity);

    /**
     * Add quantity to inventory
     */
    @Modifying
    @Query("UPDATE Inventory i SET i.quantity = i.quantity + :quantity WHERE i.product.id = :productId")
    int addQuantity(@Param("productId") UUID productId, @Param("quantity") Integer quantity);

    /**
     * Reduce quantity from inventory
     */
    @Modifying
    @Query("UPDATE Inventory i SET i.quantity = i.quantity - :quantity WHERE i.product.id = :productId AND i.quantity >= :quantity")
    int reduceQuantity(@Param("productId") UUID productId, @Param("quantity") Integer quantity);

    /**
     * Get available quantity for a product
     */
    @Query("SELECT i.quantity - i.reservedQuantity FROM Inventory i WHERE i.product.id = :productId")
    Optional<Integer> getAvailableQuantity(@Param("productId") UUID productId);
}