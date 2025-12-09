package fit.iuh.backend.sharedkernel.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

/**
 * Event fired when a payment is successful.
 */
@Getter
@AllArgsConstructor
public class PaymentSuccessEvent {

    private UUID orderId;
}