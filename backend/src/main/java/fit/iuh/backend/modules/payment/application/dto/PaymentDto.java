package fit.iuh.backend.modules.payment.application.dto;

import fit.iuh.backend.modules.payment.domain.entity.PaymentStatus;
import fit.iuh.backend.modules.order.domain.entity.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for Payment response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDto {

    private UUID id;

    private UUID orderId;

    private BigDecimal amount;

    private PaymentStatus status;

    private PaymentMethod paymentMethod;

    private String transactionId;

    private LocalDateTime paymentDate;

    private String notes;
}