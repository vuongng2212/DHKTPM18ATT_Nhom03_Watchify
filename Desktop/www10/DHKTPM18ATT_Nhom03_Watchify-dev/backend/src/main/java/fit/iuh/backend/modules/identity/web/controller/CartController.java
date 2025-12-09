package fit.iuh.backend.modules.identity.web.controller;

import fit.iuh.backend.modules.catalog.application.dto.CartDto;
import fit.iuh.backend.modules.catalog.application.service.CartService;
import fit.iuh.backend.modules.identity.application.dto.AddItemToCartRequest;
import fit.iuh.backend.modules.identity.application.dto.UpdateCartItemRequest;
import fit.iuh.backend.modules.identity.domain.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for Cart operations.
 * Handles shopping cart management for both authenticated users and guests.
 */
@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Shopping Cart", description = "Shopping cart management APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    /**
     * Get current user's cart
     *
     * @param authentication the authenticated user
     * @return cart details
     */
    @GetMapping
    @Operation(
        summary = "Get user's cart",
        description = "Retrieve the authenticated user's shopping cart with all items"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved cart"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - User not authenticated"),
        @ApiResponse(responseCode = "404", description = "Cart not found")
    })
    public ResponseEntity<CartDto> getCurrentCart(Authentication authentication) {
        log.info("GET /api/v1/cart - Getting cart for user: {}", authentication.getName());

        try {
            UUID userId = getUserIdFromAuthentication(authentication);
            CartDto cart = cartService.getCurrentCart(userId);

            log.info("Retrieved cart with {} items for user: {}", 
                cart.getItems() != null ? cart.getItems().size() : 0, userId);
            return ResponseEntity.ok(cart);

        } catch (Exception e) {
            log.error("Error getting cart: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Add item to cart
     *
     * @param request item details (productId, quantity)
     * @param authentication the authenticated user
     * @return updated cart
     */
    @PostMapping("/items")
    @Operation(
        summary = "Add item to cart",
        description = "Add a product to the user's shopping cart or update quantity if already exists"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Item added to cart successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request - Product not available or insufficient stock"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Product not found")
    })
    public ResponseEntity<CartDto> addItemToCart(
            @RequestBody @Valid AddItemToCartRequest request,
            Authentication authentication) {

        log.info("POST /api/v1/cart/items - Adding product {} (quantity: {}) for user: {}",
                request.getProductId(), request.getQuantity(), authentication.getName());

        try {
            UUID userId = getUserIdFromAuthentication(authentication);
            CartDto cart = cartService.addItemToCart(userId, request.getProductId(), request.getQuantity());

            log.info("Successfully added item to cart for user: {}", userId);
            return ResponseEntity.ok(cart);

        } catch (Exception e) {
            log.error("Error adding item to cart: {}", e.getMessage());
            throw e;
        }
    }


    /**
     * Update cart item quantity
     *
     * @param productId product ID to update
     * @param request new quantity
     * @param authentication the authenticated user
     * @return updated cart
     */
    @PutMapping("/items/{productId}")
    @Operation(
        summary = "Update cart item quantity",
        description = "Update the quantity of a specific item in the cart"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cart item updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid quantity or insufficient stock"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Cart item not found")
    })
    public ResponseEntity<CartDto> updateCartItem(
            @Parameter(description = "Product ID to update") @PathVariable UUID productId,
            @RequestBody @Valid UpdateCartItemRequest request,
            Authentication authentication) {

        log.info("PUT /api/v1/cart/items/{} - Updating quantity to {} for user: {}",
                productId, request.getQuantity(), authentication.getName());

        try {
            UUID userId = getUserIdFromAuthentication(authentication);
            CartDto cart = cartService.updateCartItem(userId, productId, request.getQuantity());

            log.info("Successfully updated cart item for user: {}", userId);
            return ResponseEntity.ok(cart);

        } catch (Exception e) {
            log.error("Error updating cart item: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Remove item from cart
     *
     * @param productId product ID to remove
     * @param authentication the authenticated user
     * @return updated cart
     */
    @DeleteMapping("/items/{productId}")
    @Operation(
        summary = "Remove item from cart",
        description = "Remove a specific item from the user's shopping cart"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Item removed from cart successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Cart item not found")
    })
    public ResponseEntity<CartDto> deleteCartItem(
            @Parameter(description = "Product ID to remove") @PathVariable UUID productId,
            Authentication authentication) {

        log.info("DELETE /api/v1/cart/items/{} for user: {}", productId, authentication.getName());

        try {
            UUID userId = getUserIdFromAuthentication(authentication);
            CartDto cart = cartService.deleteCartItem(userId, productId);

            log.info("Successfully removed item from cart for user: {}", userId);
            return ResponseEntity.ok(cart);

        } catch (Exception e) {
            log.error("Error removing cart item: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Clear entire cart
     *
     * @param authentication the authenticated user
     * @return empty cart or no content
     */
    @DeleteMapping
    @Operation(
        summary = "Clear cart",
        description = "Remove all items from the user's shopping cart"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Cart cleared successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        log.info("DELETE /api/v1/cart - Clearing cart for user: {}", authentication.getName());

        try {
            UUID userId = getUserIdFromAuthentication(authentication);
            cartService.clearCart(userId);

            log.info("Successfully cleared cart for user: {}", userId);
            return ResponseEntity.noContent().build();

        } catch (Exception e) {
            log.error("Error clearing cart: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Get cart item count
     *
     * @param authentication the authenticated user
     * @return count of items in cart
     */
    @GetMapping("/count")
    @Operation(
        summary = "Get cart item count",
        description = "Get the total number of items in the user's cart"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved cart count"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Integer>> getCartItemCount(Authentication authentication) {
        log.debug("GET /api/v1/cart/count for user: {}", authentication.getName());

        try {
            UUID userId = getUserIdFromAuthentication(authentication);
            CartDto cart = cartService.getCurrentCart(userId);
            
            int count = cart.getItems() != null ? cart.getItems().size() : 0;
            
            Map<String, Integer> response = new HashMap<>();
            response.put("count", count);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error getting cart count: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Merge guest cart with user cart on login
     * This allows users to keep items they added while browsing as guest
     *
     * @param guestCartItems items from guest cart (from localStorage)
     * @param authentication the authenticated user
     * @return merged cart
     */
    @PostMapping("/merge")
    @Operation(
        summary = "Merge guest cart",
        description = "Merge items from guest cart (localStorage) with authenticated user's cart on login"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Carts merged successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid cart items"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<CartDto> mergeGuestCart(
            @RequestBody List<AddItemToCartRequest> guestCartItems,
            Authentication authentication) {

        log.info("POST /api/v1/cart/merge - Merging {} guest items for user: {}",
                guestCartItems != null ? guestCartItems.size() : 0, authentication.getName());

        try {
            UUID userId = getUserIdFromAuthentication(authentication);

            // Add each guest cart item to user's cart
            if (guestCartItems != null && !guestCartItems.isEmpty()) {
                for (AddItemToCartRequest item : guestCartItems) {
                    try {
                        cartService.addItemToCart(userId, item.getProductId(), item.getQuantity());
                        log.debug("Merged guest cart item: {} (qty: {})", item.getProductId(), item.getQuantity());
                    } catch (Exception e) {
                        log.warn("Failed to merge guest cart item {}: {}", item.getProductId(), e.getMessage());
                        // Continue with other items even if one fails
                    }
                }
            }

            // Return final merged cart
            CartDto cart = cartService.getCurrentCart(userId);
            log.info("Successfully merged guest cart. Final cart has {} items", 
                cart.getItems() != null ? cart.getItems().size() : 0);

            return ResponseEntity.ok(cart);

        } catch (Exception e) {
            log.error("Error merging guest cart: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Helper method to extract user ID from authentication
     *
     * @param authentication the authentication object
     * @return user ID
     * @throws RuntimeException if user not found
     */
    private UUID getUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("User not found with email: {}", email);
                    return new RuntimeException("User not found");
                })
                .getId();
    }
}
