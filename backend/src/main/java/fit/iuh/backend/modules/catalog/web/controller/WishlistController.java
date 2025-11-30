package fit.iuh.backend.modules.catalog.web.controller;

import fit.iuh.backend.modules.catalog.application.dto.WishlistDto;
import fit.iuh.backend.modules.catalog.application.service.WishlistService;
import fit.iuh.backend.modules.identity.domain.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for Wishlist operations.
 * Handles user wishlist management including adding, removing, and viewing wishlist items.
 */
@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Wishlist", description = "Wishlist management APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class WishlistController {

    private final WishlistService wishlistService;
    private final UserRepository userRepository;

    /**
     * Get current user's wishlist
     *
     * @param authentication the authenticated user
     * @return list of wishlist items
     */
    @GetMapping
    @Operation(
        summary = "Get user's wishlist",
        description = "Retrieve all items in the authenticated user's wishlist"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved wishlist",
            content = @Content(schema = @Schema(implementation = WishlistDto.class))),
        @ApiResponse(responseCode = "401", description = "Unauthorized - User not authenticated"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<List<WishlistDto>> getUserWishlist(Authentication authentication) {
        log.info("GET /api/v1/wishlist - Getting wishlist for user: {}", authentication.getName());

        UUID userId = getUserIdFromAuthentication(authentication);
        List<WishlistDto> wishlist = wishlistService.getUserWishlist(userId);

        log.info("Retrieved {} wishlist items for user: {}", wishlist.size(), userId);
        return ResponseEntity.ok(wishlist);
    }

    /**
     * Get paginated user's wishlist
     *
     * @param authentication the authenticated user
     * @param page          page number (0-based)
     * @param size          page size
     * @return page of wishlist items
     */
    @GetMapping("/paginated")
    @Operation(
        summary = "Get paginated wishlist",
        description = "Retrieve user's wishlist with pagination"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved paginated wishlist"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Page<WishlistDto>> getUserWishlistPaginated(
            Authentication authentication,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "12") int size) {

        log.info("GET /api/v1/wishlist/paginated - page: {}, size: {} for user: {}",
                page, size, authentication.getName());

        UUID userId = getUserIdFromAuthentication(authentication);
        Page<WishlistDto> wishlistPage = wishlistService.getUserWishlistPaginated(userId, page, size);

        log.info("Retrieved page {} with {} items", page, wishlistPage.getNumberOfElements());
        return ResponseEntity.ok(wishlistPage);
    }

    /**
     * Add a product to wishlist
     *
     * @param productId      the product ID to add
     * @param authentication the authenticated user
     * @return the created wishlist item
     */
    @PostMapping("/{productId}")
    @Operation(
        summary = "Add product to wishlist",
        description = "Add a product to the authenticated user's wishlist"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Product added to wishlist successfully",
            content = @Content(schema = @Schema(implementation = WishlistDto.class))),
        @ApiResponse(responseCode = "400", description = "Product already in wishlist or invalid product"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Product not found")
    })
    public ResponseEntity<WishlistDto> addToWishlist(
            @Parameter(description = "Product ID to add to wishlist") @PathVariable UUID productId,
            Authentication authentication) {

        log.info("POST /api/v1/wishlist/{} - Adding to wishlist for user: {}",
                productId, authentication.getName());

        try {
            UUID userId = getUserIdFromAuthentication(authentication);
            WishlistDto wishlistItem = wishlistService.addToWishlist(userId, productId);

            log.info("Successfully added product {} to wishlist for user {}", productId, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(wishlistItem);

        } catch (RuntimeException e) {
            log.error("Error adding product {} to wishlist: {}", productId, e.getMessage());
            throw e;
        }
    }

    /**
     * Add a product to wishlist with notification preferences
     *
     * @param productId      the product ID
     * @param notifyOnSale   notify when product goes on sale
     * @param notifyOnStock  notify when product is back in stock
     * @param authentication the authenticated user
     * @return the created wishlist item
     */
    @PostMapping("/{productId}/preferences")
    @Operation(
        summary = "Add product to wishlist with preferences",
        description = "Add a product to wishlist with notification preferences"
    )
    public ResponseEntity<WishlistDto> addToWishlistWithPreferences(
            @PathVariable UUID productId,
            @RequestParam(required = false, defaultValue = "false") Boolean notifyOnSale,
            @RequestParam(required = false, defaultValue = "false") Boolean notifyOnStock,
            Authentication authentication) {

        log.info("POST /api/v1/wishlist/{}/preferences - notifyOnSale: {}, notifyOnStock: {}",
                productId, notifyOnSale, notifyOnStock);

        UUID userId = getUserIdFromAuthentication(authentication);
        WishlistDto wishlistItem = wishlistService.addToWishlistWithPreferences(
                userId, productId, notifyOnSale, notifyOnStock);

        return ResponseEntity.status(HttpStatus.CREATED).body(wishlistItem);
    }

    /**
     * Remove a product from wishlist
     *
     * @param productId      the product ID to remove
     * @param authentication the authenticated user
     * @return no content
     */
    @DeleteMapping("/{productId}")
    @Operation(
        summary = "Remove product from wishlist",
        description = "Remove a product from the authenticated user's wishlist"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Product removed from wishlist successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Product not found in wishlist")
    })
    public ResponseEntity<Void> removeFromWishlist(
            @Parameter(description = "Product ID to remove from wishlist") @PathVariable UUID productId,
            Authentication authentication) {

        log.info("DELETE /api/v1/wishlist/{} - Removing from wishlist for user: {}",
                productId, authentication.getName());

        try {
            UUID userId = getUserIdFromAuthentication(authentication);
            wishlistService.removeFromWishlist(userId, productId);

            log.info("Successfully removed product {} from wishlist for user {}", productId, userId);
            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {
            log.error("Error removing product {} from wishlist: {}", productId, e.getMessage());
            throw e;
        }
    }

    /**
     * Check if a product is in user's wishlist
     *
     * @param productId      the product ID to check
     * @param authentication the authenticated user
     * @return true if product is in wishlist, false otherwise
     */
    @GetMapping("/check/{productId}")
    @Operation(
        summary = "Check if product is in wishlist",
        description = "Check if a specific product is in the user's wishlist"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully checked wishlist status"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Boolean>> checkInWishlist(
            @Parameter(description = "Product ID to check") @PathVariable UUID productId,
            Authentication authentication) {

        log.debug("GET /api/v1/wishlist/check/{} for user: {}", productId, authentication.getName());

        UUID userId = getUserIdFromAuthentication(authentication);
        boolean inWishlist = wishlistService.isInWishlist(userId, productId);

        Map<String, Boolean> response = new HashMap<>();
        response.put("inWishlist", inWishlist);

        return ResponseEntity.ok(response);
    }

    /**
     * Get wishlist count for current user
     *
     * @param authentication the authenticated user
     * @return count of wishlist items
     */
    @GetMapping("/count")
    @Operation(
        summary = "Get wishlist count",
        description = "Get the total number of items in user's wishlist"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved wishlist count"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Long>> getWishlistCount(Authentication authentication) {
        log.debug("GET /api/v1/wishlist/count for user: {}", authentication.getName());

        UUID userId = getUserIdFromAuthentication(authentication);
        long count = wishlistService.getWishlistCount(userId);

        Map<String, Long> response = new HashMap<>();
        response.put("count", count);

        return ResponseEntity.ok(response);
    }

    /**
     * Clear all items from wishlist
     *
     * @param authentication the authenticated user
     * @return no content
     */
    @DeleteMapping
    @Operation(
        summary = "Clear wishlist",
        description = "Remove all items from the user's wishlist"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Wishlist cleared successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> clearWishlist(Authentication authentication) {
        log.info("DELETE /api/v1/wishlist - Clearing wishlist for user: {}", authentication.getName());

        UUID userId = getUserIdFromAuthentication(authentication);
        wishlistService.clearWishlist(userId);

        log.info("Successfully cleared wishlist for user: {}", userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Update wishlist item notification preferences
     *
     * @param productId      the product ID
     * @param notifyOnSale   notify when product goes on sale
     * @param notifyOnStock  notify when product is back in stock
     * @param authentication the authenticated user
     * @return updated wishlist item
     */
    @PatchMapping("/{productId}/preferences")
    @Operation(
        summary = "Update wishlist preferences",
        description = "Update notification preferences for a wishlist item"
    )
    public ResponseEntity<WishlistDto> updateWishlistPreferences(
            @PathVariable UUID productId,
            @RequestParam(required = false) Boolean notifyOnSale,
            @RequestParam(required = false) Boolean notifyOnStock,
            Authentication authentication) {

        log.info("PATCH /api/v1/wishlist/{}/preferences for user: {}", productId, authentication.getName());

        UUID userId = getUserIdFromAuthentication(authentication);
        WishlistDto updatedItem = wishlistService.updateWishlistPreferences(
                userId, productId, notifyOnSale, notifyOnStock);

        return ResponseEntity.ok(updatedItem);
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