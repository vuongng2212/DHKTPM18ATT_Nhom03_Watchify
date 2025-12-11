package fit.iuh.backend.modules.order.web.controller;

import fit.iuh.backend.modules.identity.domain.repository.UserRepository;
import fit.iuh.backend.modules.order.application.dto.CreateGuestOrderRequest;
import fit.iuh.backend.modules.order.application.dto.CreateOrderRequest;
import fit.iuh.backend.modules.order.application.dto.OrderDto;
import fit.iuh.backend.modules.order.application.dto.OrderListResponse;
import fit.iuh.backend.modules.order.application.dto.RevenueAnalyticsResponse;
import fit.iuh.backend.modules.order.application.dto.UpdateOrderStatusRequest;
import fit.iuh.backend.modules.order.application.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

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
    @Operation(summary = "Get all orders (Admin)", description = "Get paginated list of all orders for admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderListResponse> getAllOrders(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size
    ) {
        log.info("OrderController: getAllOrders called with page={}, size={}", page, size);
        OrderListResponse response = orderService.getAllOrders(page, size);
        log.info("OrderController: getAllOrders returning {} orders for page {}", response.getOrders().size(), page);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/analytics/monthly-revenue")
    @Operation(summary = "Get monthly revenue analytics", description = "Get revenue by month for a specific year")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RevenueAnalyticsResponse> getMonthlyRevenue(
            @Parameter(description = "Year (defaults to current year)") @RequestParam(required = false) Integer year
    ) {
        log.info("📊 [CONTROLLER] ========== Monthly Revenue Request ==========");
        log.info("📊 [CONTROLLER] Endpoint: GET /api/v1/orders/analytics/monthly-revenue");
        log.info("📊 [CONTROLLER] Request parameter - year: {}", year != null ? year : "null (will default to current year)");
        
        long startTime = System.currentTimeMillis();
        
        try {
            log.info("📊 [CONTROLLER] Calling OrderService.getMonthlyRevenue()...");
            RevenueAnalyticsResponse response = orderService.getMonthlyRevenue(year);
            
            long executionTime = System.currentTimeMillis() - startTime;
            
            log.info("📊 [CONTROLLER] ========== Response Summary ==========");
            log.info("📊 [CONTROLLER] Execution time: {} ms", executionTime);
            log.info("📊 [CONTROLLER] Response year: {}", response.getYear());
            log.info("📊 [CONTROLLER] Total revenue: {} VND", response.getTotalRevenue());
            log.info("📊 [CONTROLLER] Total orders: {}", response.getTotalOrders());
            log.info("📊 [CONTROLLER] Monthly data points: {}", response.getMonthlyRevenues().size());
            
            // Log each month's data
            if (response.getMonthlyRevenues() != null && !response.getMonthlyRevenues().isEmpty()) {
                log.info("📊 [CONTROLLER] Monthly breakdown:");
                response.getMonthlyRevenues().forEach(monthData -> 
                    log.info("📊 [CONTROLLER]   - Month {}: Revenue={} VND, Orders={}", 
                        monthData.getMonth(), 
                        monthData.getTotalRevenue(), 
                        monthData.getOrderCount())
                );
            } else {
                log.warn("📊 [CONTROLLER] ⚠️ No monthly revenue data available for year {}", response.getYear());
            }
            
            log.info("📊 [CONTROLLER] ========== Request Completed Successfully ==========");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("📊 [CONTROLLER] ❌ ERROR: Failed to get monthly revenue after {} ms", executionTime, e);
            log.error("📊 [CONTROLLER] Error message: {}", e.getMessage());
            log.error("📊 [CONTROLLER] Error class: {}", e.getClass().getName());
            throw e;
        }
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