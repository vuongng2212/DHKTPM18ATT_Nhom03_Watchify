package fit.iuh.backend.modules.payment.application.service;

import fit.iuh.backend.modules.order.domain.entity.Order;
import fit.iuh.backend.modules.order.domain.repository.OrderRepository;
import fit.iuh.backend.modules.payment.application.dto.PaymentDto;
import fit.iuh.backend.modules.payment.application.mapper.PaymentMapper;
import fit.iuh.backend.modules.payment.domain.entity.Payment;
import fit.iuh.backend.modules.payment.domain.entity.PaymentStatus;
import fit.iuh.backend.modules.payment.domain.repository.PaymentRepository;
import fit.iuh.backend.sharedkernel.event.OrderCreatedEvent;
import fit.iuh.backend.sharedkernel.event.PaymentSuccessEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service for Payment operations (Mock implementation).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final OrderRepository orderRepository;
    private final ApplicationEventPublisher eventPublisher;

    @EventListener
    @Transactional
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Handling OrderCreatedEvent for order: {}", event.getOrderId());

        Order order = orderRepository.findById(event.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Create payment record
        Payment payment = Payment.builder()
                .order(order)
                .amount(event.getTotalAmount())
                .status(PaymentStatus.PENDING)
                .paymentMethod(order.getPaymentMethod())
                .build();

        payment = paymentRepository.save(payment);
        log.info("Payment created: {}", payment.getId());

        // Mock: Simulate payment success immediately
        simulatePaymentSuccess(payment);
    }

    private void simulatePaymentSuccess(Payment payment) {
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setTransactionId("MOCK_" + UUID.randomUUID().toString().substring(0, 8));
        payment.setNotes("Mock payment success");

        paymentRepository.save(payment);

        // Publish success event
        PaymentSuccessEvent successEvent = new PaymentSuccessEvent(payment.getOrder().getId());
        eventPublisher.publishEvent(successEvent);

        log.info("Mock payment success for order: {}", payment.getOrder().getId());
    }

    public PaymentDto getPaymentByOrderId(UUID orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for order: " + orderId));

        return paymentMapper.toDto(payment);
    }
}