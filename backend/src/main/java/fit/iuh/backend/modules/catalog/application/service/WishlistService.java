package fit.iuh.backend.modules.catalog.application.service;

import fit.iuh.backend.modules.catalog.application.dto.WishlistDto;
import fit.iuh.backend.modules.catalog.application.mapper.WishlistMapper;
import fit.iuh.backend.modules.catalog.domain.entity.Product;
import fit.iuh.backend.modules.catalog.domain.entity.Wishlist;
import fit.iuh.backend.modules.catalog.domain.repository.ProductRepository;
import fit.iuh.backend.modules.catalog.domain.repository.WishlistRepository;
import fit.iuh.backend.modules.identity.domain.entity.User;
import fit.iuh.backend.modules.identity.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service for managing user wishlists.
 * Provides business logic for adding, removing, and retrieving wishlist items.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final WishlistMapper wishlistMapper;

    /**
     * Get all wishlist items for a user
     *
     * @param userId the user ID
     * @return list of wishlist items
     */
    public List<WishlistDto> getUserWishlist(UUID userId) {
        log.info("Fetching wishlist for user: {}", userId);
        
        List<Wishlist> wishlists = wishlistRepository.findByUserIdWithProductDetails(userId);
        
        log.info("Found {} wishlist items for user: {}", wishlists.size(), userId);
        return wishlistMapper.toDtoList(wishlists);
    }

    /**
     * Get paginated wishlist items for a user
     *
     * @param userId the user ID
     * @param page   page number (0-based)
     * @param size   page size
     * @return page of wishlist items
     */
    public Page<WishlistDto> getUserWishlistPaginated(UUID userId, int page, int size) {
        log.info("Fetching paginated wishlist for user: {}, page: {}, size: {}", userId, page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Wishlist> wishlistPage = wishlistRepository.findByUserId(userId, pageable);
        
        return wishlistPage.map(wishlistMapper::toDto);
    }

    /**
     * Add a product to user's wishlist
     *
     * @param userId    the user ID
     * @param productId the product ID to add
     * @return the created wishlist item
     * @throws RuntimeException if user or product not found, or item already exists
     */
    @Transactional
    public WishlistDto addToWishlist(UUID userId, UUID productId) {
        log.info("Adding product {} to wishlist for user {}", productId, userId);

        // Check if already exists
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            log.warn("Product {} already exists in wishlist for user {}", productId, userId);
            throw new RuntimeException("Product already exists in wishlist");
        }

        // Fetch user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("User not found: {}", userId);
                    return new RuntimeException("User not found with id: " + userId);
                });

        // Fetch product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> {
                    log.error("Product not found: {}", productId);
                    return new RuntimeException("Product not found with id: " + productId);
                });

        // Check if product is available
        if (product.getStatus() == null || product.getStatus().toString().equals("INACTIVE")) {
            log.warn("Attempting to add inactive product {} to wishlist", productId);
            throw new RuntimeException("Cannot add inactive product to wishlist");
        }

        // Create wishlist item
        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .product(product)
                .notifyOnSale(false)
                .notifyOnStock(false)
                .build();

        Wishlist savedWishlist = wishlistRepository.save(wishlist);
        log.info("Successfully added product {} to wishlist for user {}", productId, userId);

        return wishlistMapper.toDto(savedWishlist);
    }

    /**
     * Add a product to wishlist with notification preferences
     *
     * @param userId         the user ID
     * @param productId      the product ID
     * @param notifyOnSale   whether to notify when product goes on sale
     * @param notifyOnStock  whether to notify when product is back in stock
     * @return the created wishlist item
     */
    @Transactional
    public WishlistDto addToWishlistWithPreferences(UUID userId, UUID productId, 
                                                     Boolean notifyOnSale, Boolean notifyOnStock) {
        log.info("Adding product {} to wishlist for user {} with preferences", productId, userId);

        // Check if already exists
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            log.warn("Product {} already exists in wishlist for user {}", productId, userId);
            throw new RuntimeException("Product already exists in wishlist");
        }

        // Fetch user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Fetch product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        // Create wishlist item
        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .product(product)
                .notifyOnSale(notifyOnSale != null ? notifyOnSale : false)
                .notifyOnStock(notifyOnStock != null ? notifyOnStock : false)
                .build();

        Wishlist savedWishlist = wishlistRepository.save(wishlist);
        log.info("Successfully added product {} to wishlist with preferences", productId);

        return wishlistMapper.toDto(savedWishlist);
    }

    /**
     * Remove a product from user's wishlist
     *
     * @param userId    the user ID
     * @param productId the product ID to remove
     * @throws RuntimeException if wishlist item not found
     */
    @Transactional
    public void removeFromWishlist(UUID userId, UUID productId) {
        log.info("Removing product {} from wishlist for user {}", productId, userId);

        // Check if exists
        if (!wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            log.warn("Product {} not found in wishlist for user {}", productId, userId);
            throw new RuntimeException("Product not found in wishlist");
        }

        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
        log.info("Successfully removed product {} from wishlist for user {}", productId, userId);
    }

    /**
     * Check if a product is in user's wishlist
     *
     * @param userId    the user ID
     * @param productId the product ID to check
     * @return true if product is in wishlist, false otherwise
     */
    public boolean isInWishlist(UUID userId, UUID productId) {
        log.debug("Checking if product {} is in wishlist for user {}", productId, userId);
        
        boolean exists = wishlistRepository.existsByUserIdAndProductId(userId, productId);
        
        log.debug("Product {} in wishlist for user {}: {}", productId, userId, exists);
        return exists;
    }

    /**
     * Get count of wishlist items for a user
     *
     * @param userId the user ID
     * @return count of wishlist items
     */
    public long getWishlistCount(UUID userId) {
        log.debug("Getting wishlist count for user: {}", userId);
        
        long count = wishlistRepository.countByUserId(userId);
        
        log.debug("User {} has {} items in wishlist", userId, count);
        return count;
    }

    /**
     * Clear all wishlist items for a user
     *
     * @param userId the user ID
     */
    @Transactional
    public void clearWishlist(UUID userId) {
        log.info("Clearing wishlist for user: {}", userId);
        
        wishlistRepository.deleteByUserId(userId);
        
        log.info("Successfully cleared wishlist for user: {}", userId);
    }

    /**
     * Update wishlist item preferences
     *
     * @param userId        the user ID
     * @param productId     the product ID
     * @param notifyOnSale  whether to notify when product goes on sale
     * @param notifyOnStock whether to notify when product is back in stock
     * @return updated wishlist item
     */
    @Transactional
    public WishlistDto updateWishlistPreferences(UUID userId, UUID productId,
                                                  Boolean notifyOnSale, Boolean notifyOnStock) {
        log.info("Updating wishlist preferences for user {} and product {}", userId, productId);

        Wishlist wishlist = wishlistRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new RuntimeException("Wishlist item not found"));

        if (notifyOnSale != null) {
            wishlist.setNotifyOnSale(notifyOnSale);
        }
        if (notifyOnStock != null) {
            wishlist.setNotifyOnStock(notifyOnStock);
        }

        Wishlist updatedWishlist = wishlistRepository.save(wishlist);
        log.info("Successfully updated wishlist preferences");

        return wishlistMapper.toDto(updatedWishlist);
    }

    /**
     * Get users who want to be notified when a product goes on sale
     *
     * @param productId the product ID
     * @return list of wishlist items with notification preference
     */
    public List<Wishlist> getUsersToNotifyOnSale(UUID productId) {
        log.info("Fetching users to notify for product on sale: {}", productId);
        
        List<Wishlist> wishlists = wishlistRepository.findByProductIdAndNotifyOnSaleTrue(productId);
        
        log.info("Found {} users to notify for product {} on sale", wishlists.size(), productId);
        return wishlists;
    }

    /**
     * Get users who want to be notified when a product is back in stock
     *
     * @param productId the product ID
     * @return list of wishlist items with notification preference
     */
    public List<Wishlist> getUsersToNotifyOnStock(UUID productId) {
        log.info("Fetching users to notify for product back in stock: {}", productId);
        
        List<Wishlist> wishlists = wishlistRepository.findByProductIdAndNotifyOnStockTrue(productId);
        
        log.info("Found {} users to notify for product {} back in stock", wishlists.size(), productId);
        return wishlists;
    }

    /**
     * Move all items from wishlist to cart
     * This is a convenience method for users who want to purchase all wishlist items
     *
     * @param userId the user ID
     * @return count of items moved to cart
     */
    @Transactional
    public int moveAllToCart(UUID userId) {
        log.info("Moving all wishlist items to cart for user: {}", userId);

        List<Wishlist> wishlists = wishlistRepository.findByUserId(userId);
        
        if (wishlists.isEmpty()) {
            log.info("No wishlist items to move for user: {}", userId);
            return 0;
        }

        // Here you would integrate with CartService to add items to cart
        // For now, we just return the count
        int count = wishlists.size();
        
        log.info("Found {} wishlist items to move to cart for user: {}", count, userId);
        return count;
    }
}