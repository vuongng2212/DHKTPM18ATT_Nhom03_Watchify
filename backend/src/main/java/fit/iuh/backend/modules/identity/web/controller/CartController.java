package fit.iuh.backend.modules.identity.web.controller;

import fit.iuh.backend.modules.catalog.application.dto.CartDto;
import fit.iuh.backend.modules.catalog.application.service.CartService;
import fit.iuh.backend.modules.identity.application.dto.AddItemToCartRequest;
import fit.iuh.backend.modules.identity.application.dto.UpdateCartItemRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public CartDto getCurrentCart(
            Authentication authentication
    ) {
        UUID userId = (UUID) authentication.getPrincipal();
        return cartService.getCurrentCart(userId);
    }

    @PostMapping("/items")
    public CartDto addItemToCart(
            @RequestBody @Valid AddItemToCartRequest request,
            Authentication authentication
    ) {
        UUID userId = (UUID) authentication.getPrincipal();
        return cartService.addItemToCart(userId,  request.getProductId(), request.getQuantity());
    }


    @PutMapping("/items/{productId}")
    public CartDto updateCartItem(
            @PathVariable UUID productId,
            @RequestBody @Valid UpdateCartItemRequest request,
            Authentication authentication
    ) {
        UUID userId = (UUID) authentication.getPrincipal();

        return cartService.updateCartItem(userId, productId, request.getQuantity());
    }

    @DeleteMapping("/items/{productId}")
    public CartDto deleteCartItem(
            @PathVariable UUID productId,
            Authentication authentication
    ) {
        UUID userId = (UUID) authentication.getPrincipal();
        return cartService.deleteCartItem(userId,productId);
    }
}
