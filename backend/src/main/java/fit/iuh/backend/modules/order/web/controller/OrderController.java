package fit.iuh.backend.modules.order.web.controller;

import fit.iuh.backend.modules.identity.domain.repository.UserRepository;
import fit.iuh.backend.modules.order.application.dto.CreateOrderRequest;
import fit.iuh.backend.modules.order.application.dto.OrderDto;
import fit.iuh.backend.modules.order.application.dto.OrderListResponse;
import fit.iuh.backend.modules.order.application.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller for Order operations
 */
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order management APIs")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    @PostMapping
    @Operation(summary = "Create a new order", description = "Create an order with items (mock cart implementation)")
    public ResponseEntity<OrderDto> createOrder(
            @RequestBody CreateOrderRequest request,
            Authentication authentication) {

        String email = authentication.getName();
        UUID userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        OrderDto order = orderService.createDirect(request, userId);
        return ResponseEntity.ok(order);
    }

    @GetMapping
    @Operation(summary = "Get user orders", description = "Get paginated list of user's orders")
    public ResponseEntity<OrderListResponse> getUserOrders(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        String email = authentication.getName();
        UUID userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        OrderListResponse response = orderService.getUserOrders(userId, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get order by ID", description = "Get detailed information of a specific order")
    public ResponseEntity<OrderDto> getOrderById(
            @Parameter(description = "Order ID") @PathVariable UUID orderId,
            Authentication authentication) {

        UUID userId = UUID.fromString(authentication.getName());
        OrderDto order = orderService.getOrderById(orderId, userId);
        return ResponseEntity.ok(order);
    }
}