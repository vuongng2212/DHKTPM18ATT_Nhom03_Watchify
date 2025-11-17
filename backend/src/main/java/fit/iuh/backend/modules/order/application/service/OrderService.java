package fit.iuh.backend.modules.order.application.service;

import fit.iuh.backend.modules.catalog.domain.entity.Product;
import fit.iuh.backend.modules.catalog.domain.repository.ProductRepository;
import fit.iuh.backend.modules.identity.domain.entity.User;
import fit.iuh.backend.modules.identity.domain.repository.UserRepository;
import fit.iuh.backend.modules.order.application.dto.CreateOrderRequest;
import fit.iuh.backend.modules.order.application.dto.OrderDto;
import fit.iuh.backend.modules.order.application.dto.OrderItemRequest;
import fit.iuh.backend.modules.order.application.dto.OrderListResponse;
import fit.iuh.backend.modules.order.application.mapper.OrderMapper;
import fit.iuh.backend.modules.order.domain.entity.Order;
import fit.iuh.backend.modules.order.domain.entity.OrderItem;
import fit.iuh.backend.modules.order.domain.entity.OrderStatus;
import fit.iuh.backend.modules.order.domain.repository.OrderRepository;
import fit.iuh.backend.sharedkernel.event.OrderCreatedEvent;
import fit.iuh.backend.sharedkernel.event.PaymentSuccessEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
}