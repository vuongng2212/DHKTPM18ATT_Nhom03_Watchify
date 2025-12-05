package fit.iuh.backend.modules.order.web.controller;

import fit.iuh.backend.modules.identity.domain.repository.UserRepository;
import fit.iuh.backend.modules.order.application.dto.CreateGuestOrderRequest;
import fit.iuh.backend.modules.order.application.dto.CreateOrderRequest;
import fit.iuh.backend.modules.order.application.dto.OrderDto;
import fit.iuh.backend.modules.order.application.dto.OrderFilterRequest;
import fit.iuh.backend.modules.order.application.dto.OrderListResponse;
import fit.iuh.backend.modules.order.application.dto.UpdateOrderStatusRequest;
import fit.iuh.backend.modules.order.application.service.OrderService;
import fit.iuh.backend.modules.order.domain.entity.OrderStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.UUID;

/**
 * REST controller for Order operations
 */
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order management APIs")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

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

    @PostMapping("/guest")
    @Operation(summary = "Create a guest order", description = "Create an order as a guest user without authentication")
    public ResponseEntity<OrderDto> createGuestOrder(@Valid @RequestBody CreateGuestOrderRequest request) {
        log.info("Creating guest order for: {} ({})", request.getGuestName(), request.getGuestEmail());
        OrderDto order = orderService.createGuestOrder(request);
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

    @GetMapping("/all")
    @Operation(
        summary = "Get all orders (Admin)", 
        description = "Get paginated list of all orders with optional filtering by keyword, status, payment method, and date range"
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderListResponse> getAllOrders(
            @Parameter(description = "Page number (0-based)") 
            @RequestParam(defaultValue = "0") int page,
            
            @Parameter(description = "Page size") 
            @RequestParam(defaultValue = "10") int size,
            
            @Parameter(description = "Search keyword (order ID, customer name, or email)") 
            @RequestParam(required = false) String keyword,
            
            @Parameter(description = "Filter by order status") 
            @RequestParam(required = false) OrderStatus status,
            
            @Parameter(description = "Filter by payment method (COD, VNPAY, MOMO)") 
            @RequestParam(required = false) String paymentMethod,
            
            @Parameter(description = "Filter orders from this date (format: yyyy-MM-dd)") 
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            
            @Parameter(description = "Filter orders to this date (format: yyyy-MM-dd)") 
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            
            @Parameter(description = "Sort by field (orderDate, totalAmount, status)") 
            @RequestParam(required = false, defaultValue = "orderDate") String sortBy,
            
            @Parameter(description = "Sort direction (asc, desc)") 
            @RequestParam(required = false, defaultValue = "desc") String sortDirection
    ) {
        log.info("OrderController: getAllOrders called with filters - page={}, size={}, keyword={}, status={}, paymentMethod={}, fromDate={}, toDate={}", 
                 page, size, keyword, status, paymentMethod, fromDate, toDate);
        
        // Build filter request
        OrderFilterRequest filter = OrderFilterRequest.builder()
            .keyword(keyword)
            .status(status)
            .paymentMethod(paymentMethod)
            .fromDate(fromDate)
            .toDate(toDate)
            .sortBy(sortBy)
            .sortDirection(sortDirection)
            .build();
        
        // Get filtered orders
        OrderListResponse response = orderService.getAllOrdersWithFilter(filter, page, size);
        
        log.info("OrderController: Returning {} orders for page {}", 
                 response.getOrders().size(), page);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get order by ID", description = "Get detailed information of a specific order")
    public ResponseEntity<OrderDto> getOrderById(
            @Parameter(description = "Order ID") @PathVariable UUID orderId,
            Authentication authentication) {

        String email = authentication.getName();
        UUID userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        OrderDto order = orderService.getOrderById(orderId, userId);
        return ResponseEntity.ok(order);
    }

    @PutMapping("/{orderId}/status")
    @Operation(summary = "Update order status", description = "Update the status of an order")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateOrderStatus(
            @Parameter(description = "Order ID") @PathVariable UUID orderId,
            @RequestBody UpdateOrderStatusRequest request) {
        orderService.updateOrderStatus(orderId, request.getTrangThaiDonHang());
        return ResponseEntity.ok().build();
    }
}