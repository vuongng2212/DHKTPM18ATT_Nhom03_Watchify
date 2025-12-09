package fit.iuh.backend.modules.inventory.application.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Inventory
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryDto {

    private String id;
    private UUID productId;
    private String productName;
    private Integer quantity;
    private Integer reservedQuantity;
    private Integer availableQuantity;
    private String location;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}