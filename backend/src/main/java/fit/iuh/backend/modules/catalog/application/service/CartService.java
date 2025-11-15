package fit.iuh.backend.modules.catalog.application.service;

import fit.iuh.backend.modules.catalog.domain.entity.Cart;
import fit.iuh.backend.modules.catalog.domain.entity.CartItem;
import fit.iuh.backend.modules.catalog.domain.entity.Product;
import fit.iuh.backend.modules.catalog.domain.repository.ProductRepository;
import fit.iuh.backend.modules.identity.domain.repository.CartItemRepository;
import fit.iuh.backend.modules.identity.domain.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartService {


    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;



    public Cart getCurrentCart(UUID userId) {

            return cartRepository.findByUserId(userId)
                    .orElseGet(() -> createCartForUser(userId));

    }

    private Cart createCartForUser(UUID userId) {
        Cart cart = Cart.builder().userId(userId).build();
        return cartRepository.save(cart);
    }


    public Cart addItemToCart(UUID userId, UUID productId, int quantity) {
        Cart cart = getCurrentCart(userId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if already exists
        CartItem existing = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .orElse(null);

        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + quantity);
            cartItemRepository.save(existing);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantity)
                    .build();

            cart.addItem(newItem);
            cartItemRepository.save(newItem);
        }

        return cartRepository.save(cart);
    }

    public Cart updateCartItem(UUID userId, UUID productId, int quantity) {
        Cart cart = getCurrentCart(userId);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Product not found in cart"));

        if (quantity <= 0) {
            cart.removeItem(item);
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return cartRepository.save(cart);
    }

    public Cart deleteCartItem(UUID userId, UUID productId) {
        Cart cart = getCurrentCart(userId);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Product not found in cart"));

        cart.removeItem(item);
        cartItemRepository.delete(item);

        return cartRepository.save(cart);
    }
}
