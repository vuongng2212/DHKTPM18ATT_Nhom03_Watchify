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
import fit.iuh.backend.sharedkernel.event.PaymentCompletedEvent;
import fit.iuh.backend.sharedkernel.event.PaymentFailedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service for Payment operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final OrderRepository orderRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final PaymentGatewayFactory paymentGatewayFactory;

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

        // For online payment, create payment URL
        if (order.getPaymentMethod() != fit.iuh.backend.modules.order.domain.entity.PaymentMethod.CASH_ON_DELIVERY) {
            PaymentGatewayService gatewayService = paymentGatewayFactory.getGatewayService(order.getPaymentMethod());
            if (gatewayService != null) {
                try {
                    String paymentUrl = gatewayService.createPaymentUrl(payment);
                    payment.setNotes("Payment URL: " + paymentUrl);
                    paymentRepository.save(payment);
                    log.info("Payment URL created: {}", paymentUrl);
                } catch (Exception e) {
                    log.error("Failed to create payment URL", e);
                    // For now, mark as failed or keep pending
                }
            }
        } else {
            // For COD, simulate success immediately
            simulatePaymentSuccess(payment);
        }
    }

    private void simulatePaymentSuccess(Payment payment) {
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setTransactionId("COD_" + UUID.randomUUID().toString().substring(0, 8));
        payment.setNotes("COD payment success");

        paymentRepository.save(payment);

        // Publish old success event (for backward compatibility)
        PaymentSuccessEvent successEvent = new PaymentSuccessEvent(payment.getOrder().getId());
        eventPublisher.publishEvent(successEvent);

        // Publish new PaymentCompletedEvent
        PaymentCompletedEvent completedEvent = new PaymentCompletedEvent(
            payment.getId(),
            payment.getOrder().getId(),
            payment.getOrder().getUser().getId(),
            payment.getAmount(),
            "CASH_ON_DELIVERY",
            payment.getTransactionId(),
            LocalDateTime.now()
        );
        eventPublisher.publishEvent(completedEvent);

        log.info("COD payment success for order: {}", payment.getOrder().getId());
    }

    public PaymentDto getPaymentByOrderId(UUID orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for order: " + orderId));

        return paymentMapper.toDto(payment);
    }

    @Transactional
    public void updatePaymentStatus(UUID paymentId, PaymentStatus status, String transactionId, String notes) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));

        payment.setStatus(status);
        payment.setTransactionId(transactionId);
        payment.setPaymentDate(LocalDateTime.now());
        if (notes != null) {
            payment.setNotes(notes);
        }

        paymentRepository.save(payment);

        // Publish events based on payment status
        if (status == PaymentStatus.SUCCESS) {
            // Publish old success event (for backward compatibility)
            PaymentSuccessEvent successEvent = new PaymentSuccessEvent(payment.getOrder().getId());
            eventPublisher.publishEvent(successEvent);
            
            // Publish new PaymentCompletedEvent
            PaymentCompletedEvent completedEvent = new PaymentCompletedEvent(
                payment.getId(),
                payment.getOrder().getId(),
                payment.getOrder().getUser().getId(),
                payment.getAmount(),
                payment.getPaymentMethod().toString(),
                transactionId,
                LocalDateTime.now()
            );
            eventPublisher.publishEvent(completedEvent);
            
            log.info("Payment success events published for order: {}", payment.getOrder().getId());
        } else if (status == PaymentStatus.FAILED) {
            // Publish PaymentFailedEvent
            PaymentFailedEvent failedEvent = new PaymentFailedEvent(
                payment.getId(),
                payment.getOrder().getId(),
                payment.getOrder().getUser().getId(),
                notes != null ? notes : "Payment failed"
            );
            eventPublisher.publishEvent(failedEvent);
            
            log.info("Payment failed event published for order: {}", payment.getOrder().getId());
        }

        log.info("Payment {} updated to status: {}", paymentId, status);
    }
}