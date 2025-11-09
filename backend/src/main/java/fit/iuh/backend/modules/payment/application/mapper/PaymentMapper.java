package fit.iuh.backend.modules.payment.application.mapper;

import fit.iuh.backend.modules.payment.application.dto.PaymentDto;
import fit.iuh.backend.modules.payment.domain.entity.Payment;
import org.springframework.stereotype.Component;

/**
 * Mapper for Payment entities and DTOs.
 */
@Component
public class PaymentMapper {

    public PaymentDto toDto(Payment payment) {
        return PaymentDto.builder()
                .id(payment.getId())
                .orderId(payment.getOrder().getId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .paymentMethod(payment.getPaymentMethod())
                .transactionId(payment.getTransactionId())
                .paymentDate(payment.getPaymentDate())
                .notes(payment.getNotes())
                .build();
    }
}