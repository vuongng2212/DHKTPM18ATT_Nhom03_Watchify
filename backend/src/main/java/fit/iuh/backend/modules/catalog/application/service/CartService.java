package fit.iuh.backend.modules.catalog.application.service;

import fit.iuh.backend.modules.catalog.application.dto.CartDto;
import fit.iuh.backend.modules.catalog.application.dto.CartItemDto;
import fit.iuh.backend.modules.catalog.domain.entity.Cart;
import fit.iuh.backend.modules.catalog.domain.entity.CartItem;
import fit.iuh.backend.modules.catalog.domain.entity.Product;
import fit.iuh.backend.modules.catalog.domain.repository.ProductRepository;
import fit.iuh.backend.modules.catalog.domain.repository.CartItemRepository;
import fit.iuh.backend.modules.catalog.domain.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {


    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;



    public CartDto getCurrentCart(UUID userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createCartForUser(userId));
        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        return mapToDto(cart, items);
    }

    private Cart createCartForUser(UUID userId) {
        Cart cart = Cart.builder().userId(userId).build();
        return cartRepository.save(cart);
    }


    public CartDto addItemToCart(UUID userId, UUID productId, int quantity) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createCartForUser(userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());

        // Check if already exists
        Optional<CartItem> existingOpt = items.stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst();

        if (existingOpt.isPresent()) {
            CartItem existing = existingOpt.get();
            existing.setQuantity(existing.getQuantity() + quantity);
            cartItemRepository.save(existing);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantity)
                    .build();

            cartItemRepository.save(newItem);
            items.add(newItem);
        }

        return mapToDto(cart, items);
    }

    public CartDto updateCartItem(UUID userId, UUID productId, int quantity) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createCartForUser(userId));

        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());

        CartItem item = items.stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Product not found in cart"));

        if (quantity <= 0) {
            cartItemRepository.delete(item);
            items.remove(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return mapToDto(cart, items);
    }

    public CartDto deleteCartItem(UUID userId, UUID productId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createCartForUser(userId));

        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());

        CartItem item = items.stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Product not found in cart"));

        cartItemRepository.delete(item);
        items.remove(item);

        return mapToDto(cart, items);
    }

    private CartDto mapToDto(Cart cart, List<CartItem> items) {
        List<CartItemDto> itemDtos = items.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        BigDecimal totalPrice = itemDtos.stream()
                .map(CartItemDto::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartDto.builder()
                .id(cart.getId())
                .userId(cart.getUserId())
                .items(itemDtos)
                .totalPrice(totalPrice)
                .totalItems(itemDtos.size())
                .build();
    }

    private CartItemDto mapToDto(CartItem cartItem) {
        Product product = cartItem.getProduct();
        BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));

        return CartItemDto.builder()
                .id(cartItem.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productImage(null) // TODO: Implement image fetching from ProductImage repository
                .price(product.getPrice())
                .quantity(cartItem.getQuantity())
                .subtotal(subtotal)
                .build();
    }
}
