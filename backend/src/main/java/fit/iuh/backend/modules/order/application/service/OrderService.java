package fit.iuh.backend.modules.order.application.service;

import fit.iuh.backend.modules.catalog.domain.entity.Product;
import fit.iuh.backend.modules.catalog.domain.repository.ProductRepository;
import fit.iuh.backend.modules.identity.domain.entity.User;
import fit.iuh.backend.modules.identity.domain.repository.UserRepository;
import fit.iuh.backend.modules.order.application.dto.CreateGuestOrderRequest;
import fit.iuh.backend.modules.order.application.dto.CreateOrderRequest;
import fit.iuh.backend.modules.order.application.dto.OrderDto;
import fit.iuh.backend.modules.order.application.dto.OrderFilterRequest;
import fit.iuh.backend.modules.order.application.dto.OrderItemRequest;
import fit.iuh.backend.modules.order.application.dto.OrderListResponse;
import fit.iuh.backend.modules.order.application.mapper.OrderMapper;
import fit.iuh.backend.modules.order.domain.entity.Order;
import fit.iuh.backend.modules.order.domain.entity.OrderItem;
import fit.iuh.backend.modules.order.domain.entity.OrderStatus;
import fit.iuh.backend.modules.order.domain.repository.OrderRepository;
import fit.iuh.backend.sharedkernel.event.OrderCreatedEvent;
import fit.iuh.backend.sharedkernel.event.PaymentSuccessEvent;
import fit.iuh.backend.sharedkernel.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for Order operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public OrderDto createDirect(CreateOrderRequest request, UUID userId) {
        log.info("Creating order for user: {}", userId);

        // Validate user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate and calculate items
        List<OrderItem> orderItems = (request.getItems() != null ? request.getItems() : new ArrayList<OrderItemRequest>()).stream()
                .map(itemRequest -> createOrderItem(itemRequest))
                .collect(Collectors.toList());

        BigDecimal totalAmount = orderItems.stream()
                .map(OrderItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Create order
        Order order = Order.builder()
                .user(user)
                .totalAmount(totalAmount)
                .status(OrderStatus.PENDING)
                .paymentMethod(request.getPaymentMethod())
                .shippingAddress(request.getShippingAddress())
                .billingAddress(request.getBillingAddress())
                .notes(request.getNotes())
                .build();

        order = orderRepository.save(order);

        // Set order for items and save
        final Order savedOrder = order;
        orderItems.forEach(item -> item.setOrder(savedOrder));
        order.setItems(orderItems);

        // Publish event
        eventPublisher.publishEvent(new OrderCreatedEvent(order.getId(), userId, totalAmount));

        log.info("Order created successfully: {}", order.getId());
        return orderMapper.toDto(order);
    }

    @Transactional
    public OrderDto createGuestOrder(CreateGuestOrderRequest request) {
        log.info("Creating guest order for: {} ({})", request.getGuestName(), request.getGuestEmail());

        // Validate and calculate items
        List<OrderItem> orderItems = (request.getItems() != null ? request.getItems() : new ArrayList<OrderItemRequest>()).stream()
                .map(itemRequest -> createOrderItem(itemRequest))
                .collect(Collectors.toList());

        BigDecimal totalAmount = orderItems.stream()
                .map(OrderItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Create order without user (guest order)
        // Store guest information in notes
        String guestNotes = String.format("GUEST ORDER\nName: %s\nPhone: %s\nEmail: %s\n---\n%s",
                request.getGuestName(),
                request.getGuestPhone(),
                request.getGuestEmail(),
                request.getNotes() != null ? request.getNotes() : "");

        Order order = Order.builder()
                .user(null) // No user for guest orders
                .totalAmount(totalAmount)
                .status(OrderStatus.PENDING)
                .paymentMethod(request.getPaymentMethod())
                .shippingAddress(request.getShippingAddress())
                .billingAddress(request.getBillingAddress())
                .notes(guestNotes)
                .build();

        order = orderRepository.save(order);

        // Set order for items and save
        final Order savedOrder = order;
        orderItems.forEach(item -> item.setOrder(savedOrder));
        order.setItems(orderItems);

        // Publish event with null userId for guest orders
        eventPublisher.publishEvent(new OrderCreatedEvent(order.getId(), null, totalAmount));

        log.info("Guest order created successfully: {}", order.getId());
        return orderMapper.toDto(order);
    }

    @EventListener
    @Transactional
    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        log.info("Handling PaymentSuccessEvent for order: {}", event.getOrderId());

        Order order = orderRepository.findById(event.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        log.info("Order status updated to PAID: {}", order.getId());
    }

    private OrderItem createOrderItem(OrderItemRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + request.getProductId()));

        BigDecimal unitPrice = product.getPrice();
        BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(request.getQuantity()));

        return OrderItem.builder()
                .product(product)
                .quantity(request.getQuantity())
                .unitPrice(unitPrice)
                .totalPrice(totalPrice)
                .build();
    }

    public OrderDto getOrderById(UUID orderId, UUID userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        return orderMapper.toDto(order);
    }

    public OrderListResponse getUserOrders(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orderPage = orderRepository.findByUserIdOrderByOrderDateDesc(userId, pageable);

        List<OrderDto> orderDtos = orderMapper.toDtoList(orderPage.getContent());

        return OrderListResponse.builder()
                .orders(orderDtos)
                .currentPage(page)
                .totalPages(orderPage.getTotalPages())
                .totalElements(orderPage.getTotalElements())
                .hasNext(orderPage.hasNext())
                .hasPrevious(orderPage.hasPrevious())
                .build();
    }

    /**
     * Get all orders with filtering and pagination (Admin)
     * 
     * @param filter Filter criteria
     * @param page Page number (0-based)
     * @param size Page size
     * @return Paginated and filtered orders
     */
    @Transactional(readOnly = true)
    public OrderListResponse getAllOrdersWithFilter(OrderFilterRequest filter, int page, int size) {
        log.info("OrderService: getAllOrdersWithFilter - page={}, size={}, filter={}", 
                 page, size, filter);
        
        // Build Sort
        Sort sort = buildSort(filter.getSortBy(), filter.getSortDirection());
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // Convert LocalDate to LocalDateTime for time range
        LocalDateTime fromDateTime = filter.getFromDate() != null 
            ? LocalDateTime.of(filter.getFromDate(), LocalTime.MIN) 
            : null;
        
        LocalDateTime toDateTime = filter.getToDate() != null 
            ? LocalDateTime.of(filter.getToDate(), LocalTime.MAX) 
            : null;
        
        // Execute search query
        Page<Order> orderPage = orderRepository.searchOrders(
            filter.getKeyword(),
            filter.getStatus(),
            filter.getPaymentMethod(),
            fromDateTime,
            toDateTime,
            pageable
        );
        
        log.info("OrderService: Found {} orders matching filters", orderPage.getTotalElements());
        
        // Map to DTOs
        List<OrderDto> orderDtos = orderMapper.toDtoList(orderPage.getContent());
        
        // Build response
        return OrderListResponse.builder()
                .orders(orderDtos)
                .currentPage(orderPage.getNumber())
                .totalPages(orderPage.getTotalPages())
                .totalElements(orderPage.getTotalElements())
                .hasNext(orderPage.hasNext())
                .hasPrevious(orderPage.hasPrevious())
                .build();
    }
    
    /**
     * Build Sort object from sortBy and sortDirection
     */
    private Sort buildSort(String sortBy, String sortDirection) {
        // Default sort
        if (sortBy == null || sortBy.isEmpty()) {
            sortBy = "orderDate";
        }
        
        if (sortDirection == null || sortDirection.isEmpty()) {
            sortDirection = "desc";
        }
        
        // Validate sortBy field
        List<String> validSortFields = List.of("orderDate", "totalAmount", "status");
        if (!validSortFields.contains(sortBy)) {
            log.warn("Invalid sortBy field: {}, using default 'orderDate'", sortBy);
            sortBy = "orderDate";
        }
        
        // Create Sort
        Sort.Direction direction = sortDirection.equalsIgnoreCase("asc") 
            ? Sort.Direction.ASC 
            : Sort.Direction.DESC;
        
        return Sort.by(direction, sortBy);
    }

    /**
     * Get all orders without filters (deprecated - use getAllOrdersWithFilter instead)
     */
    @Deprecated
    public OrderListResponse getAllOrders(int page, int size) {
        log.warn("OrderService: getAllOrders (deprecated) called, consider using getAllOrdersWithFilter");
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "orderDate"));
        Page<Order> orderPage = orderRepository.findAll(pageable);

        List<OrderDto> orderDtos = orderMapper.toDtoList(orderPage.getContent());

        return OrderListResponse.builder()
                .orders(orderDtos)
                .currentPage(page)
                .totalPages(orderPage.getTotalPages())
                .totalElements(orderPage.getTotalElements())
                .hasNext(orderPage.hasNext())
                .hasPrevious(orderPage.hasPrevious())
                .build();
    }

    @Transactional
    public void updateOrderStatus(UUID orderId, String trangThaiDonHang) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Map Vietnamese status to enum
        OrderStatus newStatus = mapVietnameseStatusToEnum(trangThaiDonHang);
        order.setStatus(newStatus);

        orderRepository.save(order);

        log.info("Updated order {} status to {}", orderId, newStatus);
    }

    private OrderStatus mapVietnameseStatusToEnum(String vietnameseStatus) {
        return switch (vietnameseStatus) {
            // Vietnamese text
            case "Chờ xác nhận" -> OrderStatus.PENDING;
            case "Đã xác nhận" -> OrderStatus.CONFIRMED;
            case "Đang xử lý" -> OrderStatus.PROCESSING;
            case "Đang giao hàng" -> OrderStatus.SHIPPED;
            case "Đã giao hàng" -> OrderStatus.DELIVERED;
            case "Đã hủy" -> OrderStatus.CANCELLED;
            // Enum values
            case "PENDING" -> OrderStatus.PENDING;
            case "CONFIRMED" -> OrderStatus.CONFIRMED;
            case "PROCESSING" -> OrderStatus.PROCESSING;
            case "SHIPPED" -> OrderStatus.SHIPPED;
            case "DELIVERED" -> OrderStatus.DELIVERED;
            case "CANCELLED" -> OrderStatus.CANCELLED;
            default -> throw new IllegalArgumentException("Unknown status: " + vietnameseStatus);
        };
    }
}