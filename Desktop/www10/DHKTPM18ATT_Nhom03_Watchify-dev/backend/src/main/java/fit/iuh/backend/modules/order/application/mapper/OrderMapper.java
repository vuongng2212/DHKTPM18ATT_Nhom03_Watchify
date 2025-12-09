package fit.iuh.backend.modules.order.application.mapper;

import fit.iuh.backend.modules.identity.application.dto.UserDto;
import fit.iuh.backend.modules.identity.application.mapper.UserMapper;
import fit.iuh.backend.modules.order.application.dto.OrderDto;
import fit.iuh.backend.modules.order.application.dto.OrderItemDto;
import fit.iuh.backend.modules.order.domain.entity.Order;
import fit.iuh.backend.modules.order.domain.entity.OrderItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for Order entities and DTOs.
 */
@Component
@RequiredArgsConstructor
public class OrderMapper {

    private final UserMapper userMapper;

    public OrderDto toDto(Order order) {
        UserDto userDto = order.getUser() != null ? userMapper.toDto(order.getUser()) : null;
        
        return OrderDto.builder()
                .id(order.getId())
                .orderNumber("ORD-" + order.getId().toString().substring(0, 8).toUpperCase())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .user(userDto)
                .totalAmount(order.getTotalAmount())
                .total(order.getTotalAmount()) // Alias for frontend compatibility
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .shippingAddress(order.getShippingAddress())
                .billingAddress(order.getBillingAddress())
                .notes(order.getNotes())
                .orderDate(order.getOrderDate())
                .createdAt(order.getCreatedAt() != null ? order.getCreatedAt() : order.getOrderDate()) // Alias for frontend
                .items(order.getItems() != null ? order.getItems().stream()
                        .map(this::toOrderItemDto)
                        .collect(Collectors.toList()) : null)
                .build();
    }

    public List<OrderDto> toDtoList(List<Order> orders) {
        return orders.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private OrderItemDto toOrderItemDto(OrderItem item) {
        return OrderItemDto.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .build();
    }
}