package fit.iuh.backend.modules.inventory.web.controller;

import fit.iuh.backend.modules.inventory.application.dto.InventoryDto;
import fit.iuh.backend.modules.inventory.application.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for Inventory operations
 */
@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory", description = "Inventory management APIs")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/all")
    @Operation(summary = "Get all inventories", description = "Get all inventory items with product details")
    public ResponseEntity<List<InventoryDto>> getAllInventories() {
        List<InventoryDto> inventories = inventoryService.getAllInventories();
        return ResponseEntity.ok(inventories);
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get inventory for product", description = "Get inventory information for a specific product")
    public ResponseEntity<InventoryDto> getInventoryByProductId(
            @Parameter(description = "Product ID") @PathVariable UUID productId) {
        InventoryDto inventory = inventoryService.getInventoryByProductId(productId);
        return ResponseEntity.ok(inventory);
    }

    @GetMapping("/product/{productId}/available")
    @Operation(summary = "Get available quantity", description = "Get available quantity for a product")
    public ResponseEntity<Integer> getAvailableQuantity(
            @Parameter(description = "Product ID") @PathVariable UUID productId) {
        Integer availableQuantity = inventoryService.getAvailableQuantity(productId);
        return ResponseEntity.ok(availableQuantity);
    }

    @GetMapping("/product/{productId}/in-stock")
    @Operation(summary = "Check if product is in stock", description = "Check if a product is available in stock")
    public ResponseEntity<Boolean> isInStock(
            @Parameter(description = "Product ID") @PathVariable UUID productId) {
        boolean inStock = inventoryService.isInStock(productId);
        return ResponseEntity.ok(inStock);
    }

    // Admin endpoints for managing inventory
    @PostMapping("/product/{productId}")
    @Operation(summary = "Create or update inventory", description = "Create or update inventory for a product (Admin only)")
    public ResponseEntity<InventoryDto> createOrUpdateInventory(
            @Parameter(description = "Product ID") @PathVariable UUID productId,
            @Parameter(description = "Quantity") @RequestParam Integer quantity,
            @Parameter(description = "Location") @RequestParam(required = false) String location) {
        InventoryDto inventory = inventoryService.createOrUpdateInventory(productId, quantity, location);
        return ResponseEntity.ok(inventory);
    }

    @PostMapping("/product/{productId}/add")
    @Operation(summary = "Add quantity to inventory", description = "Add quantity to existing inventory (Admin only)")
    public ResponseEntity<Boolean> addQuantity(
            @Parameter(description = "Product ID") @PathVariable UUID productId,
            @Parameter(description = "Quantity to add") @RequestParam Integer quantity) {
        boolean success = inventoryService.addQuantity(productId, quantity);
        return ResponseEntity.ok(success);
    }

    @PostMapping("/product/{productId}/reduce")
    @Operation(summary = "Reduce quantity from inventory", description = "Reduce quantity from existing inventory (Admin only)")
    public ResponseEntity<Boolean> reduceQuantity(
            @Parameter(description = "Product ID") @PathVariable UUID productId,
            @Parameter(description = "Quantity to reduce") @RequestParam Integer quantity) {
        boolean success = inventoryService.reduceQuantity(productId, quantity);
        return ResponseEntity.ok(success);
    }
}